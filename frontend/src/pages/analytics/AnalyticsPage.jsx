import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Navbar from '../../components/Navbar';

const AnalyticsPage = () => {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('table');

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
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => navigate('/home')}
                            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            ←
                        </button>
                        <div>
                            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>Analytics</h1>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Tag-wise performance breakdown</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['table', 'graph'].map(mode => (
                            <button key={mode} onClick={() => setViewMode(mode)} style={{
                                padding: '8px 16px',
                                backgroundColor: viewMode === mode ? 'var(--accent)' : 'var(--bg-card)',
                                color: viewMode === mode ? '#fff' : 'var(--text-secondary)',
                                border: '1px solid var(--border)', borderRadius: '8px',
                                fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                            }}>
                                {mode === 'table' ? '📋 Table' : '📊 Graph'}
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
                        padding: '60px', textAlign: 'center',
                        boxShadow: `0 2px 8px var(--shadow)`, border: '1px solid var(--border)'
                    }}>
                        <p style={{ fontSize: '40px', marginBottom: '12px' }}>📊</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
                            No data available yet. Create questions and take tests to see analytics.
                        </p>
                    </div>
                ) : viewMode === 'table' ? (
                    /* TABLE VIEW */
                    <div style={{
                        backgroundColor: 'var(--bg-card)', borderRadius: '12px',
                        boxShadow: `0 2px 8px var(--shadow)`,
                        border: '1px solid var(--border)', overflow: 'hidden'
                    }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--table-header)' }}>
                                        {['Tag', 'Total Questions', 'Struggling Questions', 'Status'].map(h => (
                                            <th key={h} style={{
                                                padding: '14px 16px', textAlign: 'left',
                                                fontWeight: '700', color: 'var(--text-secondary)',
                                                borderBottom: '2px solid var(--border)', fontSize: '13px'
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
                                        const statusLabel = ratio === 0 ? '✅ Good' : ratio < 0.3 ? '⚠️ Needs Work' : '🔴 Struggling';

                                        return (
                                            <tr key={idx} style={{
                                                borderBottom: '1px solid var(--border-light)',
                                                backgroundColor: idx % 2 === 0 ? 'var(--bg-card)' : 'var(--table-alt)'
                                            }}>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{
                                                        padding: '4px 12px', borderRadius: '20px',
                                                        backgroundColor: 'var(--accent-light)', color: 'var(--accent-text)',
                                                        fontSize: '13px', fontWeight: '600'
                                                    }}>{row.tag_name}</span>
                                                </td>
                                                <td style={{ padding: '14px 16px', fontWeight: '700', color: 'var(--text-primary)' }}>{total}</td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{ fontWeight: '700', color: struggling > 0 ? 'var(--error)' : 'var(--success)' }}>
                                                        {struggling}
                                                    </span>
                                                    {total > 0 && (
                                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                                                            ({Math.round(ratio * 100)}%)
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{
                                                        padding: '4px 12px', borderRadius: '20px',
                                                        backgroundColor: 'var(--bg-hover)', color: statusColor,
                                                        fontSize: '12px', fontWeight: '700',
                                                        border: '1px solid var(--border)'
                                                    }}>{statusLabel}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ padding: '16px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-hover)' }}>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                                * Struggling = questions where correct + unattempted ≤ wrong attempts
                            </p>
                        </div>
                    </div>
                ) : (
                    /* GRAPH VIEW */
                    <div style={{
                        backgroundColor: 'var(--bg-card)', borderRadius: '12px',
                        padding: '28px', boxShadow: `0 2px 8px var(--shadow)`,
                        border: '1px solid var(--border)'
                    }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '24px' }}>
                            Questions per Tag
                        </h3>
                        {analytics.map((row, idx) => {
                            const total = parseInt(row.total_questions) || 0;
                            const struggling = parseInt(row.struggling_questions) || 0;
                            const totalWidth = (total / maxQuestions) * 100;
                            const strugglingWidth = total > 0 ? (struggling / total) * totalWidth : 0;

                            return (
                                <div key={idx} style={{ marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                            {row.tag_name}
                                        </span>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '12px', color: 'var(--accent-text)', fontWeight: '700' }}>{total} total</span>
                                            {struggling > 0 && (
                                                <span style={{ fontSize: '12px', color: 'var(--error)', fontWeight: '700' }}>{struggling} struggling</span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ height: '28px', backgroundColor: 'var(--bg-hover)', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
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

                        <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
                            {[
                                { color: 'var(--accent)', label: 'Total Questions' },
                                { color: 'var(--error)', label: 'Struggling Questions' }
                            ].map(item => (
                                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '16px', height: '16px', borderRadius: '3px', backgroundColor: item.color }} />
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>{item.label}</span>
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