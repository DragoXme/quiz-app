import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../api/axios';
import Navbar from '../../components/Navbar';
import TagInput from '../../components/TagInput';
import ImageUpload from '../../components/ImageUpload';
import OptionsList from '../../components/OptionsList';
import ConfirmModal from '../../components/ConfirmModal';
import { getQuestionTypeLabel, formatTime } from '../../utils/helpers';
import useWindowSize from '../../hooks/useWindowSize';

const QuestionDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isMobile } = useWindowSize();
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [editForm, setEditForm] = useState(null);

    useEffect(() => { fetchQuestion(); }, [id]);

    const fetchQuestion = async () => {
        setLoading(true);
        try {
            const res = await API.get(`/questions/${id}`);
            setQuestion(res.data.question);
        } catch (err) {
            setError('Question not found.');
        } finally {
            setLoading(false);
        }
    };

    const startEditing = () => {
        setEditForm({
            type: question.type,
            questionText: question.question_text || '',
            questionImageUrl: question.question_image_url || null,
            questionInputType: question.question_image_url ? 'image' : 'text',
            solutionText: question.solution_text || '',
            solutionImageUrl: question.solution_image_url || null,
            solutionInputType: question.solution_image_url ? 'image' : 'text',
            options: question.options?.map(o => ({
                optionText: o.option_text || '',
                optionImageUrl: o.option_image_url || null,
                isCorrect: o.is_correct
            })) || [],
            fillAnswer: question.fillAnswer?.correct_answer || '',
            tags: question.tags || [],
            isStarred: question.is_starred
        });
        setEditing(true);
        setSaveError('');
    };

    const handleSave = async () => {
        setSaveError('');
        if (!editForm.questionText && !editForm.questionImageUrl) { setSaveError('Question text or image is required.'); return; }
        if (editForm.tags.length === 0) { setSaveError('At least one tag is required.'); return; }
        if (editForm.type === 'mcq_single') {
            const correct = editForm.options.filter(o => o.isCorrect);
            if (correct.length !== 1) { setSaveError('Please select exactly 1 correct answer.'); return; }
        }
        if (editForm.type === 'mcq_multiple') {
            const correct = editForm.options.filter(o => o.isCorrect);
            if (correct.length < 1) { setSaveError('Please select at least 1 correct answer.'); return; }
        }
        if (editForm.type === 'fill_blank' && !editForm.fillAnswer.trim()) { setSaveError('Correct answer is required.'); return; }

        setSaving(true);
        try {
            const res = await API.put(`/questions/${id}`, {
                type: editForm.type,
                questionText: editForm.questionInputType === 'text' ? editForm.questionText : null,
                questionImageUrl: editForm.questionInputType === 'image' ? editForm.questionImageUrl : null,
                solutionText: editForm.solutionInputType === 'text' ? editForm.solutionText : null,
                solutionImageUrl: editForm.solutionInputType === 'image' ? editForm.solutionImageUrl : null,
                options: editForm.type !== 'fill_blank' ? editForm.options : [],
                fillAnswer: editForm.type === 'fill_blank' ? editForm.fillAnswer : null,
                tags: editForm.tags.map(t => t.name),
                isStarred: editForm.isStarred
            });
            setQuestion(res.data.question);
            setEditing(false);
            setShowAnswer(false);
        } catch (err) {
            setSaveError(err.response?.data?.message || 'Failed to save question.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await API.delete(`/questions/${id}`);
            navigate('/questions');
        } catch (err) {
            setError('Failed to delete question.');
        }
    };

    const sectionStyle = {
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '16px',
        boxShadow: `0 2px 8px var(--shadow)`,
        border: '1px solid var(--border)'
    };

    const tabStyle = (active) => ({
        padding: '7px 18px', borderRadius: '8px', border: 'none',
        backgroundColor: active ? 'var(--accent)' : 'var(--bg-hover)',
        color: active ? '#fff' : 'var(--text-secondary)',
        fontSize: '13px', fontWeight: '600', cursor: 'pointer'
    });

    const labelStyle = {
        fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px',
        marginBottom: '6px', display: 'block'
    };

    const inputStyle = {
        width: '100%', padding: '11px 14px', borderRadius: '8px',
        border: '1px solid var(--input-border)', fontSize: '14px',
        outline: 'none', boxSizing: 'border-box',
        backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)'
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Navbar />
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>Loading...</div>
        </div>
    );

    if (error) return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Navbar />
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--error)' }}>{error}</div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Navbar />
            <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 24px' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => navigate('/questions')}
                            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            ←
                        </button>
                        <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)' }}>
                            Question Detail
                        </h1>
                    </div>
                    {!editing && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={startEditing} style={{
                                padding: '8px 18px', backgroundColor: 'var(--accent-light)',
                                color: 'var(--accent-text)', border: 'none', borderRadius: '8px',
                                fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                            }}>✏️ Edit</button>
                            <button onClick={() => setShowDeleteModal(true)} style={{
                                padding: '8px 18px', backgroundColor: 'var(--error-light)',
                                color: 'var(--error)', border: 'none', borderRadius: '8px',
                                fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                            }}>🗑️ Delete</button>
                        </div>
                    )}
                </div>

                {/* Meta Info */}
                <div style={sectionStyle}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                        <div>
                            <span style={labelStyle}>Type</span>
                            <span style={{
                                padding: '4px 12px', borderRadius: '20px',
                                backgroundColor: 'var(--accent-light)', color: 'var(--accent-text)',
                                fontSize: '13px', fontWeight: '700'
                            }}>
                                {getQuestionTypeLabel(question.type)}
                            </span>
                        </div>
                        <div>
                            <span style={labelStyle}>Starred</span>
                            <span style={{ fontSize: '18px' }}>{question.is_starred ? '⭐' : '☆'}</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)', gap: '10px', marginBottom: '16px' }}>
                        {[
                            { label: '✅ Correct', value: question.correct_count, color: 'var(--success)' },
                            { label: '❌ Wrong', value: question.wrong_count, color: 'var(--error)' },
                            { label: '⏭️ Unattempted', value: question.unattempted_count, color: 'var(--warning)' },
                            { label: '⚡ Min Time', value: formatTime(question.min_time), color: 'var(--accent)' },
                            { label: '🕐 Max Time', value: formatTime(question.max_time), color: 'var(--accent)' }
                        ].map(stat => (
                            <div key={stat.label} style={{ backgroundColor: 'var(--bg-hover)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{stat.label}</p>
                                <p style={{ fontSize: '18px', fontWeight: '800', color: stat.color }}>{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Tags */}
                    <div>
                        <span style={labelStyle}>Tags</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {question.tags?.map(tag => (
                                <span key={tag.id} style={{
                                    padding: '3px 10px', borderRadius: '12px',
                                    backgroundColor: 'var(--accent-light)', color: 'var(--accent-text)',
                                    fontSize: '12px', fontWeight: '600'
                                }}>{tag.name}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* VIEW MODE */}
                {!editing && (
                    <>
                        <div style={sectionStyle}>
                            <span style={labelStyle}>Question</span>
                            {question.question_text && (
                                <p style={{ fontSize: '16px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                                    {question.question_text}
                                </p>
                            )}
                            {question.question_image_url && (
                                <img src={question.question_image_url} alt="Question"
                                    style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '8px' }} />
                            )}
                        </div>

                        {(question.type === 'mcq_single' || question.type === 'mcq_multiple') && (
                            <div style={sectionStyle}>
                                <span style={labelStyle}>Options</span>
                                {question.options?.map((opt, idx) => (
                                    <div key={opt.id} style={{
                                        padding: '12px 16px', borderRadius: '8px',
                                        border: '1px solid var(--border)', marginBottom: '8px',
                                        backgroundColor: 'var(--bg-hover)'
                                    }}>
                                        <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                            {String.fromCharCode(65 + idx)}. {opt.option_text || '(Image option)'}
                                        </span>
                                        {opt.option_image_url && (
                                            <img src={opt.option_image_url} alt={`Option ${idx + 1}`}
                                                style={{ maxWidth: '100%', borderRadius: '6px', marginTop: '6px', display: 'block' }} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* View Answer */}
                        <div style={sectionStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={labelStyle}>Answer</span>
                                <button onClick={() => setShowAnswer(!showAnswer)} style={{
                                    padding: '6px 16px',
                                    backgroundColor: showAnswer ? 'var(--accent-light)' : 'var(--accent)',
                                    color: showAnswer ? 'var(--accent-text)' : '#fff',
                                    border: 'none', borderRadius: '6px',
                                    fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                                }}>
                                    {showAnswer ? 'Hide Answer' : 'View Answer'}
                                </button>
                            </div>
                            {showAnswer && (
                                <div style={{ marginTop: '12px', padding: '14px', backgroundColor: 'var(--success-light)', borderRadius: '8px', border: '1px solid var(--success)' }}>
                                    {question.type === 'fill_blank' && (
                                        <p style={{ fontSize: '15px', color: 'var(--success)', fontWeight: '700' }}>
                                            ✅ {question.fillAnswer?.correct_answer}
                                        </p>
                                    )}
                                    {(question.type === 'mcq_single' || question.type === 'mcq_multiple') &&
                                        question.options?.filter(o => o.is_correct).map(opt => (
                                            <p key={opt.id} style={{ fontSize: '15px', color: 'var(--success)', fontWeight: '700' }}>
                                                ✅ {opt.option_text || '(Image option)'}
                                                {opt.option_image_url && (
                                                    <img src={opt.option_image_url} alt="Correct"
                                                        style={{ maxWidth: '100%', borderRadius: '6px', marginTop: '6px', display: 'block' }} />
                                                )}
                                            </p>
                                        ))
                                    }
                                </div>
                            )}
                        </div>

                        {/* View Solution */}
                        {(question.solution_text || question.solution_image_url) && (
                            <div style={sectionStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={labelStyle}>Solution</span>
                                    <button onClick={() => setShowSolution(!showSolution)} style={{
                                        padding: '6px 16px',
                                        backgroundColor: showSolution ? 'var(--accent-light)' : 'var(--accent)',
                                        color: showSolution ? 'var(--accent-text)' : '#fff',
                                        border: 'none', borderRadius: '6px',
                                        fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                                    }}>
                                        {showSolution ? 'Hide Solution' : 'View Solution'}
                                    </button>
                                </div>
                                {showSolution && (
                                    <div style={{ marginTop: '12px' }}>
                                        {question.solution_text && (
                                            <p style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                                                {question.solution_text}
                                            </p>
                                        )}
                                        {question.solution_image_url && (
                                            <img src={question.solution_image_url} alt="Solution"
                                                style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '8px' }} />
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* EDIT MODE */}
                {editing && editForm && (
                    <>
                        {saveError && (
                            <div style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>
                                {saveError}
                            </div>
                        )}

                        <div style={sectionStyle}>
                            <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '10px' }}>Question *</label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                                <button style={tabStyle(editForm.questionInputType === 'text')} onClick={() => setEditForm({ ...editForm, questionInputType: 'text' })}>✏️ Write</button>
                                <button style={tabStyle(editForm.questionInputType === 'image')} onClick={() => setEditForm({ ...editForm, questionInputType: 'image' })}>📷 Image</button>
                            </div>
                            {editForm.questionInputType === 'text' ? (
                                <textarea value={editForm.questionText}
                                    onChange={e => setEditForm({ ...editForm, questionText: e.target.value })}
                                    rows={4} style={{
                                        width: '100%', padding: '12px 14px', borderRadius: '8px',
                                        border: '1px solid var(--input-border)', fontSize: '14px',
                                        outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                                        fontFamily: 'inherit', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)'
                                    }} />
                            ) : (
                                <ImageUpload label="Question Image" imageUrl={editForm.questionImageUrl}
                                    onImageChange={url => setEditForm({ ...editForm, questionImageUrl: url })}
                                    onClear={() => setEditForm({ ...editForm, questionImageUrl: null })} />
                            )}
                        </div>

                        {(editForm.type === 'mcq_single' || editForm.type === 'mcq_multiple') && (
                            <div style={sectionStyle}>
                                <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '10px' }}>Options *</label>
                                <OptionsList options={editForm.options}
                                    onChange={opts => setEditForm({ ...editForm, options: opts })}
                                    allowMultiple={editForm.type === 'mcq_multiple'} />
                            </div>
                        )}

                        {editForm.type === 'fill_blank' && (
                            <div style={sectionStyle}>
                                <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '10px' }}>Correct Answer *</label>
                                <input type="text" value={editForm.fillAnswer}
                                    onChange={e => setEditForm({ ...editForm, fillAnswer: e.target.value })}
                                    style={inputStyle} />
                            </div>
                        )}

                        <div style={sectionStyle}>
                            <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '10px' }}>Solution (Optional)</label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                                <button style={tabStyle(editForm.solutionInputType === 'text')} onClick={() => setEditForm({ ...editForm, solutionInputType: 'text' })}>✏️ Write</button>
                                <button style={tabStyle(editForm.solutionInputType === 'image')} onClick={() => setEditForm({ ...editForm, solutionInputType: 'image' })}>📷 Image</button>
                            </div>
                            {editForm.solutionInputType === 'text' ? (
                                <textarea value={editForm.solutionText}
                                    onChange={e => setEditForm({ ...editForm, solutionText: e.target.value })}
                                    rows={3} style={{
                                        width: '100%', padding: '12px 14px', borderRadius: '8px',
                                        border: '1px solid var(--input-border)', fontSize: '14px',
                                        outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                                        fontFamily: 'inherit', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)'
                                    }} />
                            ) : (
                                <ImageUpload label="Solution Image" imageUrl={editForm.solutionImageUrl}
                                    onImageChange={url => setEditForm({ ...editForm, solutionImageUrl: url })}
                                    onClear={() => setEditForm({ ...editForm, solutionImageUrl: null })} />
                            )}
                        </div>

                        <div style={sectionStyle}>
                            <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '10px' }}>Tags *</label>
                            <TagInput selectedTags={editForm.tags} onChange={tags => setEditForm({ ...editForm, tags })} />
                        </div>

                        <div style={sectionStyle}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={editForm.isStarred}
                                    onChange={e => setEditForm({ ...editForm, isStarred: e.target.checked })}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                                <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>⭐ Star this question</span>
                            </label>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={handleSave} disabled={saving} style={{
                                flex: 1, padding: '14px',
                                backgroundColor: saving ? 'var(--text-muted)' : 'var(--accent)',
                                color: '#fff', border: 'none', borderRadius: '10px',
                                fontSize: '15px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer'
                            }}>
                                {saving ? 'Saving...' : '💾 Save Changes'}
                            </button>
                            <button onClick={() => { setEditing(false); setSaveError(''); }} style={{
                                padding: '14px 24px', backgroundColor: 'var(--bg-card)',
                                color: 'var(--text-primary)', border: '1px solid var(--border)',
                                borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer'
                            }}>
                                Cancel
                            </button>
                        </div>
                    </>
                )}
            </div>

            <ConfirmModal
                isOpen={showDeleteModal}
                title="Delete Question"
                message="Are you sure you want to delete this question? This action cannot be undone."
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteModal(false)}
                confirmText="Yes, Delete"
                cancelText="Cancel"
            />
        </div>
    );
};

export default QuestionDetailPage;