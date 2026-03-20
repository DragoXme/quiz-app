import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Navbar from '../../components/Navbar';
import { formatDate, formatTime } from '../../utils/helpers';

const ContestSummariesPage = () => {
    const navigate = useNavigate();
    const [summaries, setSummaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSummaries();
    }, []);

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
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Navbar />
            <div style={{ textAlign: 'center', padding: '80px', color: '#888' }}>
                Loading summaries...
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Navbar />
            <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                    <button
                        onClick={() => navigate('/home')}
                        style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}
                    >
                        ←
                    </button>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111' }}>
                            Contest Summaries
                        </h1>
                        <p style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>
                            {summaries.length} contest{summaries.length !== 1 ? 's' : ''} completed
                        </p>
                    </div>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#FEF2F2', color: '#EF4444',
                        padding: '12px 16px', borderRadius: '8px',
                        fontSize: '14px', marginBottom: '16px'
                    }}>
                        {error}
                    </div>
                )}

                {summaries.length === 0 ? (
                    <div style={{
                        ...sectionStyle, textAlign: 'center', padding: '60px'
                    }}>
                        <p style={{ fontSize: '40px', marginBottom: '12px' }}>🏆</p>
                        <p style={{ color: '#888', fontSize: '16px', marginBottom: '16px' }}>
                            No contests completed yet.
                        </p>
                        <button
                            onClick={() => navigate('/test/configure')}
                            style={{
                                padding: '10px 24px',
                                backgroundColor: '#4F46E5', color: '#fff',
                                border: 'none', borderRadius: '8px',
                                fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                            }}
                        >
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
                        const scoreColor = scorePercent >= 70 ? '#10B981' : scorePercent >= 40 ? '#F59E0B' : '#EF4444';

                        return (
                            <div
                                key={summary.id}
                                onClick={() => navigate(`/contests/${summary.id}`)}
                                style={{
                                    ...sectionStyle,
                                    cursor: 'pointer',
                                    border: '2px solid transparent',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.border = '2px solid #4F46E5';
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,70,229,0.1)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.border = '2px solid transparent';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                                }}
                            >
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px'
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                            <span style={{
                                                fontSize: '13px', fontWeight: '700', color: '#888'
                                            }}>
                                                Contest #{summaries.length - idx}
                                            </span>
                                            <span style={{
                                                padding: '2px 10px', borderRadius: '20px',
                                                backgroundColor: `${scoreColor}15`, color: scoreColor,
                                                fontSize: '12px', fontWeight: '700'
                                            }}>
                                                {scorePercent}%
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: '#888' }}>
                                            📅 {formatDate(summary.ended_at)}
                                        </p>
                                        <p style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>
                                            ⏱ {summary.total_time} min · 📝 {total} questions
                                        </p>
                                    </div>

                                    <div style={{
                                        display: 'flex', gap: '16px', flexWrap: 'wrap'
                                    }}>
                                        {[
                                            { label: '✅', value: correct, color: '#10B981' },
                                            { label: '❌', value: wrong, color: '#EF4444' },
                                            { label: '⏭️', value: unattempted, color: '#F59E0B' }
                                        ].map(stat => (
                                            <div key={stat.label} style={{ textAlign: 'center' }}>
                                                <p style={{ fontSize: '20px', fontWeight: '800', color: stat.color }}>
                                                    {stat.value}
                                                </p>
                                                <p style={{ fontSize: '11px', color: '#888' }}>{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div style={{
                                    marginTop: '14px', height: '6px',
                                    backgroundColor: '#f0f0f0', borderRadius: '3px',
                                    overflow: 'hidden'
                                }}>
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