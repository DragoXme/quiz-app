import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Navbar from '../../components/Navbar';
import useWindowSize from '../../hooks/useWindowSize';

const AnalyticsPage = () => {
    const navigate = useNavigate();
    const { isMobile } = useWindowSize();
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('graph');

    useEffect(() => { fetchAnalytics(); }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await API.get('/analytics');
            setAnalytics(res.data.analytics);
        } catch (err) {
            setError('Failed to load analytics.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Navbar />
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
                Loading analytics...
            </div>
        </div>
    );

    const maxQuestions = Math.max(...analytics.map(a => parseInt(a.total_questions) || 0), 1);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Navbar />
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: isMobile ? '16px' : '32px 24px' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button onClick={() => navigate('/home')}
                            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            ←
                        </button>
                        <div>
                            <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
                                Analytics
                            </h1>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                Tag-wise performance
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        {['table', 'graph'].map(mode => (
                            <button key={mode} onClick={() => setViewMode(mode)} style={{
                                padding: isMobile ? '7px 12px' : '8px 16px',
                                backgroundColor: viewMode === mode ? 'var(--accent)' : 'var(--bg-card)',
                                color: viewMode === mode ? '#fff' : 'var(--text-secondary)',
                                border: '1px solid var(--border)', borderRadius: '8px',
                                fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                            }}>
                                {mode === 'table' ? '📋' : '📊'}{!isMobile && ` ${mode.charAt(0).toUpperCase() + mode.slice(1)}`}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>
                        {error}
                    </div>
                )}

                {analytics.length === 0 ? (
                    <div style={{
                        backgroundColor: 'var(--bg-card)', borderRadius: '12px',
                        padding: '48px 24px', textAlign: 'center',
                        boxShadow: `0 2px 8px var(--shadow)`, border: '1px solid var(--border)'
                    }}>
                        <p style={{ fontSize: '40px', marginBottom: '12px' }}>📊</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                            No data yet. Create questions and take tests to see analytics.
                        </p>
                    </div>
                ) : viewMode === 'table' ? (
                    /* TABLE VIEW */
                    <div style={{
                        backgroundColor: 'var(--bg-card)', borderRadius: '12px',
                        boxShadow: `0 2px 8px var(--shadow)`,
                        border: '1px solid var(--border)', overflow: 'hidden'
                    }}>
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? '12px' : '14px', minWidth: '340px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--table-header)' }}>
                                        {['Tag', 'Total', 'Struggling', 'Status'].map(h => (
                                            <th key={h} style={{
                                                padding: isMobile ? '10px 10px' : '14px 16px',
                                                textAlign: 'left', fontWeight: '700',
                                                color: 'var(--text-secondary)',
                                                borderBottom: '2px solid var(--border)',
                                                whiteSpace: 'nowrap'
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.map((row, idx) => {
                                        const total = parseInt(row.total_questions) || 0;
                                        const struggling = parseInt(row.struggling_questions) || 0;
                                        const ratio = total > 0 ? struggling / total : 0;
                                        const statusColor = ratio === 0 ? 'var(--success)' : ratio < 0.3 ? 'var(--warning)' : 'var(--error)';
                                        const statusLabel = ratio === 0 ? '✅ Good' : ratio < 0.3 ? '⚠️ Fair' : '🔴 Poor';

                                        return (
                                            <tr key={idx} style={{
                                                borderBottom: '1px solid var(--border-light)',
                                                backgroundColor: idx % 2 === 0 ? 'var(--bg-card)' : 'var(--table-alt)'
                                            }}>
                                                <td style={{ padding: isMobile ? '10px' : '14px 16px', maxWidth: isMobile ? '80px' : '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    <span style={{
                                                        padding: '3px 8px', borderRadius: '20px',
                                                        backgroundColor: 'var(--accent-light)', color: 'var(--accent-text)',
                                                        fontSize: isMobile ? '11px' : '13px', fontWeight: '600'
                                                    }}>{row.tag_name}</span>
                                                </td>
                                                <td style={{ padding: isMobile ? '10px' : '14px 16px', fontWeight: '700', color: 'var(--text-primary)' }}>{total}</td>
                                                <td style={{ padding: isMobile ? '10px' : '14px 16px' }}>
                                                    <span style={{ fontWeight: '700', color: struggling > 0 ? 'var(--error)' : 'var(--success)' }}>
                                                        {struggling}
                                                    </span>
                                                    {!isMobile && total > 0 && (
                                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                                                            ({Math.round(ratio * 100)}%)
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: isMobile ? '10px' : '14px 16px' }}>
                                                    <span style={{
                                                        padding: '3px 8px', borderRadius: '20px',
                                                        backgroundColor: 'var(--bg-hover)', color: statusColor,
                                                        fontSize: '11px', fontWeight: '700',
                                                        border: '1px solid var(--border)', whiteSpace: 'nowrap'
                                                    }}>{statusLabel}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-hover)' }}>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
                                * Struggling = correct + unattempted ≤ wrong attempts
                            </p>
                        </div>
                    </div>
                ) : (
                    /* GRAPH VIEW */
                    <div style={{
                        backgroundColor: 'var(--bg-card)', borderRadius: '12px',
                        padding: isMobile ? '16px' : '28px',
                        boxShadow: `0 2px 8px var(--shadow)`,
                        border: '1px solid var(--border)'
                    }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>
                            Questions per Tag
                        </h3>
                        {analytics.map((row, idx) => {
                            const total = parseInt(row.total_questions) || 0;
                            const struggling = parseInt(row.struggling_questions) || 0;
                            const totalWidth = (total / maxQuestions) * 100;
                            const strugglingWidth = total > 0 ? (struggling / total) * totalWidth : 0;

                            return (
                                <div key={idx} style={{ marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', gap: '8px' }}>
                                        <span style={{
                                            fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)',
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                            maxWidth: isMobile ? '120px' : '200px'
                                        }}>
                                            {row.tag_name}
                                        </span>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                                            <span style={{ fontSize: '11px', color: 'var(--accent-text)', fontWeight: '700' }}>{total}</span>
                                            {struggling > 0 && (
                                                <span style={{ fontSize: '11px', color: 'var(--error)', fontWeight: '700' }}>({struggling} 🔴)</span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ height: '24px', backgroundColor: 'var(--bg-hover)', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                                        <div style={{
                                            position: 'absolute', left: 0, top: 0,
                                            height: '100%', width: `${totalWidth}%`,
                                            backgroundColor: 'var(--accent)',
                                            borderRadius: '6px', transition: 'width 0.4s'
                                        }} />
                                        {struggling > 0 && (
                                            <div style={{
                                                position: 'absolute', left: 0, top: 0,
                                                height: '100%', width: `${strugglingWidth}%`,
                                                backgroundColor: 'var(--error)',
                                                borderRadius: '6px', transition: 'width 0.4s'
                                            }} />
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
                            {[
                                { color: 'var(--accent)', label: 'Total Questions' },
                                { color: 'var(--error)', label: 'Struggling' }
                            ].map(item => (
                                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: item.color }} />
                                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsPage;