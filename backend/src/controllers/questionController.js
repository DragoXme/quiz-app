const {
    createQuestion,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    createOption,
    getOptionsForQuestion,
    deleteOptionsForQuestion,
    createFillAnswer,
    getFillAnswerForQuestion,
    deleteFillAnswerForQuestion
} = require('../models/questionModel');

const {
    addTagToQuestion,
    removeAllTagsFromQuestion,
    getTagsForQuestion,
    findTagByName,
    createTag
} = require('../models/tagModel');

const pool = require('../config/db');

const createQuestionHandler = async (req, res, next) => {
    try {
        const { type, questionText, questionImageUrl, solutionText, solutionImageUrl, isStarred, options, fillAnswer, tags } = req.body;

        if (!type) return res.status(400).json({ message: 'Question type is required.' });
        if (!questionText && !questionImageUrl) return res.status(400).json({ message: 'Question text or image is required.' });
        if (!tags || tags.length === 0) return res.status(400).json({ message: 'At least one tag is required.' });

        if (type === 'mcq_single') {
            if (!options || options.length < 2) return res.status(400).json({ message: 'At least 2 options are required.' });
            const correctOptions = options.filter(o => o.isCorrect);
            if (correctOptions.length !== 1) return res.status(400).json({ message: 'Please select exactly 1 correct answer or change the question type.' });
        }
        if (type === 'mcq_multiple') {
            if (!options || options.length < 2) return res.status(400).json({ message: 'At least 2 options are required.' });
            const correctOptions = options.filter(o => o.isCorrect);
            if (correctOptions.length < 1) return res.status(400).json({ message: 'Please select at least 1 correct answer.' });
        }
        if (type === 'fill_blank') {
            if (!fillAnswer || fillAnswer.trim() === '') return res.status(400).json({ message: 'Correct answer is required for fill in the blank.' });
        }

        const question = await createQuestion(req.user.id, type, questionText, questionImageUrl, solutionText, solutionImageUrl, isStarred);

        if (type === 'mcq_single' || type === 'mcq_multiple') {
            for (let i = 0; i < options.length; i++) {
                await createOption(question.id, options[i].optionText, options[i].optionImageUrl, options[i].isCorrect, i + 1);
            }
        }
        if (type === 'fill_blank') await createFillAnswer(question.id, fillAnswer.trim());

        const autoTags = ['mcq single correct', 'mcq multiple correct', 'fill in the blank', 'starred'];
        const allTags = [...tags.filter(t => !autoTags.includes(t.toLowerCase().trim()))];
        const typeTagMap = { 'mcq_single': 'mcq single correct', 'mcq_multiple': 'mcq multiple correct', 'fill_blank': 'fill in the blank' };
        allTags.push(typeTagMap[type]);
        if (isStarred) allTags.push('starred');

        for (const tagName of allTags) {
            const normalizedName = tagName.toLowerCase().trim();
            let tag = await findTagByName(normalizedName);
            if (!tag) tag = await createTag(normalizedName);
            await addTagToQuestion(question.id, tag.id);
        }

        const questionTags = await getTagsForQuestion(question.id);
        const questionOptions = type !== 'fill_blank' ? await getOptionsForQuestion(question.id) : [];
        const questionFillAnswer = type === 'fill_blank' ? await getFillAnswerForQuestion(question.id) : null;

        res.status(201).json({ message: 'Question created successfully.', question: { ...question, tags: questionTags, options: questionOptions, fillAnswer: questionFillAnswer } });
    } catch (error) {
        next(error);
    }
};

