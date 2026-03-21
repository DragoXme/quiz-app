import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import API from '../../api/axios';
import useAuth from '../../hooks/useAuth';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, user, loading: authLoading } = useAuth();
    const [form, setForm] = useState({ username: '', password: '', rememberMe: false });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!authLoading && user) return <Navigate to="/home" replace />;

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm({ ...form, [e.target.name]: value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.username || !form.password) { setError('Please enter username and password.'); return; }
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

    const inputStyle = {
        width: '100%', padding: '12px 14px',
        borderRadius: '10px', border: '1.5px solid var(--input-border)',
        fontSize: '14px', outline: 'none', boxSizing: 'border-box',
        marginBottom: '16px', backgroundColor: 'var(--bg-input)',
        color: 'var(--text-primary)', transition: 'border-color 0.2s'
    };

    return (
        <div style={{
            minHeight: '100vh', backgroundColor: 'var(--bg-main)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
            <div style={{
                backgroundColor: 'var(--bg-card)', borderRadius: '24px', padding: '40px',
                width: '100%', maxWidth: '420px',
                boxShadow: `0 8px 40px var(--shadow-md)`,
                border: '1px solid var(--border)'
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '52px', height: '52px', borderRadius: '16px',
                        background: 'var(--gradient-accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 14px',
                        boxShadow: '0 4px 16px rgba(99,102,241,0.3)'
                    }}>
                        <span style={{ fontSize: '24px' }}>📚</span>
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '6px' }}>
                        QuizApp
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Welcome back! Please login.
                    </p>
                </div>

                {error && (
                    <div style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px', border: '1px solid var(--error)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Username</label>
                    <input style={inputStyle} type="text" name="username" value={form.username} onChange={handleChange} placeholder="Enter your username" />

                    <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Password</label>
                    <input style={inputStyle} type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <input type="checkbox" name="rememberMe" checked={form.rememberMe} onChange={handleChange} style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: 'var(--accent)' }} />
                            Remember me
                        </label>
                        <Link to="/forgot-password" style={{ fontSize: '13px', color: 'var(--accent-text)', fontWeight: '600' }}>
                            Forgot Password?
                        </Link>
                    </div>

                    <button type="submit" disabled={submitting} style={{
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
