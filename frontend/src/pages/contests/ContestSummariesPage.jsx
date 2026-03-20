import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Navbar from '../../components/Navbar';
import { formatDate } from '../../utils/helpers';
import useWindowSize from '../../hooks/useWindowSize';

const ContestSummariesPage = () => {
    const navigate = useNavigate();
    const { isMobile } = useWindowSize();
    const [summaries, setSummaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => { fetchSummaries(); }, []);

    const fetchSummaries = async () => {
        try {
            const res = await API.get('/contests');
            setSummaries(res.data.summaries);
        } catch (err) {
            setError('Failed to load contest summaries.');
        } finally {
            setLoading(false);
        }
    };

    const sectionStyle = {
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        padding: isMobile ? '16px' : '24px',
        marginBottom: '12px',
        boxShadow: `0 2px 8px var(--shadow)`,
        border: '1px solid var(--border)'
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Navbar />
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
                Loading summaries...
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Navbar />
            <div style={{ maxWidth: '860px', margin: '0 auto', padding: isMobile ? '16px' : '32px 24px' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <button onClick={() => navigate('/home')}
                        style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        ←
                    </button>
                    <div>
                        <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
                            Contest Summaries
                        </h1>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {summaries.length} contest{summaries.length !== 1 ? 's' : ''} completed
                        </p>
                    </div>
                </div>

                {error && (
                    <div style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>
                        {error}
                    </div>
                )}

                {summaries.length === 0 ? (
                    <div style={{ ...sectionStyle, textAlign: 'center', padding: '48px 24px' }}>
                        <p style={{ fontSize: '40px', marginBottom: '12px' }}>🏆</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '16px' }}>
                            No contests completed yet.
                        </p>
                        <button onClick={() => navigate('/test/configure')} style={{
                            padding: '10px 24px', backgroundColor: 'var(--accent)',
                            color: '#fff', border: 'none', borderRadius: '8px',
                            fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                        }}>
                            Take your first test
                        </button>
                    </div>
                ) : (
                    summaries.map((summary, idx) => {
                        const total = parseInt(summary.question_count) || 0;
                        const correct = parseInt(summary.correct_count) || 0;
                        const wrong = parseInt(summary.wrong_count) || 0;
                        const unattempted = parseInt(summary.unattempted_count) || 0;
                        const scorePercent = total > 0 ? Math.round((correct / total) * 100) : 0;
                        const scoreColor = scorePercent >= 70 ? 'var(--success)' : scorePercent >= 40 ? 'var(--warning)' : 'var(--error)';

                        return (
                            <div key={summary.id} onClick={() => navigate(`/contests/${summary.id}`)}
                                style={{ ...sectionStyle, cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'var(--accent)';
                                    e.currentTarget.style.boxShadow = `0 4px 16px var(--shadow-md)`;
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.boxShadow = `0 2px 8px var(--shadow)`;
                                }}
                            >
                                {/* Top row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>
                                                Contest #{summaries.length - idx}
                                            </span>
                                            <span style={{
                                                padding: '2px 10px', borderRadius: '20px',
                                                backgroundColor: 'var(--bg-hover)', color: scoreColor,
                                                fontSize: '12px', fontWeight: '700',
                                                border: `1px solid var(--border)`
                                            }}>
                                                {scorePercent}%
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                            📅 {formatDate(summary.ended_at)}
                                        </p>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                            ⏱ {summary.total_time} min · 📝 {total} questions
                                        </p>
                                    </div>

                                    {/* Stats */}
                                    <div style={{ display: 'flex', gap: isMobile ? '12px' : '16px' }}>
                                        {[
                                            { label: '✅', value: correct, color: 'var(--success)' },
                                            { label: '❌', value: wrong, color: 'var(--error)' },
                                            { label: '⏭️', value: unattempted, color: 'var(--warning)' }
                                        ].map(stat => (
                                            <div key={stat.label} style={{ textAlign: 'center' }}>
                                                <p style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '800', color: stat.color }}>{stat.value}</p>
                                                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div style={{ height: '5px', backgroundColor: 'var(--bg-hover)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', width: `${scorePercent}%`,
                                        backgroundColor: scoreColor,
                                        borderRadius: '3px', transition: 'width 0.3s'
                                    }} />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ContestSummariesPage;