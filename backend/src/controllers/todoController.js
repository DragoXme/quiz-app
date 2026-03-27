const pool = require('../config/db');

const getTodos = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT id, text, completed, priority, due_date, created_at
             FROM todos WHERE user_id = $1
             ORDER BY completed ASC, 
                      CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END ASC,
                      created_at DESC`,
            [req.user.id]
        );
        res.status(200).json({ todos: result.rows });
    } catch (error) { next(error); }
};

const createTodo = async (req, res, next) => {
    try {
        const { text, priority = 'medium', due_date = null } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ message: 'Todo text is required.' });
        }
        const result = await pool.query(
            `INSERT INTO todos (user_id, text, priority, due_date)
             VALUES ($1, $2, $3, $4)
             RETURNING id, text, completed, priority, due_date, created_at`,
            [req.user.id, text.trim(), priority, due_date || null]
        );
        res.status(201).json({ todo: result.rows[0] });
    } catch (error) { next(error); }
};

const updateTodo = async (req, res, next) => {
    try {
        const { text, completed, priority, due_date } = req.body;
        const { id } = req.params;

        // Build dynamic update
        const fields = [];
        const values = [];
        let i = 1;

        if (text !== undefined)      { fields.push(`text = $${i++}`);      values.push(text.trim()); }
        if (completed !== undefined) { fields.push(`completed = $${i++}`); values.push(completed); }
        if (priority !== undefined)  { fields.push(`priority = $${i++}`);  values.push(priority); }
        if (due_date !== undefined)  { fields.push(`due_date = $${i++}`);  values.push(due_date || null); }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'Nothing to update.' });
        }

        values.push(id, req.user.id);
        const result = await pool.query(
            `UPDATE todos SET ${fields.join(', ')}
             WHERE id = $${i} AND user_id = $${i + 1}
             RETURNING id, text, completed, priority, due_date, created_at`,
            values
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Todo not found.' });
        }
        res.status(200).json({ todo: result.rows[0] });
    } catch (error) { next(error); }
};

const deleteTodo = async (req, res, next) => {
    try {
        const result = await pool.query(
            `DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING id`,
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Todo not found.' });
        }
        res.status(200).json({ message: 'Todo deleted.' });
    } catch (error) { next(error); }
};

module.exports = { getTodos, createTodo, updateTodo, deleteTodo };
