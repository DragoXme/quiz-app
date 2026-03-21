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

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Navbar />
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: isMobile ? '16px' : '32px 24px' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '12px' }}>
                    <button onClick={() => navigate('/home')}
                        style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        ←
                    </button>
                    <div>
                        <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '800', color: 'var(--text-primary)' }}>Analytics</h1>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Tag-wise performance</p>
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
                ) : (
                    <div style={{
                        backgroundColor: 'var(--bg-card)', borderRadius: '12px',
                        boxShadow: `0 2px 8px var(--shadow)`,
                        border: '1px solid var(--border)', overflow: 'hidden'
                    }}>
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? '12px' : '14px', minWidth: '340px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--table-header)' }}>
                                        {['Tag', 'Total Questions', 'Unattempted', 'Struggling', 'Status'].map(h => (
                                            <th key={h} style={{
                                                padding: isMobile ? '10px' : '14px 16px',
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
                                        const unattempted = parseInt(row.unattempted_questions) || 0;
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
                                                <td style={{ padding: isMobile ? '10px' : '14px 16px', fontWeight: '700', color: 'var(--warning)' }}>{unattempted}</td>
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
                                * Struggling = correct attempts ≤ wrong attempts &nbsp;|&nbsp; * Unattempted = skipped more than attempted
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsPage;