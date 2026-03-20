const pool = require('../config/db');

const createContest = async (userId, totalQuestions, totalTime) => {
    const result = await pool.query(
        `INSERT INTO contests (user_id, total_questions, total_time)
         VALUES ($1, $2, $3) RETURNING *`,
        [userId, totalQuestions, totalTime]
    );
    return result.rows[0];
};

const addContestQuestion = async (contestId, questionId, prevMinTime, prevMaxTime) => {
    const result = await pool.query(
        `INSERT INTO contest_questions (contest_id, question_id, prev_min_time, prev_max_time)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [contestId, questionId, prevMinTime || null, prevMaxTime || null]
    );
    return result.rows[0];
};

const getContestById = async (contestId, userId) => {
    const result = await pool.query(
        `SELECT * FROM contests WHERE id = $1 AND user_id = $2`,
        [contestId, userId]
    );
    return result.rows[0];
};

const getContestQuestions = async (contestId) => {
    const result = await pool.query(
        `SELECT cq.*, q.type, q.question_text, q.question_image_url,
                q.solution_text, q.solution_image_url, q.is_starred,
                q.correct_count, q.wrong_count, q.unattempted_count,
                q.min_time, q.max_time
         FROM contest_questions cq
         JOIN questions q ON cq.question_id = q.id
         WHERE cq.contest_id = $1
         ORDER BY cq.id ASC`,
        [contestId]
    );
    return result.rows;
};

const updateContestQuestion = async (id, chosenAnswer, timeSpent, isCorrect, isAttempted) => {
    const result = await pool.query(
        `UPDATE contest_questions
         SET chosen_answer = $1, time_spent = $2, is_correct = $3, is_attempted = $4
         WHERE id = $5 RETURNING *`,
        [chosenAnswer || null, timeSpent || 0, isCorrect || false, isAttempted || false, id]
    );
    return result.rows[0];
};

const completeContest = async (contestId) => {
    const result = await pool.query(
        `UPDATE contests SET completed = TRUE, ended_at = NOW()
         WHERE id = $1 RETURNING *`,
        [contestId]
    );
    return result.rows[0];
};

const getQuestionsForTest = async (userId, tagIds, totalCount) => {
    // Get questions that match ALL selected tags first (priority questions)
    let priorityQuestions = [];
    let remainingQuestions = [];

    if (tagIds && tagIds.length > 0) {
        // Priority: questions matching ALL selected tags
        const priorityResult = await pool.query(
            `SELECT DISTINCT q.id, q.min_time, q.max_time
             FROM questions q
             JOIN question_tags qt ON q.id = qt.question_id
             WHERE q.user_id = $1
             AND qt.tag_id = ANY($2::uuid[])
             GROUP BY q.id, q.min_time, q.max_time
             HAVING COUNT(DISTINCT qt.tag_id) = $3
             ORDER BY RANDOM()`,
            [userId, tagIds, tagIds.length]
        );
        priorityQuestions = priorityResult.rows;

        // Secondary: questions matching at least 1 selected tag (but not all)
        const selectedIds = priorityQuestions.map(q => q.id);
        const secondaryResult = await pool.query(
            `SELECT DISTINCT q.id, q.min_time, q.max_time
             FROM questions q
             JOIN question_tags qt ON q.id = qt.question_id
             WHERE q.user_id = $1
             AND qt.tag_id = ANY($2::uuid[])
             AND q.id != ALL($3::uuid[])
             ORDER BY RANDOM()`,
            [userId, tagIds, selectedIds.length > 0 ? selectedIds : ['00000000-0000-0000-0000-000000000000']]
        );
        remainingQuestions = secondaryResult.rows;
    }

    // Fill remaining slots with random questions not already selected
    const allSelectedIds = [...priorityQuestions, ...remainingQuestions].map(q => q.id);
    const needed = totalCount - allSelectedIds.length;

    if (needed > 0) {
        const randomResult = await pool.query(
            `SELECT q.id, q.min_time, q.max_time
             FROM questions q
             WHERE q.user_id = $1
             AND q.id != ALL($2::uuid[])
             ORDER BY RANDOM()
             LIMIT $3`,
            [userId, allSelectedIds.length > 0 ? allSelectedIds : ['00000000-0000-0000-0000-000000000000'], needed]
        );
        remainingQuestions = [...remainingQuestions, ...randomResult.rows];
    }

    // Combine and limit to totalCount
    const combined = [...priorityQuestions, ...remainingQuestions].slice(0, totalCount);
    return combined;
};

module.exports = {
    createContest,
    addContestQuestion,
    getContestById,
    getContestQuestions,
    updateContestQuestion,
    completeContest,
    getQuestionsForTest
};