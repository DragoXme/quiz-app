const pool = require('../config/db');

// Generate a random username for Google sign-ups
const generateRandomUsername = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const random = Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `user_${random}`;
};

const createUser = async (username, email, passwordHash, mobile, displayName = null) => {
    const result = await pool.query(
        `INSERT INTO users (username, email, password_hash, mobile, display_name, auth_provider)
         VALUES ($1, $2, $3, $4, $5, 'email')
         RETURNING id, username, email, mobile, display_name, auth_provider, avatar_url, created_at`,
        [username, email, passwordHash, mobile || null, displayName || username]
    );
    return result.rows[0];
};

const createGoogleUser = async (googleId, email, displayName, avatarUrl) => {
    // Generate unique username
    let username = generateRandomUsername();
    // Ensure uniqueness
    let existing = await findUserByUsername(username);
    while (existing) {
        username = generateRandomUsername();
        existing = await findUserByUsername(username);
    }
    const result = await pool.query(
        `INSERT INTO users (username, email, password_hash, display_name, google_id, avatar_url, auth_provider)
         VALUES ($1, $2, NULL, $3, $4, $5, 'google')
         RETURNING id, username, email, mobile, display_name, auth_provider, avatar_url, google_id, created_at`,
        [username, email, displayName, googleId, avatarUrl]
    );
    return result.rows[0];
};

const findUserByEmail = async (email) => {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    return result.rows[0];
};

const findUserByUsername = async (username) => {
    const result = await pool.query(`SELECT * FROM users WHERE username = $1`, [username]);
    return result.rows[0];
};

const findUserByGoogleId = async (googleId) => {
    const result = await pool.query(`SELECT * FROM users WHERE google_id = $1`, [googleId]);
    return result.rows[0];
};

// Find by username OR email (for login)
const findUserByUsernameOrEmail = async (identifier) => {
    const result = await pool.query(
        `SELECT * FROM users WHERE username = $1 OR email = $1`,
        [identifier]
    );
    return result.rows[0];
};

const findUserById = async (id) => {
    const result = await pool.query(
        `SELECT id, username, email, mobile, display_name, auth_provider, avatar_url, google_id, created_at
         FROM users WHERE id = $1`,
        [id]
    );
    return result.rows[0];
};

const updateUserProfile = async (id, username, mobile, displayName) => {
    const result = await pool.query(
        `UPDATE users SET username = $1, mobile = $2, display_name = $3
         WHERE id = $4
         RETURNING id, username, email, mobile, display_name, auth_provider, avatar_url, created_at`,
        [username, mobile || null, displayName, id]
    );
    return result.rows[0];
};

const updateUserPassword = async (id, passwordHash) => {
    const result = await pool.query(
        `UPDATE users SET password_hash = $1 WHERE id = $2
         RETURNING id, username, email`,
        [passwordHash, id]
    );
    return result.rows[0];
};

const updateUserPasswordByEmail = async (email, passwordHash) => {
    const result = await pool.query(
        `UPDATE users SET password_hash = $1 WHERE email = $2
         RETURNING id, username, email`,
        [passwordHash, email]
    );
    return result.rows[0];
};

const deleteUser = async (id) => {
    const result = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
};

module.exports = {
    createUser,
    createGoogleUser,
    findUserByEmail,
    findUserByUsername,
    findUserByGoogleId,
    findUserByUsernameOrEmail,
    findUserById,
    updateUserProfile,
    updateUserPassword,
    updateUserPasswordByEmail,
    deleteUser,
    generateRandomUsername
};
