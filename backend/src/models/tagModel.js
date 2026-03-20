const pool = require('../config/db');

const searchTags = async (query) => {
    const result = await pool.query(
        `SELECT * FROM tags WHERE name ILIKE $1 ORDER BY name ASC LIMIT 10`,
        [`%${query}%`]
    );
    return result.rows;
};

const findTagByName = async (name) => {
    const result = await pool.query(
        `SELECT * FROM tags WHERE name = $1`,
        [name.toLowerCase().trim()]
    );
    return result.rows[0];
};

const createTag = async (name) => {
    const result = await pool.query(
        `INSERT INTO tags (name) VALUES ($1)
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
         RETURNING *`,
        [name.toLowerCase().trim()]
    );
    return result.rows[0];
};

const getTagById = async (id) => {
    const result = await pool.query(
        `SELECT * FROM tags WHERE id = $1`,
        [id]
    );
    return result.rows[0];
};

const getAllTagsForUser = async (userId) => {
    const result = await pool.query(
        `SELECT DISTINCT t.id, t.name
         FROM tags t
         JOIN question_tags qt ON t.id = qt.tag_id
         JOIN questions q ON qt.question_id = q.id
         WHERE q.user_id = $1
         ORDER BY t.name ASC`,
        [userId]
    );
    return result.rows;
};

const addTagToQuestion = async (questionId, tagId) => {
    await pool.query(
        `INSERT INTO question_tags (question_id, tag_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [questionId, tagId]
    );
};

const removeAllTagsFromQuestion = async (questionId) => {
    await pool.query(
        `DELETE FROM question_tags WHERE question_id = $1`,
        [questionId]
    );
};

const getTagsForQuestion = async (questionId) => {
    const result = await pool.query(
        `SELECT t.id, t.name FROM tags t
         JOIN question_tags qt ON t.id = qt.tag_id
         WHERE qt.question_id = $1
         ORDER BY t.name ASC`,
        [questionId]
    );
    return result.rows;
};

module.exports = {
    searchTags,
    findTagByName,
    createTag,
    getTagById,
    getAllTagsForUser,
    addTagToQuestion,
    removeAllTagsFromQuestion,
    getTagsForQuestion
};