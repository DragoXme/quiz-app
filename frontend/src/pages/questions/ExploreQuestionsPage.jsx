import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Navbar from '../../components/Navbar';
import Pagination from '../../components/Pagination';
import CustomSelect from '../../components/CustomSelect';
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
    const [filterType, setFilterType] = useState('');

    useEffect(() => { fetchTags(); }, []);
    useEffect(() => { fetchQuestions(); }, [currentPage, selectedTagIds, sortBy, sortOrder, filterType]);

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
            if (filterType) params.append('filterType', filterType);
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

    const handleFilterType = (type) => {
        setCurrentPage(1);
        setFilterType(prev => prev === type ? '' : type);
    };

    const handleClearFilters = () => {
        setSelectedTagIds([]);
        setSortBy('');
        setSortOrder('ASC');
        setFilterType('');
        setCurrentPage(1);
    };

    const glassCard = {
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderRadius: '16px',
        padding: isMobile ? '16px' : '20px',
        marginBottom: '16px',
        boxShadow: `0 4px 20px var(--shadow)`,
        border: '1px solid var(--glass-border)'
    };

    const sortByOptions = [
        { value: '', label: 'Default (Latest)' },
        { value: 'min_time', label: 'Min Time' },
        { value: 'max_time', label: 'Max Time' },
        { value: 'diff_time', label: 'Time Difference' }
    ];

    const sortOrderOptions = [
        { value: 'ASC', label: 'Ascending' },
        { value: 'DESC', label: 'Descending' }
    ];

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
                    <button onClick={() => setShowFilters(!showFilters)} style={{
                        padding: '8px 14px', flexShrink: 0,
                        background: showFilters ? 'var(--gradient-accent)' : 'var(--glass-bg)',
                        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                        color: showFilters ? '#fff' : 'var(--accent-text)',
                        border: '1.5px solid var(--accent)',
                        borderRadius: '10px', fontSize: '13px',
                        fontWeight: '600', cursor: 'pointer'
                    }}>
                        🔧 {isMobile ? 'Filter' : 'Filters & Sort'}
                    </button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div style={glassCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Filter & Sort</h3>
                            <button onClick={handleClearFilters} style={{
                                padding: '4px 10px', backgroundColor: 'var(--error-light)',
                                color: 'var(--error)', border: 'none', borderRadius: '8px',
                                fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                            }}>Clear All</button>
                        </div>

                        {/* Status Filter */}
                        <div style={{ marginBottom: '14px' }}>
                            <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Filter by Status:</p>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {[
                                    { key: 'struggling', label: '🔴 Struggling', activeColor: 'var(--error)', lightColor: 'var(--error-light)', textColor: 'var(--error)' },
                                    { key: 'unattempted', label: '⏭️ Unattempted', activeColor: 'var(--warning)', lightColor: 'var(--warning-light)', textColor: 'var(--warning)' }
                                ].map(f => (
                                    <button key={f.key} onClick={() => handleFilterType(f.key)} style={{
                                        padding: '5px 12px', borderRadius: '20px', border: 'none',
                                        backgroundColor: filterType === f.key ? f.activeColor : f.lightColor,
                                        color: filterType === f.key ? '#fff' : f.textColor,
                                        fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                                    }}>{f.label}</button>
                                ))}
                            </div>
                        </div>

                        {/* Tag Filter */}
                        <div style={{ marginBottom: '14px' }}>
                            <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Filter by Tags:</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {availableTags.filter(t =>
                                    t.name !== 'mcq single correct' && t.name !== 'mcq multiple correct' && t.name !== 'fill in the blank'
                                ).map(tag => (
                                    <button key={tag.id} onClick={() => handleTagFilter(tag.id)} style={{
                                        padding: '4px 10px', borderRadius: '20px', border: 'none',
                                        backgroundColor: selectedTagIds.includes(tag.id) ? 'var(--accent)' : 'var(--accent-light)',
                                        color: selectedTagIds.includes(tag.id) ? '#fff' : 'var(--accent-text)',
                                        fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                                    }}>{tag.name}</button>
                                ))}
                            </div>
                        </div>

                        {/* Sort — using CustomSelect */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '140px' }}>
                                <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Sort By:</p>
                                <CustomSelect
                                    value={sortBy}
                                    onChange={v => { setSortBy(v); setCurrentPage(1); }}
                                    options={sortByOptions}
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: '120px' }}>
                                <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Order:</p>
                                <CustomSelect
                                    value={sortOrder}
                                    onChange={v => { setSortOrder(v); setCurrentPage(1); }}
                                    options={sortOrderOptions}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Filters */}
                {(selectedTagIds.length > 0 || sortBy || filterType) && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Active:</span>
                        {filterType === 'struggling' && <span style={{ padding: '2px 8px', backgroundColor: 'var(--error-light)', color: 'var(--error)', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>🔴 Struggling</span>}
                        {filterType === 'unattempted' && <span style={{ padding: '2px 8px', backgroundColor: 'var(--warning-light)', color: 'var(--warning)', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>⏭️ Unattempted</span>}
                        {selectedTagIds.map(id => {
                            const tag = availableTags.find(t => t.id === id);
                            return tag ? <span key={id} style={{ padding: '2px 8px', backgroundColor: 'var(--accent-light)', color: 'var(--accent-text)', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>{tag.name}</span> : null;
                        })}
                        {sortBy && <span style={{ padding: '2px 8px', backgroundColor: 'var(--warning-light)', color: 'var(--warning)', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>{sortBy} {sortOrder}</span>}
                    </div>
                )}

                {/* Questions List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Loading questions...</div>
                ) : questions.length === 0 ? (
                    <div style={{ ...glassCard, textAlign: 'center', padding: '48px' }}>
                        <p style={{ fontSize: '40px', marginBottom: '12px' }}>📭</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>No questions found.</p>
                        <button onClick={() => navigate('/questions/create')} style={{
                            marginTop: '16px', padding: '10px 24px',
                            background: 'var(--gradient-accent)', color: '#fff',
                            border: 'none', borderRadius: '10px',
                            fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                        }}>Create your first question</button>
                    </div>
                ) : (
                    <>
                        {questions.map((q, idx) => (
                            <div key={q.id} onClick={() => navigate(`/questions/${q.id}`)} style={{
                                background: 'var(--glass-bg)',
                                backdropFilter: 'var(--glass-blur)',
                                WebkitBackdropFilter: 'var(--glass-blur)',
                                borderRadius: '14px',
                                padding: isMobile ? '14px' : '18px',
                                marginBottom: '10px',
                                boxShadow: `0 2px 12px var(--shadow)`,
                                cursor: 'pointer',
                                border: '1px solid var(--glass-border)',
                                transition: 'all 0.2s'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = `0 6px 24px var(--shadow-md)`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.boxShadow = `0 2px 12px var(--shadow)`; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>#{(currentPage - 1) * 10 + idx + 1}</span>
                                    <span style={{ padding: '2px 8px', borderRadius: '20px', backgroundColor: 'var(--accent-light)', color: 'var(--accent-text)', fontSize: '11px', fontWeight: '700' }}>
                                        {getQuestionTypeLabel(q.type)}
                                    </span>
                                    {q.is_starred && <span style={{ fontSize: '14px' }}>⭐</span>}
                                    {q.correct_count <= q.wrong_count && q.wrong_count > 0 && (
                                        <span style={{ padding: '2px 8px', borderRadius: '20px', backgroundColor: 'var(--error-light)', color: 'var(--error)', fontSize: '11px', fontWeight: '700' }}>🔴 Struggling</span>
                                    )}
                                    {(q.wrong_count + q.correct_count) <= q.unattempted_count && q.unattempted_count > 0 && (
                                        <span style={{ padding: '2px 8px', borderRadius: '20px', backgroundColor: 'var(--warning-light)', color: 'var(--warning)', fontSize: '11px', fontWeight: '700' }}>⏭️ Unattempted</span>
                                    )}
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
                                        t.name !== 'starred' && t.name !== 'mcq single correct' && t.name !== 'mcq multiple correct' && t.name !== 'fill in the blank'
                                    ).map(tag => (
                                        <span key={tag.id} style={{ padding: '2px 6px', borderRadius: '10px', backgroundColor: 'var(--tag-bg)', color: 'var(--tag-text)', fontSize: '10px', fontWeight: '500' }}>
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
