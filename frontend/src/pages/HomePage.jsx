import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import useAuth from '../hooks/useAuth';

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeContest, setActiveContest] = useState(null);

    useEffect(() => {
        // Check if there's an active contest in localStorage
        const saved = localStorage.getItem('activeContest');
        if (saved) {
            const data = JSON.parse(saved);
            const elapsed = Math.floor((Date.now() - data.startedAt) / 1000);
            const timeLeft = data.totalTime - elapsed;
            if (timeLeft > 0) {
                setActiveContest({ ...data, timeLeft });
            } else {
                // Time has expired, clear it
                localStorage.removeItem('activeContest');
            }
        }
    }, []);

    const cards = [
        {
            title: 'Explore Questions',
            description: 'Browse, filter and sort all your questions.',
            icon: '🔍',
            color: '#4F46E5',
            path: '/questions'
        },
        {
            title: 'Create Question',
            description: 'Add new MCQ or Fill in the blank questions.',
            icon: '✏️',
            color: '#10B981',
            path: '/questions/create'
        },
        {
            title: 'Take Test',
            description: 'Start a customized test with your questions.',
            icon: '🎯',
            color: '#F59E0B',
            path: '/test/configure'
        }
    ];

    const formatTimeLeft = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Navbar />
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>

                {/* Welcome */}
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{
                        fontSize: '32px', fontWeight: '800',
                        color: 'var(--text-primary)', marginBottom: '8px'
                    }}>
                        Welcome back, {user?.username}! 👋
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
                        What would you like to do today?
                    </p>
                </div>

                {/* Resume Test Banner */}
                {activeContest && (
                    <div style={{
                        backgroundColor: 'var(--warning-light)',
                        border: '2px solid var(--warning)',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        marginBottom: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '24px' }}>⚡</span>
                            <div>
                                <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                    You have an unfinished test!
                                </p>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    Time remaining: ~{formatTimeLeft(activeContest.timeLeft)}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/test/${activeContest.contestId}`)}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: 'var(--warning)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '700',
                                cursor: 'pointer'
                            }}
                        >
                            Resume Test →
                        </button>
                    </div>
                )}

                {/* Main Action Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '24px',
                    marginBottom: '48px'
                }}>
                    {cards.map((card) => (
                        <div
                            key={card.path}
                            onClick={() => navigate(card.path)}
                            style={{
                                backgroundColor: 'var(--bg-card)',
                                borderRadius: '16px',
                                padding: '32px 24px',
                                cursor: 'pointer',
                                boxShadow: `0 2px 8px var(--shadow)`,
                                border: '2px solid var(--border)',
                                transition: 'all 0.2s',
                                textAlign: 'center'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = card.color;
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = `0 8px 24px var(--shadow-md)`;
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'var(--border)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = `0 2px 8px var(--shadow)`;
                            }}
                        >
                            <div style={{
                                width: '64px', height: '64px',
                                borderRadius: '16px',
                                backgroundColor: 'var(--accent-light)',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '28px',
                                margin: '0 auto 16px'
                            }}>
                                {card.icon}
                            </div>
                            <h3 style={{
                                fontSize: '18px', fontWeight: '700',
                                color: 'var(--text-primary)', marginBottom: '8px'
                            }}>
                                {card.title}
                            </h3>
                            <p style={{
                                fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5'
                            }}>
                                {card.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Secondary Actions */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px'
                }}>
                    {[
                        { icon: '🏆', title: 'Contest Summaries', desc: 'View past test results', path: '/contests' },
                        { icon: '📊', title: 'Analytics', desc: 'Track your performance', path: '/analytics' }
                    ].map(item => (
                        <div
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            style={{
                                backgroundColor: 'var(--bg-card)',
                                borderRadius: '12px',
                                padding: '20px 24px',
                                cursor: 'pointer',
                                boxShadow: `0 2px 8px var(--shadow)`,
                                border: '1px solid var(--border)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 16px var(--shadow-md)`}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = `0 2px 8px var(--shadow)`}
                        >
                            <span style={{ fontSize: '24px' }}>{item.icon}</span>
                            <div>
                                <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                    {item.title}
                                </p>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
