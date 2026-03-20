import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../api/axios';
import Navbar from '../../components/Navbar';
import { formatTime } from '../../utils/helpers';

const TestResultPage = () => {
    const { contestId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedQuestion, setExpandedQuestion] = useState(null);

    useEffect(() => { fetchResult(); }, []);

    const fetchResult = async () => {
        try {
            const res = await API.get(`/contests/${contestId}`);
            setData(res.data);
        } catch (err) {
            setError('Failed to load results.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Navbar />
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>Loading results...</div>
        </div>
    );

    if (error) return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Navbar />
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--error)' }}>{error}</div>
        </div>
    );

    const { contest, tagSummary, questions } = data;
    const totalQ = questions.length;
    const correctQ = questions.filter(q => q.is_correct).length;
    const wrongQ = questions.filter(q => q.is_attempted && !q.is_correct).length;
    const unattemptedQ = questions.filter(q => !q.is_attempted).length;
    const scorePercent = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0;
    const scoreColor = scorePercent >= 70 ? 'var(--success)' : scorePercent >= 40 ? 'var(--warning)' : 'var(--error)';

    const sectionStyle = {
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '16px',
        boxShadow: `0 2px 8px var(--shadow)`,
        border: '1px solid var(--border)'
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Navbar />
            <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>Test Results</h1>
                </div>

                {/* Score Card */}
                <div style={{ ...sectionStyle, textAlign: 'center' }}>
                    <div style={{
                        width: '100px', height: '100px', borderRadius: '50%',
                        border: `6px solid ${scoreColor}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', backgroundColor: 'var(--bg-card)'
                    }}>
                        <span style={{ fontSize: '28px', fontWeight: '800', color: scoreColor }}>{scorePercent}%</span>
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '20px' }}>
                        {scorePercent >= 70 ? '🎉 Great job!' : scorePercent >= 40 ? '📚 Keep practicing!' : '💪 Keep going!'}
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '16px' }}>
                        {[
                            { label: '✅ Correct', value: correctQ, color: 'var(--success)' },
                            { label: '❌ Wrong', value: wrongQ, color: 'var(--error)' },
                            { label: '⏭️ Skipped', value: unattemptedQ, color: 'var(--warning)' },
                            { label: '📝 Total', value: totalQ, color: 'var(--accent)' }
                        ].map(stat => (
                            <div key={stat.label} style={{
                                backgroundColor: 'var(--bg-hover)', borderRadius: '10px',
                                padding: '14px', boxShadow: `0 2px 6px var(--shadow)`
                            }}>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{stat.label}</p>
                                <p style={{ fontSize: '24px', fontWeight: '800', color: stat.color }}>{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tag Summary */}
                {tagSummary && tagSummary.length > 0 && (
                    <div style={sectionStyle}>
                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>
                            📊 Tag-wise Summary
                        </h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--table-header)' }}>
                                        {['Tag', 'Total', '✅ Correct', '❌ Wrong', '⏭️ Skipped', '⚡ Faster than min'].map(h => (
                                            <th key={h} style={{
                                                padding: '10px 12px', textAlign: 'left',
                                                fontWeight: '700', color: 'var(--text-secondary)',
                                                borderBottom: '1px solid var(--border)'
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tagSummary.map((tag, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: '10px 12px', fontWeight: '600', color: 'var(--accent-text)' }}>{tag.tag_name}</td>
                                            <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: '700' }}>{tag.total_questions}</td>
                                            <td style={{ padding: '10px 12px', color: 'var(--success)', fontWeight: '700' }}>{tag.correct_count}</td>
                                            <td style={{ padding: '10px 12px', color: 'var(--error)', fontWeight: '700' }}>{tag.wrong_count}</td>
                                            <td style={{ padding: '10px 12px', color: 'var(--warning)', fontWeight: '700' }}>{tag.unattempted_count}</td>
                                            <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: '700' }}>{tag.faster_than_min_count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Question Review */}
                <div style={sectionStyle}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>
                        📋 Question-wise Review
                    </h3>
                    {questions.map((q, idx) => {
                        const isExpanded = expandedQuestion === q.id;
                        const statusColor = !q.is_attempted ? 'var(--warning)' : q.is_correct ? 'var(--success)' : 'var(--error)';
                        const statusLabel = !q.is_attempted ? '⏭️ Skipped' : q.is_correct ? '✅ Correct' : '❌ Wrong';

                        return (
                            <div key={q.id} style={{
                                border: `1px solid var(--border)`,
                                borderRadius: '10px', marginBottom: '10px', overflow: 'hidden'
                            }}>
                                <div onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                                    style={{
                                        padding: '14px 18px', cursor: 'pointer',
                                        backgroundColor: 'var(--bg-hover)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>Q{idx + 1}</span>
                                        <span style={{
                                            fontSize: '12px', fontWeight: '700', color: statusColor,
                                            backgroundColor: 'var(--bg-card)',
                                            padding: '3px 10px', borderRadius: '20px',
                                            border: `1px solid var(--border)`
                                        }}>{statusLabel}</span>
                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>⏱ {formatTime(q.time_spent)}</span>
                                    </div>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{isExpanded ? '▲' : '▼'}</span>
                                </div>

                                {isExpanded && (
                                    <div style={{ padding: '18px', backgroundColor: 'var(--bg-card)' }}>
                                        {q.question_text && (
                                            <p style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '14px', lineHeight: '1.6' }}>
                                                {q.question_text}
                                            </p>
                                        )}
                                        {q.question_image_url && (
                                            <img src={q.question_image_url} alt="Q"
                                                style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '14px' }} />
                                        )}

                                        {/* Time comparison */}
                                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
                                            {[
                                                { label: `Time: ${formatTime(q.time_spent)}`, bg: 'var(--accent-light)', color: 'var(--accent-text)' },
                                                { label: `Prev Min: ${formatTime(q.prev_min_time)}`, bg: 'var(--success-light)', color: 'var(--success)' },
                                                { label: `Prev Max: ${formatTime(q.prev_max_time)}`, bg: 'var(--warning-light)', color: 'var(--warning)' }
                                            ].map(item => (
                                                <span key={item.label} style={{
                                                    padding: '4px 12px', borderRadius: '8px',
                                                    backgroundColor: item.bg, color: item.color,
                                                    fontSize: '12px', fontWeight: '600'
                                                }}>{item.label}</span>
                                            ))}
                                        </div>

                                        {/* Chosen vs Correct */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--error-light)', border: '1px solid var(--error)' }}>
                                                <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>YOUR ANSWER</p>
                                                <p style={{ fontSize: '14px', color: 'var(--error)', fontWeight: '600' }}>
                                                    {q.chosen_answer
                                                        ? (q.type === 'fill_blank'
                                                            ? q.chosen_answer
                                                            : q.options?.find(o =>
                                                                q.type === 'mcq_multiple'
                                                                    ? JSON.parse(q.chosen_answer || '[]').includes(o.id)
                                                                    : o.id === q.chosen_answer
                                                            )?.option_text || q.chosen_answer)
                                                        : 'Not answered'}
                                                </p>
                                            </div>
                                            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--success-light)', border: '1px solid var(--success)' }}>
                                                <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>CORRECT ANSWER</p>
                                                <p style={{ fontSize: '14px', color: 'var(--success)', fontWeight: '600' }}>
                                                    {q.type === 'fill_blank'
                                                        ? q.correctAnswer
                                                        : q.options?.filter(o =>
                                                            Array.isArray(q.correctAnswer)
                                                                ? q.correctAnswer.includes(o.id)
                                                                : o.id === q.correctAnswer
                                                        ).map(o => o.option_text).join(', ') || '—'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Solution */}
                                        {(q.solution_text || q.solution_image_url) && (
                                            <div style={{ marginTop: '14px', padding: '14px', backgroundColor: 'var(--bg-hover)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                                <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>SOLUTION</p>
                                                {q.solution_text && (
                                                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{q.solution_text}</p>
                                                )}
                                                {q.solution_image_url && (
                                                    <img src={q.solution_image_url} alt="Solution"
                                                        style={{ maxWidth: '100%', borderRadius: '6px', marginTop: '8px' }} />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button onClick={() => navigate('/test/configure')} style={{
                        flex: 1, padding: '14px', backgroundColor: 'var(--accent)',
                        color: '#fff', border: 'none', borderRadius: '10px',
                        fontSize: '15px', fontWeight: '700', cursor: 'pointer'
                    }}>
                        🔁 Take Another Test
                    </button>
                    <button onClick={() => navigate('/home')} style={{
                        flex: 1, padding: '14px', backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-primary)', border: '1px solid var(--border)',
                        borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer'
                    }}>
                        🏠 Go Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TestResultPage;