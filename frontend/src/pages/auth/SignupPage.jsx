import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import API from '../../api/axios';
import useAuth from '../../hooks/useAuth';

const SignupPage = () => {
    const navigate = useNavigate();
    const { login, user, loading: authLoading } = useAuth();
    const [step, setStep] = useState(1); // 1: form, 2: otp
    const [form, setForm] = useState({
        username: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: ''
    });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!authLoading && user) {
        return <Navigate to="/home" replace />;
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!form.username || !form.email || !form.password || !form.confirmPassword) {
            setError('Please fill in all required fields.');
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setSubmitting(true);
        try {
            await API.post('/auth/send-signup-otp', form);
            setSuccess(`OTP sent to ${form.email}. Please check your inbox.`);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerifyAndSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (!otp) {
            setError('Please enter the OTP.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await API.post('/auth/signup', { ...form, otp });
            login(res.data.user, res.data.token);
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

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
        transition: 'background-color 0.2s'
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
                    {[1, 2].map(s => (
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
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '800',
                        color: 'var(--accent)',
                        marginBottom: '8px'
                    }}>
                        QuizApp
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {step === 1 ? 'Create your account' : `Enter OTP sent to ${form.email}`}
                    </p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: 'var(--error-light)',
                        color: 'var(--error)',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        marginBottom: '16px',
                        border: '1px solid var(--error)'
                    }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        backgroundColor: 'var(--success-light)',
                        color: 'var(--success)',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        marginBottom: '16px',
                        border: '1px solid var(--success)'
                    }}>
                        {success}
                    </div>
                )}

                {/* Step 1 - Signup Form */}
                {step === 1 && (
                    <form onSubmit={handleSendOTP}>
                        <label style={labelStyle}>Username *</label>
                        <input style={inputStyle} type="text" name="username"
                            value={form.username} onChange={handleChange}
                            placeholder="Enter username" />

                        <label style={labelStyle}>Email *</label>
                        <input style={inputStyle} type="email" name="email"
                            value={form.email} onChange={handleChange}
                            placeholder="Enter email" />

                        <label style={labelStyle}>Mobile (optional)</label>
                        <input style={inputStyle} type="tel" name="mobile"
                            value={form.mobile} onChange={handleChange}
                            placeholder="Enter mobile number" />

                        <label style={labelStyle}>Password *</label>
                        <input style={inputStyle} type="password" name="password"
                            value={form.password} onChange={handleChange}
                            placeholder="Min 6 characters" />

                        <label style={labelStyle}>Confirm Password *</label>
                        <input style={inputStyle} type="password" name="confirmPassword"
                            value={form.confirmPassword} onChange={handleChange}
                            placeholder="Re-enter password" />

                        <button type="submit" disabled={submitting} style={btnStyle(submitting)}>
                            {submitting ? 'Sending OTP...' : 'Send Verification OTP'}
                        </button>
                    </form>
                )}

                {/* Step 2 - OTP Verification */}
                {step === 2 && (
                    <form onSubmit={handleVerifyAndSignup}>
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

                        <button type="submit" disabled={submitting}
                            style={{ ...btnStyle(submitting), marginBottom: '12px' }}>
                            {submitting ? 'Creating Account...' : 'Verify & Create Account'}
                        </button>

                        <button type="button" onClick={handleSendOTP} disabled={submitting}
                            style={{
                                ...btnStyle(submitting),
                                backgroundColor: 'var(--bg-card)',
                                color: 'var(--accent)',
                                border: '1px solid var(--accent)'
                            }}>
                            Resend OTP
                        </button>

                        <button type="button" onClick={() => { setStep(1); setOtp(''); setError(''); setSuccess(''); }}
                            style={{
                                ...btnStyle(false),
                                backgroundColor: 'var(--bg-card)',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border)',
                                marginTop: '8px'
                            }}>
                            ← Back to Form
                        </button>
                    </form>
                )}

                <p style={{
                    textAlign: 'center',
                    marginTop: '24px',
                    fontSize: '14px',
                    color: 'var(--text-secondary)'
                }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--accent)', fontWeight: '600' }}>
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;