const getQuestionsHandler = async (req, res, next) => {
    try {
        const { tagIds, sortBy, sortOrder, page = 1, limit = 10, filterTypes } = req.query;

        const parsedTagIds = tagIds ? JSON.parse(tagIds) : [];
        const parsedFilterTypes = filterTypes ? JSON.parse(filterTypes) : [];
        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);
        const offset = (parsedPage - 1) * parsedLimit;

        let baseQuery = `FROM questions q WHERE q.user_id = $1`;
        const params = [req.user.id];
        let paramIndex = 2;

        // Tag filter
        if (parsedTagIds.length > 0) {
            baseQuery += ` AND (
                SELECT COUNT(DISTINCT qt.tag_id)
                FROM question_tags qt
                WHERE qt.question_id = q.id
                AND qt.tag_id = ANY($${paramIndex}::uuid[])
            ) = $${paramIndex + 1}`;
            params.push(parsedTagIds);
            params.push(parsedTagIds.length);
            paramIndex += 2;
        }

        const hasStruggling = parsedFilterTypes.includes('struggling');
        const hasUnattempted = parsedFilterTypes.includes('unattempted');

        if (hasStruggling && hasUnattempted) {
            baseQuery += ` AND (
                (q.correct_count <= q.wrong_count AND q.wrong_count > 0)
                OR
                (q.wrong_count = 0 AND q.correct_count = 0 AND q.unattempted_count = 0)
                OR
                ((q.wrong_count + q.correct_count) <= q.unattempted_count AND q.unattempted_count > 0)
            )`;
        } else if (hasStruggling) {
            baseQuery += ` AND q.correct_count <= q.wrong_count AND q.wrong_count > 0`;
        } else if (hasUnattempted) {
            baseQuery += ` AND (
                (q.wrong_count = 0 AND q.correct_count = 0 AND q.unattempted_count = 0)
                OR
                ((q.wrong_count + q.correct_count) <= q.unattempted_count AND q.unattempted_count > 0)
            )`;
        }

        const validSortFields = { 'min_time': 'q.min_time', 'max_time': 'q.max_time', 'diff_time': 'ABS(q.max_time - q.min_time)' };
        const validSortOrders = ['ASC', 'DESC'];
        const sortField = validSortFields[sortBy] || null;
        const order = validSortOrders.includes(sortOrder?.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
        const orderClause = sortField ? ` ORDER BY (${sortField} IS NULL) ASC, ${sortField} ${order}` : ` ORDER BY q.created_at DESC`;

        const countResult = await pool.query(`SELECT COUNT(*) ${baseQuery}`, params);
        const totalCount = parseInt(countResult.rows[0].count);

        const dataResult = await pool.query(
            `SELECT q.* ${baseQuery} ${orderClause} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            [...params, parsedLimit, offset]
        );

        const questionsWithDetails = await Promise.all(
            dataResult.rows.map(async (q) => {
                const tags = await getTagsForQuestion(q.id);
                return { ...q, tags };
            })
        );

        res.status(200).json({ questions: questionsWithDetails, totalCount, page: parsedPage, limit: parsedLimit, totalPages: Math.ceil(totalCount / parsedLimit) });
    } catch (error) {
        next(error);
    }
};

const getQuestionByIdHandler = async (req, res, next) => {
    try {
        const question = await getQuestionById(req.params.id, req.user.id);
        if (!question) return res.status(404).json({ message: 'Question not found.' });
        const tags = await getTagsForQuestion(question.id);
        const options = question.type !== 'fill_blank' ? await getOptionsForQuestion(question.id) : [];
        const fillAnswer = question.type === 'fill_blank' ? await getFillAnswerForQuestion(question.id) : null;
        res.status(200).json({ question: { ...question, tags, options, fillAnswer } });
    } catch (error) {
        next(error);
    }
};

const updateQuestionHandler = async (req, res, next) => {
    try {
        const { type, questionText, questionImageUrl, solutionText, solutionImageUrl, isStarred, options, fillAnswer, tags } = req.body;

        const existingQuestion = await getQuestionById(req.params.id, req.user.id);
        if (!existingQuestion) return res.status(404).json({ message: 'Question not found.' });
        if (!questionText && !questionImageUrl) return res.status(400).json({ message: 'Question text or image is required.' });
        if (!tags || tags.length === 0) return res.status(400).json({ message: 'At least one tag is required.' });

        if (type === 'mcq_single') {
            const correctOptions = options.filter(o => o.isCorrect);
            if (correctOptions.length !== 1) return res.status(400).json({ message: 'Please select exactly 1 correct answer or change the question type.' });
        }
        if (type === 'mcq_multiple') {
            const correctOptions = options.filter(o => o.isCorrect);
            if (correctOptions.length < 1) return res.status(400).json({ message: 'Please select at least 1 correct answer.' });
        }
        if (type === 'fill_blank') {
            if (!fillAnswer || fillAnswer.trim() === '') return res.status(400).json({ message: 'Correct answer is required.' });
        }

        const updatedQuestion = await updateQuestion(req.params.id, req.user.id, questionText, questionImageUrl, solutionText, solutionImageUrl, isStarred, type);

        await deleteOptionsForQuestion(req.params.id);
        if (type === 'mcq_single' || type === 'mcq_multiple') {
            for (let i = 0; i < options.length; i++) {
                await createOption(req.params.id, options[i].optionText, options[i].optionImageUrl, options[i].isCorrect, i + 1);
            }
        }

        await deleteFillAnswerForQuestion(req.params.id);
        if (type === 'fill_blank') await createFillAnswer(req.params.id, fillAnswer.trim());

        await removeAllTagsFromQuestion(req.params.id);
        const autoTags = ['mcq single correct', 'mcq multiple correct', 'fill in the blank', 'starred'];
        const allTags = [...tags.filter(t => !autoTags.includes(t.toLowerCase().trim()))];
        const typeTagMap = { 'mcq_single': 'mcq single correct', 'mcq_multiple': 'mcq multiple correct', 'fill_blank': 'fill in the blank' };
        allTags.push(typeTagMap[type]);
        if (isStarred) allTags.push('starred');

        for (const tagName of allTags) {
            const normalizedName = tagName.toLowerCase().trim();
            let tag = await findTagByName(normalizedName);
            if (!tag) tag = await createTag(normalizedName);
            await addTagToQuestion(req.params.id, tag.id);
        }

        const updatedTags = await getTagsForQuestion(req.params.id);
        const updatedOptions = type !== 'fill_blank' ? await getOptionsForQuestion(req.params.id) : [];
        const updatedFillAnswer = type === 'fill_blank' ? await getFillAnswerForQuestion(req.params.id) : null;

        res.status(200).json({ message: 'Question updated successfully.', question: { ...updatedQuestion, tags: updatedTags, options: updatedOptions, fillAnswer: updatedFillAnswer } });
    } catch (error) {
        next(error);
    }
};

const deleteQuestionHandler = async (req, res, next) => {
    try {
        const deleted = await deleteQuestion(req.params.id, req.user.id);
        if (!deleted) return res.status(404).json({ message: 'Question not found.' });
        res.status(200).json({ message: 'Question deleted successfully.' });
    } catch (error) {
        next(error);
    }
};

module.exports = { createQuestionHandler, getQuestionsHandler, getQuestionByIdHandler, updateQuestionHandler, deleteQuestionHandler };
