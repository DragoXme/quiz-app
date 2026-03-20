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
            borderBottom: '1px solid var(--border)',
            padding: '0 24px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: `0 1px 4px var(--shadow)`
        }}>
            {/* Logo */}
            <div
                onClick={() => navigate('/home')}
                style={{
                    fontSize: '20px',
                    fontWeight: '800',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    letterSpacing: '-0.5px'
                }}
            >
                QuizApp
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg-hover)',
                        cursor: 'pointer',
                        fontSize: '18px',
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
                            backgroundColor: 'var(--accent-light)',
                            border: 'none',
                            borderRadius: '24px',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--accent-text)'
                        }}
                    >
                        <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--accent)',
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
                        <span style={{ fontSize: '10px' }}>▼</span>
                    </button>

                    {showDropdown && (
                        <>
                            <div
                                style={{
                                    position: 'fixed',
                                    top: 0, left: 0, right: 0, bottom: 0,
                                    zIndex: 99
                                }}
                                onClick={() => setShowDropdown(false)}
                            />
                            <div style={{
                                position: 'absolute',
                                top: '48px',
                                right: 0,
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                boxShadow: `0 8px 24px var(--shadow-md)`,
                                minWidth: '200px',
                                zIndex: 100,
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    padding: '12px 16px',
                                    borderBottom: '1px solid var(--border-light)',
                                    backgroundColor: 'var(--bg-hover)'
                                }}>
                                    <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                        {user?.username}
                                    </p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                        {user?.email}
                                    </p>
                                </div>

                                {[
                                    { label: '👤 View Profile', path: '/profile' },
                                    { label: '🏆 Contest Summaries', path: '/contests' },
                                    { label: '📊 Analytics', path: '/analytics' }
                                ].map(item => (
                                    <div
                                        key={item.path}
                                        onClick={() => { navigate(item.path); setShowDropdown(false); }}
                                        style={{
                                            padding: '12px 16px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            color: 'var(--text-primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            borderBottom: '1px solid var(--border-light)',
                                            transition: 'background-color 0.15s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
                                    >
                                        {item.label}
                                    </div>
                                ))}

                                <div
                                    onClick={handleLogout}
                                    style={{
                                        padding: '12px 16px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: 'var(--error)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        transition: 'background-color 0.15s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--error-light)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
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