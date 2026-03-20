import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const inputStyle = {
        width: '100%',
        padding: '12px 14px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
        marginBottom: '16px'
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        if (!email) {
            setError('Please enter your email.');
            return;
        }
        setLoading(true);
        try {
            await API.post('/auth/forgot-password', { email });
            setSuccess('OTP sent to your email!');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        if (!otp) {
            setError('Please enter the OTP.');
            return;
        }
        setLoading(true);
        try {
            const res = await API.post('/auth/verify-otp', { email, otp });
            setResetToken(res.data.resetToken);
            setSuccess('OTP verified! Set your new password.');
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        if (!newPassword || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        try {
            await API.post('/auth/reset-password', {
                resetToken,
                newPassword,
                confirmPassword
            });
            setSuccess('Password reset successfully!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    const cardStyle = {
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
    };

    const stepTitles = {
        1: 'Forgot Password',
        2: 'Enter OTP',
        3: 'Set New Password'
    };

    const stepDescriptions = {
        1: 'Enter your email to receive an OTP.',
        2: `Enter the 6-digit OTP sent to ${email}`,
        3: 'Enter and confirm your new password.'
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
        }}>
            <div style={cardStyle}>
                {/* Step indicator */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '24px'
                }}>
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: s <= step ? '#4F46E5' : '#e5e7eb',
                            color: s <= step ? '#fff' : '#999',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: '700'
                        }}>
                            {s < step ? '✓' : s}
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <h2 style={{
                        fontSize: '22px',
                        fontWeight: '800',
                        color: '#111',
                        marginBottom: '8px'
                    }}>
                        {stepTitles[step]}
                    </h2>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                        {stepDescriptions[step]}
                    </p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#FEF2F2',
                        color: '#EF4444',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        marginBottom: '16px',
                        border: '1px solid #FECACA'
                    }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        backgroundColor: '#F0FDF4',
                        color: '#10B981',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        marginBottom: '16px',
                        border: '1px solid #A7F3D0'
                    }}>
                        {success}
                    </div>
                )}

                {/* Step 1: Email */}
                {step === 1 && (
                    <form onSubmit={handleSendOTP}>
                        <label style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#333',
                            display: 'block',
                            marginBottom: '6px'
                        }}>
                            Email Address
                        </label>
                        <input
                            style={inputStyle}
                            type="email"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setError(''); }}
                            placeholder="Enter your registered email"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '13px',
                                backgroundColor: loading ? '#a5b4fc' : '#4F46E5',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '15px',
                                fontWeight: '700',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOTP}>
                        <label style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#333',
                            display: 'block',
                            marginBottom: '6px'
                        }}>
                            Enter OTP
                        </label>
                        <input
                            style={{
                                ...inputStyle,
                                textAlign: 'center',
                                fontSize: '24px',
                                letterSpacing: '8px',
                                fontWeight: '700'
                            }}
                            type="text"
                            value={otp}
                            onChange={e => { setOtp(e.target.value); setError(''); }}
                            placeholder="000000"
                            maxLength={6}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '13px',
                                backgroundColor: loading ? '#a5b4fc' : '#4F46E5',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '15px',
                                fontWeight: '700',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                marginBottom: '12px'
                            }}
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '13px',
                                backgroundColor: '#fff',
                                color: '#4F46E5',
                                border: '1px solid #4F46E5',
                                borderRadius: '8px',
                                fontSize: '15px',
                                fontWeight: '700',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Resend OTP
                        </button>
                    </form>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword}>
                        <label style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#333',
                            display: 'block',
                            marginBottom: '6px'
                        }}>
                            New Password
                        </label>
                        <input
                            style={inputStyle}
                            type="password"
                            value={newPassword}
                            onChange={e => { setNewPassword(e.target.value); setError(''); }}
                            placeholder="Min 6 characters"
                        />
                        <label style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#333',
                            display: 'block',
                            marginBottom: '6px'
                        }}>
                            Confirm New Password
                        </label>
                        <input
                            style={inputStyle}
                            type="password"
                            value={confirmPassword}
                            onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                            placeholder="Re-enter new password"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '13px',
                                backgroundColor: loading ? '#a5b4fc' : '#4F46E5',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '15px',
                                fontWeight: '700',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <p style={{
                    textAlign: 'center',
                    marginTop: '24px',
                    fontSize: '14px',
                    color: '#666'
                }}>
                    <Link to="/login" style={{ color: '#4F46E5', fontWeight: '600' }}>
                        ← Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;