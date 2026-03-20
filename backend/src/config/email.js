const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendSignupOTPEmail = async (toEmail, otp) => {
    try {
        const response = await resend.emails.send({
            from: 'noreply@shekhar.live',
            to: toEmail,
            subject: 'Verify your email - Quiz App',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4F46E5;">Quiz App - Email Verification</h2>
                    <p>Thanks for signing up! Please verify your email address using the OTP below:</p>
                    <div style="background-color: #F3F4F6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <h1 style="color: #4F46E5; font-size: 48px; letter-spacing: 8px; margin: 0;">${otp}</h1>
                    </div>
                    <p>This OTP is valid for <strong>10 minutes</strong>.</p>
                    <p>If you did not request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
                    <p style="color: #6B7280; font-size: 12px;">Quiz App &copy; 2026</p>
                </div>
            `
        });
        return { success: true, data: response };
    } catch (error) {
        console.error('Error sending signup OTP email:', error);
        return { success: false, error };
    }
};

const sendPasswordResetEmail = async (toEmail, otp) => {
    try {
        const response = await resend.emails.send({
            from: 'noreply@shekhar.live',
            to: toEmail,
            subject: 'Password Reset OTP - Quiz App',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4F46E5;">Quiz App - Password Reset</h2>
                    <p>You requested a password reset. Use the OTP below:</p>
                    <div style="background-color: #F3F4F6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <h1 style="color: #4F46E5; font-size: 48px; letter-spacing: 8px; margin: 0;">${otp}</h1>
                    </div>
                    <p>This OTP is valid for <strong>10 minutes</strong>.</p>
                    <p>If you did not request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
                    <p style="color: #6B7280; font-size: 12px;">Quiz App &copy; 2026</p>
                </div>
            `
        });
        return { success: true, data: response };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return { success: false, error };
    }
};

module.exports = { sendSignupOTPEmail, sendPasswordResetEmail };