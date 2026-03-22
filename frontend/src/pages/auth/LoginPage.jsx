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

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, user, loading: authLoading } = useAuth();
    const [form, setForm] = useState({ identifier: '', password: '', rememberMe: false });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    if (!authLoading && user) return <Navigate to="/home" replace />;

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm({ ...form, [e.target.name]: value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.identifier || !form.password) { setError('Please enter your username/email and password.'); return; }
        setSubmitting(true);
        try {
            const res = await API.post('/auth/login', form);
            login(res.data.user, res.data.token, form.rememberMe);
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogleSuccess = async (tokenResponse) => {
        setGoogleLoading(true);
        setError('');
        try {
            // tokenResponse.access_token from useGoogleLogin — we need to get the ID token
            // Use credential flow instead: handled by googleLoginWithCredential
        } catch (err) {
            setError('Google sign-in failed. Please try again.');
            setGoogleLoading(false);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setGoogleLoading(true);
            setError('');
            try {
                // Get user info from Google using access token
                const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                }).then(r => r.json());

                // Send to our backend with the sub as googleId
                const res = await API.post('/auth/google', {
                    credential: tokenResponse.access_token,
                    googleUserInfo: userInfo,
                    rememberMe: form.rememberMe
                });
                login(res.data.user, res.data.token, form.rememberMe);
                navigate('/home');
            } catch (err) {
                setError('Google sign-in failed. Please try again.');
            } finally {
                setGoogleLoading(false);
            }
        },
        onError: () => {
            setError('Google sign-in was cancelled or failed.');
            setGoogleLoading(false);
        }
    });

    // Detect if identifier looks like an email
    const isEmailLike = form.identifier.includes('@');

    const inputStyle = {
        width: '100%', padding: '12px 14px', borderRadius: '10px',
        border: '1.5px solid var(--input-border)', fontSize: '14px',
        outline: 'none', boxSizing: 'border-box', marginBottom: '16px',
        backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)',
        transition: 'border-color 0.2s'
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{
                background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '420px',
                boxShadow: '0 8px 40px var(--shadow-md)', border: '1px solid var(--glass-border)'
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 4px 16px rgba(99,102,241,0.3)', fontSize: '24px' }}>📚</div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '6px' }}>QuizApp</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Welcome back! Please login.</p>
                </div>

                {error && (
                    <div style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px', border: '1px solid var(--error)' }}>
                        {error}
                    </div>
                )}

                {/* Google button */}
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
                    {googleLoading ? 'Signing in...' : 'Continue with Google'}
                </button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
                </div>

                <form onSubmit={handleSubmit}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                        Username or Email
                        {form.identifier && (
                            <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--accent-text)', fontWeight: '500' }}>
                                {isEmailLike ? '(email detected)' : '(username detected)'}
                            </span>
                        )}
                    </label>
                    <input style={inputStyle} type="text" name="identifier" value={form.identifier} onChange={handleChange} placeholder="Enter username or email" autoComplete="username" />

                    <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Password</label>
                    <input style={inputStyle} type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" autoComplete="current-password" />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <input type="checkbox" name="rememberMe" checked={form.rememberMe} onChange={handleChange} style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: 'var(--accent)' }} />
                            Remember me
                        </label>
                        <Link to="/forgot-password" style={{ fontSize: '13px', color: 'var(--accent-text)', fontWeight: '600' }}>Forgot Password?</Link>
                    </div>

                    <button type="submit" disabled={submitting || googleLoading} style={{
                        width: '100%', padding: '13px',
                        background: submitting ? 'var(--border)' : 'var(--gradient-accent)',
                        color: '#fff', border: 'none', borderRadius: '12px',
                        fontSize: '15px', fontWeight: '700',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        boxShadow: submitting ? 'none' : '0 4px 16px rgba(99,102,241,0.35)',
                        transition: 'all 0.2s'
                    }}>
                        {submitting ? 'Logging in...' : 'Login →'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Don't have an account?{' '}
                    <Link to="/signup" style={{ color: 'var(--accent-text)', fontWeight: '700' }}>Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
