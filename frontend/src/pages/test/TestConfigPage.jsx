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

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const res = await API.get('/tags');
            setAvailableTags(res.data.tags);
        } catch (err) {
            console.error('Failed to fetch tags');
        }
    };

    const handleTagToggle = (tagId) => {
        if (selectedTagIds.includes(tagId)) {
            setSelectedTagIds(selectedTagIds.filter(id => id !== tagId));
        } else {
            setSelectedTagIds([...selectedTagIds, tagId]);
        }
    };

    const handleStartTest = async () => {
        setError('');
        if (totalQuestions < 1) {
            setError('Total questions must be at least 1.');
            return;
        }
        if (totalTime < 1) {
            setError('Total time must be at least 1 minute.');
            return;
        }

        setLoading(true);
        try {
            const res = await API.post('/tests/configure', {
                totalQuestions,
                totalTime,
                tagIds: selectedTagIds
            });
            navigate(`/test/${res.data.contestId}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to start test.');
        } finally {
            setLoading(false);
        }
    };

    const sectionStyle = {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Navbar />
            <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 24px' }}>

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
                            Configure Test
                        </h1>
                        <p style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>
                            Customize your test settings
                        </p>
                    </div>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#FEF2F2', color: '#EF4444',
                        padding: '12px 16px', borderRadius: '8px',
                        fontSize: '14px', marginBottom: '16px', border: '1px solid #FECACA'
                    }}>
                        {error}
                    </div>
                )}

                {/* Number of Questions */}
                <div style={sectionStyle}>
                    <label style={{ fontSize: '15px', fontWeight: '700', color: '#111', display: 'block', marginBottom: '12px' }}>
                        📝 Number of Questions
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            onClick={() => setTotalQuestions(Math.max(1, totalQuestions - 1))}
                            style={{
                                width: '36px', height: '36px',
                                borderRadius: '8px', border: '1px solid #ddd',
                                backgroundColor: '#fff', fontSize: '18px',
                                cursor: 'pointer', fontWeight: '700', color: '#333'
                            }}
                        >
                            −
                        </button>
                        <input
                            type="number"
                            value={totalQuestions}
                            onChange={e => setTotalQuestions(Math.max(1, parseInt(e.target.value) || 1))}
                            min={1}
                            style={{
                                width: '80px', textAlign: 'center',
                                padding: '8px', borderRadius: '8px',
                                border: '1px solid #ddd', fontSize: '18px',
                                fontWeight: '700', outline: 'none'
                            }}
                        />
                        <button
                            onClick={() => setTotalQuestions(totalQuestions + 1)}
                            style={{
                                width: '36px', height: '36px',
                                borderRadius: '8px', border: '1px solid #ddd',
                                backgroundColor: '#fff', fontSize: '18px',
                                cursor: 'pointer', fontWeight: '700', color: '#333'
                            }}
                        >
                            +
                        </button>
                        <span style={{ fontSize: '14px', color: '#888' }}>questions</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                        {[5, 10, 15, 20, 30].map(n => (
                            <button
                                key={n}
                                onClick={() => setTotalQuestions(n)}
                                style={{
                                    padding: '5px 14px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    backgroundColor: totalQuestions === n ? '#4F46E5' : '#EEF2FF',
                                    color: totalQuestions === n ? '#fff' : '#4F46E5',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Total Time */}
                <div style={sectionStyle}>
                    <label style={{ fontSize: '15px', fontWeight: '700', color: '#111', display: 'block', marginBottom: '12px' }}>
                        ⏱️ Total Time (minutes)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            onClick={() => setTotalTime(Math.max(1, totalTime - 5))}
                            style={{
                                width: '36px', height: '36px',
                                borderRadius: '8px', border: '1px solid #ddd',
                                backgroundColor: '#fff', fontSize: '18px',
                                cursor: 'pointer', fontWeight: '700', color: '#333'
                            }}
                        >
                            −
                        </button>
                        <input
                            type="number"
                            value={totalTime}
                            onChange={e => setTotalTime(Math.max(1, parseInt(e.target.value) || 1))}
                            min={1}
                            style={{
                                width: '80px', textAlign: 'center',
                                padding: '8px', borderRadius: '8px',
                                border: '1px solid #ddd', fontSize: '18px',
                                fontWeight: '700', outline: 'none'
                            }}
                        />
                        <button
                            onClick={() => setTotalTime(totalTime + 5)}
                            style={{
                                width: '36px', height: '36px',
                                borderRadius: '8px', border: '1px solid #ddd',
                                backgroundColor: '#fff', fontSize: '18px',
                                cursor: 'pointer', fontWeight: '700', color: '#333'
                            }}
                        >
                            +
                        </button>
                        <span style={{ fontSize: '14px', color: '#888' }}>minutes</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                        {[15, 30, 45, 60, 90].map(n => (
                            <button
                                key={n}
                                onClick={() => setTotalTime(n)}
                                style={{
                                    padding: '5px 14px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    backgroundColor: totalTime === n ? '#4F46E5' : '#EEF2FF',
                                    color: totalTime === n ? '#fff' : '#4F46E5',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                {n}m
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tag Selection */}
                <div style={sectionStyle}>
                    <label style={{ fontSize: '15px', fontWeight: '700', color: '#111', display: 'block', marginBottom: '6px' }}>
                        🏷️ Filter by Tags (Optional)
                    </label>
                    <p style={{ fontSize: '13px', color: '#888', marginBottom: '14px' }}>
                        Questions with selected tags will be prioritized. Leave empty for random questions.
                    </p>
                    {availableTags.length === 0 ? (
                        <p style={{ fontSize: '13px', color: '#aaa' }}>No tags available yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {availableTags.map(tag => (
                                <button
                                    key={tag.id}
                                    onClick={() => handleTagToggle(tag.id)}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        border: 'none',
                                        backgroundColor: selectedTagIds.includes(tag.id) ? '#4F46E5' : '#EEF2FF',
                                        color: selectedTagIds.includes(tag.id) ? '#fff' : '#4F46E5',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {selectedTagIds.includes(tag.id) ? '✓ ' : ''}{tag.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Summary */}
                <div style={{
                    ...sectionStyle,
                    backgroundColor: '#EEF2FF',
                    border: '1px solid #C7D2FE'
                }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#4F46E5', marginBottom: '12px' }}>
                        📋 Test Summary
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                            <p style={{ fontSize: '12px', color: '#818CF8' }}>Questions</p>
                            <p style={{ fontSize: '18px', fontWeight: '800', color: '#4F46E5' }}>{totalQuestions}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', color: '#818CF8' }}>Time</p>
                            <p style={{ fontSize: '18px', fontWeight: '800', color: '#4F46E5' }}>{totalTime} min</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', color: '#818CF8' }}>Tags Selected</p>
                            <p style={{ fontSize: '18px', fontWeight: '800', color: '#4F46E5' }}>
                                {selectedTagIds.length === 0 ? 'Any' : selectedTagIds.length}
                            </p>
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', color: '#818CF8' }}>Time/Question</p>
                            <p style={{ fontSize: '18px', fontWeight: '800', color: '#4F46E5' }}>
                                {Math.floor((totalTime * 60) / totalQuestions)}s
                            </p>
                        </div>
                    </div>
                </div>

                {/* Start Button */}
                <button
                    onClick={handleStartTest}
                    disabled={loading}
                    style={{
                        width: '100%', padding: '16px',
                        backgroundColor: loading ? '#a5b4fc' : '#4F46E5',
                        color: '#fff', border: 'none',
                        borderRadius: '12px', fontSize: '16px',
                        fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer',
                        letterSpacing: '0.3px'
                    }}
                >
                    {loading ? 'Setting up test...' : '🚀 Start Test'}
                </button>
            </div>
        </div>
    );
};

export default TestConfigPage;