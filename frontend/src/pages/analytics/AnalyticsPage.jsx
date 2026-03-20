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

    useEffect(() => {
        fetchAnalytics();
    }, []);

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
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Navbar />
            <div style={{ textAlign: 'center', padding: '80px', color: '#888' }}>
                Loading analytics...
            </div>
        </div>
    );

    const maxQuestions = Math.max(...analytics.map(a => parseInt(a.total_questions) || 0), 1);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Navbar />
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>

                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            onClick={() => navigate('/home')}
                            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}
                        >
                            ←
                        </button>
                        <div>
                            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111' }}>
                                Analytics
                            </h1>
                            <p style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>
                                Tag-wise performance breakdown
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setViewMode('table')}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: viewMode === 'table' ? '#4F46E5' : '#fff',
                                color: viewMode === 'table' ? '#fff' : '#666',
                                border: '1px solid #ddd', borderRadius: '8px',
                                fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                            }}
                        >
                            📋 Table
                        </button>
                        <button
                            onClick={() => setViewMode('graph')}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: viewMode === 'graph' ? '#4F46E5' : '#fff',
                                color: viewMode === 'graph' ? '#fff' : '#666',
                                border: '1px solid #ddd', borderRadius: '8px',
                                fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                            }}
                        >
                            📊 Graph
                        </button>
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

                {analytics.length === 0 ? (
                    <div style={{
                        backgroundColor: '#fff', borderRadius: '12px',
                        padding: '60px', textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}>
                        <p style={{ fontSize: '40px', marginBottom: '12px' }}>📊</p>
                        <p style={{ color: '#888', fontSize: '16px' }}>
                            No data available yet. Create questions and take tests to see analytics.
                        </p>
                    </div>
                ) : viewMode === 'table' ? (
                    /* TABLE VIEW */
                    <div style={{
                        backgroundColor: '#fff', borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden'
                    }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f9fafb' }}>
                                        {['Tag', 'Total Questions', 'Struggling Questions', 'Status'].map(h => (
                                            <th key={h} style={{
                                                padding: '14px 16px', textAlign: 'left',
                                                fontWeight: '700', color: '#555',
                                                borderBottom: '2px solid #e5e7eb',
                                                fontSize: '13px'
                                            }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.map((row, idx) => {
                                        const total = parseInt(row.total_questions) || 0;
                                        const struggling = parseInt(row.struggling_questions) || 0;
                                        const ratio = total > 0 ? struggling / total : 0;
                                        const statusColor = ratio === 0 ? '#10B981' : ratio < 0.3 ? '#F59E0B' : '#EF4444';
                                        const statusLabel = ratio === 0 ? '✅ Good' : ratio < 0.3 ? '⚠️ Needs Work' : '🔴 Struggling';

                                        return (
                                            <tr key={idx} style={{
                                                borderBottom: '1px solid #f0f0f0',
                                                backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa'
                                            }}>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{
                                                        padding: '4px 12px', borderRadius: '20px',
                                                        backgroundColor: '#EEF2FF', color: '#4F46E5',
                                                        fontSize: '13px', fontWeight: '600'
                                                    }}>
                                                        {row.tag_name}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 16px', fontWeight: '700', color: '#111' }}>
                                                    {total}
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{
                                                        fontWeight: '700',
                                                        color: struggling > 0 ? '#EF4444' : '#10B981'
                                                    }}>
                                                        {struggling}
                                                    </span>
                                                    {total > 0 && (
                                                        <span style={{ fontSize: '12px', color: '#888', marginLeft: '6px' }}>
                                                            ({Math.round(ratio * 100)}%)
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{
                                                        padding: '4px 12px', borderRadius: '20px',
                                                        backgroundColor: `${statusColor}15`,
                                                        color: statusColor,
                                                        fontSize: '12px', fontWeight: '700'
                                                    }}>
                                                        {statusLabel}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Legend */}
                        <div style={{
                            padding: '16px', borderTop: '1px solid #f0f0f0',
                            backgroundColor: '#fafafa', display: 'flex',
                            gap: '20px', flexWrap: 'wrap'
                        }}>
                            <p style={{ fontSize: '12px', color: '#888', fontWeight: '600' }}>
                                * Struggling = questions where correct + unattempted ≤ wrong attempts
                            </p>
                        </div>
                    </div>
                ) : (
                    /* GRAPH VIEW */
                    <div style={{
                        backgroundColor: '#fff', borderRadius: '12px',
                        padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '24px' }}>
                            Questions per Tag
                        </h3>
                        {analytics.map((row, idx) => {
                            const total = parseInt(row.total_questions) || 0;
                            const struggling = parseInt(row.struggling_questions) || 0;
                            const totalWidth = (total / maxQuestions) * 100;
                            const strugglingWidth = total > 0 ? (struggling / total) * totalWidth : 0;

                            return (
                                <div key={idx} style={{ marginBottom: '20px' }}>
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        alignItems: 'center', marginBottom: '6px'
                                    }}>
                                        <span style={{
                                            fontSize: '13px', fontWeight: '600', color: '#333'
                                        }}>
                                            {row.tag_name}
                                        </span>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '12px', color: '#4F46E5', fontWeight: '700' }}>
                                                {total} total
                                            </span>
                                            {struggling > 0 && (
                                                <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: '700' }}>
                                                    {struggling} struggling
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{
                                        height: '28px', backgroundColor: '#f0f0f0',
                                        borderRadius: '6px', overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        {/* Total bar */}
                                        <div style={{
                                            position: 'absolute', left: 0, top: 0,
                                            height: '100%', width: `${totalWidth}%`,
                                            backgroundColor: '#4F46E5',
                                            borderRadius: '6px', transition: 'width 0.4s'
                                        }} />
                                        {/* Struggling overlay */}
                                        {struggling > 0 && (
                                            <div style={{
                                                position: 'absolute', left: 0, top: 0,
                                                height: '100%', width: `${strugglingWidth}%`,
                                                backgroundColor: '#EF4444',
                                                borderRadius: '6px', transition: 'width 0.4s'
                                            }} />
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Legend */}
                        <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '16px', height: '16px', borderRadius: '3px', backgroundColor: '#4F46E5' }} />
                                <span style={{ fontSize: '12px', color: '#555', fontWeight: '600' }}>Total Questions</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '16px', height: '16px', borderRadius: '3px', backgroundColor: '#EF4444' }} />
                                <span style={{ fontSize: '12px', color: '#555', fontWeight: '600' }}>Struggling Questions</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsPage;