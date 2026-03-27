import React, { useState, useEffect } from 'react';
import API from '../api/axios';

const PRIORITIES = [
    { key: 'high',   label: 'High',   color: 'var(--error)',   bg: 'var(--error-light)'   },
    { key: 'medium', label: 'Medium', color: 'var(--warning)', bg: 'var(--warning-light)' },
    { key: 'low',    label: 'Low',    color: 'var(--success)', bg: 'var(--success-light)' },
];

const priorityOf = (key) => PRIORITIES.find(p => p.key === key) || PRIORITIES[1];

const formatDue = (dateStr) => {
    if (!dateStr) return null;
    const due = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((due - today) / 86400000);
    if (diff < 0)  return { label: `${Math.abs(diff)}d overdue`, color: 'var(--error)' };
    if (diff === 0) return { label: 'Due today',                  color: 'var(--warning)' };
    if (diff === 1) return { label: 'Due tomorrow',               color: 'var(--warning)' };
    return { label: `Due in ${diff}d`,                            color: 'var(--text-muted)' };
};

const TodoPanel = ({ collapsed, onToggleCollapse }) => {
    const [todos, setTodos]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [newText, setNewText]       = useState('');
    const [newPriority, setNewPriority] = useState('medium');
    const [newDueDate, setNewDueDate] = useState('');
    const [adding, setAdding]         = useState(false);
    const [showForm, setShowForm]     = useState(false);
    const [hoveredId, setHoveredId]   = useState(null);
    const [editingId, setEditingId]   = useState(null);
    const [editText, setEditText]     = useState('');

    useEffect(() => { fetchTodos(); }, []);

    const fetchTodos = async () => {
        try {
            const res = await API.get('/todos');
            setTodos(res.data.todos);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newText.trim()) return;
        setAdding(true);
        try {
            const res = await API.post('/todos', {
                text: newText.trim(),
                priority: newPriority,
                due_date: newDueDate || null
            });
            setTodos(prev => [res.data.todo, ...prev]);
            setNewText(''); setNewDueDate(''); setNewPriority('medium');
            setShowForm(false);
        } catch (e) { console.error(e); }
        finally { setAdding(false); }
    };

    const handleToggle = async (todo) => {
        try {
            const res = await API.patch(`/todos/${todo.id}`, { completed: !todo.completed });
            setTodos(prev => prev.map(t => t.id === todo.id ? res.data.todo : t)
                .sort((a, b) => {
                    if (a.completed !== b.completed) return a.completed ? 1 : -1;
                    const po = { high: 0, medium: 1, low: 2 };
                    return (po[a.priority] || 1) - (po[b.priority] || 1);
                })
            );
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/todos/${id}`);
            setTodos(prev => prev.filter(t => t.id !== id));
        } catch (e) { console.error(e); }
    };

    const handleEditSave = async (todo) => {
        if (!editText.trim()) return;
        try {
            const res = await API.patch(`/todos/${todo.id}`, { text: editText.trim() });
            setTodos(prev => prev.map(t => t.id === todo.id ? res.data.todo : t));
            setEditingId(null);
        } catch (e) { console.error(e); }
    };

    const done  = todos.filter(t => t.completed).length;
    const total = todos.length;

    const glassCard = {
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: '20px',
        boxShadow: '0 4px 20px var(--shadow)',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
    };

    return (
        <div style={glassCard}>
            {/* Header — always visible, click to collapse */}
            <div
                onClick={onToggleCollapse}
                style={{
                    padding: '16px 20px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderBottom: collapsed ? 'none' : '1px solid var(--glass-border)',
                    transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>📋</span>
                    <div>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Study Tasks</p>
                        {total > 0 && (
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                                {done}/{total} done
                            </p>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Progress pill */}
                    {total > 0 && (
                        <div style={{
                            width: '48px', height: '6px', borderRadius: '3px',
                            backgroundColor: 'var(--border)', overflow: 'hidden'
                        }}>
                            <div style={{
                                height: '100%', borderRadius: '3px',
                                width: `${Math.round((done / total) * 100)}%`,
                                background: 'var(--gradient-accent)',
                                transition: 'width 0.4s ease'
                            }} />
                        </div>
                    )}
                    <span style={{
                        fontSize: '11px', color: 'var(--text-muted)',
                        transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s', display: 'inline-block'
                    }}>▼</span>
                </div>
            </div>

            {/* Body — hidden when collapsed */}
            {!collapsed && (
                <div style={{ padding: '14px 20px' }}>

                    {/* Add button */}
                    {!showForm ? (
                        <button
                            onClick={() => setShowForm(true)}
                            style={{
                                width: '100%', padding: '9px', marginBottom: '14px',
                                background: 'transparent',
                                border: '1.5px dashed var(--accent)',
                                borderRadius: '10px', color: 'var(--accent-text)',
                                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-light)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            + Add task
                        </button>
                    ) : (
                        /* Add form */
                        <form onSubmit={handleAdd} style={{ marginBottom: '14px' }}>
                            <input
                                autoFocus
                                type="text"
                                value={newText}
                                onChange={e => setNewText(e.target.value)}
                                placeholder="What do you need to study?"
                                style={{
                                    width: '100%', padding: '9px 12px', borderRadius: '8px',
                                    border: '1.5px solid var(--input-border)', fontSize: '13px',
                                    outline: 'none', boxSizing: 'border-box', marginBottom: '8px',
                                    background: 'var(--glass-bg)', color: 'var(--text-primary)'
                                }}
                            />
                            {/* Priority + Due date row */}
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                {PRIORITIES.map(p => (
                                    <button key={p.key} type="button" onClick={() => setNewPriority(p.key)} style={{
                                        padding: '4px 10px', borderRadius: '20px', border: 'none',
                                        fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                                        background: newPriority === p.key ? p.color : p.bg,
                                        color: newPriority === p.key ? '#fff' : p.color,
                                        transition: 'all 0.15s'
                                    }}>{p.label}</button>
                                ))}
                                <input
                                    type="date"
                                    value={newDueDate}
                                    onChange={e => setNewDueDate(e.target.value)}
                                    style={{
                                        marginLeft: 'auto', padding: '4px 8px', borderRadius: '8px',
                                        border: '1px solid var(--input-border)', fontSize: '11px',
                                        background: 'var(--glass-bg)', color: 'var(--text-primary)',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button type="submit" disabled={adding || !newText.trim()} style={{
                                    flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                                    background: 'var(--gradient-accent)', color: '#fff',
                                    fontSize: '13px', fontWeight: '700',
                                    cursor: adding || !newText.trim() ? 'not-allowed' : 'pointer',
                                    opacity: !newText.trim() ? 0.5 : 1
                                }}>{adding ? 'Adding...' : 'Add'}</button>
                                <button type="button" onClick={() => { setShowForm(false); setNewText(''); setNewDueDate(''); setNewPriority('medium'); }} style={{
                                    padding: '8px 14px', borderRadius: '8px',
                                    border: '1px solid var(--border)', background: 'transparent',
                                    color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer'
                                }}>Cancel</button>
                            </div>
                        </form>
                    )}

                    {/* Todo list */}
                    {loading ? (
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>Loading...</p>
                    ) : todos.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <p style={{ fontSize: '28px', marginBottom: '6px' }}>🎯</p>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No tasks yet. Add something to study!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '360px', overflowY: 'auto', paddingRight: '2px' }}>
                            {todos.map(todo => {
                                const p = priorityOf(todo.priority);
                                const due = formatDue(todo.due_date);
                                const isHovered = hoveredId === todo.id;
                                const isEditing = editingId === todo.id;
                                return (
                                    <div
                                        key={todo.id}
                                        onMouseEnter={() => setHoveredId(todo.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                        style={{
                                            display: 'flex', alignItems: 'flex-start', gap: '10px',
                                            padding: '10px 12px', borderRadius: '10px',
                                            background: todo.completed ? 'transparent' : 'var(--bg-hover)',
                                            border: `1px solid ${todo.completed ? 'var(--border-light)' : 'var(--border)'}`,
                                            transition: 'all 0.15s', opacity: todo.completed ? 0.6 : 1
                                        }}
                                    >
                                        {/* Checkbox */}
                                        <button
                                            onClick={() => handleToggle(todo)}
                                            style={{
                                                width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
                                                border: `2px solid ${todo.completed ? 'var(--success)' : p.color}`,
                                                background: todo.completed ? 'var(--success)' : 'transparent',
                                                cursor: 'pointer', marginTop: '1px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.15s'
                                            }}
                                        >
                                            {todo.completed && <span style={{ color: '#fff', fontSize: '10px', fontWeight: '800' }}>✓</span>}
                                        </button>

                                        {/* Text + meta */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            {isEditing ? (
                                                <input
                                                    autoFocus
                                                    value={editText}
                                                    onChange={e => setEditText(e.target.value)}
                                                    onBlur={() => handleEditSave(todo)}
                                                    onKeyDown={e => { if (e.key === 'Enter') handleEditSave(todo); if (e.key === 'Escape') setEditingId(null); }}
                                                    style={{
                                                        width: '100%', padding: '2px 6px', borderRadius: '4px',
                                                        border: '1px solid var(--accent)', fontSize: '13px',
                                                        background: 'var(--glass-bg)', color: 'var(--text-primary)',
                                                        outline: 'none', boxSizing: 'border-box'
                                                    }}
                                                />
                                            ) : (
                                                <p
                                                    onDoubleClick={() => { setEditingId(todo.id); setEditText(todo.text); }}
                                                    style={{
                                                        fontSize: '13px', color: 'var(--text-primary)',
                                                        fontWeight: '500', lineHeight: '1.4',
                                                        textDecoration: todo.completed ? 'line-through' : 'none',
                                                        wordBreak: 'break-word', cursor: 'text'
                                                    }}
                                                    title="Double-click to edit"
                                                >{todo.text}</p>
                                            )}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                                                {/* Priority badge */}
                                                <span style={{
                                                    fontSize: '10px', fontWeight: '700', padding: '1px 6px',
                                                    borderRadius: '20px', color: p.color, background: p.bg
                                                }}>{p.label}</span>
                                                {/* Due date */}
                                                {due && (
                                                    <span style={{ fontSize: '10px', color: due.color, fontWeight: '600' }}>
                                                        📅 {due.label}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Delete button — shows on hover */}
                                        {isHovered && !isEditing && (
                                            <button
                                                onClick={() => handleDelete(todo.id)}
                                                style={{
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    color: 'var(--text-muted)', fontSize: '14px',
                                                    padding: '0', flexShrink: 0, lineHeight: 1,
                                                    transition: 'color 0.15s'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
                                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                                title="Delete task"
                                            >✕</button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Done count footer */}
                    {done > 0 && total > 0 && (
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
                            🎉 {done} of {total} tasks completed
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default TodoPanel;
