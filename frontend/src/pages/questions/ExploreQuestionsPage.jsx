import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Navbar from '../../components/Navbar';
import Pagination from '../../components/Pagination';
import { getQuestionTypeLabel, truncateText } from '../../utils/helpers';
import useWindowSize from '../../hooks/useWindowSize';

const ExploreQuestionsPage = () => {
    const navigate = useNavigate();
    const { isMobile } = useWindowSize();
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

    useEffect(() => { fetchTags(); }, []);
    useEffect(() => { fetchQuestions(); }, [currentPage, selectedTagIds, sortBy, sortOrder]);

    const fetchTags = async () => {
        try {
            const res = await API.get('/tags');
            setAvailableTags(res.data.tags);
        } catch (err) { console.error('Failed to fetch tags'); }
    };

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedTagIds.length > 0) params.append('tagIds', JSON.stringify(selectedTagIds));
            if (sortBy) { params.append('sortBy', sortBy); params.append('sortOrder', sortOrder); }
            params.append('page', currentPage);
            params.append('limit', 10);
            const res = await API.get(`/questions?${params.toString()}`);
            setQuestions(res.data.questions);
            setTotalCount(res.data.totalCount);
            setTotalPages(res.data.totalPages);
        } catch (err) { console.error('Failed to fetch questions'); }
        finally { setLoading(false); }
    };

    const handleTagFilter = (tagId) => {
        setCurrentPage(1);
        setSelectedTagIds(prev =>
            prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
        );
    };

    const handleClearFilters = () => {
        setSelectedTagIds([]);
        setSortBy('');
        setSortOrder('ASC');
        setCurrentPage(1);
    };

    const sectionStyle = {
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        padding: isMobile ? '16px' : '20px',
        marginBottom: '16px',
        boxShadow: `0 2px 8px var(--shadow)`,
        border: '1px solid var(--border)'
    };

    const selectStyle = {
        width: '100%', padding: '9px 12px', borderRadius: '8px',
        border: '1px solid var(--input-border)', fontSize: '13px',
        outline: 'none', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)'
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Navbar />
            <div style={{ maxWidth: '860px', margin: '0 auto', padding: isMobile ? '16px' : '32px 24px' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button onClick={() => navigate('/home')}
                            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            ←
                        </button>
                        <div>
                            <h1 style={{ fontSize: isMobile ? '18px' : '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
                                Explore Questions
                            </h1>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {totalCount} question{totalCount !== 1 ? 's' : ''} found
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        style={{
                            padding: '8px 14px', flexShrink: 0,
                            backgroundColor: showFilters ? 'var(--accent)' : 'var(--bg-card)',
                            color: showFilters ? '#fff' : 'var(--accent)',
                            border: '1px solid var(--accent)',
                            borderRadius: '8px', fontSize: '13px',
                            fontWeight: '600', cursor: 'pointer'
                        }}
                    >
                        🔧 {isMobile ? 'Filter' : 'Filters & Sort'}
                    </button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div style={sectionStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Filter & Sort</h3>
                            <button onClick={handleClearFilters} style={{
                                padding: '4px 10px', backgroundColor: 'var(--error-light)',
                                color: 'var(--error)', border: 'none', borderRadius: '6px',
                                fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                            }}>
                                Clear All
                            </button>
                        </div>

                        {/* Tag Filter */}
                        <div style={{ marginBottom: '14px' }}>
                            <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                Filter by Tags:
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {availableTags.length === 0 && (
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No tags available yet.</p>
                                )}
                                {availableTags.map(tag => (
                                    <button key={tag.id} onClick={() => handleTagFilter(tag.id)} style={{
                                        padding: '4px 10px', borderRadius: '20px', border: 'none',
                                        backgroundColor: selectedTagIds.includes(tag.id) ? 'var(--accent)' : 'var(--accent-light)',
                                        color: selectedTagIds.includes(tag.id) ? '#fff' : 'var(--accent-text)',
                                        fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                                    }}>
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sort */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '140px' }}>
                                <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Sort By:</p>
                                <select value={sortBy} onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }} style={selectStyle}>
                                    <option value="">Default (Latest)</option>
                                    <option value="min_time">Min Time</option>
                                    <option value="max_time">Max Time</option>
                                    <option value="diff_time">Time Difference</option>
                                </select>
                            </div>
                            <div style={{ flex: 1, minWidth: '120px' }}>
                                <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Order:</p>
                                <select value={sortOrder} onChange={e => { setSortOrder(e.target.value); setCurrentPage(1); }} style={selectStyle}>
                                    <option value="ASC">Ascending</option>
                                    <option value="DESC">Descending</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Filters */}
                {(selectedTagIds.length > 0 || sortBy) && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Active:</span>
                        {selectedTagIds.map(id => {
                            const tag = availableTags.find(t => t.id === id);
                            return tag ? (
                                <span key={id} style={{
                                    padding: '2px 8px', backgroundColor: 'var(--accent-light)',
                                    color: 'var(--accent-text)', borderRadius: '20px', fontSize: '11px', fontWeight: '600'
                                }}>{tag.name}</span>
                            ) : null;
                        })}
                        {sortBy && (
                            <span style={{
                                padding: '2px 8px', backgroundColor: 'var(--warning-light)',
                                color: 'var(--warning)', borderRadius: '20px', fontSize: '11px', fontWeight: '600'
                            }}>
                                {sortBy} {sortOrder}
                            </span>
                        )}
                    </div>
                )}

                {/* Questions List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Loading questions...</div>
                ) : questions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '40px', marginBottom: '12px' }}>📭</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>No questions found.</p>
                        <button onClick={() => navigate('/questions/create')} style={{
                            marginTop: '16px', padding: '10px 24px',
                            backgroundColor: 'var(--accent)', color: '#fff',
                            border: 'none', borderRadius: '8px',
                            fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                        }}>
                            Create your first question
                        </button>
                    </div>
                ) : (
                    <>
                        {questions.map((q, idx) => (
                            <div
                                key={q.id}
                                onClick={() => navigate(`/questions/${q.id}`)}
                                style={{
                                    backgroundColor: 'var(--bg-card)',
                                    borderRadius: '12px',
                                    padding: isMobile ? '14px' : '20px',
                                    marginBottom: '10px',
                                    boxShadow: `0 2px 6px var(--shadow)`,
                                    cursor: 'pointer',
                                    border: '2px solid var(--border)',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'var(--accent)';
                                    e.currentTarget.style.boxShadow = `0 4px 16px var(--shadow-md)`;
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.boxShadow = `0 2px 6px var(--shadow)`;
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>
                                        #{(currentPage - 1) * 10 + idx + 1}
                                    </span>
                                    <span style={{
                                        padding: '2px 8px', borderRadius: '20px',
                                        backgroundColor: 'var(--accent-light)', color: 'var(--accent-text)',
                                        fontSize: '11px', fontWeight: '700'
                                    }}>
                                        {getQuestionTypeLabel(q.type)}
                                    </span>
                                    {q.is_starred && <span style={{ fontSize: '14px' }}>⭐</span>}
                                </div>

                                {q.question_text && (
                                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500', marginBottom: '10px', lineHeight: '1.5' }}>
                                        {truncateText(q.question_text, isMobile ? 100 : 150)}
                                    </p>
                                )}
                                {q.question_image_url && !q.question_text && (
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>📷 Image question</p>
                                )}

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {q.tags?.filter(t =>
                                        t.name !== 'starred' &&
                                        t.name !== 'mcq single correct' &&
                                        t.name !== 'mcq multiple correct' &&
                                        t.name !== 'fill in the blank'
                                    ).map(tag => (
                                        <span key={tag.id} style={{
                                            padding: '2px 6px', borderRadius: '10px',
                                            backgroundColor: 'var(--tag-bg)', color: 'var(--tag-text)',
                                            fontSize: '10px', fontWeight: '500'
                                        }}>
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', margin: '14px 0' }}>
                            Showing {(currentPage - 1) * 10 + 1}–{Math.min(currentPage * 10, totalCount)} of {totalCount}
                        </p>

                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </>
                )}
            </div>
        </div>
    );
};

export default ExploreQuestionsPage;