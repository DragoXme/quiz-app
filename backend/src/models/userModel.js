const pool = require('../config/db');

const createUser = async (username, email, passwordHash, mobile) => {
    const result = await pool.query(
        `INSERT INTO users (username, email, password_hash, mobile)
         VALUES ($1, $2, $3, $4) RETURNING id, username, email, mobile, created_at`,
        [username, email, passwordHash, mobile || null]
    );
    return result.rows[0];
};

const findUserByEmail = async (email) => {
    const result = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
    );
    return result.rows[0];
};

const findUserByUsername = async (username) => {
    const result = await pool.query(
        `SELECT * FROM users WHERE username = $1`,
        [username]
    );
    return result.rows[0];
};

const findUserById = async (id) => {
    const result = await pool.query(
        `SELECT id, username, email, mobile, created_at FROM users WHERE id = $1`,
        [id]
    );
    return result.rows[0];
};

const updateUserProfile = async (id, username, mobile) => {
    const result = await pool.query(
        `UPDATE users SET username = $1, mobile = $2 WHERE id = $3
         RETURNING id, username, email, mobile, created_at`,
        [username, mobile || null, id]
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

module.exports = {
    createUser,
    findUserByEmail,
    findUserByUsername,
    findUserById,
    updateUserProfile,
    updateUserPassword,
    updateUserPasswordByEmail
};