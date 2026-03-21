const pool = require('../config/db');

const createQuestion = async (userId, type, questionText, questionImageUrl, solutionText, solutionImageUrl, isStarred) => {
    const result = await pool.query(
        `INSERT INTO questions (user_id, type, question_text, question_image_url, solution_text, solution_image_url, is_starred)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [userId, type, questionText || null, questionImageUrl || null, solutionText || null, solutionImageUrl || null, isStarred || false]
    );
    return result.rows[0];
};

const getQuestionById = async (id, userId) => {
    const result = await pool.query(
        `SELECT * FROM questions WHERE id = $1 AND user_id = $2`,
        [id, userId]
    );
    return result.rows[0];
};

const updateQuestion = async (id, userId, questionText, questionImageUrl, solutionText, solutionImageUrl, isStarred, type) => {
    const result = await pool.query(
        `UPDATE questions
         SET question_text = $1, question_image_url = $2, solution_text = $3,
             solution_image_url = $4, is_starred = $5, type = $6
         WHERE id = $7 AND user_id = $8
         RETURNING *`,
        [questionText || null, questionImageUrl || null, solutionText || null,
         solutionImageUrl || null, isStarred || false, type, id, userId]
    );
    return result.rows[0];
};

const deleteQuestion = async (id, userId) => {
    const result = await pool.query(
        `DELETE FROM questions WHERE id = $1 AND user_id = $2 RETURNING *`,
        [id, userId]
    );
    return result.rows[0];
};

const createOption = async (questionId, optionText, optionImageUrl, isCorrect, position) => {
    const result = await pool.query(
        `INSERT INTO options (question_id, option_text, option_image_url, is_correct, position)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [questionId, optionText || null, optionImageUrl || null, isCorrect || false, position]
    );
    return result.rows[0];
};

const getOptionsForQuestion = async (questionId) => {
    const result = await pool.query(
        `SELECT * FROM options WHERE question_id = $1 ORDER BY position ASC`,
        [questionId]
    );
    return result.rows;
};

const deleteOptionsForQuestion = async (questionId) => {
    await pool.query(`DELETE FROM options WHERE question_id = $1`, [questionId]);
};

const createFillAnswer = async (questionId, correctAnswer) => {
    const result = await pool.query(
        `INSERT INTO fill_answers (question_id, correct_answer)
         VALUES ($1, $2) RETURNING *`,
        [questionId, correctAnswer]
    );
    return result.rows[0];
};

const getFillAnswerForQuestion = async (questionId) => {
    const result = await pool.query(
        `SELECT * FROM fill_answers WHERE question_id = $1`,
        [questionId]
    );
    return result.rows[0];
};

const deleteFillAnswerForQuestion = async (questionId) => {
    await pool.query(`DELETE FROM fill_answers WHERE question_id = $1`, [questionId]);
};

const updateQuestionStats = async (id, correctCount, wrongCount, unattemptedCount, minTime, maxTime) => {
    const result = await pool.query(
        `UPDATE questions
         SET correct_count = $1, wrong_count = $2, unattempted_count = $3,
             min_time = $4, max_time = $5
         WHERE id = $6 RETURNING *`,
        [correctCount, wrongCount, unattemptedCount, minTime, maxTime, id]
    );
    return result.rows[0];
};

module.exports = {
    createQuestion,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    createOption,
    getOptionsForQuestion,
    deleteOptionsForQuestion,
    createFillAnswer,
    getFillAnswerForQuestion,
    deleteFillAnswerForQuestion,
    updateQuestionStats
};
