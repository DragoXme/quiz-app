import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Navbar from '../../components/Navbar';
import useWindowSize from '../../hooks/useWindowSize';

const TestConfigPage = () => {
    const navigate = useNavigate();
    const { isMobile } = useWindowSize();
    const [totalQuestions, setTotalQuestions] = useState(10);
    const [totalTime, setTotalTime] = useState(30);
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTagIds, setSelectedTagIds] = useState([]);
    const [filterType, setFilterType] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => { fetchTags(); }, []);

    const fetchTags = async () => {
        try {
            const res = await API.get('/tags');
            setAvailableTags(res.data.tags);
        } catch (err) { console.error('Failed to fetch tags'); }
    };

    const handleTagToggle = (tagId) => {
        setSelectedTagIds(prev =>
            prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
        );
    };

    const handleFilterType = (type) => {
        setFilterType(prev => prev === type ? '' : type);
    };

    const handleStartTest = async () => {
        setError('');
        if (totalQuestions < 1) { setError('Total questions must be at least 1.'); return; }
        if (totalTime < 1) { setError('Total time must be at least 1 minute.'); return; }
        setLoading(true);
        try {
            const res = await API.post('/tests/configure', {
                totalQuestions, totalTime, tagIds: selectedTagIds, filterType
            });
            const contestId = res.data.contestId;
            const totalSeconds = totalTime * 60;
            const now = Date.now();

            // Load existing active contests array
            const existing = JSON.parse(localStorage.getItem('activeContests') || '[]');
            // Add new contest
            existing.push({ contestId, startedAt: now, totalTime: totalSeconds });
            localStorage.setItem('activeContests', JSON.stringify(existing));

            navigate(`/test/${contestId}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to start test.');
        } finally {
            setLoading(false);
        }
    };

    const sectionStyle = {
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        padding: isMobile ? '16px' : '24px',
        marginBottom: '16px',
        boxShadow: `0 2px 8px var(--shadow)`,
        border: '1px solid var(--border)'
    };

    const counterBtnStyle = {
        width: '36px', height: '36px',
        borderRadius: '8px', border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-card)', fontSize: '18px',
        cursor: 'pointer', fontWeight: '700', color: 'var(--text-primary)'
    };

    const inputStyle = {
        width: '70px', textAlign: 'center',
        padding: '8px', borderRadius: '8px',
        border: '1px solid var(--border)', fontSize: '18px',
        fontWeight: '700', outline: 'none',
        backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)'
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Navbar />
            <div style={{ maxWidth: '640px', margin: '0 auto', padding: isMobile ? '16px' : '32px 24px' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <button onClick={() => navigate('/home')}
                        style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        ←
                    </button>
                    <div>
                        <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
                            Configure Test
                        </h1>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Customize your test settings
                        </p>
                    </div>
                </div>

                {error && (
                    <div style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', border: '1px solid var(--error)' }}>
                        {error}
                    </div>
                )}

                {/* Number of Questions */}
                <div style={sectionStyle}>
                    <label style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '12px' }}>
                        📝 Number of Questions
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => setTotalQuestions(Math.max(1, totalQuestions - 1))} style={counterBtnStyle}>−</button>
                        <input type="number" value={totalQuestions}
                            onChange={e => setTotalQuestions(Math.max(1, parseInt(e.target.value) || 1))}
                            min={1} style={inputStyle} />
                        <button onClick={() => setTotalQuestions(totalQuestions + 1)} style={counterBtnStyle}>+</button>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>questions</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                        {[5, 10, 15, 20, 30].map(n => (
                            <button key={n} onClick={() => setTotalQuestions(n)} style={{
                                padding: '5px 12px', borderRadius: '20px', border: 'none',
                                backgroundColor: totalQuestions === n ? 'var(--accent)' : 'var(--accent-light)',
                                color: totalQuestions === n ? '#fff' : 'var(--accent-text)',
                                fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                            }}>{n}</button>
                        ))}
                    </div>
                </div>

                {/* Total Time */}
                <div style={sectionStyle}>
                    <label style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '12px' }}>
                        ⏱️ Total Time (minutes)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => setTotalTime(Math.max(1, totalTime - 5))} style={counterBtnStyle}>−</button>
                        <input type="number" value={totalTime}
                            onChange={e => setTotalTime(Math.max(1, parseInt(e.target.value) || 1))}
                            min={1} style={inputStyle} />
                        <button onClick={() => setTotalTime(totalTime + 5)} style={counterBtnStyle}>+</button>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>minutes</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                        {[15, 30, 45, 60, 90].map(n => (
                            <button key={n} onClick={() => setTotalTime(n)} style={{
                                padding: '5px 12px', borderRadius: '20px', border: 'none',
                                backgroundColor: totalTime === n ? 'var(--accent)' : 'var(--accent-light)',
                                color: totalTime === n ? '#fff' : 'var(--accent-text)',
                                fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                            }}>{n}m</button>
                        ))}
                    </div>
                </div>

                {/* Question Filter */}
                <div style={sectionStyle}>
                    <label style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                        🎯 Question Filter (Optional)
                    </label>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        Focus on questions that need more practice.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button onClick={() => handleFilterType('struggling')} style={{
                            padding: '8px 16px', borderRadius: '20px', border: 'none',
                            backgroundColor: filterType === 'struggling' ? 'var(--error)' : 'var(--error-light)',
                            color: filterType === 'struggling' ? '#fff' : 'var(--error)',
                            fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                        }}>🔴 Struggling Questions</button>
                        <button onClick={() => handleFilterType('unattempted')} style={{
                            padding: '8px 16px', borderRadius: '20px', border: 'none',
                            backgroundColor: filterType === 'unattempted' ? 'var(--warning)' : 'var(--warning-light)',
                            color: filterType === 'unattempted' ? '#fff' : 'var(--warning)',
                            fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                        }}>⏭️ Unattempted Questions</button>
                    </div>
                </div>

                {/* Tag Selection */}
                <div style={sectionStyle}>
                    <label style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                        🏷️ Filter by Tags (Optional)
                    </label>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        Questions with selected tags will be prioritized.
                    </p>
                    {availableTags.filter(t =>
                        t.name !== 'mcq single correct' &&
                        t.name !== 'mcq multiple correct' &&
                        t.name !== 'fill in the blank'
                    ).length === 0 ? (
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No tags available yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {availableTags.filter(t =>
                                t.name !== 'mcq single correct' &&
                                t.name !== 'mcq multiple correct' &&
                                t.name !== 'fill in the blank'
                            ).map(tag => (
                                <button key={tag.id} onClick={() => handleTagToggle(tag.id)} style={{
                                    padding: '6px 12px', borderRadius: '20px', border: 'none',
                                    backgroundColor: selectedTagIds.includes(tag.id) ? 'var(--accent)' : 'var(--accent-light)',
                                    color: selectedTagIds.includes(tag.id) ? '#fff' : 'var(--accent-text)',
                                    fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                                }}>
                                    {selectedTagIds.includes(tag.id) ? '✓ ' : ''}{tag.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Summary */}
                <div style={{ ...sectionStyle, backgroundColor: 'var(--accent-light)', border: '1px solid var(--accent)' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--accent-text)', marginBottom: '12px' }}>
                        📋 Test Summary
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '12px' }}>
                        {[
                            { label: 'Questions', value: totalQuestions },
                            { label: 'Time', value: `${totalTime} min` },
                            { label: 'Tags', value: selectedTagIds.length === 0 ? 'Any' : selectedTagIds.length },
                            { label: 'Filter', value: filterType ? filterType : 'None' }
                        ].map(item => (
                            <div key={item.label} style={{ backgroundColor: 'var(--bg-card)', borderRadius: '8px', padding: '10px 12px' }}>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>{item.label}</p>
                                <p style={{ fontSize: '16px', fontWeight: '800', color: 'var(--accent-text)' }}>{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Start Button */}
                <button onClick={handleStartTest} disabled={loading} style={{
                    width: '100%', padding: '16px',
                    backgroundColor: loading ? 'var(--text-muted)' : 'var(--accent)',
                    color: '#fff', border: 'none', borderRadius: '12px',
                    fontSize: '16px', fontWeight: '800',
                    cursor: loading ? 'not-allowed' : 'pointer'
                }}>
                    {loading ? 'Setting up test...' : '🚀 Start Test'}
                </button>
            </div>
        </div>
    );
};

export default TestConfigPage;
