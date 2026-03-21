const {
    getContestSummariesForUser,
    countContestSummariesForUser,
    getContestSummaryById,
    getContestQuestionsWithDetails,
    getTagSummaryForContest,
    getQuestionsToRevisit
} = require('../models/contestModel');

const pool = require('../config/db');

const { getOptionsForQuestion, getFillAnswerForQuestion } = require('../models/questionModel');

const getAllContestSummaries = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const summaries = await getContestSummariesForUser(req.user.id, page, limit);
        const totalCount = await countContestSummariesForUser(req.user.id);
        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({ summaries, totalCount, totalPages, page, limit });
    } catch (error) {
        next(error);
    }
};

const getContestSummaryDetails = async (req, res, next) => {
    try {
        const { contestId } = req.params;

        const contest = await getContestSummaryById(contestId, req.user.id);
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found.' });
        }

        const tagSummary = await getTagSummaryForContest(contestId);
        const questionsToRevisit = await getQuestionsToRevisit(contestId);
        const contestQuestions = await getContestQuestionsWithDetails(contestId);

        const questionsWithAnswers = await Promise.all(
            contestQuestions.map(async (cq) => {
                let correctAnswer = null;
                let options = [];

                if (cq.type === 'fill_blank') {
                    const fillAnswer = await getFillAnswerForQuestion(cq.question_id);
                    correctAnswer = fillAnswer ? fillAnswer.correct_answer : null;
                } else {
                    options = await getOptionsForQuestion(cq.question_id);
                    correctAnswer = options.filter(o => o.is_correct).map(o => o.id);
                }

                return { ...cq, options, correctAnswer };
            })
        );

        res.status(200).json({
            contest,
            tagSummary,
            questionsToRevisit,
            questions: questionsWithAnswers
        });
    } catch (error) {
        next(error);
    }
};

const deleteContest = async (req, res, next) => {
    try {
        const { contestId } = req.params;

        const contest = await getContestSummaryById(contestId, req.user.id);
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found.' });
        }

        await pool.query(
            `DELETE FROM contests WHERE id = $1 AND user_id = $2`,
            [contestId, req.user.id]
        );

        res.status(200).json({ message: 'Contest deleted successfully.' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllContestSummaries,
    getContestSummaryDetails,
    deleteContest
};
