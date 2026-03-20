import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Navbar from '../../components/Navbar';
import TagInput from '../../components/TagInput';
import ImageUpload from '../../components/ImageUpload';
import OptionsList from '../../components/OptionsList';
import ConfirmModal from '../../components/ConfirmModal';

const defaultOptions = () => [
    { optionText: '', optionImageUrl: null, isCorrect: false },
    { optionText: '', optionImageUrl: null, isCorrect: false },
    { optionText: '', optionImageUrl: null, isCorrect: false },
    { optionText: '', optionImageUrl: null, isCorrect: false }
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

    const handleClear = () => {
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
        setSuccess('');
        setShowClearModal(false);
    };

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        if (!questionType) {
            setError('Please select a question type.');
            return;
        }

        if (!questionText && !questionImageUrl) {
            setError('Please enter question text or upload an image.');
            return;
        }

        if (tags.length === 0) {
            setError('Please add at least one tag.');
            return;
        }

        if (questionType === 'mcq_single') {
            const correct = options.filter(o => o.isCorrect);
            if (correct.length !== 1) {
                setError('Please select exactly 1 correct answer or change the question type.');
                return;
            }
        }

        if (questionType === 'mcq_multiple') {
            const correct = options.filter(o => o.isCorrect);
            if (correct.length < 1) {
                setError('Please select at least 1 correct answer.');
                return;
            }
        }

        if (questionType === 'fill_blank' && !fillAnswer.trim()) {
            setError('Please enter the correct answer.');
            return;
        }

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
            setSuccess('Question created successfully!');
            setTimeout(() => navigate('/questions'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create question.');
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

    const labelStyle = {
        fontSize: '14px',
        fontWeight: '700',
        color: '#333',
        display: 'block',
        marginBottom: '10px'
    };

    const tabStyle = (active) => ({
        padding: '8px 20px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: active ? '#4F46E5' : '#f0f0f0',
        color: active ? '#fff' : '#666',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer'
    });

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Navbar />
            <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 24px' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                    <button
                        onClick={() => navigate('/home')}
                        style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}
                    >
                        ←
                    </button>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111' }}>
                        Create Question
                    </h1>
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

                {success && (
                    <div style={{
                        backgroundColor: '#F0FDF4', color: '#10B981',
                        padding: '12px 16px', borderRadius: '8px',
                        fontSize: '14px', marginBottom: '16px', border: '1px solid #A7F3D0'
                    }}>
                        {success}
                    </div>
                )}

                {/* Question Type */}
                <div style={sectionStyle}>
                    <label style={labelStyle}>Question Type *</label>
                    <select
                        value={questionType}
                        onChange={e => {
                            setQuestionType(e.target.value);
                            setOptions(defaultOptions());
                            setError('');
                        }}
                        style={{
                            width: '100%', padding: '11px 14px',
                            borderRadius: '8px', border: '1px solid #ddd',
                            fontSize: '14px', outline: 'none',
                            backgroundColor: '#fff', cursor: 'pointer'
                        }}
                    >
                        <option value="">-- Select Question Type --</option>
                        <option value="mcq_single">MCQ - Single Correct Answer</option>
                        <option value="mcq_multiple">MCQ - Multiple Correct Answers</option>
                        <option value="fill_blank">Fill in the Blank</option>
                    </select>
                </div>

                {questionType && (
                    <>
                        {/* Question Input */}
                        <div style={sectionStyle}>
                            <label style={labelStyle}>Question *</label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                <button style={tabStyle(questionInputType === 'text')} onClick={() => setQuestionInputType('text')}>
                                    ✏️ Write
                                </button>
                                <button style={tabStyle(questionInputType === 'image')} onClick={() => setQuestionInputType('image')}>
                                    📷 Upload Image
                                </button>
                            </div>
                            {questionInputType === 'text' ? (
                                <textarea
                                    value={questionText}
                                    onChange={e => setQuestionText(e.target.value)}
                                    placeholder="Enter your question here..."
                                    rows={4}
                                    style={{
                                        width: '100%', padding: '12px 14px',
                                        borderRadius: '8px', border: '1px solid #ddd',
                                        fontSize: '14px', outline: 'none',
                                        resize: 'vertical', boxSizing: 'border-box',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            ) : (
                                <ImageUpload
                                    label="Question Image"
                                    imageUrl={questionImageUrl}
                                    onImageChange={setQuestionImageUrl}
                                    onClear={() => setQuestionImageUrl(null)}
                                />
                            )}
                        </div>

                        {/* Options for MCQ */}
                        {(questionType === 'mcq_single' || questionType === 'mcq_multiple') && (
                            <div style={sectionStyle}>
                                <label style={labelStyle}>Options *</label>
                                <OptionsList
                                    options={options}
                                    onChange={setOptions}
                                    allowMultiple={questionType === 'mcq_multiple'}
                                />
                            </div>
                        )}

                        {/* Fill in blank answer */}
                        {questionType === 'fill_blank' && (
                            <div style={sectionStyle}>
                                <label style={labelStyle}>Correct Answer *</label>
                                <input
                                    type="text"
                                    value={fillAnswer}
                                    onChange={e => setFillAnswer(e.target.value)}
                                    placeholder="Enter the correct answer"
                                    style={{
                                        width: '100%', padding: '11px 14px',
                                        borderRadius: '8px', border: '1px solid #ddd',
                                        fontSize: '14px', outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        )}

                        {/* Solution */}
                        <div style={sectionStyle}>
                            <label style={labelStyle}>Solution (Optional)</label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                <button style={tabStyle(solutionInputType === 'text')} onClick={() => setSolutionInputType('text')}>
                                    ✏️ Write
                                </button>
                                <button style={tabStyle(solutionInputType === 'image')} onClick={() => setSolutionInputType('image')}>
                                    📷 Upload Image
                                </button>
                            </div>
                            {solutionInputType === 'text' ? (
                                <textarea
                                    value={solutionText}
                                    onChange={e => setSolutionText(e.target.value)}
                                    placeholder="Enter solution explanation (optional)..."
                                    rows={3}
                                    style={{
                                        width: '100%', padding: '12px 14px',
                                        borderRadius: '8px', border: '1px solid #ddd',
                                        fontSize: '14px', outline: 'none',
                                        resize: 'vertical', boxSizing: 'border-box',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            ) : (
                                <ImageUpload
                                    label="Solution Image"
                                    imageUrl={solutionImageUrl}
                                    onImageChange={setSolutionImageUrl}
                                    onClear={() => setSolutionImageUrl(null)}
                                />
                            )}
                        </div>

                        {/* Tags */}
                        <div style={sectionStyle}>
                            <label style={labelStyle}>Tags * (at least 1 required)</label>
                            <TagInput selectedTags={tags} onChange={setTags} />
                        </div>

                        {/* Starred */}
                        <div style={sectionStyle}>
                            <label style={{
                                display: 'flex', alignItems: 'center',
                                gap: '12px', cursor: 'pointer'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={isStarred}
                                    onChange={e => setIsStarred(e.target.checked)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '15px', fontWeight: '600', color: '#333' }}>
                                    ⭐ Star this question
                                </span>
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                style={{
                                    flex: 1, padding: '14px',
                                    backgroundColor: loading ? '#a5b4fc' : '#4F46E5',
                                    color: '#fff', border: 'none',
                                    borderRadius: '10px', fontSize: '15px',
                                    fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? 'Saving...' : '💾 Save Question'}
                            </button>
                            <button
                                onClick={() => setShowClearModal(true)}
                                style={{
                                    padding: '14px 24px',
                                    backgroundColor: '#fff',
                                    color: '#EF4444',
                                    border: '1px solid #FECACA',
                                    borderRadius: '10px',
                                    fontSize: '15px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                }}
                            >
                                🗑️ Clear
                            </button>
                        </div>
                    </>
                )}
            </div>

            <ConfirmModal
                isOpen={showClearModal}
                title="Clear All"
                message="Confirm if you want to clear all the entered data? This cannot be undone."
                onConfirm={handleClear}
                onCancel={() => setShowClearModal(false)}
                confirmText="Yes, Clear"
                cancelText="Cancel"
            />
        </div>
    );
};

export default CreateQuestionPage;