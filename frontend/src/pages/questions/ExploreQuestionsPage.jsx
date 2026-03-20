import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Navbar from '../../components/Navbar';
import Pagination from '../../components/Pagination';
import { getQuestionTypeLabel, truncateText } from '../../utils/helpers';

const ExploreQuestionsPage = () => {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTagIds, setSelectedTagIds] = useState([]);
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState('ASC');

    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchTags();
    }, []);

    useEffect(() => {
        fetchQuestions();
    }, [currentPage, selectedTagIds, sortBy, sortOrder]);

    const fetchTags = async () => {
        try {
            const res = await API.get('/tags');
            setAvailableTags(res.data.tags);
        } catch (err) {
            console.error('Failed to fetch tags');
        }
    };

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedTagIds.length > 0) {
                params.append('tagIds', JSON.stringify(selectedTagIds));
            }
            if (sortBy) {
                params.append('sortBy', sortBy);
                params.append('sortOrder', sortOrder);
            }
            params.append('page', currentPage);
            params.append('limit', 10);

            const res = await API.get(`/questions?${params.toString()}`);
            setQuestions(res.data.questions);
            setTotalCount(res.data.totalCount);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error('Failed to fetch questions');
        } finally {
            setLoading(false);
        }
    };

    const handleTagFilter = (tagId) => {
        setCurrentPage(1);
        if (selectedTagIds.includes(tagId)) {
            setSelectedTagIds(selectedTagIds.filter(id => id !== tagId));
        } else {
            setSelectedTagIds([...selectedTagIds, tagId]);
        }
    };

    const handleClearFilters = () => {
        setSelectedTagIds([]);
        setSortBy('');
        setSortOrder('ASC');
        setCurrentPage(1);
    };

    const cardStyle = {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '12px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        border: '2px solid transparent',
        transition: 'all 0.2s'
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Navbar />
            <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }}>

                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: '24px',
                    flexWrap: 'wrap', gap: '12px'
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
                                Explore Questions
                            </h1>
                            <p style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>
                                {totalCount} question{totalCount !== 1 ? 's' : ''} found
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        style={{
                            padding: '9px 18px',
                            backgroundColor: showFilters ? '#4F46E5' : '#fff',
                            color: showFilters ? '#fff' : '#4F46E5',
                            border: '1px solid #4F46E5',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        🔧 Filters & Sort
                    </button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '20px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', marginBottom: '16px'
                        }}>
                            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111' }}>
                                Filter & Sort
                            </h3>
                            <button
                                onClick={handleClearFilters}
                                style={{
                                    padding: '5px 12px',
                                    backgroundColor: '#FEF2F2',
                                    color: '#EF4444',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Clear All
                            </button>
                        </div>

                        {/* Tag Filter */}
                        <div style={{ marginBottom: '16px' }}>
                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '8px' }}>
                                Filter by Tags:
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {availableTags.length === 0 && (
                                    <p style={{ fontSize: '13px', color: '#888' }}>No tags available yet.</p>
                                )}
                                {availableTags.map(tag => (
                                    <button
                                        key={tag.id}
                                        onClick={() => handleTagFilter(tag.id)}
                                        style={{
                                            padding: '5px 12px',
                                            borderRadius: '20px',
                                            border: 'none',
                                            backgroundColor: selectedTagIds.includes(tag.id) ? '#4F46E5' : '#EEF2FF',
                                            color: selectedTagIds.includes(tag.id) ? '#fff' : '#4F46E5',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sort */}
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '180px' }}>
                                <p style={{ fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '8px' }}>
                                    Sort By:
                                </p>
                                <select
                                    value={sortBy}
                                    onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}
                                    style={{
                                        width: '100%', padding: '9px 12px',
                                        borderRadius: '8px', border: '1px solid #ddd',
                                        fontSize: '13px', outline: 'none', backgroundColor: '#fff'
                                    }}
                                >
                                    <option value="">Default (Latest)</option>
                                    <option value="min_time">Min Time</option>
                                    <option value="max_time">Max Time</option>
                                    <option value="diff_time">Time Difference</option>
                                </select>
                            </div>
                            <div style={{ flex: 1, minWidth: '140px' }}>
                                <p style={{ fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '8px' }}>
                                    Order:
                                </p>
                                <select
                                    value={sortOrder}
                                    onChange={e => { setSortOrder(e.target.value); setCurrentPage(1); }}
                                    style={{
                                        width: '100%', padding: '9px 12px',
                                        borderRadius: '8px', border: '1px solid #ddd',
                                        fontSize: '13px', outline: 'none', backgroundColor: '#fff'
                                    }}
                                >
                                    <option value="ASC">Ascending</option>
                                    <option value="DESC">Descending</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Filters Summary */}
                {(selectedTagIds.length > 0 || sortBy) && (
                    <div style={{
                        display: 'flex', flexWrap: 'wrap', gap: '8px',
                        marginBottom: '16px', alignItems: 'center'
                    }}>
                        <span style={{ fontSize: '13px', color: '#888' }}>Active:</span>
                        {selectedTagIds.map(id => {
                            const tag = availableTags.find(t => t.id === id);
                            return tag ? (
                                <span key={id} style={{
                                    padding: '3px 10px', backgroundColor: '#EEF2FF',
                                    color: '#4F46E5', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
                                }}>
                                    {tag.name}
                                </span>
                            ) : null;
                        })}
                        {sortBy && (
                            <span style={{
                                padding: '3px 10px', backgroundColor: '#FFF7ED',
                                color: '#F59E0B', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
                            }}>
                                Sort: {sortBy} {sortOrder}
                            </span>
                        )}
                    </div>
                )}

                {/* Questions List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '48px', color: '#888' }}>
                        Loading questions...
                    </div>
                ) : questions.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '48px',
                        backgroundColor: '#fff', borderRadius: '12px'
                    }}>
                        <p style={{ fontSize: '40px', marginBottom: '12px' }}>📭</p>
                        <p style={{ color: '#888', fontSize: '16px' }}>No questions found.</p>
                        <button
                            onClick={() => navigate('/questions/create')}
                            style={{
                                marginTop: '16px', padding: '10px 24px',
                                backgroundColor: '#4F46E5', color: '#fff',
                                border: 'none', borderRadius: '8px',
                                fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                            }}
                        >
                            Create your first question
                        </button>
                    </div>
                ) : (
                    <>
                        {questions.map((q, idx) => (
                            <div
                                key={q.id}
                                onClick={() => navigate(`/questions/${q.id}`)}
                                style={cardStyle}
                                onMouseEnter={e => {
                                    e.currentTarget.style.border = '2px solid #4F46E5';
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,70,229,0.1)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.border = '2px solid transparent';
                                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05)';
                                }}
                            >
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'flex-start', marginBottom: '10px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{
                                            fontSize: '13px', fontWeight: '700',
                                            color: '#888', minWidth: '28px'
                                        }}>
                                            #{(currentPage - 1) * 10 + idx + 1}
                                        </span>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: '20px',
                                            backgroundColor: '#EEF2FF', color: '#4F46E5',
                                            fontSize: '11px', fontWeight: '700'
                                        }}>
                                            {getQuestionTypeLabel(q.type)}
                                        </span>
                                        {q.is_starred && (
                                            <span style={{ fontSize: '16px' }}>⭐</span>
                                        )}
                                    </div>
                                </div>

                                {q.question_text && (
                                    <p style={{
                                        fontSize: '15px', color: '#111',
                                        fontWeight: '500', marginBottom: '12px',
                                        lineHeight: '1.5'
                                    }}>
                                        {truncateText(q.question_text, 150)}
                                    </p>
                                )}

                                {q.question_image_url && !q.question_text && (
                                    <p style={{ fontSize: '14px', color: '#888', marginBottom: '12px' }}>
                                        📷 Image question
                                    </p>
                                )}

                                {/* Tags */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {q.tags?.map(tag => (
                                        <span key={tag.id} style={{
                                            padding: '2px 8px', borderRadius: '12px',
                                            backgroundColor: '#f3f4f6', color: '#555',
                                            fontSize: '11px', fontWeight: '500'
                                        }}>
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Count */}
                        <p style={{
                            textAlign: 'center', fontSize: '13px',
                            color: '#888', margin: '16px 0'
                        }}>
                            Showing {(currentPage - 1) * 10 + 1}–{Math.min(currentPage * 10, totalCount)} of {totalCount} questions
                        </p>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default ExploreQuestionsPage;