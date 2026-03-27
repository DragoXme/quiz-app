import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TodoPanel from '../components/TodoPanel';
import useAuth from '../hooks/useAuth';
import useWindowSize from '../hooks/useWindowSize';

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isMobile } = useWindowSize();
    const [activeContests, setActiveContests] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const [hoveredResume, setHoveredResume] = useState(null);
    const [todoCollapsed, setTodoCollapsed] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        loadContests();
        timerRef.current = setInterval(() => {
            setActiveContests(prev => {
                const updated = prev
                    .map(c => ({ ...c, timeLeft: c.timeLeft - 1 }))
                    .filter(c => c.timeLeft > 0);
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
    const displayName = user?.displayName || user?.username || '';

    // Left column takes remaining space; right todo panel: expanded=320px, collapsed=56px
    const todoWidth = todoCollapsed ? '56px' : '300px';

    const MainContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {/* Welcome */}
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Welcome back,{' '}
                    <span style={{ background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        {displayName}
                    </span>! 👋
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>What would you like to do today?</p>
            </div>

            {/* Pending Tests */}
            {activeContests.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="pulse">⚡</span>
                            {activeContests.length} unfinished test{activeContests.length > 1 ? 's' : ''}
                        </p>
                        {activeContests.length > 1 && (
                            <button onClick={() => setExpanded(!expanded)} style={{
                                background: 'var(--glass-bg)', backdropFilter: 'blur(8px)',
                                border: '1px solid var(--warning)', color: 'var(--warning)',
                                borderRadius: '20px', padding: '3px 12px',
                                fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s'
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
                            background: 'var(--warning-light)', border: '1.5px solid var(--warning)',
                            borderRadius: '14px', padding: '14px 18px', marginBottom: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            flexWrap: 'wrap', gap: '10px'
                        }}>
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Test #{activeContests.length - idx}</p>
                                <p style={{ fontSize: '13px', fontWeight: '700', color: timerColor(c.timeLeft), marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
                                    ⏱ {formatTimeLeft(c.timeLeft)}
                                </p>
                            </div>
                            <button onClick={() => navigate(`/test/${c.contestId}`)}
                                onMouseEnter={() => setHoveredResume(c.contestId)}
                                onMouseLeave={() => setHoveredResume(null)}
                                style={{
                                    padding: '8px 20px',
                                    background: hoveredResume === c.contestId ? 'linear-gradient(135deg, #EF4444, #F59E0B)' : 'linear-gradient(135deg, #F59E0B, #EF4444)',
                                    color: '#fff', border: 'none', borderRadius: '10px',
                                    fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                                    transform: hoveredResume === c.contestId ? 'translateY(-2px) scale(1.03)' : 'translateY(0) scale(1)',
                                    boxShadow: hoveredResume === c.contestId ? '0 6px 18px rgba(245,158,11,0.45)' : '0 2px 8px rgba(0,0,0,0.12)',
                                    transition: 'all 0.2s ease'
                                }}
                            >Resume →</button>
                        </div>
                    ))}
                </div>
            )}

            {/* Main Action Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                {cards.map((card) => (
                    <div key={card.path} onClick={() => navigate(card.path)} style={{
                        background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)',
                        WebkitBackdropFilter: 'var(--glass-blur)', borderRadius: '18px',
                        padding: '22px 20px', cursor: 'pointer', boxShadow: '0 4px 20px var(--shadow)',
                        border: '1px solid var(--glass-border)', transition: 'all 0.25s ease',
                        textAlign: 'center', position: 'relative', overflow: 'hidden'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 16px 40px var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px var(--shadow)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                    >
                        <div style={{ position: 'absolute', top: '-16px', right: '-16px', width: '64px', height: '64px', borderRadius: '50%', background: card.gradient, opacity: 0.15 }} />
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: card.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', margin: '0 auto 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                            {card.icon}
                        </div>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>{card.title}</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{card.description}</p>
                    </div>
                ))}
            </div>

            {/* Secondary Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {[
                    { icon: '🏆', title: 'Contest Summaries', desc: 'View past test results', path: '/contests' },
                    { icon: '📊', title: 'Analytics', desc: 'Track your performance', path: '/analytics' }
                ].map(item => (
                    <div key={item.path} onClick={() => navigate(item.path)} style={{
                        background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)',
                        WebkitBackdropFilter: 'var(--glass-blur)', borderRadius: '14px',
                        padding: '16px 18px', cursor: 'pointer', boxShadow: '0 2px 12px var(--shadow)',
                        border: '1px solid var(--glass-border)', display: 'flex',
                        alignItems: 'center', gap: '12px', transition: 'all 0.2s'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px var(--shadow)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                            {item.icon}
                        </div>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{item.title}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Navbar />

            {isMobile ? (
                /* ── MOBILE: stacked layout ── */
                <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <MainContent />
                    <TodoPanel
                        collapsed={todoCollapsed}
                        onToggleCollapse={() => setTodoCollapsed(p => !p)}
                    />
                </div>
            ) : (
                /* ── DESKTOP: side-by-side split layout ── */
                <div style={{
                    maxWidth: '1200px', margin: '0 auto', padding: '36px 24px',
                    display: 'flex', gap: '20px', alignItems: 'flex-start'
                }}>
                    {/* Left — main content, grows to fill */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <MainContent />
                    </div>

                    {/* Right — todo panel, fixed width with smooth transition */}
                    <div style={{
                        width: todoWidth,
                        flexShrink: 0,
                        transition: 'width 0.3s ease',
                        position: 'sticky',
                        top: '84px',   /* below navbar */
                        maxHeight: 'calc(100vh - 104px)',
                        overflowY: 'auto'
                    }}>
                        {todoCollapsed ? (
                            /* Collapsed: vertical pill with icon + label rotated */
                            <div
                                onClick={() => setTodoCollapsed(false)}
                                title="Expand Study Tasks"
                                style={{
                                    background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)',
                                    WebkitBackdropFilter: 'var(--glass-blur)',
                                    border: '1px solid var(--glass-border)', borderRadius: '16px',
                                    height: '120px', display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center', gap: '6px',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    boxShadow: '0 4px 20px var(--shadow)'
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                            >
                                <span style={{ fontSize: '18px' }}>📋</span>
                                <span style={{
                                    fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)',
                                    writingMode: 'vertical-rl', textOrientation: 'mixed',
                                    transform: 'rotate(180deg)', letterSpacing: '0.5px'
                                }}>TASKS</span>
                                <span style={{ fontSize: '10px', color: 'var(--accent)', transform: 'rotate(90deg)' }}>›</span>
                            </div>
                        ) : (
                            <TodoPanel
                                collapsed={false}
                                onToggleCollapse={() => setTodoCollapsed(true)}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;
