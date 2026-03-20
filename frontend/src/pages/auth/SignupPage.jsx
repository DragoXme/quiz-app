import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import useAuth from '../../hooks/useAuth';

const SignupPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({
        username: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

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

        setLoading(true);
        try {
            const res = await API.post('/auth/signup', form);
            login(res.data.user, res.data.token);
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
        }}>
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                padding: '40px',
                width: '100%',
                maxWidth: '440px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '800',
                        color: '#4F46E5',
                        marginBottom: '8px'
                    }}>
                        QuizApp
                    </h1>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                        Create your account
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

                <form onSubmit={handleSubmit}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '6px' }}>
                        Username *
                    </label>
                    <input
                        style={inputStyle}
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="Enter username"
                    />

                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '6px' }}>
                        Email *
                    </label>
                    <input
                        style={inputStyle}
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Enter email"
                    />

                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '6px' }}>
                        Mobile (optional)
                    </label>
                    <input
                        style={inputStyle}
                        type="tel"
                        name="mobile"
                        value={form.mobile}
                        onChange={handleChange}
                        placeholder="Enter mobile number"
                    />

                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '6px' }}>
                        Password *
                    </label>
                    <input
                        style={inputStyle}
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Min 6 characters"
                    />

                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '6px' }}>
                        Confirm Password *
                    </label>
                    <input
                        style={inputStyle}
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter password"
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
                            transition: 'background-color 0.2s'
                        }}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p style={{
                    textAlign: 'center',
                    marginTop: '24px',
                    fontSize: '14px',
                    color: '#666'
                }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#4F46E5', fontWeight: '600' }}>
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;