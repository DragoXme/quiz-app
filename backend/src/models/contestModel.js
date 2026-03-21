const pool = require('../config/db');

const getContestSummariesForUser = async (userId, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const result = await pool.query(
        `SELECT c.id, c.total_questions, c.total_time, c.started_at, c.ended_at, c.completed,
                COUNT(cq.id) as question_count,
                SUM(CASE WHEN cq.is_correct = TRUE THEN 1 ELSE 0 END) as correct_count,
                SUM(CASE WHEN cq.is_attempted = FALSE THEN 1 ELSE 0 END) as unattempted_count,
                SUM(CASE WHEN cq.is_attempted = TRUE AND cq.is_correct = FALSE THEN 1 ELSE 0 END) as wrong_count
         FROM contests c
         LEFT JOIN contest_questions cq ON c.id = cq.contest_id
         WHERE c.user_id = $1 AND c.completed = TRUE
         GROUP BY c.id
         ORDER BY c.ended_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
    );
    return result.rows;
};

const countContestSummariesForUser = async (userId) => {
    const result = await pool.query(
        `SELECT COUNT(*) FROM contests WHERE user_id = $1 AND completed = TRUE`,
        [userId]
    );
    return parseInt(result.rows[0].count);
};

const getContestSummaryById = async (contestId, userId) => {
    const result = await pool.query(
        `SELECT c.id, c.total_questions, c.total_time, c.started_at, c.ended_at, c.completed
         FROM contests c
         WHERE c.id = $1 AND c.user_id = $2`,
        [contestId, userId]
    );
    return result.rows[0];
};

const getContestQuestionsWithDetails = async (contestId) => {
    const result = await pool.query(
        `SELECT cq.id, cq.question_id, cq.chosen_answer, cq.time_spent,
                cq.is_correct, cq.is_attempted, cq.prev_min_time, cq.prev_max_time,
                q.type, q.question_text, q.question_image_url,
                q.solution_text, q.solution_image_url,
                q.correct_count, q.wrong_count, q.unattempted_count,
                q.min_time as current_min_time, q.max_time as current_max_time
         FROM contest_questions cq
         JOIN questions q ON cq.question_id = q.id
         WHERE cq.contest_id = $1
         ORDER BY cq.id ASC`,
        [contestId]
    );
    return result.rows;
};

const getTagSummaryForContest = async (contestId) => {
    const result = await pool.query(
        `SELECT t.name as tag_name,
                COUNT(DISTINCT cq.question_id) as total_questions,
                SUM(CASE WHEN cq.is_correct = TRUE THEN 1 ELSE 0 END) as correct_count,
                SUM(CASE WHEN cq.is_attempted = FALSE THEN 1 ELSE 0 END) as unattempted_count,
                SUM(CASE WHEN cq.is_attempted = TRUE AND cq.is_correct = FALSE THEN 1 ELSE 0 END) as wrong_count,
                SUM(CASE WHEN cq.time_spent < cq.prev_min_time AND cq.prev_min_time IS NOT NULL THEN 1 ELSE 0 END) as faster_than_min_count
         FROM contest_questions cq
         JOIN question_tags qt ON cq.question_id = qt.question_id
         JOIN tags t ON qt.tag_id = t.id
         WHERE cq.contest_id = $1
         GROUP BY t.name
         ORDER BY total_questions DESC`,
        [contestId]
    );
    return result.rows;
};

const getQuestionsToRevisit = async (contestId) => {
    const result = await pool.query(
        `SELECT cq.question_id, q.question_text, q.question_image_url, q.type,
                cq.time_spent, cq.prev_min_time, cq.is_correct, cq.is_attempted
         FROM contest_questions cq
         JOIN questions q ON cq.question_id = q.id
         WHERE cq.contest_id = $1
         AND (
             cq.is_correct = FALSE
             OR (cq.prev_min_time IS NOT NULL AND cq.time_spent > cq.prev_min_time)
         )`,
        [contestId]
    );
    return result.rows;
};

module.exports = {
    getContestSummariesForUser,
    countContestSummariesForUser,
    getContestSummaryById,
    getContestQuestionsWithDetails,
    getTagSummaryForContest,
    getQuestionsToRevisit
};
