const pool = require('../config/db');

const getTodos = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT id, text, status, partial_note, priority, due_date,
                    is_recurring, recur_days, created_at
             FROM todos WHERE user_id = $1
             ORDER BY
                CASE status WHEN 'completed' THEN 2 WHEN 'partial' THEN 1 ELSE 0 END ASC,
                CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END ASC,
                created_at DESC`,
            [req.user.id]
        );

        // Expand recurring tasks into individual date instances for the next 30 days
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todos = [];

        for (const row of result.rows) {
            if (row.is_recurring && row.recur_days && row.recur_days.length > 0) {
                // Generate an instance for each matching day in the next 30 days
                for (let d = 0; d < 30; d++) {
                    const date = new Date(today);
                    date.setDate(today.getDate() + d);
                    const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon ... 6=Sat
                    if (row.recur_days.includes(dayOfWeek)) {
                        const dateStr = date.toISOString().split('T')[0];
                        todos.push({
                            ...row,
                            // Virtual ID combining base id + date
                            instanceId: `${row.id}_${dateStr}`,
                            due_date: dateStr,
                            // Status for this specific instance (stored as base for now)
                            status: row.status,
                            partial_note: row.partial_note
                        });
                    }
                }
            } else {
                todos.push({ ...row, instanceId: row.id });
            }
        }

        res.status(200).json({ todos });
    } catch (error) { next(error); }
};

const createTodo = async (req, res, next) => {
    try {
        const {
            text,
            priority    = 'medium',
            due_date    = null,
            is_recurring = false,
            recur_days  = null
        } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: 'Todo text is required.' });
        }

        const result = await pool.query(
            `INSERT INTO todos (user_id, text, priority, due_date, is_recurring, recur_days, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'pending')
             RETURNING id, text, status, partial_note, priority, due_date, is_recurring, recur_days, created_at`,
            [
                req.user.id,
                text.trim(),
                priority,
                due_date || null,
                is_recurring || false,
                is_recurring && recur_days?.length ? recur_days : null
            ]
        );

        const todo = result.rows[0];
        res.status(201).json({ todo: { ...todo, instanceId: todo.id } });
    } catch (error) { next(error); }
};

const updateTodo = async (req, res, next) => {
    try {
        const { text, status, partial_note, priority, due_date } = req.body;
        // instanceId may be `baseId_dateStr` for recurring — extract base id
        const baseId = req.params.id.split('_')[0];

        const fields = [];
        const values = [];
        let i = 1;

        if (text         !== undefined) { fields.push(`text = $${i++}`);         values.push(text.trim()); }
        if (status       !== undefined) { fields.push(`status = $${i++}`);       values.push(status); }
        if (partial_note !== undefined) { fields.push(`partial_note = $${i++}`); values.push(partial_note || null); }
        if (priority     !== undefined) { fields.push(`priority = $${i++}`);     values.push(priority); }
        if (due_date     !== undefined) { fields.push(`due_date = $${i++}`);     values.push(due_date || null); }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'Nothing to update.' });
        }

        values.push(baseId, req.user.id);
        const result = await pool.query(
            `UPDATE todos SET ${fields.join(', ')}
             WHERE id = $${i} AND user_id = $${i + 1}
             RETURNING id, text, status, partial_note, priority, due_date, is_recurring, recur_days, created_at`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Todo not found.' });
        }

        const todo = result.rows[0];
        res.status(200).json({ todo: { ...todo, instanceId: req.params.id } });
    } catch (error) { next(error); }
};

const deleteTodo = async (req, res, next) => {
    try {
        // Extract base id from possible instanceId
        const baseId = req.params.id.split('_')[0];
        const result = await pool.query(
            `DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING id`,
            [baseId, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Todo not found.' });
        }
        res.status(200).json({ message: 'Todo deleted.' });
    } catch (error) { next(error); }
};

module.exports = { getTodos, createTodo, updateTodo, deleteTodo };
