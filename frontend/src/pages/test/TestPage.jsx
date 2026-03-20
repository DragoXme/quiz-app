import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../api/axios';
import ConfirmModal from '../../components/ConfirmModal';
import { formatTimerDisplay } from '../../utils/helpers';
import useWindowSize from '../../hooks/useWindowSize';

const TestPage = () => {
    const { contestId } = useParams();
    const navigate = useNavigate();
    const { isMobile } = useWindowSize();
    const [contest, setContest] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showNavigator, setShowNavigator] = useState(false);
    const [error, setError] = useState('');
    const [totalTimeLeft, setTotalTimeLeft] = useState(0);
    const [questionTimes, setQuestionTimes] = useState({});
    const questionStartTime = useRef(null);
    const totalTimerRef = useRef(null);

    useEffect(() => {
        fetchTest();
        return () => { clearInterval(totalTimerRef.current); };
    }, []);

    const fetchTest = async () => {
        try {
            const res = await API.get(`/tests/${contestId}/questions`);
            setContest(res.data.contest);
            setQuestions(res.data.questions);
            setTotalTimeLeft(res.data.contest.total_time * 60);
            const initialAnswers = {};
            const initialTimes = {};
            res.data.questions.forEach(q => {
                initialAnswers[q.contestQuestionId] = q.chosenAnswer || null;
                initialTimes[q.contestQuestionId] = q.timeSpent || 0;
            });
            setAnswers(initialAnswers);
            setQuestionTimes(initialTimes);
            setLoading(false);
            questionStartTime.current = Date.now();
            startTotalTimer(res.data.contest.total_time * 60);
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

    const saveCurrentQuestionTime = useCallback((contestQuestionId) => {
        if (!contestQuestionId || !questionStartTime.current) return 0;
        const elapsed = Math.floor((Date.now() - questionStartTime.current) / 1000);
        setQuestionTimes(prev => ({ ...prev, [contestQuestionId]: (prev[contestQuestionId] || 0) + elapsed }));
        return elapsed;
    }, []);

    const handleQuestionSwitch = (newIndex) => {
        const currentQ = questions[currentIndex];
        if (currentQ) saveCurrentQuestionTime(currentQ.contestQuestionId);
        setCurrentIndex(newIndex);
        setShowNavigator(false);
        questionStartTime.current = Date.now();
    };

    const handleAnswerChange = (contestQuestionId, value) => {
        setAnswers(prev => ({ ...prev, [contestQuestionId]: value }));
    };

    const handleMultipleAnswerChange = (contestQuestionId, optionId) => {
        setAnswers(prev => {
            const current = prev[contestQuestionId] ? JSON.parse(prev[contestQuestionId]) : [];
            const updated = current.includes(optionId)
                ? current.filter(id => id !== optionId)
                : [...current, optionId];
            return { ...prev, [contestQuestionId]: JSON.stringify(updated) };
        });
    };

    const handleSubmit = async (autoSubmit = false) => {
        clearInterval(totalTimerRef.current);
        const currentQ = questions[currentIndex];
        let finalTimes = { ...questionTimes };
        if (currentQ) {
            const elapsed = Math.floor((Date.now() - questionStartTime.current) / 1000);
            finalTimes[currentQ.contestQuestionId] = (finalTimes[currentQ.contestQuestionId] || 0) + elapsed;
        }
        setSubmitting(true);
        try {
            for (const q of questions) {
                await API.post('/tests/submit-answer', {
                    contestQuestionId: q.contestQuestionId,
                    chosenAnswer: answers[q.contestQuestionId] || null,
                    timeSpent: finalTimes[q.contestQuestionId] || 0
                });
            }
            await API.post(`/tests/${contestId}/submit`);
            navigate(`/test/${contestId}/result`);
        } catch (err) {
            setError('Failed to submit test.');
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: 'var(--accent)', backgroundColor: 'var(--bg-main)' }}>
            Loading test...
        </div>
    );

    if (error) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: 'var(--error)', backgroundColor: 'var(--bg-main)' }}>
            {error}
        </div>
    );

    const currentQ = questions[currentIndex];
    const isMultiple = currentQ?.type === 'mcq_multiple';
    const selectedAnswer = answers[currentQ?.contestQuestionId];
    const selectedMultiple = isMultiple && selectedAnswer ? JSON.parse(selectedAnswer) : [];
    const answeredCount = questions.filter(q =>
        answers[q.contestQuestionId] !== null &&
        answers[q.contestQuestionId] !== undefined &&
        answers[q.contestQuestionId] !== ''
    ).length;
    const timerColor = totalTimeLeft < 60 ? 'var(--error)' : totalTimeLeft < 300 ? 'var(--warning)' : 'var(--success)';

    const optionStyle = (isSelected) => ({
        padding: isMobile ? '12px 14px' : '14px 18px',
        borderRadius: '10px',
        border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
        backgroundColor: isSelected ? 'var(--accent-light)' : 'var(--bg-hover)',
        cursor: 'pointer', transition: 'all 0.15s',
        display: 'flex', alignItems: 'center', gap: '12px',
        marginBottom: '8px'
    });

    const NavigatorPanel = () => (
        <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: `0 2px 8px var(--shadow)`,
            border: '1px solid var(--border)'
        }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '14px' }}>
                Question Navigator
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {questions.map((q, idx) => {
                    const isAnswered = answers[q.contestQuestionId] !== null &&
                        answers[q.contestQuestionId] !== undefined &&
                        answers[q.contestQuestionId] !== '';
                    const isCurrent = idx === currentIndex;
                    return (
                        <button key={q.contestQuestionId} onClick={() => handleQuestionSwitch(idx)} style={{
                            width: '36px', height: '36px', borderRadius: '8px', border: 'none',
                            backgroundColor: isCurrent ? 'var(--accent)' : isAnswered ? 'var(--success)' : 'var(--bg-hover)',
                            color: isCurrent || isAnswered ? '#fff' : 'var(--text-secondary)',
                            fontSize: '13px', fontWeight: '700', cursor: 'pointer'
                        }}>
                            {idx + 1}
                        </button>
                    );
                })}
            </div>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                    { color: 'var(--accent)', label: 'Current' },
                    { color: 'var(--success)', label: 'Answered' },
                    { color: 'var(--bg-hover)', label: 'Not answered' }
                ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: item.color, border: '1px solid var(--border)' }} />
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            {/* Top Bar */}
            <div style={{
                backgroundColor: 'var(--navbar-bg)',
                borderBottom: '1px solid var(--border)',
                padding: isMobile ? '0 12px' : '0 24px',
                height: '60px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 100,
                boxShadow: `0 1px 4px var(--shadow)`
            }}>
                <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    📝 {isMobile ? 'Test' : 'Test in Progress'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '20px' }}>
                    {!isMobile && (
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            {answeredCount}/{questions.length} answered
                        </div>
                    )}
                    <div style={{
                        fontSize: isMobile ? '16px' : '20px', fontWeight: '800', color: timerColor,
                        backgroundColor: 'var(--bg-hover)',
                        padding: '6px 10px', borderRadius: '8px'
                    }}>
                        ⏱ {formatTimerDisplay(totalTimeLeft)}
                    </div>
                    {isMobile && (
                        <button onClick={() => setShowNavigator(!showNavigator)} style={{
                            padding: '6px 10px', backgroundColor: 'var(--accent-light)',
                            color: 'var(--accent-text)', border: 'none', borderRadius: '8px',
                            fontSize: '12px', fontWeight: '700', cursor: 'pointer'
                        }}>
                            {answeredCount}/{questions.length}
                        </button>
                    )}
                    <button onClick={() => setShowSubmitModal(true)} disabled={submitting} style={{
                        padding: isMobile ? '6px 10px' : '8px 18px',
                        backgroundColor: 'var(--accent)',
                        color: '#fff', border: 'none', borderRadius: '8px',
                        fontSize: isMobile ? '12px' : '13px', fontWeight: '700',
                        cursor: submitting ? 'not-allowed' : 'pointer'
                    }}>
                        {submitting ? '...' : 'Submit'}
                    </button>
                </div>
            </div>

            {/* Mobile Navigator Dropdown */}
            {isMobile && showNavigator && (
                <div style={{ padding: '12px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
                    <NavigatorPanel />
                </div>
            )}

            <div style={{
                maxWidth: '1000px', margin: '0 auto',
                padding: isMobile ? '16px' : '24px',
                display: 'flex', gap: '24px', alignItems: 'flex-start'
            }}>
                {/* Question Panel */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        backgroundColor: 'var(--bg-card)', borderRadius: '12px',
                        padding: isMobile ? '16px' : '28px',
                        boxShadow: `0 2px 8px var(--shadow)`,
                        border: '1px solid var(--border)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>
                                Q {currentIndex + 1} of {questions.length}
                            </span>
                            <span style={{
                                padding: '4px 10px', borderRadius: '20px',
                                backgroundColor: 'var(--accent-light)', color: 'var(--accent-text)',
                                fontSize: '11px', fontWeight: '700'
                            }}>
                                {currentQ?.type === 'mcq_single' ? 'Single' :
                                    currentQ?.type === 'mcq_multiple' ? 'Multiple' : 'Fill Blank'}
                            </span>
                        </div>

                        {currentQ?.questionText && (
                            <p style={{ fontSize: isMobile ? '15px' : '16px', color: 'var(--text-primary)', lineHeight: '1.7', marginBottom: '20px', fontWeight: '500' }}>
                                {currentQ.questionText}
                            </p>
                        )}
                        {currentQ?.questionImageUrl && (
                            <img src={currentQ.questionImageUrl} alt="Question"
                                style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '20px', display: 'block' }} />
                        )}

                        {/* MCQ Single */}
                        {currentQ?.type === 'mcq_single' && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {currentQ.options?.map((opt, idx) => (
                                    <div key={opt.id} onClick={() => handleAnswerChange(currentQ.contestQuestionId, opt.id)}
                                        style={optionStyle(selectedAnswer === opt.id)}>
                                        <div style={{
                                            width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                                            border: `2px solid ${selectedAnswer === opt.id ? 'var(--accent)' : 'var(--border)'}`,
                                            backgroundColor: selectedAnswer === opt.id ? 'var(--accent)' : 'var(--bg-card)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {selectedAnswer === opt.id && (
                                                <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#fff' }} />
                                            )}
                                        </div>
                                        <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: selectedAnswer === opt.id ? '600' : '400' }}>
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
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Select all correct answers</p>
                                {currentQ.options?.map((opt, idx) => (
                                    <div key={opt.id}
                                        onClick={() => handleMultipleAnswerChange(currentQ.contestQuestionId, opt.id)}
                                        style={optionStyle(selectedMultiple.includes(opt.id))}>
                                        <div style={{
                                            width: '20px', height: '20px', borderRadius: '4px', flexShrink: 0,
                                            border: `2px solid ${selectedMultiple.includes(opt.id) ? 'var(--accent)' : 'var(--border)'}`,
                                            backgroundColor: selectedMultiple.includes(opt.id) ? 'var(--accent)' : 'var(--bg-card)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {selectedMultiple.includes(opt.id) && (
                                                <span style={{ color: '#fff', fontSize: '11px', fontWeight: '700' }}>✓</span>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: selectedMultiple.includes(opt.id) ? '600' : '400' }}>
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
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Type your answer below:</p>
                                <input type="text" value={selectedAnswer || ''}
                                    onChange={e => handleAnswerChange(currentQ.contestQuestionId, e.target.value)}
                                    placeholder="Enter your answer..."
                                    style={{
                                        width: '100%', padding: '12px 14px',
                                        borderRadius: '8px', border: '2px solid var(--border)',
                                        fontSize: '15px', outline: 'none',
                                        boxSizing: 'border-box', fontFamily: 'inherit',
                                        backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)'
                                    }} />
                            </div>
                        )}

                        {/* Navigation */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', gap: '12px' }}>
                            <button onClick={() => handleQuestionSwitch(currentIndex - 1)}
                                disabled={currentIndex === 0} style={{
                                    padding: isMobile ? '10px 16px' : '10px 24px',
                                    backgroundColor: 'var(--bg-card)',
                                    color: 'var(--text-primary)', border: '1px solid var(--border)',
                                    borderRadius: '8px', fontSize: '14px', fontWeight: '600',
                                    cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                                    opacity: currentIndex === 0 ? 0.4 : 1
                                }}>
                                ← Prev
                            </button>
                            <button onClick={() => handleQuestionSwitch(currentIndex + 1)}
                                disabled={currentIndex === questions.length - 1} style={{
                                    padding: isMobile ? '10px 16px' : '10px 24px',
                                    backgroundColor: 'var(--accent)',
                                    color: '#fff', border: 'none', borderRadius: '8px',
                                    fontSize: '14px', fontWeight: '600',
                                    cursor: currentIndex === questions.length - 1 ? 'not-allowed' : 'pointer',
                                    opacity: currentIndex === questions.length - 1 ? 0.4 : 1
                                }}>
                                Next →
                            </button>
                        </div>
                    </div>
                </div>

                {/* Desktop Navigator */}
                {!isMobile && (
                    <div style={{
                        width: '220px', flexShrink: 0,
                        position: 'sticky', top: '80px'
                    }}>
                        <NavigatorPanel />
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={showSubmitModal}
                title="Submit Test"
                message={`You have answered ${answeredCount} out of ${questions.length} questions. Are you sure you want to submit?`}
                onConfirm={() => handleSubmit(false)}
                onCancel={() => setShowSubmitModal(false)}
                confirmText="Yes, Submit"
                cancelText="Continue Test"
                confirmColor="var(--accent)"
            />
        </div>
    );
};

export default TestPage;