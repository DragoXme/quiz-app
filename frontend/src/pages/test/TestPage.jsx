import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../api/axios';
import ConfirmModal from '../../components/ConfirmModal';
import { formatTimerDisplay } from '../../utils/helpers';

const TestPage = () => {
    const { contestId } = useParams();
    const navigate = useNavigate();

    const [contest, setContest] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [error, setError] = useState('');

    // Timers
    const [totalTimeLeft, setTotalTimeLeft] = useState(0);
    const [questionTimes, setQuestionTimes] = useState({});
    const questionStartTime = useRef(null);
    const totalTimerRef = useRef(null);
    const questionTimerRef = useRef(null);

    useEffect(() => {
        fetchTest();
        return () => {
            clearInterval(totalTimerRef.current);
            clearInterval(questionTimerRef.current);
        };
    }, []);

    const fetchTest = async () => {
        try {
            const res = await API.get(`/tests/${contestId}/questions`);
            setContest(res.data.contest);
            setQuestions(res.data.questions);
            setTotalTimeLeft(res.data.contest.total_time * 60);

            // Initialize answers
            const initialAnswers = {};
            const initialTimes = {};
            res.data.questions.forEach(q => {
                initialAnswers[q.contestQuestionId] = q.chosenAnswer || null;
                initialTimes[q.contestQuestionId] = q.timeSpent || 0;
            });
            setAnswers(initialAnswers);
            setQuestionTimes(initialTimes);
            setLoading(false);

            // Start timers
            questionStartTime.current = Date.now();
            startTotalTimer(res.data.contest.total_time * 60);
            startQuestionTimer(res.data.questions[0]?.contestQuestionId);
        } catch (err) {
            setError('Failed to load test.');
            setLoading(false);
        }
    };

    const startTotalTimer = (seconds) => {
        let timeLeft = seconds;
        totalTimerRef.current = setInterval(() => {
            timeLeft -= 1;
            setTotalTimeLeft(timeLeft);
            if (timeLeft <= 0) {
                clearInterval(totalTimerRef.current);
                handleSubmit(true);
            }
        }, 1000);
    };

    const startQuestionTimer = (contestQuestionId) => {
        questionStartTime.current = Date.now();
    };

    const saveCurrentQuestionTime = useCallback((contestQuestionId) => {
        if (!contestQuestionId || !questionStartTime.current) return 0;
        const elapsed = Math.floor((Date.now() - questionStartTime.current) / 1000);
        setQuestionTimes(prev => ({
            ...prev,
            [contestQuestionId]: (prev[contestQuestionId] || 0) + elapsed
        }));
        return elapsed;
    }, []);

    const handleQuestionSwitch = (newIndex) => {
        const currentQ = questions[currentIndex];
        if (currentQ) {
            saveCurrentQuestionTime(currentQ.contestQuestionId);
        }
        setCurrentIndex(newIndex);
        questionStartTime.current = Date.now();
    };

    const handleAnswerChange = (contestQuestionId, value) => {
        setAnswers(prev => ({ ...prev, [contestQuestionId]: value }));
    };

    const handleMultipleAnswerChange = (contestQuestionId, optionId) => {
        setAnswers(prev => {
            const current = prev[contestQuestionId]
                ? JSON.parse(prev[contestQuestionId])
                : [];
            const updated = current.includes(optionId)
                ? current.filter(id => id !== optionId)
                : [...current, optionId];
            return { ...prev, [contestQuestionId]: JSON.stringify(updated) };
        });
    };

    const handleSubmit = async (autoSubmit = false) => {
        clearInterval(totalTimerRef.current);
        clearInterval(questionTimerRef.current);

        const currentQ = questions[currentIndex];
        let finalTimes = { ...questionTimes };
        if (currentQ) {
            const elapsed = Math.floor((Date.now() - questionStartTime.current) / 1000);
            finalTimes[currentQ.contestQuestionId] =
                (finalTimes[currentQ.contestQuestionId] || 0) + elapsed;
        }

        setSubmitting(true);
        try {
            // Save all answers
            for (const q of questions) {
                await API.post('/tests/submit-answer', {
                    contestQuestionId: q.contestQuestionId,
                    chosenAnswer: answers[q.contestQuestionId] || null,
                    timeSpent: finalTimes[q.contestQuestionId] || 0
                });
            }

            // Submit contest
            await API.post(`/tests/${contestId}/submit`);
            navigate(`/test/${contestId}/result`);
        } catch (err) {
            setError('Failed to submit test.');
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div style={{
            display: 'flex', justifyContent: 'center',
            alignItems: 'center', height: '100vh',
            fontSize: '18px', color: '#4F46E5'
        }}>
            Loading test...
        </div>
    );

    if (error) return (
        <div style={{
            display: 'flex', justifyContent: 'center',
            alignItems: 'center', height: '100vh',
            fontSize: '18px', color: '#EF4444'
        }}>
            {error}
        </div>
    );

    const currentQ = questions[currentIndex];
    const isMultiple = currentQ?.type === 'mcq_multiple';
    const selectedAnswer = answers[currentQ?.contestQuestionId];
    const selectedMultiple = isMultiple && selectedAnswer
        ? JSON.parse(selectedAnswer)
        : [];

    const answeredCount = questions.filter(q =>
        answers[q.contestQuestionId] !== null &&
        answers[q.contestQuestionId] !== undefined &&
        answers[q.contestQuestionId] !== ''
    ).length;

    const timerColor = totalTimeLeft < 60 ? '#EF4444' : totalTimeLeft < 300 ? '#F59E0B' : '#10B981';

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            {/* Top Bar */}
            <div style={{
                backgroundColor: '#fff',
                borderBottom: '1px solid #e5e7eb',
                padding: '0 24px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#111' }}>
                    📝 Test in Progress
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                        fontSize: '13px', color: '#888'
                    }}>
                        {answeredCount}/{questions.length} answered
                    </div>
                    <div style={{
                        fontSize: '20px', fontWeight: '800',
                        color: timerColor,
                        backgroundColor: `${timerColor}15`,
                        padding: '6px 14px',
                        borderRadius: '8px'
                    }}>
                        ⏱ {formatTimerDisplay(totalTimeLeft)}
                    </div>
                    <button
                        onClick={() => setShowSubmitModal(true)}
                        disabled={submitting}
                        style={{
                            padding: '8px 18px',
                            backgroundColor: '#4F46E5', color: '#fff',
                            border: 'none', borderRadius: '8px',
                            fontSize: '13px', fontWeight: '700',
                            cursor: submitting ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {submitting ? 'Submitting...' : 'Submit Test'}
                    </button>
                </div>
            </div>

            <div style={{
                maxWidth: '1000px', margin: '0 auto',
                padding: '24px', display: 'flex',
                gap: '24px', alignItems: 'flex-start'
            }}>
                {/* Question Panel */}
                <div style={{ flex: 1 }}>
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        padding: '28px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}>
                        {/* Question Header */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', marginBottom: '20px'
                        }}>
                            <span style={{
                                fontSize: '14px', fontWeight: '700', color: '#888'
                            }}>
                                Question {currentIndex + 1} of {questions.length}
                            </span>
                            <span style={{
                                padding: '4px 12px', borderRadius: '20px',
                                backgroundColor: '#EEF2FF', color: '#4F46E5',
                                fontSize: '12px', fontWeight: '700'
                            }}>
                                {currentQ?.type === 'mcq_single' ? 'Single Correct' :
                                    currentQ?.type === 'mcq_multiple' ? 'Multiple Correct' : 'Fill in Blank'}
                            </span>
                        </div>

                        {/* Question Content */}
                        {currentQ?.questionText && (
                            <p style={{
                                fontSize: '16px', color: '#111',
                                lineHeight: '1.7', marginBottom: '24px',
                                fontWeight: '500'
                            }}>
                                {currentQ.questionText}
                            </p>
                        )}
                        {currentQ?.questionImageUrl && (
                            <img
                                src={currentQ.questionImageUrl}
                                alt="Question"
                                style={{
                                    maxWidth: '100%', borderRadius: '8px',
                                    marginBottom: '24px', display: 'block'
                                }}
                            />
                        )}

                        {/* MCQ Single */}
                        {currentQ?.type === 'mcq_single' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {currentQ.options?.map((opt, idx) => (
                                    <div
                                        key={opt.id}
                                        onClick={() => handleAnswerChange(currentQ.contestQuestionId, opt.id)}
                                        style={{
                                            padding: '14px 18px',
                                            borderRadius: '10px',
                                            border: `2px solid ${selectedAnswer === opt.id ? '#4F46E5' : '#e5e7eb'}`,
                                            backgroundColor: selectedAnswer === opt.id ? '#EEF2FF' : '#fafafa',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}
                                    >
                                        <div style={{
                                            width: '24px', height: '24px',
                                            borderRadius: '50%',
                                            border: `2px solid ${selectedAnswer === opt.id ? '#4F46E5' : '#ddd'}`,
                                            backgroundColor: selectedAnswer === opt.id ? '#4F46E5' : '#fff',
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', flexShrink: 0
                                        }}>
                                            {selectedAnswer === opt.id && (
                                                <div style={{
                                                    width: '10px', height: '10px',
                                                    borderRadius: '50%', backgroundColor: '#fff'
                                                }} />
                                            )}
                                        </div>
                                        <span style={{ fontSize: '14px', color: '#111', fontWeight: selectedAnswer === opt.id ? '600' : '400' }}>
                                            {String.fromCharCode(65 + idx)}. {opt.option_text || '(Image)'}
                                        </span>
                                        {opt.option_image_url && (
                                            <img src={opt.option_image_url} alt="" style={{ maxHeight: '60px', borderRadius: '4px' }} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* MCQ Multiple */}
                        {currentQ?.type === 'mcq_multiple' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <p style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>
                                    Select all correct answers
                                </p>
                                {currentQ.options?.map((opt, idx) => (
                                    <div
                                        key={opt.id}
                                        onClick={() => handleMultipleAnswerChange(currentQ.contestQuestionId, opt.id)}
                                        style={{
                                            padding: '14px 18px',
                                            borderRadius: '10px',
                                            border: `2px solid ${selectedMultiple.includes(opt.id) ? '#4F46E5' : '#e5e7eb'}`,
                                            backgroundColor: selectedMultiple.includes(opt.id) ? '#EEF2FF' : '#fafafa',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}
                                    >
                                        <div style={{
                                            width: '22px', height: '22px',
                                            borderRadius: '4px',
                                            border: `2px solid ${selectedMultiple.includes(opt.id) ? '#4F46E5' : '#ddd'}`,
                                            backgroundColor: selectedMultiple.includes(opt.id) ? '#4F46E5' : '#fff',
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', flexShrink: 0
                                        }}>
                                            {selectedMultiple.includes(opt.id) && (
                                                <span style={{ color: '#fff', fontSize: '12px', fontWeight: '700' }}>✓</span>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '14px', color: '#111', fontWeight: selectedMultiple.includes(opt.id) ? '600' : '400' }}>
                                            {String.fromCharCode(65 + idx)}. {opt.option_text || '(Image)'}
                                        </span>
                                        {opt.option_image_url && (
                                            <img src={opt.option_image_url} alt="" style={{ maxHeight: '60px', borderRadius: '4px' }} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Fill in Blank */}
                        {currentQ?.type === 'fill_blank' && (
                            <div>
                                <p style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>
                                    Type your answer below:
                                </p>
                                <input
                                    type="text"
                                    value={selectedAnswer || ''}
                                    onChange={e => handleAnswerChange(currentQ.contestQuestionId, e.target.value)}
                                    placeholder="Enter your answer..."
                                    style={{
                                        width: '100%', padding: '12px 14px',
                                        borderRadius: '8px', border: '2px solid #ddd',
                                        fontSize: '15px', outline: 'none',
                                        boxSizing: 'border-box', fontFamily: 'inherit'
                                    }}
                                />
                            </div>
                        )}

                        {/* Navigation */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            marginTop: '28px', gap: '12px'
                        }}>
                            <button
                                onClick={() => handleQuestionSwitch(currentIndex - 1)}
                                disabled={currentIndex === 0}
                                style={{
                                    padding: '10px 24px',
                                    backgroundColor: '#fff', color: '#333',
                                    border: '1px solid #ddd', borderRadius: '8px',
                                    fontSize: '14px', fontWeight: '600',
                                    cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                                    opacity: currentIndex === 0 ? 0.4 : 1
                                }}
                            >
                                ← Previous
                            </button>
                            <button
                                onClick={() => handleQuestionSwitch(currentIndex + 1)}
                                disabled={currentIndex === questions.length - 1}
                                style={{
                                    padding: '10px 24px',
                                    backgroundColor: '#4F46E5', color: '#fff',
                                    border: 'none', borderRadius: '8px',
                                    fontSize: '14px', fontWeight: '600',
                                    cursor: currentIndex === questions.length - 1 ? 'not-allowed' : 'pointer',
                                    opacity: currentIndex === questions.length - 1 ? 0.4 : 1
                                }}
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                </div>

                {/* Question Navigator */}
                <div style={{
                    width: '220px', flexShrink: 0,
                    backgroundColor: '#fff', borderRadius: '12px',
                    padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    position: 'sticky', top: '80px'
                }}>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#333', marginBottom: '14px' }}>
                        Question Navigator
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {questions.map((q, idx) => {
                            const isAnswered = answers[q.contestQuestionId] !== null &&
                                answers[q.contestQuestionId] !== undefined &&
                                answers[q.contestQuestionId] !== '';
                            const isCurrent = idx === currentIndex;
                            return (
                                <button
                                    key={q.contestQuestionId}
                                    onClick={() => handleQuestionSwitch(idx)}
                                    style={{
                                        width: '36px', height: '36px',
                                        borderRadius: '8px', border: 'none',
                                        backgroundColor: isCurrent ? '#4F46E5' :
                                            isAnswered ? '#10B981' : '#f0f0f0',
                                        color: isCurrent || isAnswered ? '#fff' : '#555',
                                        fontSize: '13px', fontWeight: '700',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: '#4F46E5' }} />
                            <span style={{ fontSize: '11px', color: '#888' }}>Current</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: '#10B981' }} />
                            <span style={{ fontSize: '11px', color: '#888' }}>Answered</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: '#f0f0f0' }} />
                            <span style={{ fontSize: '11px', color: '#888' }}>Not answered</span>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={showSubmitModal}
                title="Submit Test"
                message={`You have answered ${answeredCount} out of ${questions.length} questions. Are you sure you want to submit?`}
                onConfirm={() => handleSubmit(false)}
                onCancel={() => setShowSubmitModal(false)}
                confirmText="Yes, Submit"
                cancelText="Continue Test"
                confirmColor="#4F46E5"
            />
        </div>
    );
};

export default TestPage;