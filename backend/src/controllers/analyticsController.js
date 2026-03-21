const pool = require('../config/db');

const getAnalytics = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT
                t.name as tag_name,
                COUNT(DISTINCT q.id) as total_questions,
                SUM(CASE WHEN q.correct_count <= q.wrong_count THEN 1 ELSE 0 END) as struggling_questions,
                COUNT(DISTINCT CASE WHEN q.unattempted_count > 0 THEN q.id END) as unattempted_questions
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