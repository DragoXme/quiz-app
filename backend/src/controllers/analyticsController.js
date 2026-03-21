const pool = require('../config/db');

const getAnalytics = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT
                t.name as tag_name,
                COUNT(DISTINCT q.id) as total_questions,
                SUM(CASE WHEN q.correct_count <= q.wrong_count AND q.wrong_count > 0 THEN 1 ELSE 0 END) as struggling_questions,
                SUM(CASE WHEN
                    (q.wrong_count = 0 AND q.correct_count = 0 AND q.unattempted_count = 0)
                    OR
                    ((q.wrong_count + q.correct_count) <= q.unattempted_count AND q.unattempted_count > 0)
                THEN 1 ELSE 0 END) as unattempted_questions
             FROM tags t
             JOIN question_tags qt ON t.id = qt.tag_id
             JOIN questions q ON qt.question_id = q.id
             WHERE q.user_id = $1
             GROUP BY t.name
             ORDER BY total_questions DESC`,
            [req.user.id]
        );

        res.status(200).json({ analytics: result.rows });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAnalytics };
