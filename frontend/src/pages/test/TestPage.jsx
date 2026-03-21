import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../api/axios';
import ConfirmModal from '../../components/ConfirmModal';
import { formatTimerDisplay } from '../../utils/helpers';
import useWindowSize from '../../hooks/useWindowSize';

const IMAGE_SIZES = [
    { key: 'small',    label: 'S',        maxWidth: '80px'  },
    { key: 'medium',   label: 'M',        maxWidth: '160px' },
    { key: 'large',    label: 'L',        maxWidth: '280px' },
    { key: 'original', label: 'Original', maxWidth: '100%'  },
];

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
    const [abandoning, setAbandoning] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showAbandonModal, setShowAbandonModal] = useState(false);
    const [showNavigator, setShowNavigator] = useState(false);
    const [error, setError] = useState('');
    const [totalTimeLeft, setTotalTimeLeft] = useState(0);
    const [questionTimes, setQuestionTimes] = useState({});
    const [leaveHovered, setLeaveHovered] = useState(false);
    const [optionImageSize, setOptionImageSize] = useState('medium');
    const questionStartTime = useRef(null);
    const totalTimerRef = useRef(null);

    useEffect(() => {
        fetchTest();
        return () => { clearInterval(totalTimerRef.current); };
    }, []);

    const removeFromActiveContests = (cId) => {
        const existing = JSON.parse(localStorage.getItem('activeContests') || '[]');
        localStorage.setItem('activeContests', JSON.stringify(existing.filter(c => c.contestId !== cId)));
    };

    const fetchTest = async () => {
        try {
            const res = await API.get(`/tests/${contestId}/questions`);
            setContest(res.data.contest);
            setQuestions(res.data.questions);

            const totalSeconds = res.data.contest.total_time * 60;
            let timeLeft = totalSeconds;
            const activeContests = JSON.parse(localStorage.getItem('activeContests') || '[]');
            const activeContest = activeContests.find(c => c.contestId === contestId);
            if (activeContest) {
                const elapsed = Math.floor((Date.now() - activeContest.startedAt) / 1000);
                timeLeft = Math.max(0, activeContest.totalTime - elapsed);
            }

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

            if (timeLeft <= 0) {
                handleSubmit(true);
            } else {
                startTotalTimer(timeLeft);
            }
        } catch (err) {
            setError('Failed to load test.');
            setLoading(false);
        }
    };

    const startTotalTimer = (seconds) => {
        setTotalTimeLeft(seconds);
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
            const updated = current.includes(optionId) ? current.filter(id => id !== optionId) : [...current, optionId];
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
            removeFromActiveContests(contestId);
            navigate(`/test/${contestId}/result`);
        } catch (err) {
            setError('Failed to submit test.');
            setSubmitting(false);
        }
    };

    const handleAbandon = async () => {
        clearInterval(totalTimerRef.current);
        setAbandoning(true);
        try {
            await API.delete(`/tests/${contestId}/abandon`);
            removeFromActiveContests(contestId);
            navigate('/home');
        } catch (err) {
            setError('Failed to abandon test.');
            setAbandoning(false);
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
        answers[q.contestQuestionId] !== null && answers[q.contestQuestionId] !== undefined && answers[q.contestQuestionId] !== ''
    ).length;
    const timerColor = totalTimeLeft < 60 ? 'var(--error)' : totalTimeLeft < 300 ? 'var(--warning)' : 'var(--success)';
    const currentSize = IMAGE_SIZES.find(s => s.key === optionImageSize) || IMAGE_SIZES[1];
    const currentQHasOptionImages = currentQ?.options?.some(o => o.option_image_url);

    const optionStyle = (isSelected) => ({
        padding: isMobile ? '12px 14px' : '14px 18px',
        borderRadius: '10px',
        border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
        backgroundColor: isSelected ? 'var(--accent-light)' : 'var(--bg-hover)',
        cursor: 'pointer', transition: 'all 0.15s',
        display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px'
    });

    // Renders one option row — text + image (never shows "(Image)" placeholder)
    const OptionContent = ({ opt, idx, isSelected }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            {/* Label row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: isSelected ? '600' : '400' }}>
                    {String.fromCharCode(65 + idx)}.{opt.option_text ? ` ${opt.option_text}` : ''}
                </span>
            </div>
            {/* Actual image — sized, never cropped */}
            {opt.option_image_url && (
                <img
                    src={opt.option_image_url}
                    alt={`Option ${String.fromCharCode(65 + idx)}`}
                    style={{
                        maxWidth: currentSize.maxWidth,
                        width: '100%',
                        height: 'auto',
                        borderRadius: '6px',
                        display: 'block',
                        border: '1px solid var(--border)'
                    }}
                />
            )}
        </div>
    );

    const NavigatorPanel = () => (
        <div style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 20px var(--shadow)', border: '1px solid var(--glass-border)' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '14px' }}>Question Navigator</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {questions.map((q, idx) => {
                    const isAnswered = answers[q.contestQuestionId] !== null && answers[q.contestQuestionId] !== undefined && answers[q.contestQuestionId] !== '';
                    const isCurrent = idx === currentIndex;
                    return (
                        <button key={q.contestQuestionId} onClick={() => handleQuestionSwitch(idx)} style={{
                            width: '36px', height: '36px', borderRadius: '8px', border: 'none',
                            backgroundColor: isCurrent ? 'var(--accent)' : isAnswered ? 'var(--success)' : 'var(--bg-hover)',
                            color: isCurrent || isAnswered ? '#fff' : 'var(--text-secondary)',
                            fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s'
                        }}>{idx + 1}</button>
                    );
                })}
            </div>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[{ color: 'var(--accent)', label: 'Current' }, { color: 'var(--success)', label: 'Answered' }, { color: 'var(--bg-hover)', label: 'Not answered' }].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: item.color, border: '1px solid var(--border)' }} />
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.label}</span>
                    </div>
                ))}
            </div>
            {!isMobile && (
                <button
                    onClick={() => setShowAbandonModal(true)}
                    onMouseEnter={() => setLeaveHovered(true)}
                    onMouseLeave={() => setLeaveHovered(false)}
                    style={{
                        marginTop: '16px', width: '100%', padding: '8px',
                        backgroundColor: leaveHovered ? 'var(--error)' : 'var(--error-light)',
                        color: leaveHovered ? '#fff' : 'var(--error)',
                        border: '1px solid var(--error)', borderRadius: '8px',
                        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                        transition: 'background-color 0.15s, color 0.15s'
                    }}
                >
                    🚪 Leave Test
                </button>
            )}
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            {/* Top Bar */}
            <div style={{
                backgroundColor: 'var(--navbar-bg)', borderBottom: '1px solid var(--navbar-border)',
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                padding: isMobile ? '0 12px' : '0 24px', height: '60px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 12px var(--shadow)'
            }}>
                <span style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    📝 {isMobile ? 'Test' : 'Test in Progress'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '14px' }}>
                    {!isMobile && (
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            {answeredCount}/{questions.length} answered
                        </span>
                    )}
                    <div style={{ fontSize: isMobile ? '15px' : '18px', fontWeight: '800', color: timerColor, background: 'var(--glass-bg)', backdropFilter: 'blur(8px)', padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                        ⏱ {formatTimerDisplay(totalTimeLeft)}
                    </div>
                    {isMobile && (
                        <button onClick={() => setShowNavigator(!showNavigator)} style={{
                            padding: '5px 9px', backgroundColor: 'var(--accent-light)',
                            color: 'var(--accent-text)', border: 'none', borderRadius: '7px',
                            fontSize: '12px', fontWeight: '700', cursor: 'pointer'
                        }}>{answeredCount}/{questions.length}</button>
                    )}
                    {isMobile && (
                        <button onClick={() => setShowAbandonModal(true)} style={{
                            padding: '5px 9px', backgroundColor: 'var(--error-light)',
                            color: 'var(--error)', border: 'none', borderRadius: '7px',
                            fontSize: '12px', fontWeight: '700', cursor: 'pointer'
                        }}>🚪</button>
                    )}
                    <button onClick={() => setShowSubmitModal(true)} disabled={submitting} style={{
                        padding: isMobile ? '6px 10px' : '8px 18px',
                        background: 'var(--gradient-accent)',
                        color: '#fff', border: 'none', borderRadius: '8px',
                        fontSize: isMobile ? '12px' : '13px', fontWeight: '700',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        boxShadow: '0 2px 8px var(--shadow)'
                    }}>{submitting ? '...' : 'Submit'}</button>
                </div>
            </div>

            {isMobile && showNavigator && (
                <div style={{ padding: '12px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
                    <NavigatorPanel />
                </div>
            )}

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: isMobile ? '16px' : '24px', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)', borderRadius: '16px', padding: isMobile ? '16px' : '28px', boxShadow: '0 4px 20px var(--shadow)', border: '1px solid var(--glass-border)' }}>

                        {/* Q header + type badge */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>Q {currentIndex + 1} of {questions.length}</span>
                            <span style={{ padding: '4px 10px', borderRadius: '20px', backgroundColor: 'var(--accent-light)', color: 'var(--accent-text)', fontSize: '11px', fontWeight: '700' }}>
                                {currentQ?.type === 'mcq_single' ? 'Single' : currentQ?.type === 'mcq_multiple' ? 'Multiple' : 'Fill Blank'}
                            </span>
                        </div>

                        {/* Question text / image */}
                        {currentQ?.questionText && (
                            <p style={{ fontSize: isMobile ? '15px' : '16px', color: 'var(--text-primary)', lineHeight: '1.7', marginBottom: '20px', fontWeight: '500' }}>
                                {currentQ.questionText}
                            </p>
                        )}
                        {currentQ?.questionImageUrl && (
                            <img src={currentQ.questionImageUrl} alt="Question" style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '20px', display: 'block' }} />
                        )}

                        {/* Image size picker — shown only when current question has image options */}
                        {currentQHasOptionImages && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Option image size:</span>
                                {IMAGE_SIZES.map(s => (
                                    <button
                                        key={s.key}
                                        onClick={() => setOptionImageSize(s.key)}
                                        style={{
                                            padding: '3px 9px', borderRadius: '6px', border: 'none',
                                            background: optionImageSize === s.key ? 'var(--gradient-accent)' : 'var(--accent-light)',
                                            color: optionImageSize === s.key ? '#fff' : 'var(--accent-text)',
                                            fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                                            transition: 'all 0.15s'
                                        }}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* MCQ Single */}
                        {currentQ?.type === 'mcq_single' && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {currentQ.options?.map((opt, idx) => {
                                    const isSelected = selectedAnswer === opt.id;
                                    return (
                                        <div key={opt.id} onClick={() => handleAnswerChange(currentQ.contestQuestionId, opt.id)} style={optionStyle(isSelected)}>
                                            <div style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, marginTop: '2px', border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`, backgroundColor: isSelected ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {isSelected && <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#fff' }} />}
                                            </div>
                                            <OptionContent opt={opt} idx={idx} isSelected={isSelected} />
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* MCQ Multiple */}
                        {currentQ?.type === 'mcq_multiple' && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Select all correct answers</p>
                                {currentQ.options?.map((opt, idx) => {
                                    const isSelected = selectedMultiple.includes(opt.id);
                                    return (
                                        <div key={opt.id} onClick={() => handleMultipleAnswerChange(currentQ.contestQuestionId, opt.id)} style={optionStyle(isSelected)}>
                                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', flexShrink: 0, marginTop: '2px', border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`, backgroundColor: isSelected ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {isSelected && <span style={{ color: '#fff', fontSize: '11px', fontWeight: '700' }}>✓</span>}
                                            </div>
                                            <OptionContent opt={opt} idx={idx} isSelected={isSelected} />
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Fill blank */}
                        {currentQ?.type === 'fill_blank' && (
                            <div>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Type your answer below:</p>
                                <input type="text" value={selectedAnswer || ''}
                                    onChange={e => handleAnswerChange(currentQ.contestQuestionId, e.target.value)}
                                    placeholder="Enter your answer..."
                                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '2px solid var(--input-border)', fontSize: '15px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'var(--glass-bg)', color: 'var(--text-primary)' }} />
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', gap: '12px' }}>
                            <button onClick={() => handleQuestionSwitch(currentIndex - 1)} disabled={currentIndex === 0} style={{ padding: isMobile ? '10px 16px' : '10px 24px', background: 'var(--glass-bg)', backdropFilter: 'blur(8px)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentIndex === 0 ? 0.4 : 1 }}>← Prev</button>
                            <button onClick={() => handleQuestionSwitch(currentIndex + 1)} disabled={currentIndex === questions.length - 1} style={{ padding: isMobile ? '10px 16px' : '10px 24px', background: 'var(--gradient-accent)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: currentIndex === questions.length - 1 ? 'not-allowed' : 'pointer', opacity: currentIndex === questions.length - 1 ? 0.4 : 1, boxShadow: '0 2px 8px var(--shadow)' }}>Next →</button>
                        </div>
                    </div>
                </div>

                {!isMobile && (
                    <div style={{ width: '220px', flexShrink: 0, position: 'sticky', top: '80px' }}>
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
            <ConfirmModal
                isOpen={showAbandonModal}
                title="⚠️ Leave Test"
                message="Are you sure you want to leave? This test will be permanently deleted and nothing will be saved — no answers, no stats, nothing."
                onConfirm={handleAbandon}
                onCancel={() => setShowAbandonModal(false)}
                confirmText={abandoning ? 'Leaving...' : 'Yes, Leave & Delete'}
                cancelText="Stay in Test"
                confirmColor="var(--error)"
            />
        </div>
    );
};

export default TestPage;
