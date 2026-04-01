import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';

// ── Sound effects using Web Audio API (no external files needed) ──
const playSound = (type) => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);

        if (type === 'check') {
            // Pleasant ascending chime for completing a task
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            osc.type = 'sine';
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.4);
        } else if (type === 'uncheck') {
            // Soft descending for unchecking
            osc.frequency.setValueAtTime(500, ctx.currentTime);
            osc.frequency.setValueAtTime(350, ctx.currentTime + 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc.type = 'sine';
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.3);
        } else if (type === 'add') {
            // Quick positive pop for adding
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.setValueAtTime(800, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc.type = 'triangle';
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.2);
        } else if (type === 'delete') {
            // Soft swoosh for delete
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc.type = 'sine';
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.2);
        }
    } catch (e) {
        // Web Audio not available — silently ignore
    }
};

const PRIORITIES = [
    { key: 'high',   label: 'High',   color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   dot: '#EF4444' },
    { key: 'medium', label: 'Medium', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  dot: '#F59E0B' },
    { key: 'low',    label: 'Low',    color: '#10B981', bg: 'rgba(16,185,129,0.12)',  dot: '#10B981' },
];

const priorityOf = (key) => PRIORITIES.find(p => p.key === key) || PRIORITIES[1];

const formatDue = (dateStr) => {
    if (!dateStr) return null;
    const due = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((due - today) / 86400000);
    if (diff < 0)   return { label: `${Math.abs(diff)}d overdue`, color: '#EF4444' };
    if (diff === 0) return { label: 'Today',                      color: '#F59E0B' };
    if (diff === 1) return { label: 'Tomorrow',                   color: '#F59E0B' };
    return           { label: `${diff}d left`,                    color: '#9898C0' };
};

// SVG trash icon — clean, minimal
const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14H6L5 6"/>
        <path d="M10 11v6M14 11v6"/>
        <path d="M9 6V4h6v2"/>
    </svg>
);

// SVG calendar icon
const CalIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
);

