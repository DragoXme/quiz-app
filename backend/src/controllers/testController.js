const {
    createContest,
    addContestQuestion,
    getContestById,
    getContestQuestions,
    updateContestQuestion,
    completeContest,
    getQuestionsForTest
} = require('../models/testModel');

const {
    getOptionsForQuestion,
    getFillAnswerForQuestion,
    updateQuestionStats
} = require('../models/questionModel');

const { getTagsForQuestion } = require('../models/tagModel');
const pool = require('../config/db');

const configureTest = async (req, res, next) => {
    try {
        const { totalQuestions, totalTime, tagIds, filterType } = req.body;
        console.log('Configure test called with:', { totalQuestions, totalTime, tagIds, filterType });

        if (!totalQuestions || !totalTime) {
            return res.status(400).json({ message: 'Total questions and total time are required.' });
        }

        if (totalQuestions < 1) {
            return res.status(400).json({ message: 'Total questions must be at least 1.' });
        }

        if (totalTime < 1) {
            return res.status(400).json({ message: 'Total time must be at least 1 minute.' });
        }

        const selectedQuestions = await getQuestionsForTest(
            req.user.id, tagIds || [], totalQuestions, filterType
        );

        if (selectedQuestions.length === 0) {
            return res.status(400).json({ message: 'No questions found matching your criteria. Please create some questions first.' });
        }

        const contest = await createContest(req.user.id, totalQuestions, totalTime);

        for (const q of selectedQuestions) {
            await addContestQuestion(contest.id, q.id, q.min_time, q.max_time);
        }

        res.status(201).json({
            message: 'Test configured successfully.',
            contestId: contest.id,
            totalQuestions: selectedQuestions.length
        });
    } catch (error) {
        next(error);
    }
};

const getTestQuestions = async (req, res, next) => {
    try {
        const { contestId } = req.params;

        const contest = await getContestById(contestId, req.user.id);
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found.' });
        }

        if (contest.completed) {
            return res.status(400).json({ message: 'This contest is already completed.' });
        }

        const contestQuestions = await getContestQuestions(contestId);

        const questionsWithDetails = await Promise.all(
            contestQuestions.map(async (cq) => {
                const options = cq.type !== 'fill_blank' ? await getOptionsForQuestion(cq.question_id) : [];
                const tags = await getTagsForQuestion(cq.question_id);
                return {
                    contestQuestionId: cq.id,
                    questionId: cq.question_id,
                    type: cq.type,
                    questionText: cq.question_text,
                    questionImageUrl: cq.question_image_url,
                    options,
                    tags,
                    timeSpent: cq.time_spent,
                    chosenAnswer: cq.chosen_answer,
                    isAttempted: cq.is_attempted
                };
            })
        );

        res.status(200).json({ contest, questions: questionsWithDetails });
    } catch (error) {
        next(error);
    }
};

const submitAnswer = async (req, res, next) => {
    try {
        const { contestQuestionId, chosenAnswer, timeSpent } = req.body;

        if (!contestQuestionId) {
            return res.status(400).json({ message: 'Contest question ID is required.' });
        }

        const cqResult = await pool.query(
            `SELECT cq.*, q.type FROM contest_questions cq
             JOIN questions q ON cq.question_id = q.id
             WHERE cq.id = $1`,
            [contestQuestionId]
        );

        if (cqResult.rows.length === 0) {
            return res.status(404).json({ message: 'Contest question not found.' });
        }

        const cq = cqResult.rows[0];

        const contest = await getContestById(cq.contest_id, req.user.id);
        if (!contest) {
            return res.status(403).json({ message: 'Unauthorized.' });
        }

        let isCorrect = false;
        let isAttempted = chosenAnswer !== null && chosenAnswer !== undefined && chosenAnswer !== '';

        if (isAttempted) {
            if (cq.type === 'fill_blank') {
                const fillAnswer = await getFillAnswerForQuestion(cq.question_id);
                isCorrect = fillAnswer &&
                    fillAnswer.correct_answer.toLowerCase().trim() === chosenAnswer.toLowerCase().trim();
            } else if (cq.type === 'mcq_single') {
                const options = await getOptionsForQuestion(cq.question_id);
                const correctOption = options.find(o => o.is_correct);
                isCorrect = correctOption && correctOption.id === chosenAnswer;
            } else if (cq.type === 'mcq_multiple') {
                const options = await getOptionsForQuestion(cq.question_id);
                const correctOptionIds = options.filter(o => o.is_correct).map(o => o.id).sort();
                const chosenIds = JSON.parse(chosenAnswer).sort();
                isCorrect = JSON.stringify(correctOptionIds) === JSON.stringify(chosenIds);
            }
        }

        await updateContestQuestion(contestQuestionId, chosenAnswer, timeSpent || 0, isCorrect, isAttempted);

        res.status(200).json({ message: 'Answer saved.' });
    } catch (error) {
        next(error);
    }
};

const submitTest = async (req, res, next) => {
    try {
        const { contestId } = req.params;

        const contest = await getContestById(contestId, req.user.id);
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found.' });
        }

        if (contest.completed) {
            return res.status(400).json({ message: 'Contest already completed.' });
        }

        const contestQuestions = await getContestQuestions(contestId);

        for (const cq of contestQuestions) {
            const currentQuestion = await pool.query(
                `SELECT * FROM questions WHERE id = $1`,
                [cq.question_id]
            );
            const q = currentQuestion.rows[0];

            let newCorrectCount = q.correct_count;
            let newWrongCount = q.wrong_count;
            let newUnattemptedCount = q.unattempted_count;
            let newMinTime = q.min_time;
            let newMaxTime = q.max_time;

            if (!cq.is_attempted) {
                newUnattemptedCount += 1;
            } else if (cq.is_correct) {
                newCorrectCount += 1;
            } else {
                newWrongCount += 1;
            }

            if (cq.is_attempted && cq.time_spent > 0) {
                if (newMinTime === null || cq.time_spent < newMinTime) {
                    newMinTime = cq.time_spent;
                }
                if (newMaxTime === null || cq.time_spent > newMaxTime) {
                    newMaxTime = cq.time_spent;
                }
            }

            await updateQuestionStats(
                cq.question_id, newCorrectCount, newWrongCount,
                newUnattemptedCount, newMinTime, newMaxTime
            );
        }

        await completeContest(contestId);

        res.status(200).json({ message: 'Test submitted successfully.', contestId });
    } catch (error) {
        next(error);
    }
};

module.exports = { configureTest, getTestQuestions, submitAnswer, submitTest };