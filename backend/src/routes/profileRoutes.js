const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
    getProfile,
    updateProfile,
    updatePassword
} = require('../controllers/profileController');

router.get('/', verifyToken, getProfile);
router.put('/update', verifyToken, updateProfile);
router.put('/update-password', verifyToken, updatePassword);

module.exports = router;