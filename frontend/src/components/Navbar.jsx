import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { preference, setPreference } = useContext(ThemeContext);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showThemeMenu, setShowThemeMenu] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null); // tracks which item is hovered
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
                setShowThemeMenu(false);
                setHoveredItem(null);
            }
        };
        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDropdown]);

    const themeOptions = [
        { key: 'light',  label: 'Light',  icon: '☀️' },
        { key: 'dark',   label: 'Dark',   icon: '🌙' },
        { key: 'system', label: 'System', icon: '💻' }
    ];

    const currentThemeIcon = themeOptions.find(o => o.key === preference)?.icon || '💻';

    // Reusable hover-aware item bg
    const itemBg = (key, isError = false, isActive = false) => {
        if (isActive) return 'var(--accent-light)';
        if (hoveredItem === key) return isError ? 'var(--error-light)' : 'var(--bg-hover)';
        return 'transparent';
    };

    const menuItemStyle = (key, extra = {}) => ({
        padding: '11px 16px',
        cursor: 'pointer',
        fontSize: '14px',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        borderBottom: '1px solid var(--border-light)',
        backgroundColor: itemBg(key),
        transition: 'background-color 0.15s',
        userSelect: 'none',
        ...extra
    });

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
            <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                    onClick={() => { setShowDropdown(p => !p); setShowThemeMenu(false); setHoveredItem(null); }}
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
                    <div style={{
                        position: 'absolute', top: '52px', right: 0,
                        backgroundColor: 'var(--dropdown-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px var(--shadow-md)',
                        zIndex: 200,
                        /* KEY FIX: fixed width + overflow hidden clips the right panel */
                        width: '220px',
                        overflow: 'hidden'
                    }}>
                        {/* Sliding panel track — 440px wide, slides left to reveal theme panel */}
                        <div style={{
                            display: 'flex',
                            width: '440px',
                            transform: showThemeMenu ? 'translateX(-220px)' : 'translateX(0)',
                            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}>

                            {/* ── LEFT PANEL: main menu ── */}
                            <div style={{ width: '220px', flexShrink: 0 }}>
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
                                    { key: 'profile',  label: '👤 View Profile',       path: '/profile'  },
                                    { key: 'contests', label: '🏆 Contest Summaries',  path: '/contests' },
                                    { key: 'analytics',label: '📊 Analytics',          path: '/analytics'}
                                ].map(item => (
                                    <div
                                        key={item.key}
                                        onClick={() => { navigate(item.path); setShowDropdown(false); setShowThemeMenu(false); }}
                                        onMouseEnter={() => setHoveredItem(item.key)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        style={menuItemStyle(item.key)}
                                    >
                                        {item.label}
                                    </div>
                                ))}

                                {/* Theme row */}
                                <div
                                    onClick={() => { setShowThemeMenu(true); setHoveredItem(null); }}
                                    onMouseEnter={() => setHoveredItem('theme')}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    style={{
                                        ...menuItemStyle('theme'),
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {currentThemeIcon} Theme
                                    </span>
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700' }}>›</span>
                                </div>

                                {/* Logout */}
                                <div
                                    onClick={handleLogout}
                                    onMouseEnter={() => setHoveredItem('logout')}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    style={{
                                        ...menuItemStyle('logout', { borderBottom: 'none' }),
                                        color: 'var(--error)',
                                        backgroundColor: itemBg('logout', true)
                                    }}
                                >
                                    🚪 Logout
                                </div>
                            </div>

                            {/* ── RIGHT PANEL: theme menu ── */}
                            <div style={{ width: '220px', flexShrink: 0 }}>
                                {/* Back button */}
                                <div
                                    onClick={() => { setShowThemeMenu(false); setHoveredItem(null); }}
                                    onMouseEnter={() => setHoveredItem('back')}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    style={{
                                        ...menuItemStyle('back'),
                                        fontSize: '13px',
                                        color: 'var(--text-muted)',
                                        fontWeight: '700',
                                        gap: '6px'
                                    }}
                                >
                                    ‹ Theme
                                </div>

                                {themeOptions.map(opt => {
                                    const isActive = preference === opt.key;
                                    const hoverKey = `theme_${opt.key}`;
                                    return (
                                        <div
                                            key={opt.key}
                                            onClick={() => { setPreference(opt.key); setShowThemeMenu(false); setHoveredItem(null); }}
                                            onMouseEnter={() => setHoveredItem(hoverKey)}
                                            onMouseLeave={() => setHoveredItem(null)}
                                            style={{
                                                padding: '11px 16px', cursor: 'pointer',
                                                fontSize: '14px', userSelect: 'none',
                                                color: isActive ? 'var(--accent-text)' : 'var(--text-primary)',
                                                backgroundColor: isActive
                                                    ? 'var(--accent-light)'
                                                    : hoveredItem === hoverKey ? 'var(--bg-hover)' : 'transparent',
                                                display: 'flex', alignItems: 'center',
                                                justifyContent: 'space-between',
                                                borderBottom: '1px solid var(--border-light)',
                                                transition: 'background-color 0.15s',
                                                fontWeight: isActive ? '700' : '400'
                                            }}
                                        >
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {opt.icon} {opt.label}
                                            </span>
                                            {isActive && (
                                                <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '700' }}>✓</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
