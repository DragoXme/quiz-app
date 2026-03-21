import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{
            backgroundColor: 'var(--navbar-bg)',
            borderBottom: '1px solid var(--navbar-border)',
            padding: '0 24px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 1px 20px var(--shadow)'
        }}>
            {/* Logo */}
            <div
                onClick={() => navigate('/home')}
                style={{
                    fontSize: '20px',
                    fontWeight: '800',
                    background: 'var(--gradient-accent)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    cursor: 'pointer',
                    letterSpacing: '-0.5px'
                }}
            >
                QuizApp
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    style={{
                        width: '38px', height: '38px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg-hover)',
                        cursor: 'pointer',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>

                {/* Profile */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'var(--accent-light)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            padding: '7px 14px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--accent-text)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{
                            width: '28px', height: '28px',
                            borderRadius: '8px',
                            background: 'var(--gradient-accent)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: '700'
                        }}>
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        {user?.username}
                        <span style={{ fontSize: '10px', opacity: 0.7 }}>▼</span>
                    </button>

                    {showDropdown && (
                        <>
                            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }}
                                onClick={() => setShowDropdown(false)} />
                            <div style={{
                                position: 'absolute', top: '52px', right: 0,
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: '16px',
                                boxShadow: `0 8px 32px var(--shadow-md)`,
                                minWidth: '210px',
                                zIndex: 100,
                                overflow: 'hidden',
                                backdropFilter: 'blur(12px)'
                            }}>
                                <div style={{
                                    padding: '14px 16px',
                                    borderBottom: '1px solid var(--border-light)',
                                    background: 'var(--gradient-card)'
                                }}>
                                    <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                        {user?.username}
                                    </p>
                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                        {user?.email}
                                    </p>
                                </div>

                                {[
                                    { label: '👤 View Profile', path: '/profile' },
                                    { label: '🏆 Contest Summaries', path: '/contests' },
                                    { label: '📊 Analytics', path: '/analytics' }
                                ].map(item => (
                                    <div key={item.path}
                                        onClick={() => { navigate(item.path); setShowDropdown(false); }}
                                        style={{
                                            padding: '11px 16px', cursor: 'pointer',
                                            fontSize: '14px', color: 'var(--text-primary)',
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            borderBottom: '1px solid var(--border-light)',
                                            transition: 'background-color 0.15s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        {item.label}
                                    </div>
                                ))}

                                <div onClick={handleLogout} style={{
                                    padding: '11px 16px', cursor: 'pointer',
                                    fontSize: '14px', color: 'var(--error)',
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    transition: 'background-color 0.15s'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--error-light)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    🚪 Logout
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
