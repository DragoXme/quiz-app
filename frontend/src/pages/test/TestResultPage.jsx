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

    useEffect(() => {
        fetchResult();
    }, []);

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
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Navbar />
            <div style={{ textAlign: 'center', padding: '80px', color: '#888' }}>Loading results...</div>
        </div>
    );

    if (error) return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Navbar />
            <div style={{ textAlign: 'center', padding: '80px', color: '#EF4444' }}>{error}</div>
        </div>
    );

    const { contest, tagSummary, questions } = data;
    const totalQ = questions.length;
    const correctQ = questions.filter(q => q.is_correct).length;
    const wrongQ = questions.filter(q => q.is_attempted && !q.is_correct).length;
    const unattemptedQ = questions.filter(q => !q.is_attempted).length;
    const scorePercent = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0;

    const scoreColor = scorePercent >= 70 ? '#10B981' : scorePercent >= 40 ? '#F59E0B' : '#EF4444';

    const sectionStyle = {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Navbar />
            <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111' }}>
                        Test Results
                    </h1>
                </div>

                {/* Score Card */}
                <div style={{
                    ...sectionStyle,
                    background: `linear-gradient(135deg, ${scoreColor}15, ${scoreColor}05)`,
                    border: `1px solid ${scoreColor}30`,
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '100px', height: '100px',
                        borderRadius: '50%',
                        border: `6px solid ${scoreColor}`,
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 16px',
                        backgroundColor: '#fff'
                    }}>
                        <span style={{ fontSize: '28px', fontWeight: '800', color: scoreColor }}>
                            {scorePercent}%
                        </span>
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111', marginBottom: '20px' }}>
                        {scorePercent >= 70 ? '🎉 Great job!' : scorePercent >= 40 ? '📚 Keep practicing!' : '💪 Keep going!'}
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                        gap: '16px'
                    }}>
                        {[
                            { label: '✅ Correct', value: correctQ, color: '#10B981' },
                            { label: '❌ Wrong', value: wrongQ, color: '#EF4444' },
                            { label: '⏭️ Skipped', value: unattemptedQ, color: '#F59E0B' },
                            { label: '📝 Total', value: totalQ, color: '#4F46E5' }
                        ].map(stat => (
                            <div key={stat.label} style={{
                                backgroundColor: '#fff',
                                borderRadius: '10px', padding: '14px',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                            }}>
                                <p style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{stat.label}</p>
                                <p style={{ fontSize: '24px', fontWeight: '800', color: stat.color }}>{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tag Summary */}
                {tagSummary && tagSummary.length > 0 && (
                    <div style={sectionStyle}>
                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#111', marginBottom: '16px' }}>
                            📊 Tag-wise Summary
                        </h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f9fafb' }}>
                                        {['Tag', 'Total', '✅ Correct', '❌ Wrong', '⏭️ Skipped', '⚡ Faster than min'].map(h => (
                                            <th key={h} style={{
                                                padding: '10px 12px', textAlign: 'left',
                                                fontWeight: '700', color: '#555',
                                                borderBottom: '1px solid #e5e7eb'
                                            }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tagSummary.map((tag, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '10px 12px', fontWeight: '600', color: '#4F46E5' }}>
                                                {tag.tag_name}
                                            </td>
                                            <td style={{ padding: '10px 12px', color: '#111', fontWeight: '700' }}>
                                                {tag.total_questions}
                                            </td>
                                            <td style={{ padding: '10px 12px', color: '#10B981', fontWeight: '700' }}>
                                                {tag.correct_count}
                                            </td>
                                            <td style={{ padding: '10px 12px', color: '#EF4444', fontWeight: '700' }}>
                                                {tag.wrong_count}
                                            </td>
                                            <td style={{ padding: '10px 12px', color: '#F59E0B', fontWeight: '700' }}>
                                                {tag.unattempted_count}
                                            </td>
                                            <td style={{ padding: '10px 12px', color: '#8B5CF6', fontWeight: '700' }}>
                                                {tag.faster_than_min_count}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Question-wise Review */}
                <div style={sectionStyle}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#111', marginBottom: '16px' }}>
                        📋 Question-wise Review
                    </h3>
                    {questions.map((q, idx) => {
                        const isExpanded = expandedQuestion === q.id;
                        const statusColor = !q.is_attempted ? '#F59E0B' : q.is_correct ? '#10B981' : '#EF4444';
                        const statusLabel = !q.is_attempted ? '⏭️ Skipped' : q.is_correct ? '✅ Correct' : '❌ Wrong';

                        return (
                            <div key={q.id} style={{
                                border: `1px solid ${statusColor}30`,
                                borderRadius: '10px',
                                marginBottom: '10px',
                                overflow: 'hidden'
                            }}>
                                <div
                                    onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                                    style={{
                                        padding: '14px 18px',
                                        cursor: 'pointer',
                                        backgroundColor: `${statusColor}08`,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#888' }}>
                                            Q{idx + 1}
                                        </span>
                                        <span style={{
                                            fontSize: '12px', fontWeight: '700',
                                            color: statusColor,
                                            backgroundColor: `${statusColor}15`,
                                            padding: '3px 10px', borderRadius: '20px'
                                        }}>
                                            {statusLabel}
                                        </span>
                                        <span style={{ fontSize: '13px', color: '#888' }}>
                                            ⏱ {formatTime(q.time_spent)}
                                        </span>
                                    </div>
                                    <span style={{ color: '#888', fontSize: '12px' }}>
                                        {isExpanded ? '▲' : '▼'}
                                    </span>
                                </div>

                                {isExpanded && (
                                    <div style={{ padding: '18px', backgroundColor: '#fff' }}>
                                        {/* Question */}
                                        {q.question_text && (
                                            <p style={{ fontSize: '15px', color: '#111', marginBottom: '14px', lineHeight: '1.6' }}>
                                                {q.question_text}
                                            </p>
                                        )}
                                        {q.question_image_url && (
                                            <img src={q.question_image_url} alt="Q"
                                                style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '14px' }}
                                            />
                                        )}

                                        {/* Time comparison */}
                                        <div style={{
                                            display: 'flex', gap: '12px', flexWrap: 'wrap',
                                            marginBottom: '14px'
                                        }}>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: '8px',
                                                backgroundColor: '#EEF2FF', color: '#4F46E5',
                                                fontSize: '12px', fontWeight: '600'
                                            }}>
                                                Time: {formatTime(q.time_spent)}
                                            </span>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: '8px',
                                                backgroundColor: '#F0FDF4', color: '#10B981',
                                                fontSize: '12px', fontWeight: '600'
                                            }}>
                                                Prev Min: {formatTime(q.prev_min_time)}
                                            </span>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: '8px',
                                                backgroundColor: '#FFF7ED', color: '#F59E0B',
                                                fontSize: '12px', fontWeight: '600'
                                            }}>
                                                Prev Max: {formatTime(q.prev_max_time)}
                                            </span>
                                        </div>

                                        {/* Chosen vs Correct */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div style={{
                                                padding: '12px', borderRadius: '8px',
                                                backgroundColor: '#FEF2F2', border: '1px solid #FECACA'
                                            }}>
                                                <p style={{ fontSize: '11px', fontWeight: '700', color: '#888', marginBottom: '6px' }}>
                                                    YOUR ANSWER
                                                </p>
                                                <p style={{ fontSize: '14px', color: '#EF4444', fontWeight: '600' }}>
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
                                            <div style={{
                                                padding: '12px', borderRadius: '8px',
                                                backgroundColor: '#F0FDF4', border: '1px solid #A7F3D0'
                                            }}>
                                                <p style={{ fontSize: '11px', fontWeight: '700', color: '#888', marginBottom: '6px' }}>
                                                    CORRECT ANSWER
                                                </p>
                                                <p style={{ fontSize: '14px', color: '#10B981', fontWeight: '600' }}>
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
                                            <div style={{
                                                marginTop: '14px', padding: '14px',
                                                backgroundColor: '#FAFAFA', borderRadius: '8px',
                                                border: '1px solid #e5e7eb'
                                            }}>
                                                <p style={{ fontSize: '12px', fontWeight: '700', color: '#888', marginBottom: '8px' }}>
                                                    SOLUTION
                                                </p>
                                                {q.solution_text && (
                                                    <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.6' }}>
                                                        {q.solution_text}
                                                    </p>
                                                )}
                                                {q.solution_image_url && (
                                                    <img src={q.solution_image_url} alt="Solution"
                                                        style={{ maxWidth: '100%', borderRadius: '6px', marginTop: '8px' }}
                                                    />
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
                    <button
                        onClick={() => navigate('/test/configure')}
                        style={{
                            flex: 1, padding: '14px',
                            backgroundColor: '#4F46E5', color: '#fff',
                            border: 'none', borderRadius: '10px',
                            fontSize: '15px', fontWeight: '700', cursor: 'pointer'
                        }}
                    >
                        🔁 Take Another Test
                    </button>
                    <button
                        onClick={() => navigate('/home')}
                        style={{
                            flex: 1, padding: '14px',
                            backgroundColor: '#fff', color: '#333',
                            border: '1px solid #ddd', borderRadius: '10px',
                            fontSize: '15px', fontWeight: '700', cursor: 'pointer'
                        }}
                    >
                        🏠 Go Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TestResultPage;