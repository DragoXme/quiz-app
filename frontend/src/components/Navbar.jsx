import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { theme, preference, setPreference } = useContext(ThemeContext);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showThemeMenu, setShowThemeMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const themeOptions = [
        { key: 'light',  label: 'Light',  icon: '☀️' },
        { key: 'dark',   label: 'Dark',   icon: '🌙' },
        { key: 'system', label: 'System', icon: '💻' }
    ];

    const currentThemeIcon = themeOptions.find(o => o.key === preference)?.icon || '💻';

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
            <div onClick={() => navigate('/home')} style={{
                fontSize: '20px', fontWeight: '800',
                background: 'var(--gradient-accent)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', cursor: 'pointer', letterSpacing: '-0.5px'
            }}>
                QuizApp
            </div>

            {/* Profile dropdown */}
            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => { setShowDropdown(!showDropdown); setShowThemeMenu(false); }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'var(--accent-light)', border: '1px solid var(--border)',
                        borderRadius: '12px', padding: '7px 14px', cursor: 'pointer',
                        fontSize: '14px', fontWeight: '600', color: 'var(--accent-text)',
                        transition: 'all 0.2s'
                    }}
                >
                    <div style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: 'var(--gradient-accent)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: '700'
                    }}>
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    {user?.username}
                    <span style={{ fontSize: '10px', opacity: 0.7 }}>▼</span>
                </button>

                {showDropdown && (
                    <>
                        {/* Backdrop */}
                        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                            onClick={() => { setShowDropdown(false); setShowThemeMenu(false); }} />

                        <div style={{
                            position: 'absolute', top: '52px', right: 0,
                            backgroundColor: 'var(--dropdown-bg)',
                            border: '1px solid var(--border)',
                            borderRadius: '16px',
                            boxShadow: '0 8px 32px var(--shadow-md)',
                            minWidth: '220px',
                            zIndex: 100,
                            overflow: 'hidden'
                        }}>
                            {/* User info header */}
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

                            {/* Nav items */}
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

                            {/* Theme option — expands into submenu */}
                            {!showThemeMenu ? (
                                <div
                                    onClick={(e) => { e.stopPropagation(); setShowThemeMenu(true); }}
                                    style={{
                                        padding: '11px 16px', cursor: 'pointer',
                                        fontSize: '14px', color: 'var(--text-primary)',
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'space-between',
                                        borderBottom: '1px solid var(--border-light)',
                                        transition: 'background-color 0.15s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {currentThemeIcon} Theme
                                    </span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>›</span>
                                </div>
                            ) : (
                                /* Theme submenu — replaces the single row */
                                <div style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    {/* Back button */}
                                    <div
                                        onClick={(e) => { e.stopPropagation(); setShowThemeMenu(false); }}
                                        style={{
                                            padding: '10px 16px', cursor: 'pointer',
                                            fontSize: '12px', color: 'var(--text-muted)',
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            borderBottom: '1px solid var(--border-light)',
                                            transition: 'background-color 0.15s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        ‹ Theme
                                    </div>
                                    {themeOptions.map(opt => (
                                        <div
                                            key={opt.key}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreference(opt.key);
                                                setShowThemeMenu(false);
                                            }}
                                            style={{
                                                padding: '11px 16px', cursor: 'pointer',
                                                fontSize: '14px',
                                                color: preference === opt.key ? 'var(--accent-text)' : 'var(--text-primary)',
                                                backgroundColor: preference === opt.key ? 'var(--accent-light)' : 'transparent',
                                                display: 'flex', alignItems: 'center',
                                                justifyContent: 'space-between',
                                                transition: 'background-color 0.15s'
                                            }}
                                            onMouseEnter={e => {
                                                if (preference !== opt.key) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.backgroundColor = preference === opt.key ? 'var(--accent-light)' : 'transparent';
                                            }}
                                        >
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {opt.icon} {opt.label}
                                            </span>
                                            {preference === opt.key && (
                                                <span style={{ fontSize: '13px', color: 'var(--accent)' }}>✓</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Logout */}
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
        </nav>
    );
};

export default Navbar;
