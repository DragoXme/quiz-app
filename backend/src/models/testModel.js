const pool = require('../config/db');

const createContest = async (userId, totalQuestions, totalTime) => {
    const result = await pool.query(
        `INSERT INTO contests (user_id, total_questions, total_time) VALUES ($1, $2, $3) RETURNING *`,
        [userId, totalQuestions, totalTime]
    );
    return result.rows[0];
};

const addContestQuestion = async (contestId, questionId, prevMinTime, prevMaxTime) => {
    const result = await pool.query(
        `INSERT INTO contest_questions (contest_id, question_id, prev_min_time, prev_max_time) VALUES ($1, $2, $3, $4) RETURNING *`,
        [contestId, questionId, prevMinTime || null, prevMaxTime || null]
    );
    return result.rows[0];
};

const getContestById = async (contestId, userId) => {
    const result = await pool.query(`SELECT * FROM contests WHERE id = $1 AND user_id = $2`, [contestId, userId]);
    return result.rows[0];
};

const getContestQuestions = async (contestId) => {
    const result = await pool.query(
        `SELECT cq.*, q.type, q.question_text, q.question_image_url,
                q.solution_text, q.solution_image_url, q.is_starred,
                q.correct_count, q.wrong_count, q.unattempted_count, q.min_time, q.max_time
         FROM contest_questions cq
         JOIN questions q ON cq.question_id = q.id
         WHERE cq.contest_id = $1 ORDER BY cq.id ASC`,
        [contestId]
    );
    return result.rows;
};

const updateContestQuestion = async (id, chosenAnswer, timeSpent, isCorrect, isAttempted) => {
    const result = await pool.query(
        `UPDATE contest_questions SET chosen_answer = $1, time_spent = $2, is_correct = $3, is_attempted = $4 WHERE id = $5 RETURNING *`,
        [chosenAnswer || null, timeSpent || 0, isCorrect || false, isAttempted || false, id]
    );
    return result.rows[0];
};

const completeContest = async (contestId) => {
    const result = await pool.query(
        `UPDATE contests SET completed = TRUE, ended_at = NOW() WHERE id = $1 RETURNING *`,
        [contestId]
    );
    return result.rows[0];
};

const getQuestionsForTest = async (userId, tagIds, totalCount, filterTypes = []) => {
    const selectedIds = new Set();
    let finalQuestions = [];

    // Build filter condition from filterTypes array
    // If both selected: question must match either condition (OR)
    // If one selected: question must match that condition
    let filterCondition = '';
    if (filterTypes.includes('struggling') && filterTypes.includes('unattempted')) {
        filterCondition = `AND (
            (q.correct_count <= q.wrong_count AND q.wrong_count > 0)
            OR
            ((q.wrong_count + q.correct_count) <= q.unattempted_count AND q.unattempted_count > 0)
        )`;
    } else if (filterTypes.includes('struggling')) {
        filterCondition = `AND q.correct_count <= q.wrong_count AND q.wrong_count > 0`;
    } else if (filterTypes.includes('unattempted')) {
        filterCondition = `AND (q.wrong_count + q.correct_count) <= q.unattempted_count AND q.unattempted_count > 0`;
    }

    if (tagIds && tagIds.length > 0) {
        // Priority: questions matching ALL selected tags
        const priorityResult = await pool.query(
            `SELECT q.id, q.min_time, q.max_time
             FROM questions q
             WHERE q.user_id = $1
             ${filterCondition}
             AND (
                 SELECT COUNT(DISTINCT qt.tag_id) FROM question_tags qt
                 WHERE qt.question_id = q.id AND qt.tag_id = ANY($2::uuid[])
             ) = $3
             ORDER BY RANDOM()`,
            [userId, tagIds, tagIds.length]
        );
        for (const q of priorityResult.rows) {
            if (!selectedIds.has(q.id) && finalQuestions.length < totalCount) {
                selectedIds.add(q.id); finalQuestions.push(q);
            }
        }

        // Secondary: questions matching at least 1 tag
        if (finalQuestions.length < totalCount) {
            const secondaryResult = await pool.query(
                `SELECT q.id, q.min_time, q.max_time
                 FROM questions q
                 WHERE q.user_id = $1
                 ${filterCondition}
                 AND (
                     SELECT COUNT(DISTINCT qt.tag_id) FROM question_tags qt
                     WHERE qt.question_id = q.id AND qt.tag_id = ANY($2::uuid[])
                 ) > 0
                 ORDER BY RANDOM()`,
                [userId, tagIds]
            );
            for (const q of secondaryResult.rows) {
                if (!selectedIds.has(q.id) && finalQuestions.length < totalCount) {
                    selectedIds.add(q.id); finalQuestions.push(q);
                }
            }
        }
    }

    // Fill remaining slots with random questions
    if (finalQuestions.length < totalCount) {
        const needed = totalCount - finalQuestions.length;
        const excludeIds = [...selectedIds];
        let randomResult;
        if (excludeIds.length > 0) {
            randomResult = await pool.query(
                `SELECT q.id, q.min_time, q.max_time FROM questions q
                 WHERE q.user_id = $1 ${filterCondition}
                 AND q.id != ANY($2::uuid[])
                 ORDER BY RANDOM() LIMIT $3`,
                [userId, excludeIds, needed]
            );
        } else {
            randomResult = await pool.query(
                `SELECT q.id, q.min_time, q.max_time FROM questions q
                 WHERE q.user_id = $1 ${filterCondition}
                 ORDER BY RANDOM() LIMIT $2`,
                [userId, needed]
            );
        }
        for (const q of randomResult.rows) {
            if (!selectedIds.has(q.id) && finalQuestions.length < totalCount) {
                selectedIds.add(q.id); finalQuestions.push(q);
            }
        }
    }

    return finalQuestions;
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
