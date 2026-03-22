const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const {
    findUserById,
    updateUserProfile,
    updateUserPassword,
    findUserByUsername,
    deleteUser
} = require('../models/userModel');

const formatUser = (user) => ({
    id: user.id,
    username: user.username,
    displayName: user.display_name || user.username,
    email: user.email,
    mobile: user.mobile || null,
    avatarUrl: user.avatar_url || null,
    authProvider: user.auth_provider || 'email'
});

const getProfile = async (req, res, next) => {
    try {
        const user = await findUserById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.status(200).json({ user: formatUser(user) });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const { username, mobile, displayName } = req.body;

        if (!username) return res.status(400).json({ message: 'Username is required.' });
        if (!displayName) return res.status(400).json({ message: 'Display name is required.' });

        const existingUser = await findUserByUsername(username);
        if (existingUser && existingUser.id !== req.user.id) {
            return res.status(409).json({ message: 'Username already taken.' });
        }

        const updatedUser = await updateUserProfile(req.user.id, username, mobile, displayName);
        res.status(200).json({ message: 'Profile updated successfully.', user: formatUser(updatedUser) });
    } catch (error) {
        next(error);
    }
};

const updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New passwords do not match.' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        const userResult = await pool.query(`SELECT * FROM users WHERE id = $1`, [req.user.id]);
        if (userResult.rows.length === 0) return res.status(404).json({ message: 'User not found.' });

        const user = userResult.rows[0];

        // Google-only users have no password
        if (!user.password_hash) {
            return res.status(400).json({ message: 'Google sign-in accounts cannot change password here. Use Google account settings.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect.' });

        const passwordHash = await bcrypt.hash(newPassword, 12);
        await updateUserPassword(req.user.id, passwordHash);

        res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
        next(error);
    }
};

const deleteAccount = async (req, res, next) => {
    try {
        const { password } = req.body;

        const userResult = await pool.query(`SELECT * FROM users WHERE id = $1`, [req.user.id]);
        if (userResult.rows.length === 0) return res.status(404).json({ message: 'User not found.' });

        const user = userResult.rows[0];

        // Google-only users: no password needed
        if (user.password_hash) {
            if (!password) return res.status(400).json({ message: 'Password is required to delete account.' });
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) return res.status(401).json({ message: 'Incorrect password.' });
        }

        await deleteUser(req.user.id);
        res.status(200).json({ message: 'Account deleted successfully.' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getProfile, updateProfile, updatePassword, deleteAccount };
