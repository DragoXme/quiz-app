import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import API from '../../api/axios';
import useAuth from '../../hooks/useAuth';

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
        <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
);

const SignupPage = () => {
    const navigate = useNavigate();
    const { login, user, loading: authLoading } = useAuth();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ displayName: '', username: '', email: '', mobile: '', password: '', confirmPassword: '' });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    if (!authLoading && user) return <Navigate to="/home" replace />;

    const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

    const handleSendOTP = async (e) => {
        e.preventDefault(); setError(''); setSuccess('');
        if (!form.displayName || !form.username || !form.email || !form.password || !form.confirmPassword) {
            setError('Please fill in all required fields.'); return;
        }
        if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setSubmitting(true);
        try {
            await API.post('/auth/send-signup-otp', form);
            setSuccess(`OTP sent to ${form.email}. Please check your inbox.`);
            setStep(2);
        } catch (err) { setError(err.response?.data?.message || 'Failed to send OTP.'); }
        finally { setSubmitting(false); }
    };

    const handleVerifyAndSignup = async (e) => {
        e.preventDefault(); setError('');
        if (!otp) { setError('Please enter the OTP.'); return; }
        setSubmitting(true);
        try {
            const res = await API.post('/auth/signup', { ...form, otp });
            login(res.data.user, res.data.token);
            navigate('/home');
        } catch (err) { setError(err.response?.data?.message || 'Signup failed.'); }
        finally { setSubmitting(false); }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setGoogleLoading(true);
            setError('');
            try {
                const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                }).then(r => r.json());

                const res = await API.post('/auth/google', { googleUserInfo: userInfo, rememberMe: false });
                login(res.data.user, res.data.token, false);
                navigate('/home');
            } catch (err) {
                setError('Google sign-up failed. Please try again.');
            } finally {
                setGoogleLoading(false);
            }
        },
        onError: () => {
            setError('Google sign-up was cancelled or failed.');
            setGoogleLoading(false);
        }
    });

    const cardStyle = {
        background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)', borderRadius: '24px',
        padding: '40px', width: '100%', maxWidth: '440px',
        boxShadow: '0 8px 40px var(--shadow-md)', border: '1px solid var(--glass-border)'
    };

    const inputStyle = {
        width: '100%', padding: '12px 14px', borderRadius: '10px',
        border: '1.5px solid var(--input-border)', fontSize: '14px',
        outline: 'none', boxSizing: 'border-box', marginBottom: '14px',
        background: 'var(--glass-bg)', backdropFilter: 'blur(8px)',
        color: 'var(--text-primary)', transition: 'border-color 0.2s'
    };

    const labelStyle = { fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' };

    const primaryBtn = (disabled) => ({
        width: '100%', padding: '13px',
        background: disabled ? 'var(--border)' : 'var(--gradient-accent)',
        color: '#fff', border: 'none', borderRadius: '12px',
        fontSize: '15px', fontWeight: '700',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 4px 16px rgba(99,102,241,0.35)',
        marginBottom: '10px'
    });

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={cardStyle}>
                {/* Step dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                    {[1, 2].map(s => (
                        <div key={s} style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: s <= step ? 'var(--gradient-accent)' : 'var(--border)',
                            color: s <= step ? '#fff' : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: '700',
                            boxShadow: s <= step ? '0 2px 8px var(--shadow)' : 'none'
                        }}>{s < step ? '✓' : s}</div>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 4px 16px rgba(99,102,241,0.3)', fontSize: '24px' }}>📚</div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '6px' }}>QuizApp</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {step === 1 ? 'Create your account' : `Enter OTP sent to ${form.email}`}
                    </p>
                </div>

                {error && <div style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px', border: '1px solid var(--error)' }}>{error}</div>}
                {success && <div style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px', border: '1px solid var(--success)' }}>{success}</div>}

                {step === 1 && (
                    <>
                        {/* Google signup */}
                        <button
                            type="button"
                            onClick={() => googleLogin()}
                            disabled={googleLoading || submitting}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '10px',
                                border: '1.5px solid var(--border)', background: 'var(--glass-bg)',
                                backdropFilter: 'blur(8px)', color: 'var(--text-primary)',
                                fontSize: '14px', fontWeight: '600', cursor: googleLoading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                marginBottom: '20px', transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                            <GoogleIcon />
                            {googleLoading ? 'Signing up...' : 'Sign up with Google'}
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>OR</span>
                            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
                        </div>

                        <form onSubmit={handleSendOTP}>
                            <label style={labelStyle}>Display Name * <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '400' }}>(shown publicly)</span></label>
                            <input style={inputStyle} type="text" name="displayName" value={form.displayName} onChange={handleChange} placeholder="e.g. Shekhar Aggarwal" />

                            <label style={labelStyle}>Username * <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '400' }}>(unique login ID)</span></label>
                            <input style={inputStyle} type="text" name="username" value={form.username} onChange={handleChange} placeholder="e.g. shekhar123" />

                            <label style={labelStyle}>Email *</label>
                            <input style={inputStyle} type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter email" />

                            <label style={labelStyle}>Mobile (optional)</label>
                            <input style={inputStyle} type="tel" name="mobile" value={form.mobile} onChange={handleChange} placeholder="Enter mobile number" />

                            <label style={labelStyle}>Password *</label>
                            <input style={inputStyle} type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" />

                            <label style={labelStyle}>Confirm Password *</label>
                            <input style={inputStyle} type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" />

                            <button type="submit" disabled={submitting} style={primaryBtn(submitting)}>
                                {submitting ? 'Sending OTP...' : 'Send Verification OTP'}
                            </button>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyAndSignup}>
                        <label style={labelStyle}>Enter OTP</label>
                        <input style={{ ...inputStyle, textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: '700' }}
                            type="text" value={otp} onChange={e => { setOtp(e.target.value); setError(''); }} placeholder="000000" maxLength={6} />
                        <button type="submit" disabled={submitting} style={primaryBtn(submitting)}>
                            {submitting ? 'Creating Account...' : 'Verify & Create Account'}
                        </button>
                        <button type="button" onClick={handleSendOTP} disabled={submitting} style={{ ...primaryBtn(submitting), background: 'transparent', color: 'var(--accent-text)', border: '1.5px solid var(--accent)', boxShadow: 'none' }}>
                            Resend OTP
                        </button>
                        <button type="button" onClick={() => { setStep(1); setOtp(''); setError(''); setSuccess(''); }} style={{ ...primaryBtn(false), background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', boxShadow: 'none', marginTop: '4px' }}>
                            ← Back to Form
                        </button>
                    </form>
                )}

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--accent-text)', fontWeight: '700' }}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;
