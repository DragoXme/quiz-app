const express = require('express');
const router = express.Router();
const {
    signup,
    login,
    forgotPassword,
    verifyOTP,
    resetPassword
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;