import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import useAuth from '../hooks/useAuth';

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeContests, setActiveContests] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const [hoveredResume, setHoveredResume] = useState(null);
    const timerRef = useRef(null);

    useEffect(() => {
        loadContests();
        // Tick every second to update time left
        timerRef.current = setInterval(() => {
            setActiveContests(prev => {
                const updated = prev
                    .map(c => ({ ...c, timeLeft: c.timeLeft - 1 }))
                    .filter(c => c.timeLeft > 0);
                // Sync expired ones out of localStorage
                const saved = JSON.parse(localStorage.getItem('activeContests') || '[]');
                const validIds = new Set(updated.map(c => c.contestId));
                localStorage.setItem('activeContests', JSON.stringify(
                    saved.filter(c => validIds.has(c.contestId))
                ));
                return updated;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, []);

    const loadContests = () => {
        const saved = JSON.parse(localStorage.getItem('activeContests') || '[]');
        const now = Date.now();
        const valid = saved
            .filter(c => (c.totalTime - Math.floor((now - c.startedAt) / 1000)) > 0)
            .map(c => ({ ...c, timeLeft: c.totalTime - Math.floor((now - c.startedAt) / 1000) }));
        localStorage.setItem('activeContests', JSON.stringify(valid));
        setActiveContests(valid);
    };

    const formatTimeLeft = (seconds) => {
        if (seconds <= 0) return '0s';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const timerColor = (seconds) => {
        if (seconds < 60) return 'var(--error)';
        if (seconds < 300) return 'var(--warning)';
        return 'var(--success)';
    };

    const cards = [
        { title: 'Explore Questions', description: 'Browse, filter and sort all your questions.', icon: '🔍', gradient: 'linear-gradient(135deg, #6366F1, #8B5CF6)', path: '/questions' },
        { title: 'Create Question', description: 'Add new MCQ or Fill in the blank questions.', icon: '✏️', gradient: 'linear-gradient(135deg, #10B981, #059669)', path: '/questions/create' },
        { title: 'Take Test', description: 'Start a customized test with your questions.', icon: '🎯', gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)', path: '/test/configure' }
    ];

    const visibleContests = expanded ? activeContests : activeContests.slice(0, 1);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Navbar />
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

                {/* Welcome */}
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '30px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>
                        Welcome back,{' '}
                        <span style={{ background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                            {user?.username}
                        </span>! 👋
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>What would you like to do today?</p>
                </div>

                {/* Pending Tests */}
                {activeContests.length > 0 && (
                    <div style={{ marginBottom: '28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className="pulse">⚡</span>
                                {activeContests.length} unfinished test{activeContests.length > 1 ? 's' : ''}
                            </p>
                            {activeContests.length > 1 && (
                                <button
                                    onClick={() => setExpanded(!expanded)}
                                    style={{
                                        background: 'var(--glass-bg)', backdropFilter: 'blur(8px)',
                                        border: '1px solid var(--warning)', color: 'var(--warning)',
                                        borderRadius: '20px', padding: '3px 12px',
                                        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--warning)'; e.currentTarget.style.color = '#fff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--glass-bg)'; e.currentTarget.style.color = 'var(--warning)'; }}
                                >
                                    <span style={{ display: 'inline-block', transition: 'transform 0.3s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                                    {expanded ? 'Show less' : `Show all ${activeContests.length}`}
                                </button>
                            )}
                        </div>

                        {visibleContests.map((c, idx) => (
                            <div key={c.contestId} className={idx > 0 ? 'slide-down' : ''} style={{
                                background: 'var(--warning-light)',
                                border: '1.5px solid var(--warning)',
                                borderRadius: '14px', padding: '14px 18px',
                                marginBottom: '8px', display: 'flex',
                                alignItems: 'center', justifyContent: 'space-between',
                                flexWrap: 'wrap', gap: '10px'
                            }}>
                                <div>
                                    <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                        Test #{activeContests.length - idx}
                                    </p>
                                    <p style={{ fontSize: '13px', fontWeight: '700', color: timerColor(c.timeLeft), marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
                                        ⏱ {formatTimeLeft(c.timeLeft)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate(`/test/${c.contestId}`)}
                                    onMouseEnter={() => setHoveredResume(c.contestId)}
                                    onMouseLeave={() => setHoveredResume(null)}
                                    style={{
                                        padding: '8px 20px',
                                        background: hoveredResume === c.contestId
                                            ? 'linear-gradient(135deg, #EF4444, #F59E0B)'
                                            : 'linear-gradient(135deg, #F59E0B, #EF4444)',
                                        color: '#fff', border: 'none', borderRadius: '10px',
                                        fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                                        transform: hoveredResume === c.contestId ? 'translateY(-2px) scale(1.03)' : 'translateY(0) scale(1)',
                                        boxShadow: hoveredResume === c.contestId ? '0 6px 18px rgba(245,158,11,0.45)' : '0 2px 8px rgba(0,0,0,0.12)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
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
                            background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)',
                            WebkitBackdropFilter: 'var(--glass-blur)',
                            borderRadius: '20px', padding: '28px 24px', cursor: 'pointer',
                            boxShadow: '0 4px 20px var(--shadow)', border: '1px solid var(--glass-border)',
                            transition: 'all 0.25s ease', textAlign: 'center',
                            position: 'relative', overflow: 'hidden'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 40px var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px var(--shadow)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                        >
                            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: card.gradient, opacity: 0.15 }} />
                            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: card.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 16px', boxShadow: '0 4px 14px rgba(0,0,0,0.18)' }}>
                                {card.icon}
                            </div>
                            <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>{card.title}</h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{card.description}</p>
                        </div>
                    ))}
                </div>

                {/* Secondary Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {[
                        { icon: '🏆', title: 'Contest Summaries', desc: 'View past test results', path: '/contests' },
                        { icon: '📊', title: 'Analytics', desc: 'Track your performance', path: '/analytics' }
                    ].map(item => (
                        <div key={item.path} onClick={() => navigate(item.path)} style={{
                            background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)',
                            WebkitBackdropFilter: 'var(--glass-blur)',
                            borderRadius: '16px', padding: '18px 20px', cursor: 'pointer',
                            boxShadow: '0 2px 12px var(--shadow)', border: '1px solid var(--glass-border)',
                            display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px var(--shadow)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
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
