const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { sendSignupOTPEmail, sendPasswordResetEmail } = require('../config/email');
const {
    createUser,
    createGoogleUser,
    findUserByEmail,
    findUserByUsername,
    findUserByGoogleId,
    findUserByUsernameOrEmail,
    updateUserPasswordByEmail
} = require('../models/userModel');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (user, rememberMe = false) => {
    const expiresIn = rememberMe ? '30d' : '7d';
    return jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn }
    );
};

const formatUser = (user) => ({
    id: user.id,
    username: user.username,
    displayName: user.display_name || user.username,
    email: user.email,
    mobile: user.mobile || null,
    avatarUrl: user.avatar_url || null,
    authProvider: user.auth_provider || 'email'
});

const sendSignupOTP = async (req, res, next) => {
    try {
        const { username, displayName, email, password, confirmPassword, mobile } = req.body;

        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match.' });
        if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

        const existingEmail = await findUserByEmail(email);
        if (existingEmail) return res.status(409).json({ message: 'Email already registered.' });

        const existingUsername = await findUserByUsername(username);
        if (existingUsername) return res.status(409).json({ message: 'Username already taken.' });

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await pool.query(`UPDATE otps SET used = TRUE WHERE email = $1 AND used = FALSE`, [email]);
        await pool.query(`INSERT INTO otps (email, otp_code, expires_at) VALUES ($1, $2, $3)`, [email, otp, expiresAt]);

        const emailResult = await sendSignupOTPEmail(email, otp);
        if (!emailResult.success) return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });

        res.status(200).json({ message: 'OTP sent to your email. Please verify to complete signup.' });
    } catch (error) { next(error); }
};

const signup = async (req, res, next) => {
    try {
        const { username, displayName, email, password, confirmPassword, mobile, otp } = req.body;

        if (!username || !email || !password || !confirmPassword || !otp) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match.' });
        if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

        const otpResult = await pool.query(
            `SELECT * FROM otps WHERE email = $1 AND otp_code = $2 AND used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`,
            [email, otp]
        );
        if (otpResult.rows.length === 0) return res.status(400).json({ message: 'Invalid or expired OTP.' });
        await pool.query(`UPDATE otps SET used = TRUE WHERE id = $1`, [otpResult.rows[0].id]);

        const existingEmail = await findUserByEmail(email);
        if (existingEmail) return res.status(409).json({ message: 'Email already registered.' });

        const existingUsername = await findUserByUsername(username);
        if (existingUsername) return res.status(409).json({ message: 'Username already taken.' });

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await createUser(username, email, passwordHash, mobile, displayName || username);
        const token = generateToken(user);

        res.status(201).json({ message: 'Account created successfully.', token, user: formatUser(user) });
    } catch (error) { next(error); }
};

const login = async (req, res, next) => {
    try {
        const { identifier, password, rememberMe } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ message: 'Username/email and password are required.' });
        }

        const user = await findUserByUsernameOrEmail(identifier);
        if (!user) return res.status(401).json({ message: 'Invalid username/email or password.' });

        if (!user.password_hash) {
            return res.status(401).json({ message: 'This account uses Google sign-in. Please use the "Continue with Google" button.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Invalid username/email or password.' });

        const token = generateToken(user, rememberMe);
        res.status(200).json({ message: 'Login successful.', token, user: formatUser(user) });
    } catch (error) { next(error); }
};

// Google OAuth — receives googleUserInfo from frontend (access_token flow)
const googleAuth = async (req, res, next) => {
    try {
        const { googleUserInfo, rememberMe } = req.body;

        if (!googleUserInfo || !googleUserInfo.sub || !googleUserInfo.email) {
            return res.status(400).json({ message: 'Invalid Google user info.' });
        }

        const { sub: googleId, email, name, picture } = googleUserInfo;

        // Check existing by google_id
        let user = await findUserByGoogleId(googleId);

        if (!user) {
            const emailUser = await findUserByEmail(email);
            if (emailUser) {
                // Link Google to existing email account
                await pool.query(
                    `UPDATE users SET google_id = $1, avatar_url = $2, auth_provider = 'both' WHERE id = $3`,
                    [googleId, picture, emailUser.id]
                );
                const updated = await pool.query(
                    `SELECT * FROM users WHERE id = $1`, [emailUser.id]
                );
                user = updated.rows[0];
            } else {
                // Brand new Google user
                user = await createGoogleUser(googleId, email, name, picture);
            }
        }

        const token = generateToken(user, rememberMe);
        res.status(200).json({ message: 'Google sign-in successful.', token, user: formatUser(user) });
    } catch (error) { next(error); }
};

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required.' });

        const user = await findUserByEmail(email);
        if (!user) return res.status(404).json({ message: 'No account found with this email.' });
        if (!user.password_hash) return res.status(400).json({ message: 'This account uses Google sign-in and has no password to reset.' });

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await pool.query(`UPDATE otps SET used = TRUE WHERE email = $1 AND used = FALSE`, [email]);
        await pool.query(`INSERT INTO otps (email, otp_code, expires_at) VALUES ($1, $2, $3)`, [email, otp, expiresAt]);

        const emailResult = await sendPasswordResetEmail(email, otp);
        if (!emailResult.success) return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });

        res.status(200).json({ message: 'OTP sent to your email.' });
    } catch (error) { next(error); }
};

const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

        const result = await pool.query(
            `SELECT * FROM otps WHERE email = $1 AND otp_code = $2 AND used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`,
            [email, otp]
        );
        if (result.rows.length === 0) return res.status(400).json({ message: 'Invalid or expired OTP.' });
        await pool.query(`UPDATE otps SET used = TRUE WHERE id = $1`, [result.rows[0].id]);

        const resetToken = jwt.sign({ email, purpose: 'password_reset' }, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.status(200).json({ message: 'OTP verified successfully.', resetToken });
    } catch (error) { next(error); }
};

const resetPassword = async (req, res, next) => {
    try {
        const { resetToken, newPassword, confirmPassword } = req.body;
        if (!resetToken || !newPassword || !confirmPassword) return res.status(400).json({ message: 'All fields are required.' });
        if (newPassword !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match.' });
        if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

        let decoded;
        try { decoded = jwt.verify(resetToken, process.env.JWT_SECRET); }
        catch (err) { return res.status(400).json({ message: 'Invalid or expired reset token.' }); }

        if (decoded.purpose !== 'password_reset') return res.status(400).json({ message: 'Invalid reset token.' });

        const passwordHash = await bcrypt.hash(newPassword, 12);
        await updateUserPasswordByEmail(decoded.email, passwordHash);
        res.status(200).json({ message: 'Password reset successfully.' });
    } catch (error) { next(error); }
};

module.exports = { sendSignupOTP, signup, login, googleAuth, forgotPassword, verifyOTP, resetPassword };
