import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
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
        border: '1px solid var(--input-border)',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
        marginBottom: '16px',
        backgroundColor: 'var(--bg-input)',
        color: 'var(--text-primary)'
    };

    const labelStyle = {
        fontSize: '13px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        display: 'block',
        marginBottom: '6px'
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        if (!email) { setError('Please enter your email.'); return; }
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
        if (!otp) { setError('Please enter the OTP.'); return; }
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
        if (!newPassword || !confirmPassword) { setError('Please fill in all fields.'); return; }
        if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
        if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setLoading(true);
        try {
            await API.post('/auth/reset-password', { resetToken, newPassword, confirmPassword });
            setSuccess('Password reset successfully!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    const stepTitles = { 1: 'Forgot Password', 2: 'Enter OTP', 3: 'Set New Password' };
    const stepDescriptions = {
        1: 'Enter your email to receive an OTP.',
        2: `Enter the 6-digit OTP sent to ${email}`,
        3: 'Enter and confirm your new password.'
    };

    const btnStyle = (disabled) => ({
        width: '100%',
        padding: '13px',
        backgroundColor: disabled ? 'var(--text-muted)' : 'var(--accent)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '700',
        cursor: disabled ? 'not-allowed' : 'pointer',
        marginBottom: '12px'
    });

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: 'var(--bg-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
        }}>
            <div style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '16px',
                padding: '40px',
                width: '100%',
                maxWidth: '440px',
                boxShadow: `0 4px 24px var(--shadow)`,
                border: '1px solid var(--border)'
            }}>
                {/* Step Indicator */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{
                            width: '32px', height: '32px',
                            borderRadius: '50%',
                            backgroundColor: s <= step ? 'var(--accent)' : 'var(--border)',
                            color: s <= step ? '#fff' : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px', fontWeight: '700'
                        }}>
                            {s < step ? '✓' : s}
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {stepTitles[step]}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {stepDescriptions[step]}
                    </p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: 'var(--error-light)', color: 'var(--error)',
                        padding: '12px 16px', borderRadius: '8px',
                        fontSize: '14px', marginBottom: '16px',
                        border: '1px solid var(--error)'
                    }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        backgroundColor: 'var(--success-light)', color: 'var(--success)',
                        padding: '12px 16px', borderRadius: '8px',
                        fontSize: '14px', marginBottom: '16px',
                        border: '1px solid var(--success)'
                    }}>
                        {success}
                    </div>
                )}

                {/* Step 1 */}
                {step === 1 && (
                    <form onSubmit={handleSendOTP}>
                        <label style={labelStyle}>Email Address</label>
                        <input
                            style={inputStyle}
                            type="email"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setError(''); }}
                            placeholder="Enter your registered email"
                        />
                        <button type="submit" disabled={loading} style={btnStyle(loading)}>
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {/* Step 2 */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOTP}>
                        <label style={labelStyle}>Enter OTP</label>
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
                        <button type="submit" disabled={loading} style={btnStyle(loading)}>
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={loading}
                            style={{
                                ...btnStyle(loading),
                                backgroundColor: 'var(--bg-card)',
                                color: 'var(--accent)',
                                border: '1px solid var(--accent)'
                            }}
                        >
                            Resend OTP
                        </button>
                    </form>
                )}

                {/* Step 3 */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword}>
                        <label style={labelStyle}>New Password</label>
                        <input
                            style={inputStyle}
                            type="password"
                            value={newPassword}
                            onChange={e => { setNewPassword(e.target.value); setError(''); }}
                            placeholder="Min 6 characters"
                        />
                        <label style={labelStyle}>Confirm New Password</label>
                        <input
                            style={inputStyle}
                            type="password"
                            value={confirmPassword}
                            onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                            placeholder="Re-enter new password"
                        />
                        <button type="submit" disabled={loading} style={btnStyle(loading)}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <Link to="/login" style={{ color: 'var(--accent)', fontWeight: '600' }}>
                        ← Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;