import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Navbar from '../../components/Navbar';
import TagInput from '../../components/TagInput';
import ImageUpload from '../../components/ImageUpload';
import OptionsList from '../../components/OptionsList';
import ConfirmModal from '../../components/ConfirmModal';
import CustomSelect from '../../components/CustomSelect';

const defaultOptions = () => [
    { optionText: '', optionImageUrl: null, isCorrect: false },
    { optionText: '', optionImageUrl: null, isCorrect: false },
    { optionText: '', optionImageUrl: null, isCorrect: false },
    { optionText: '', optionImageUrl: null, isCorrect: false }
];

const questionTypeOptions = [
    { value: '', label: '-- Select Question Type --' },
    { value: 'mcq_single', label: 'MCQ - Single Correct Answer' },
    { value: 'mcq_multiple', label: 'MCQ - Multiple Correct Answers' },
    { value: 'fill_blank', label: 'Fill in the Blank' }
];

const CreateQuestionPage = () => {
    const navigate = useNavigate();
    const [questionType, setQuestionType] = useState('');
    const [questionInputType, setQuestionInputType] = useState('text');
    const [questionText, setQuestionText] = useState('');
    const [questionImageUrl, setQuestionImageUrl] = useState(null);
    const [solutionInputType, setSolutionInputType] = useState('text');
    const [solutionText, setSolutionText] = useState('');
    const [solutionImageUrl, setSolutionImageUrl] = useState(null);
    const [options, setOptions] = useState(defaultOptions());
    const [fillAnswer, setFillAnswer] = useState('');
    const [tags, setTags] = useState([]);
    const [isStarred, setIsStarred] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);
    const [savedCount, setSavedCount] = useState(0);

    const resetForm = () => {
        setQuestionType('');
        setQuestionInputType('text');
        setQuestionText('');
        setQuestionImageUrl(null);
        setSolutionInputType('text');
        setSolutionText('');
        setSolutionImageUrl(null);
        setOptions(defaultOptions());
        setFillAnswer('');
        setTags([]);
        setIsStarred(false);
        setError('');
    };

    const handleClear = () => {
        resetForm();
        setSuccess('');
        setSavedCount(0);
        setShowClearModal(false);
    };

    const handleSubmit = async () => {
        setError('');
        setSuccess('');
        if (!questionType) { setError('Please select a question type.'); return; }
        if (!questionText && !questionImageUrl) { setError('Please enter question text or upload an image.'); return; }
        if (tags.length === 0) { setError('Please add at least one tag.'); return; }
        if (questionType === 'mcq_single') {
            const correct = options.filter(o => o.isCorrect);
            if (correct.length !== 1) { setError('Please select exactly 1 correct answer or change the question type.'); return; }
        }
        if (questionType === 'mcq_multiple') {
            const correct = options.filter(o => o.isCorrect);
            if (correct.length < 1) { setError('Please select at least 1 correct answer.'); return; }
        }
        if (questionType === 'fill_blank' && !fillAnswer.trim()) { setError('Please enter the correct answer.'); return; }

        setLoading(true);
        try {
            await API.post('/questions', {
                type: questionType,
                questionText: questionInputType === 'text' ? questionText : null,
                questionImageUrl: questionInputType === 'image' ? questionImageUrl : null,
                solutionText: solutionInputType === 'text' ? solutionText : null,
                solutionImageUrl: solutionInputType === 'image' ? solutionImageUrl : null,
                options: questionType !== 'fill_blank' ? options : [],
                fillAnswer: questionType === 'fill_blank' ? fillAnswer : null,
                tags: tags.map(t => t.name),
                isStarred
            });
            // Increment saved count and reset form — stay on page for next question
            setSavedCount(prev => prev + 1);
            setSuccess('✅ Question saved! Add another one or go back when done.');
            resetForm();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create question.');
        } finally {
            setLoading(false);
        }
    };

    const glassCard = {
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '16px',
        boxShadow: '0 4px 20px var(--shadow)',
        border: '1px solid var(--glass-border)'
    };

    const labelStyle = {
        fontSize: '14px', fontWeight: '700',
        color: 'var(--text-primary)', display: 'block', marginBottom: '10px'
    };

    const tabStyle = (active) => ({
        padding: '8px 18px', borderRadius: '10px', border: 'none',
        background: active ? 'var(--gradient-accent)' : 'var(--bg-hover)',
        color: active ? '#fff' : 'var(--text-secondary)',
        fontSize: '13px', fontWeight: '600', cursor: 'pointer',
        boxShadow: active ? '0 2px 8px var(--shadow)' : 'none'
    });

    const inputStyle = {
        width: '100%', padding: '11px 14px', borderRadius: '10px',
        border: '1.5px solid var(--input-border)', fontSize: '14px',
        outline: 'none', boxSizing: 'border-box',
        background: 'var(--glass-bg)', backdropFilter: 'blur(8px)',
        color: 'var(--text-primary)'
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Navbar />
            <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 24px' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                    <button onClick={() => navigate('/home')} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }}>←</button>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>Create Question</h1>
                        {savedCount > 0 && (
                            <p style={{ fontSize: '13px', color: 'var(--success)', fontWeight: '600', marginTop: '2px' }}>
                                ✅ {savedCount} question{savedCount > 1 ? 's' : ''} saved this session
                            </p>
                        )}
                    </div>
                    {/* Go to Explore button — visible once at least one question saved */}
                    {savedCount > 0 && (
                        <button onClick={() => navigate('/questions')} style={{
                            marginLeft: 'auto', padding: '8px 16px',
                            background: 'var(--gradient-accent)', color: '#fff',
                            border: 'none', borderRadius: '10px',
                            fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                            boxShadow: '0 2px 8px var(--shadow)'
                        }}>
                            View Questions →
                        </button>
                    )}
                </div>

                {error && <div style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', marginBottom: '16px', border: '1px solid var(--error)' }}>{error}</div>}
                {success && <div style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', marginBottom: '16px', border: '1px solid var(--success)' }}>{success}</div>}

                {/* Question Type */}
                <div style={glassCard}>
                    <label style={labelStyle}>Question Type *</label>
                    <CustomSelect
                        value={questionType}
                        onChange={v => { setQuestionType(v); setOptions(defaultOptions()); setError(''); }}
                        options={questionTypeOptions}
                        placeholder="-- Select Question Type --"
                    />
                </div>

                {questionType && (
                    <>
                        {/* Question Input */}
                        <div style={glassCard}>
                            <label style={labelStyle}>Question *</label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                <button style={tabStyle(questionInputType === 'text')} onClick={() => setQuestionInputType('text')}>✏️ Write</button>
                                <button style={tabStyle(questionInputType === 'image')} onClick={() => setQuestionInputType('image')}>📷 Upload Image</button>
                            </div>
                            {questionInputType === 'text' ? (
                                <textarea value={questionText} onChange={e => setQuestionText(e.target.value)}
                                    placeholder="Enter your question here..." rows={4}
                                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
                            ) : (
                                <ImageUpload label="Question Image" imageUrl={questionImageUrl}
                                    onImageChange={setQuestionImageUrl} onClear={() => setQuestionImageUrl(null)} />
                            )}
                        </div>

                        {/* Options for MCQ */}
                        {(questionType === 'mcq_single' || questionType === 'mcq_multiple') && (
                            <div style={glassCard}>
                                <label style={labelStyle}>Options *</label>
                                <OptionsList options={options} onChange={setOptions} allowMultiple={questionType === 'mcq_multiple'} />
                            </div>
                        )}

                        {/* Fill in blank */}
                        {questionType === 'fill_blank' && (
                            <div style={glassCard}>
                                <label style={labelStyle}>Correct Answer *</label>
                                <input type="text" value={fillAnswer} onChange={e => setFillAnswer(e.target.value)}
                                    placeholder="Enter the correct answer" style={inputStyle} />
                            </div>
                        )}

                        {/* Solution */}
                        <div style={glassCard}>
                            <label style={labelStyle}>Solution (Optional)</label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                <button style={tabStyle(solutionInputType === 'text')} onClick={() => setSolutionInputType('text')}>✏️ Write</button>
                                <button style={tabStyle(solutionInputType === 'image')} onClick={() => setSolutionInputType('image')}>📷 Upload Image</button>
                            </div>
                            {solutionInputType === 'text' ? (
                                <textarea value={solutionText} onChange={e => setSolutionText(e.target.value)}
                                    placeholder="Enter solution explanation (optional)..." rows={3}
                                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
                            ) : (
                                <ImageUpload label="Solution Image" imageUrl={solutionImageUrl}
                                    onImageChange={setSolutionImageUrl} onClear={() => setSolutionImageUrl(null)} />
                            )}
                        </div>

                        {/* Tags */}
                        <div style={{ ...glassCard, position: 'relative', zIndex: 10 }}>
                            <label style={labelStyle}>Tags * (at least 1 required)</label>
                            <TagInput selectedTags={tags} onChange={setTags} />
                        </div>

                        {/* Starred */}
                        <div style={glassCard}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={isStarred} onChange={e => setIsStarred(e.target.checked)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent)' }} />
                                <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>⭐ Star this question</span>
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={handleSubmit} disabled={loading} style={{
                                flex: 1, padding: '14px',
                                background: loading ? 'var(--border)' : 'var(--gradient-accent)',
                                color: '#fff', border: 'none', borderRadius: '12px',
                                fontSize: '15px', fontWeight: '700',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: loading ? 'none' : '0 4px 16px var(--shadow-md)'
                            }}>
                                {loading ? 'Saving...' : '💾 Save & Add Another'}
                            </button>
                            <button onClick={() => setShowClearModal(true)} style={{
                                padding: '14px 24px', backgroundColor: 'var(--error-light)',
                                color: 'var(--error)', border: '1px solid var(--error)',
                                borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer'
                            }}>🗑️ Clear</button>
                        </div>
                    </>
                )}
            </div>

            <ConfirmModal isOpen={showClearModal} title="Clear All"
                message="Confirm if you want to clear all the entered data? This cannot be undone."
                onConfirm={handleClear} onCancel={() => setShowClearModal(false)}
                confirmText="Yes, Clear" cancelText="Cancel" />
        </div>
    );
};

export default CreateQuestionPage;
