import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{
            backgroundColor: '#fff',
            borderBottom: '1px solid #e5e7eb',
            padding: '0 24px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
        }}>
            {/* Logo */}
            <div
                onClick={() => navigate('/home')}
                style={{
                    fontSize: '20px',
                    fontWeight: '800',
                    color: '#4F46E5',
                    cursor: 'pointer',
                    letterSpacing: '-0.5px'
                }}
            >
                QuizApp
            </div>

            {/* Profile */}
            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#EEF2FF',
                        border: 'none',
                        borderRadius: '24px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#4F46E5'
                    }}
                >
                    <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: '#4F46E5',
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
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                            minWidth: '200px',
                            zIndex: 100,
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                padding: '12px 16px',
                                borderBottom: '1px solid #f0f0f0',
                                backgroundColor: '#fafafa'
                            }}>
                                <p style={{ fontSize: '13px', fontWeight: '700', color: '#333' }}>
                                    {user?.username}
                                </p>
                                <p style={{ fontSize: '12px', color: '#888' }}>
                                    {user?.email}
                                </p>
                            </div>

                            <div
                                onClick={() => { navigate('/profile'); setShowDropdown(false); }}
                                style={{
                                    padding: '12px 16px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#333',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    borderBottom: '1px solid #f0f0f0'
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
                            >
                                👤 View Profile
                            </div>

                            <div
                                onClick={() => { navigate('/contests'); setShowDropdown(false); }}
                                style={{
                                    padding: '12px 16px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#333',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    borderBottom: '1px solid #f0f0f0'
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
                            >
                                🏆 Contest Summaries
                            </div>

                            <div
                                onClick={() => { navigate('/analytics'); setShowDropdown(false); }}
                                style={{
                                    padding: '12px 16px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#333',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    borderBottom: '1px solid #f0f0f0'
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
                            >
                                📊 Analytics
                            </div>

                            <div
                                onClick={handleLogout}
                                style={{
                                    padding: '12px 16px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#EF4444',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
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