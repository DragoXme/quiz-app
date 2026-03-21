import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import useAuth from '../hooks/useAuth';

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeContests, setActiveContests] = useState([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('activeContests') || '[]');
        const now = Date.now();
        const valid = saved.filter(c => {
            const elapsed = Math.floor((now - c.startedAt) / 1000);
            return (c.totalTime - elapsed) > 0;
        }).map(c => {
            const elapsed = Math.floor((now - c.startedAt) / 1000);
            return { ...c, timeLeft: c.totalTime - elapsed };
        });
        localStorage.setItem('activeContests', JSON.stringify(
            saved.filter(c => {
                const elapsed = Math.floor((now - c.startedAt) / 1000);
                return (c.totalTime - elapsed) > 0;
            })
        ));
        setActiveContests(valid);
    }, []);

    const formatTimeLeft = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const cards = [
        {
            title: 'Explore Questions',
            description: 'Browse, filter and sort all your questions.',
            icon: '🔍',
            gradient: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            path: '/questions'
        },
        {
            title: 'Create Question',
            description: 'Add new MCQ or Fill in the blank questions.',
            icon: '✏️',
            gradient: 'linear-gradient(135deg, #10B981, #059669)',
            path: '/questions/create'
        },
        {
            title: 'Take Test',
            description: 'Start a customized test with your questions.',
            icon: '🎯',
            gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
            path: '/test/configure'
        }
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Navbar />
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

                {/* Welcome */}
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '30px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>
                        Welcome back, <span style={{ background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{user?.username}</span>! 👋
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                        What would you like to do today?
                    </p>
                </div>

                {/* Pending Tests Banner */}
                {activeContests.length > 0 && (
                    <div style={{ marginBottom: '28px' }}>
                        <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--warning)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            ⚡ {activeContests.length} unfinished test{activeContests.length > 1 ? 's' : ''}
                        </p>
                        {activeContests.map((c, idx) => (
                            <div key={c.contestId} style={{
                                background: 'var(--warning-light)',
                                border: '1.5px solid var(--warning)',
                                borderRadius: '14px',
                                padding: '14px 18px',
                                marginBottom: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '10px'
                            }}>
                                <div>
                                    <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                        Test #{idx + 1}
                                    </p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                        ⏱ ~{formatTimeLeft(c.timeLeft)} remaining
                                    </p>
                                </div>
                                <button onClick={() => navigate(`/test/${c.contestId}`)} style={{
                                    padding: '8px 18px',
                                    background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                                    color: '#fff', border: 'none',
                                    borderRadius: '10px', fontSize: '13px',
                                    fontWeight: '700', cursor: 'pointer'
                                }}>
                                    Resume →
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Main Action Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                    {cards.map((card) => (
                        <div key={card.path} onClick={() => navigate(card.path)} style={{
                            backgroundColor: 'var(--bg-card)',
                            borderRadius: '20px',
                            padding: '28px 24px',
                            cursor: 'pointer',
                            boxShadow: `0 2px 16px var(--shadow)`,
                            border: '1px solid var(--border)',
                            transition: 'all 0.25s ease',
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-6px)';
                                e.currentTarget.style.boxShadow = `0 16px 40px var(--shadow-md)`;
                                e.currentTarget.style.borderColor = 'var(--accent)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = `0 2px 16px var(--shadow)`;
                                e.currentTarget.style.borderColor = 'var(--border)';
                            }}
                        >
                            {/* Gradient blob in background */}
                            <div style={{
                                position: 'absolute', top: '-20px', right: '-20px',
                                width: '80px', height: '80px', borderRadius: '50%',
                                background: card.gradient, opacity: 0.08
                            }} />
                            <div style={{
                                width: '56px', height: '56px',
                                borderRadius: '16px',
                                background: card.gradient,
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                margin: '0 auto 16px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }}>
                                {card.icon}
                            </div>
                            <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                                {card.title}
                            </h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                {card.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Secondary Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {[
                        { icon: '🏆', title: 'Contest Summaries', desc: 'View past test results', path: '/contests', color: '#8B5CF6' },
                        { icon: '📊', title: 'Analytics', desc: 'Track your performance', path: '/analytics', color: '#06B6D4' }
                    ].map(item => (
                        <div key={item.path} onClick={() => navigate(item.path)} style={{
                            backgroundColor: 'var(--bg-card)',
                            borderRadius: '16px', padding: '18px 20px',
                            cursor: 'pointer',
                            boxShadow: `0 2px 12px var(--shadow)`,
                            border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', gap: '14px',
                            transition: 'all 0.2s'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 20px var(--shadow-md)`; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 2px 12px var(--shadow)`; e.currentTarget.style.borderColor = 'var(--border)'; }}
                        >
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                                {item.icon}
                            </div>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{item.title}</p>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
