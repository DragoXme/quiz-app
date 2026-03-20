const bcrypt = require('bcryptjs');
const {
    findUserById,
    updateUserProfile,
    updateUserPassword,
    findUserByUsername,
    deleteUser
} = require('../models/userModel');

const getProfile = async (req, res, next) => {
    try {
        const user = await findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ user });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const { username, mobile } = req.body;

        if (!username) {
            return res.status(400).json({ message: 'Username is required.' });
        }

        const existingUser = await findUserByUsername(username);
        if (existingUser && existingUser.id !== req.user.id) {
            return res.status(409).json({ message: 'Username already taken.' });
        }

        const updatedUser = await updateUserProfile(req.user.id, username, mobile);
        res.status(200).json({
            message: 'Profile updated successfully.',
            user: updatedUser
        });
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

        const { findUserById: getUserWithHash } = require('../models/userModel');
        const pool = require('../config/db');
        const userResult = await pool.query(
            `SELECT * FROM users WHERE id = $1`,
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect.' });
        }

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

        if (!password) {
            return res.status(400).json({ message: 'Password is required to delete account.' });
        }

        const userResult = await pool.query(
            `SELECT * FROM users WHERE id = $1`,
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password.' });
        }

        await deleteUser(req.user.id);

        res.status(200).json({ message: 'Account deleted successfully.' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    updatePassword,
    deleteAccount
};