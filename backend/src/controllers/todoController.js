const pool = require('../config/db');

// ── Helpers ──

// Returns YYYY-MM-DD string in LOCAL time (avoids UTC shift)
const toDateStr = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// Fetch all saved instance statuses for a given todo_id
const getInstanceStatuses = async (todoId) => {
    const result = await pool.query(
        `SELECT instance_date, status, partial_note FROM todo_instances WHERE todo_id = $1`,
        [todoId]
    );
    // Map: 'YYYY-MM-DD' -> { status, partial_note }
    const map = {};
    for (const row of result.rows) {
        const dateStr = toDateStr(new Date(row.instance_date));
        map[dateStr] = { status: row.status, partial_note: row.partial_note };
    }
    return map;
};

// Upsert an instance status
const upsertInstance = async (todoId, dateStr, status, partialNote) => {
    await pool.query(
        `INSERT INTO todo_instances (todo_id, instance_date, status, partial_note)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (todo_id, instance_date)
         DO UPDATE SET status = $3, partial_note = $4`,
        [todoId, dateStr, status, partialNote || null]
    );
};

// ── Controllers ──

const getTodos = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT id, text, status, partial_note, priority, due_date,
                    is_recurring, recur_days, created_at
             FROM todos WHERE user_id = $1
             ORDER BY
                CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END ASC,
                created_at DESC`,
            [req.user.id]
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todos = [];

        for (const row of result.rows) {
            if (row.is_recurring && row.recur_days && row.recur_days.length > 0) {

                // Load all saved instance statuses for this recurring task
                const instanceMap = await getInstanceStatuses(row.id);

                // Generate instances: today + next 6 days only (1 week window)
                // Past instances are only shown if they have a saved status (partial/completed)
                const instances = [];

                // Past 7 days (show only if they have a non-pending saved status)
                for (let d = 7; d >= 1; d--) {
                    const date = new Date(today);
                    date.setDate(today.getDate() - d);
                    const dayOfWeek = date.getDay();
                    if (!row.recur_days.includes(dayOfWeek)) continue;
                    const dateStr = toDateStr(date);
                    const saved = instanceMap[dateStr];
                    // Only include past dates if they have a saved state (so user can review)
                    if (saved && saved.status !== 'pending') {
                        instances.push({
                            ...row,
                            instanceId: `${row.id}_${dateStr}`,
                            due_date: dateStr,
                            status: saved.status,
                            partial_note: saved.partial_note
                        });
                    }
                }

                // Today + next 6 days (always show, fresh pending if no saved status)
                for (let d = 0; d <= 6; d++) {
                    const date = new Date(today);
                    date.setDate(today.getDate() + d);
                    const dayOfWeek = date.getDay();
                    if (!row.recur_days.includes(dayOfWeek)) continue;
                    const dateStr = toDateStr(date);
                    const saved = instanceMap[dateStr];
                    instances.push({
                        ...row,
                        instanceId: `${row.id}_${dateStr}`,
                        due_date: dateStr,
                        // Future/today instances: use saved if exists, else always pending
                        status: saved ? saved.status : 'pending',
                        partial_note: saved ? saved.partial_note : null
                    });
                }

                todos.push(...instances);

            } else {
                // Non-recurring: use base row status as-is
                todos.push({ ...row, instanceId: String(row.id) });
            }
        }

        // Sort: pending first, partial second, completed last; then by due_date asc
        todos.sort((a, b) => {
            const so = { pending: 0, partial: 1, completed: 2 };
            if (so[a.status] !== so[b.status]) return so[a.status] - so[b.status];
            if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
            return 0;
        });

        res.status(200).json({ todos });
    } catch (error) { next(error); }
};

const createTodo = async (req, res, next) => {
    try {
        const {
            text,
            priority     = 'medium',
            due_date     = null,
            is_recurring = false,
            recur_days   = null
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
                is_recurring ? null : (due_date || null),
                is_recurring || false,
                is_recurring && recur_days?.length ? recur_days : null
            ]
        );

        const todo = result.rows[0];
        res.status(201).json({ todo: { ...todo, instanceId: String(todo.id) } });
    } catch (error) { next(error); }
};

const updateTodo = async (req, res, next) => {
    try {
        const { text, status, partial_note, priority, due_date } = req.body;
        const rawId = req.params.id;

        // Detect recurring instance: instanceId format is `uuid_YYYY-MM-DD`
        // UUID v4 format: 8-4-4-4-12 characters
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
        const uuidMatch = rawId.match(uuidPattern);
        const baseId = uuidMatch ? uuidMatch[0] : rawId;
        const dateStr = rawId.length > baseId.length ? rawId.slice(baseId.length + 1) : null;
        const isRecurringInstance = !!dateStr;

        if (isRecurringInstance && (status !== undefined || partial_note !== undefined)) {
            // Status/note changes on a recurring instance go to todo_instances table
            const newStatus = status !== undefined ? status : 'pending';
            const newNote = partial_note !== undefined ? partial_note : null;
            await upsertInstance(baseId, dateStr, newStatus, newNote);

            // Return the updated instance (fetch base todo for metadata)
            const baseResult = await pool.query(
                `SELECT id, text, status, partial_note, priority, due_date, is_recurring, recur_days, created_at
                 FROM todos WHERE id = $1 AND user_id = $2`,
                [baseId, req.user.id]
            );
            if (baseResult.rows.length === 0) {
                return res.status(404).json({ message: 'Todo not found.' });
            }
            const base = baseResult.rows[0];
            return res.status(200).json({
                todo: {
                    ...base,
                    instanceId: rawId,
                    due_date: dateStr,
                    status: newStatus,
                    partial_note: newNote
                }
            });
        }

        // Non-recurring update (or updating text/priority on recurring base)
        const fields = [];
        const values = [];
        let i = 1;

        if (text         !== undefined) { fields.push(`text = $${i++}`);         values.push(text.trim()); }
        if (priority     !== undefined) { fields.push(`priority = $${i++}`);     values.push(priority); }
        if (due_date     !== undefined) { fields.push(`due_date = $${i++}`);     values.push(due_date || null); }
        // For non-recurring todos, status/note go on the base row
        if (!isRecurringInstance) {
            if (status       !== undefined) { fields.push(`status = $${i++}`);       values.push(status); }
            if (partial_note !== undefined) { fields.push(`partial_note = $${i++}`); values.push(partial_note || null); }
        }

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
        res.status(200).json({ todo: { ...todo, instanceId: rawId } });
    } catch (error) { next(error); }
};

const deleteTodo = async (req, res, next) => {
    try {
        const rawId = req.params.id;
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
        const uuidMatch = rawId.match(uuidPattern);
        const baseId = uuidMatch ? uuidMatch[0] : rawId;

        // Always delete the base todo (cascades to todo_instances via FK)
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
