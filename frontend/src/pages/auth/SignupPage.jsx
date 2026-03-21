import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import API from '../../api/axios';
import useAuth from '../../hooks/useAuth';

const SignupPage = () => {
    const navigate = useNavigate();
    const { login, user, loading: authLoading } = useAuth();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ username: '', email: '', mobile: '', password: '', confirmPassword: '' });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!authLoading && user) return <Navigate to="/home" replace />;

    const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

    const handleSendOTP = async (e) => {
        e.preventDefault(); setError(''); setSuccess('');
        if (!form.username || !form.email || !form.password || !form.confirmPassword) { setError('Please fill in all required fields.'); return; }
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

    const cardStyle = {
        background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)', borderRadius: '24px',
        padding: '40px', width: '100%', maxWidth: '420px',
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
                    <form onSubmit={handleSendOTP}>
                        <label style={labelStyle}>Username *</label>
                        <input style={inputStyle} type="text" name="username" value={form.username} onChange={handleChange} placeholder="Enter username" />
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