const TodoSidebar = ({ open, onClose }) => {
    const [todos, setTodos]             = useState([]);
    const [loading, setLoading]         = useState(true);
    const [newText, setNewText]         = useState('');
    const [newPriority, setNewPriority] = useState('medium');
    const [newDueDate, setNewDueDate]   = useState('');
    const [adding, setAdding]           = useState(false);
    const [editingId, setEditingId]     = useState(null);
    const [editText, setEditText]       = useState('');
    const [filter, setFilter]           = useState('all'); // all | active | done

    useEffect(() => { if (open) fetchTodos(); }, [open]);

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
            playSound('add');
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
            playSound(todo.completed ? 'uncheck' : 'check');
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/todos/${id}`);
            setTodos(prev => prev.filter(t => t.id !== id));
            playSound('delete');
        } catch (e) { console.error(e); }
    };

    const handleEditSave = async (todo) => {
        if (!editText.trim()) { setEditingId(null); return; }
        try {
            const res = await API.patch(`/todos/${todo.id}`, { text: editText.trim() });
            setTodos(prev => prev.map(t => t.id === todo.id ? res.data.todo : t));
        } catch (e) { console.error(e); }
        finally { setEditingId(null); }
    };

    const done  = todos.filter(t => t.completed).length;
    const total = todos.length;
    const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

    const filtered = todos.filter(t =>
        filter === 'all' ? true : filter === 'active' ? !t.completed : t.completed
    );

    if (!open) return null;

    return (
        <>
            {/* Backdrop — click to close */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 299,
                    background: 'rgba(0,0,0,0.25)',
                    backdropFilter: 'blur(2px)',
                    animation: 'fadeIn 0.2s ease'
                }}
            />

            {/* Sidebar panel */}
            <div style={{
                position: 'fixed', top: 0, left: 0, bottom: 0,
                width: '320px', zIndex: 300,
                backgroundColor: 'var(--sidebar-bg)',
                borderRight: '1px solid var(--sidebar-border)',
                boxShadow: '4px 0 32px rgba(0,0,0,0.18)',
                display: 'flex', flexDirection: 'column',
                animation: 'sidebarIn 0.28s cubic-bezier(0.4,0,0.2,1) forwards'
            }}>

                {/* ── Header ── */}
                <div style={{
                    padding: '20px 20px 16px',
                    borderBottom: '1px solid var(--sidebar-border)',
                    background: 'var(--gradient-card)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>📋</span>
                            <div>
                                <p style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>Study Tasks</p>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                                    {done}/{total} completed
                                </p>
                            </div>
                        </div>
                        {/* Close button */}
                        <button onClick={onClose} style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            border: '1px solid var(--border)', background: 'transparent',
                            color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >✕</button>
                    </div>

                    {/* Progress bar */}
                    {total > 0 && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>PROGRESS</span>
                                <span style={{ fontSize: '10px', color: 'var(--accent-text)', fontWeight: '700' }}>{pct}%</span>
                            </div>
                            <div style={{ height: '6px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', borderRadius: '3px',
                                    width: `${pct}%`,
                                    background: pct === 100 ? '#10B981' : 'var(--gradient-accent)',
                                    transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)'
                                }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Add task form ── */}
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--sidebar-border)' }}>
                    <form onSubmit={handleAdd}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <input
                                type="text"
                                value={newText}
                                onChange={e => setNewText(e.target.value)}
                                placeholder="Add a study task..."
                                style={{
                                    flex: 1, padding: '9px 12px', borderRadius: '10px',
                                    border: '1.5px solid var(--input-border)', fontSize: '13px',
                                    outline: 'none', background: 'var(--bg-input)',
                                    color: 'var(--text-primary)', transition: 'border-color 0.15s'
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                onBlur={e => e.target.style.borderColor = 'var(--input-border)'}
                            />
                            <button type="submit" disabled={adding || !newText.trim()} style={{
                                width: '38px', height: '38px', borderRadius: '10px', border: 'none',
                                background: newText.trim() ? 'var(--gradient-accent)' : 'var(--border)',
                                color: '#fff', fontSize: '18px', cursor: newText.trim() ? 'pointer' : 'not-allowed',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0, transition: 'all 0.15s'
                            }}>+</button>
                        </div>

                        {/* Priority + Date row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {PRIORITIES.map(p => (
                                <button key={p.key} type="button" onClick={() => setNewPriority(p.key)} style={{
                                    padding: '4px 10px', borderRadius: '20px', border: 'none',
                                    fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                                    background: newPriority === p.key ? p.color : p.bg,
                                    color: newPriority === p.key ? '#fff' : p.color,
                                    transition: 'all 0.15s', flexShrink: 0
                                }}>{p.label}</button>
                            ))}
                            {/* Native date input with calendar icon overlay */}
                            <div style={{ marginLeft: 'auto', position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="date"
                                    value={newDueDate}
                                    onChange={e => setNewDueDate(e.target.value)}
                                    title="Set due date"
                                    style={{
                                        padding: '4px 8px 4px 26px',
                                        borderRadius: '8px',
                                        border: `1.5px solid ${newDueDate ? 'var(--accent)' : 'var(--input-border)'}`,
                                        fontSize: '11px', background: 'var(--bg-input)',
                                        color: newDueDate ? 'var(--text-primary)' : 'var(--text-muted)',
                                        outline: 'none', cursor: 'pointer', width: '130px',
                                        colorScheme: 'inherit'
                                    }}
                                />
                                <span style={{
                                    position: 'absolute', left: '7px',
                                    color: newDueDate ? 'var(--accent)' : 'var(--text-muted)',
                                    pointerEvents: 'none', display: 'flex'
                                }}><CalIcon /></span>
                            </div>
                        </div>
                    </form>
                </div>

                {/* ── Filter tabs ── */}
                <div style={{
                    display: 'flex', gap: '4px', padding: '10px 16px',
                    borderBottom: '1px solid var(--sidebar-border)'
                }}>
                    {['all', 'active', 'done'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} style={{
                            flex: 1, padding: '5px', borderRadius: '8px', border: 'none',
                            background: filter === f ? 'var(--accent-light)' : 'transparent',
                            color: filter === f ? 'var(--accent-text)' : 'var(--text-muted)',
                            fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                            textTransform: 'capitalize', transition: 'all 0.15s'
                        }}>
                            {f === 'all' ? `All (${total})` : f === 'active' ? `Active (${total - done})` : `Done (${done})`}
                        </button>
                    ))}
                </div>

                {/* ── Todo list ── */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '13px' }}>Loading tasks...</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                            <p style={{ fontSize: '32px', marginBottom: '8px' }}>{filter === 'done' ? '🎉' : '🎯'}</p>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                {filter === 'done' ? 'No completed tasks yet.' : filter === 'active' ? 'No active tasks!' : 'No tasks yet.\nAdd something to study!'}
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {filtered.map(todo => {
                                const p = priorityOf(todo.priority);
                                const due = formatDue(todo.due_date);
                                const isEditing = editingId === todo.id;

                                return (
                                    <div
                                        key={todo.id}
                                        className="todo-item-in"
                                        style={{
                                            display: 'flex', alignItems: 'flex-start', gap: '10px',
                                            padding: '10px 12px', borderRadius: '12px',
                                            background: todo.completed ? 'transparent' : 'var(--glass-bg)',
                                            border: `1px solid ${todo.completed ? 'var(--border-light)' : 'var(--border)'}`,
                                            transition: 'all 0.15s',
                                            opacity: todo.completed ? 0.55 : 1,
                                            position: 'relative'
                                        }}
                                    >
                                        {/* Priority dot */}
                                        <div style={{
                                            width: '3px', borderRadius: '2px',
                                            alignSelf: 'stretch', flexShrink: 0,
                                            background: p.dot, minHeight: '20px'
                                        }} />

                                        {/* Custom checkbox */}
                                        <button
                                            onClick={() => handleToggle(todo)}
                                            className={todo.completed ? '' : ''}
                                            style={{
                                                width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0,
                                                border: `2px solid ${todo.completed ? p.dot : 'var(--border)'}`,
                                                background: todo.completed ? p.dot : 'transparent',
                                                cursor: 'pointer', marginTop: '1px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {todo.completed && (
                                                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            )}
                                        </button>

                                        {/* Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            {isEditing ? (
                                                <input
                                                    autoFocus
                                                    value={editText}
                                                    onChange={e => setEditText(e.target.value)}
                                                    onBlur={() => handleEditSave(todo)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') handleEditSave(todo);
                                                        if (e.key === 'Escape') setEditingId(null);
                                                    }}
                                                    style={{
                                                        width: '100%', padding: '2px 6px', borderRadius: '4px',
                                                        border: '1.5px solid var(--accent)', fontSize: '13px',
                                                        background: 'var(--bg-input)', color: 'var(--text-primary)',
                                                        outline: 'none', boxSizing: 'border-box'
                                                    }}
                                                />
                                            ) : (
                                                <p
                                                    onDoubleClick={() => { setEditingId(todo.id); setEditText(todo.text); }}
                                                    title="Double-click to edit"
                                                    style={{
                                                        fontSize: '13px', fontWeight: '500',
                                                        color: 'var(--text-primary)', lineHeight: '1.4',
                                                        textDecoration: todo.completed ? 'line-through' : 'none',
                                                        wordBreak: 'break-word', cursor: 'default'
                                                    }}
                                                >{todo.text}</p>
                                            )}

                                            {/* Meta row */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px', flexWrap: 'wrap' }}>
                                                <span style={{
                                                    fontSize: '10px', fontWeight: '700',
                                                    padding: '2px 7px', borderRadius: '20px',
                                                    color: p.color, background: p.bg
                                                }}>{p.label}</span>
                                                {due && (
                                                    <span style={{
                                                        fontSize: '10px', fontWeight: '600',
                                                        color: due.color, display: 'flex', alignItems: 'center', gap: '3px'
                                                    }}>
                                                        <CalIcon /> {due.label}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Delete button — always visible, right side */}
                                        <button
                                            onClick={() => handleDelete(todo.id)}
                                            title="Delete task"
                                            style={{
                                                width: '28px', height: '28px', borderRadius: '7px',
                                                border: '1px solid transparent',
                                                background: 'transparent', color: 'var(--text-muted)',
                                                cursor: 'pointer', flexShrink: 0, marginTop: '-2px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.15s'
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = 'var(--error-light)';
                                                e.currentTarget.style.borderColor = 'var(--error)';
                                                e.currentTarget.style.color = 'var(--error)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.borderColor = 'transparent';
                                                e.currentTarget.style.color = 'var(--text-muted)';
                                            }}
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                {done > 0 && (
                    <div style={{
                        padding: '12px 16px', borderTop: '1px solid var(--sidebar-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {pct === 100 ? '🎉 All tasks done! Great work!' : `🔥 Keep going — ${total - done} left`}
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default TodoSidebar;
