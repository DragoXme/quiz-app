import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Navbar from '../../components/Navbar';

const TestConfigPage = () => {
    const navigate = useNavigate();
    const [totalQuestions, setTotalQuestions] = useState(10);
    const [totalTime, setTotalTime] = useState(30);
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTagIds, setSelectedTagIds] = useState([]);
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

    const handleStartTest = async () => {
        setError('');
        if (totalQuestions < 1) { setError('Total questions must be at least 1.'); return; }
        if (totalTime < 1) { setError('Total time must be at least 1 minute.'); return; }
        setLoading(true);
        try {
            const res = await API.post('/tests/configure', {
                totalQuestions, totalTime, tagIds: selectedTagIds
            });
            navigate(`/test/${res.data.contestId}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to start test.');
        } finally {
            setLoading(false);
        }
    };

    const sectionStyle = {
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px',
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
        width: '80px', textAlign: 'center',
        padding: '8px', borderRadius: '8px',
        border: '1px solid var(--border)', fontSize: '18px',
        fontWeight: '700', outline: 'none',
        backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)'
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Navbar />
            <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 24px' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                    <button onClick={() => navigate('/home')}
                        style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        ←
                    </button>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>Configure Test</h1>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Customize your test settings</p>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={() => setTotalQuestions(Math.max(1, totalQuestions - 1))} style={counterBtnStyle}>−</button>
                        <input type="number" value={totalQuestions}
                            onChange={e => setTotalQuestions(Math.max(1, parseInt(e.target.value) || 1))}
                            min={1} style={inputStyle} />
                        <button onClick={() => setTotalQuestions(totalQuestions + 1)} style={counterBtnStyle}>+</button>
                        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>questions</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                        {[5, 10, 15, 20, 30].map(n => (
                            <button key={n} onClick={() => setTotalQuestions(n)} style={{
                                padding: '5px 14px', borderRadius: '20px', border: 'none',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={() => setTotalTime(Math.max(1, totalTime - 5))} style={counterBtnStyle}>−</button>
                        <input type="number" value={totalTime}
                            onChange={e => setTotalTime(Math.max(1, parseInt(e.target.value) || 1))}
                            min={1} style={inputStyle} />
                        <button onClick={() => setTotalTime(totalTime + 5)} style={counterBtnStyle}>+</button>
                        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>minutes</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                        {[15, 30, 45, 60, 90].map(n => (
                            <button key={n} onClick={() => setTotalTime(n)} style={{
                                padding: '5px 14px', borderRadius: '20px', border: 'none',
                                backgroundColor: totalTime === n ? 'var(--accent)' : 'var(--accent-light)',
                                color: totalTime === n ? '#fff' : 'var(--accent-text)',
                                fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                            }}>{n}m</button>
                        ))}
                    </div>
                </div>

                {/* Tag Selection */}
                <div style={sectionStyle}>
                    <label style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                        🏷️ Filter by Tags (Optional)
                    </label>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                        Questions with selected tags will be prioritized. Leave empty for random questions.
                    </p>
                    {availableTags.length === 0 ? (
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No tags available yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {availableTags.map(tag => (
                                <button key={tag.id} onClick={() => handleTagToggle(tag.id)} style={{
                                    padding: '6px 14px', borderRadius: '20px', border: 'none',
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
                <div style={{
                    ...sectionStyle,
                    backgroundColor: 'var(--accent-light)',
                    border: '1px solid var(--accent)'
                }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--accent-text)', marginBottom: '12px' }}>
                        📋 Test Summary
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {[
                            { label: 'Questions', value: totalQuestions },
                            { label: 'Time', value: `${totalTime} min` },
                            { label: 'Tags Selected', value: selectedTagIds.length === 0 ? 'Any' : selectedTagIds.length },
                            { label: 'Time/Question', value: `${Math.floor((totalTime * 60) / totalQuestions)}s` }
                        ].map(item => (
                            <div key={item.label}>
                                <p style={{ fontSize: '12px', color: 'var(--accent-text)', opacity: 0.7 }}>{item.label}</p>
                                <p style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-text)' }}>{item.value}</p>
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
                    cursor: loading ? 'not-allowed' : 'pointer',
                    letterSpacing: '0.3px'
                }}>
                    {loading ? 'Setting up test...' : '🚀 Start Test'}
                </button>
            </div>
        </div>
    );
};

export default TestConfigPage;