const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
    getProfile,
    updateProfile,
    updatePassword,
    deleteAccount
} = require('../controllers/profileController');

router.get('/', verifyToken, getProfile);
router.put('/update', verifyToken, updateProfile);
router.put('/update-password', verifyToken, updatePassword);
router.post('/delete-account', verifyToken, deleteAccount);

module.exports = router;