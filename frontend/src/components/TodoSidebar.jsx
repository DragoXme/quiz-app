import React, { useState, useEffect, useRef } from 'react';
import API from '../api/axios';

// ── Sound effects ──
const playSound = (type) => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        if (type === 'check') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
        } else if (type === 'partial') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.setValueAtTime(550, ctx.currentTime + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
        } else if (type === 'uncheck') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, ctx.currentTime);
            osc.frequency.setValueAtTime(350, ctx.currentTime + 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
        } else if (type === 'add') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.setValueAtTime(800, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
        } else if (type === 'delete') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
        }
    } catch (e) { /* silent */ }
};

const PRIORITIES = [
    { key: 'high',   label: 'High',   color: '#EF4444', bg: 'rgba(239,68,68,0.13)' },
    { key: 'medium', label: 'Medium', color: '#F59E0B', bg: 'rgba(245,158,11,0.13)' },
    { key: 'low',    label: 'Low',    color: '#10B981', bg: 'rgba(16,185,129,0.13)' },
];
const priorityOf = (k) => PRIORITIES.find(p => p.key === k) || PRIORITIES[1];

const DAYS = [
    { val: 0, short: 'Su' }, { val: 1, short: 'Mo' }, { val: 2, short: 'Tu' },
    { val: 3, short: 'We' }, { val: 4, short: 'Th' }, { val: 5, short: 'Fr' },
    { val: 6, short: 'Sa' }
];

const formatDue = (dateStr) => {
    if (!dateStr) return null;
    const due = new Date(dateStr + 'T00:00:00');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const diff = Math.round((due - today) / 86400000);
    if (diff < 0)   return { label: `${Math.abs(diff)}d overdue`, color: '#EF4444' };
    if (diff === 0) return { label: 'Today',    color: '#F59E0B' };
    if (diff === 1) return { label: 'Tomorrow', color: '#F59E0B' };
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    return { label: days[due.getDay()], color: '#9898C0' };
};

// SVG Icons
const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
        <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
);
const CalIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
);
const RecurIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
        <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
);

// Status cycle: pending → partial → completed → pending
const STATUS_CONFIG = {
    pending:   { label: 'Pending',  icon: null,  color: 'var(--border)',   bg: 'transparent' },
    partial:   { label: 'Partial',  icon: '◑',   color: '#F59E0B',         bg: 'rgba(245,158,11,0.13)' },
    completed: { label: 'Done',     icon: '✓',   color: '#10B981',         bg: 'rgba(16,185,129,0.13)' },
};

// ── Partial note modal ──
const PartialModal = ({ todo, onSave, onClose }) => {
    const [note, setNote] = useState(todo.partial_note || '');
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={{ background: 'var(--dropdown-bg)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '340px', boxShadow: '0 20px 60px rgba(0,0,0,0.35)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Partial Progress</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>"{todo.text}"</p>
                <textarea
                    autoFocus
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="What's done? What's still pending?..."
                    rows={4}
                    style={{
                        width: '100%', padding: '10px 12px', borderRadius: '10px',
                        border: '1.5px solid var(--input-border)', fontSize: '13px',
                        background: 'var(--bg-input)', color: 'var(--text-primary)',
                        outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                        fontFamily: 'inherit', lineHeight: '1.5', marginBottom: '14px'
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--input-border)'}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => onSave(note)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: 'var(--gradient-accent)', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Save</button>
                    <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

const TodoSidebar = ({ open, onClose }) => {
    const [todos, setTodos]               = useState([]);
    const [loading, setLoading]           = useState(true);
    const [filter, setFilter]             = useState('all');
    const [partialTodo, setPartialTodo]   = useState(null);

    // Add form state
    const [newText, setNewText]           = useState('');
    const [newPriority, setNewPriority]   = useState('medium');
    const [newDueDate, setNewDueDate]     = useState('');
    const [isRecurring, setIsRecurring]   = useState(false);
    const [recurDays, setRecurDays]       = useState([]);
    const [adding, setAdding]             = useState(false);

    useEffect(() => { if (open) fetchTodos(); }, [open]);

    // Close on Escape key
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        if (open) window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    const fetchTodos = async () => {
        setLoading(true);
        try {
            const res = await API.get('/todos');
            setTodos(res.data.todos);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const sortTodos = (list) => [...list].sort((a, b) => {
        const so = { pending: 0, partial: 1, completed: 2 };
        if (so[a.status] !== so[b.status]) return so[a.status] - so[b.status];
        const po = { high: 0, medium: 1, low: 2 };
        return (po[a.priority] || 1) - (po[b.priority] || 1);
    });

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newText.trim()) return;
        if (isRecurring && recurDays.length === 0) { alert('Select at least one day for recurring task.'); return; }
        setAdding(true);
        try {
            const res = await API.post('/todos', {
                text: newText.trim(),
                priority: newPriority,
                due_date: isRecurring ? null : (newDueDate || null),
                is_recurring: isRecurring,
                recur_days: isRecurring ? recurDays : null
            });
            const newTodo = { ...res.data.todo, instanceId: res.data.todo.id };
            setTodos(prev => sortTodos([newTodo, ...prev]));
            setNewText(''); setNewDueDate(''); setNewPriority('medium');
            setIsRecurring(false); setRecurDays([]);
            playSound('add');
        } catch (e) { console.error(e); }
        finally { setAdding(false); }
    };

    const handleStatusCycle = async (todo) => {
        const cycle = { pending: 'partial', partial: 'completed', completed: 'pending' };
        const nextStatus = cycle[todo.status] || 'pending';

        // If cycling to partial, show note modal first
        if (nextStatus === 'partial') {
            setPartialTodo(todo);
            return;
        }

        playSound(nextStatus === 'completed' ? 'check' : nextStatus === 'partial' ? 'partial' : 'uncheck');
        try {
            const res = await API.patch(`/todos/${todo.instanceId}`, {
                status: nextStatus,
                partial_note: nextStatus === 'pending' ? null : todo.partial_note
            });
            setTodos(prev => sortTodos(prev.map(t => t.instanceId === todo.instanceId ? { ...res.data.todo, instanceId: todo.instanceId } : t)));
        } catch (e) { console.error(e); }
    };

    const handlePartialSave = async (note) => {
        const todo = partialTodo;
        setPartialTodo(null);
        playSound('partial');
        try {
            const res = await API.patch(`/todos/${todo.instanceId}`, { status: 'partial', partial_note: note });
            setTodos(prev => sortTodos(prev.map(t => t.instanceId === todo.instanceId ? { ...res.data.todo, instanceId: todo.instanceId } : t)));
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (todo) => {
        playSound('delete');
        try {
            await API.delete(`/todos/${todo.instanceId}`);
            // Remove all instances of the same base todo if recurring
            const baseId = todo.id;
            setTodos(prev => prev.filter(t => t.id !== baseId));
        } catch (e) { console.error(e); }
    };

    const toggleRecurDay = (day) => {
        setRecurDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    };

    const completed = todos.filter(t => t.status === 'completed').length;
    const partial   = todos.filter(t => t.status === 'partial').length;
    const total     = todos.length;
    const pct       = total > 0 ? Math.round(((completed + partial * 0.5) / total) * 100) : 0;

    const filtered = todos.filter(t =>
        filter === 'all'      ? true :
        filter === 'pending'  ? t.status === 'pending' :
        filter === 'partial'  ? t.status === 'partial' :
        filter === 'done'     ? t.status === 'completed' : true
    );

    if (!open) return null;

    const iBtn = (active) => ({
        padding: '3px 8px', borderRadius: '20px', border: 'none',
        fontSize: '11px', fontWeight: '700', cursor: 'pointer',
        transition: 'all 0.15s', flexShrink: 0
    });

    return (
        <>
            {/* Backdrop */}
            <div onClick={onClose} style={{
                position: 'fixed', inset: 0, zIndex: 299,
                background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(2px)',
                animation: 'fadeIn 0.2s ease'
            }} />

            {/* Partial note modal — above sidebar */}
            {partialTodo && (
                <PartialModal
                    todo={partialTodo}
                    onSave={handlePartialSave}
                    onClose={() => setPartialTodo(null)}
                />
            )}

            {/* Sidebar */}
            <div style={{
                position: 'fixed', top: 0, left: 0, bottom: 0,
                width: 'min(320px, 92vw)', zIndex: 300,
                backgroundColor: 'var(--sidebar-bg)',
                borderRight: '1px solid var(--sidebar-border)',
                boxShadow: '4px 0 32px rgba(0,0,0,0.2)',
                display: 'flex', flexDirection: 'column',
                animation: 'sidebarIn 0.28s cubic-bezier(0.4,0,0.2,1) forwards'
            }}>

                {/* ── Header ── */}
                <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--sidebar-border)', background: 'var(--gradient-card)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: total > 0 ? '12px' : '0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>📋</span>
                            <div>
                                <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>Study Tasks</p>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                                    {completed} done · {partial} partial · {total - completed - partial} pending
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} style={{
                            width: '30px', height: '30px', borderRadius: '8px', border: '1px solid var(--border)',
                            background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '15px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>✕</button>
                    </div>
                    {total > 0 && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>PROGRESS</span>
                                <span style={{ fontSize: '10px', color: 'var(--accent-text)', fontWeight: '700' }}>{pct}%</span>
                            </div>
                            <div style={{ height: '5px', borderRadius: '3px', background: 'var(--border)', overflow: 'hidden' }}>
                                <div style={{ height: '100%', borderRadius: '3px', width: `${pct}%`, background: pct === 100 ? '#10B981' : 'var(--gradient-accent)', transition: 'width 0.5s ease' }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Add Task Form ── */}
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--sidebar-border)', flexShrink: 0 }}>
                    <form onSubmit={handleAdd}>
                        {/* Text + submit */}
                        <div style={{ display: 'flex', gap: '7px', marginBottom: '8px' }}>
                            <input
                                type="text"
                                value={newText}
                                onChange={e => setNewText(e.target.value)}
                                placeholder="Add a study task..."
                                style={{
                                    flex: 1, padding: '8px 11px', borderRadius: '10px',
                                    border: '1.5px solid var(--input-border)', fontSize: '13px',
                                    outline: 'none', background: 'var(--bg-input)', color: 'var(--text-primary)',
                                    minWidth: 0
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                onBlur={e => e.target.style.borderColor = 'var(--input-border)'}
                            />
                            <button type="submit" disabled={adding || !newText.trim()} style={{
                                width: '36px', height: '36px', borderRadius: '10px', border: 'none',
                                background: newText.trim() ? 'var(--gradient-accent)' : 'var(--border)',
                                color: '#fff', fontSize: '20px', cursor: newText.trim() ? 'pointer' : 'not-allowed',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>+</button>
                        </div>

                        {/* Priority pills */}
                        <div style={{ display: 'flex', gap: '5px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            {PRIORITIES.map(p => (
                                <button key={p.key} type="button" onClick={() => setNewPriority(p.key)} style={{
                                    ...iBtn(newPriority === p.key),
                                    background: newPriority === p.key ? p.color : p.bg,
                                    color: newPriority === p.key ? '#fff' : p.color,
                                }}>● {p.label}</button>
                            ))}
                        </div>

                        {/* Recurring toggle + days */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: isRecurring ? '8px' : '0', flexWrap: 'wrap' }}>
                            <button type="button" onClick={() => { setIsRecurring(p => !p); setRecurDays([]); setNewDueDate(''); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    padding: '4px 10px', borderRadius: '20px', border: 'none',
                                    background: isRecurring ? 'var(--accent)' : 'var(--accent-light)',
                                    color: isRecurring ? '#fff' : 'var(--accent-text)',
                                    fontSize: '11px', fontWeight: '700', cursor: 'pointer'
                                }}>
                                <RecurIcon /> Recurring
                            </button>

                            {!isRecurring && (
                                <div style={{ marginLeft: 'auto', position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)}
                                        style={{
                                            padding: '4px 8px 4px 24px', borderRadius: '8px',
                                            border: `1.5px solid ${newDueDate ? 'var(--accent)' : 'var(--input-border)'}`,
                                            fontSize: '11px', background: 'var(--bg-input)',
                                            color: newDueDate ? 'var(--text-primary)' : 'var(--text-muted)',
                                            outline: 'none', width: '128px', colorScheme: 'inherit', cursor: 'pointer'
                                        }} />
                                    <span style={{ position: 'absolute', left: '6px', pointerEvents: 'none', color: newDueDate ? 'var(--accent)' : 'var(--text-muted)', display: 'flex' }}>
                                        <CalIcon />
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Day selector for recurring */}
                        {isRecurring && (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {DAYS.map(d => (
                                    <button key={d.val} type="button" onClick={() => toggleRecurDay(d.val)} style={{
                                        width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                                        background: recurDays.includes(d.val) ? 'var(--gradient-accent)' : 'var(--bg-hover)',
                                        color: recurDays.includes(d.val) ? '#fff' : 'var(--text-muted)',
                                        fontSize: '11px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s'
                                    }}>{d.short}</button>
                                ))}
                            </div>
                        )}
                    </form>
                </div>

                {/* ── Filter tabs ── */}
                <div style={{ display: 'flex', gap: '3px', padding: '8px 12px', borderBottom: '1px solid var(--sidebar-border)', flexShrink: 0 }}>
                    {[
                        { key: 'all',     label: `All (${total})` },
                        { key: 'pending', label: `Pending (${total - completed - partial})` },
                        { key: 'partial', label: `Partial (${partial})` },
                        { key: 'done',    label: `Done (${completed})` },
                    ].map(f => (
                        <button key={f.key} onClick={() => setFilter(f.key)} style={{
                            flex: 1, padding: '5px 2px', borderRadius: '7px', border: 'none',
                            background: filter === f.key ? 'var(--accent-light)' : 'transparent',
                            color: filter === f.key ? 'var(--accent-text)' : 'var(--text-muted)',
                            fontSize: '10px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>{f.label}</button>
                    ))}
                </div>

                {/* ── List ── */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', WebkitOverflowScrolling: 'touch' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '13px' }}>Loading tasks...</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                            <p style={{ fontSize: '30px', marginBottom: '8px' }}>🎯</p>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No tasks here yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {filtered.map(todo => {
                                const p = priorityOf(todo.priority);
                                const due = formatDue(todo.due_date);
                                const sc = STATUS_CONFIG[todo.status] || STATUS_CONFIG.pending;
                                const isDone = todo.status === 'completed';
                                const isPartial = todo.status === 'partial';

                                return (
                                    <div key={todo.instanceId} className="todo-item-in" style={{
                                        display: 'flex', alignItems: 'flex-start', gap: '8px',
                                        padding: '10px 10px', borderRadius: '12px',
                                        background: isDone ? 'transparent' : 'var(--glass-bg)',
                                        border: `1px solid ${isDone ? 'var(--border-light)' : isPartial ? 'rgba(245,158,11,0.35)' : 'var(--border)'}`,
                                        opacity: isDone ? 0.5 : 1, transition: 'all 0.15s'
                                    }}>
                                        {/* Priority bar */}
                                        <div style={{ width: '3px', borderRadius: '2px', alignSelf: 'stretch', flexShrink: 0, background: p.color, minHeight: '20px' }} />

                                        {/* Status button — cycles pending→partial→done */}
                                        <button
                                            onClick={() => handleStatusCycle(todo)}
                                            title={`Status: ${todo.status} — click to cycle`}
                                            style={{
                                                width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                                                border: `2px solid ${isDone ? '#10B981' : isPartial ? '#F59E0B' : 'var(--border)'}`,
                                                background: isDone ? '#10B981' : isPartial ? 'rgba(245,158,11,0.2)' : 'transparent',
                                                cursor: 'pointer', marginTop: '1px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '11px', fontWeight: '700',
                                                color: isDone ? '#fff' : isPartial ? '#F59E0B' : 'transparent',
                                                transition: 'all 0.2s', padding: 0
                                            }}
                                        >
                                            {isDone ? (
                                                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            ) : isPartial ? '◑' : ''}
                                        </button>

                                        {/* Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{
                                                fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)',
                                                lineHeight: '1.4', wordBreak: 'break-word',
                                                textDecoration: isDone ? 'line-through' : 'none'
                                            }}>{todo.text}</p>

                                            {/* Partial note */}
                                            {isPartial && todo.partial_note && (
                                                <p style={{
                                                    fontSize: '11px', color: '#F59E0B', marginTop: '4px',
                                                    lineHeight: '1.4', fontStyle: 'italic',
                                                    background: 'rgba(245,158,11,0.08)', borderRadius: '6px',
                                                    padding: '4px 6px', wordBreak: 'break-word'
                                                }}>📝 {todo.partial_note}</p>
                                            )}

                                            {/* Meta row */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '20px', color: p.color, background: p.bg }}>
                                                    {p.label}
                                                </span>
                                                {todo.is_recurring && (
                                                    <span style={{ fontSize: '10px', color: 'var(--accent-text)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: '600' }}>
                                                        <RecurIcon /> Recurring
                                                    </span>
                                                )}
                                                {due && (
                                                    <span style={{ fontSize: '10px', color: due.color, display: 'flex', alignItems: 'center', gap: '3px', fontWeight: '600' }}>
                                                        <CalIcon /> {due.label}
                                                    </span>
                                                )}
                                                {/* Edit partial note button */}
                                                {isPartial && (
                                                    <button onClick={() => setPartialTodo(todo)} style={{
                                                        fontSize: '10px', padding: '1px 6px', borderRadius: '6px',
                                                        border: '1px solid rgba(245,158,11,0.4)', background: 'transparent',
                                                        color: '#F59E0B', cursor: 'pointer', fontWeight: '600'
                                                    }}>Edit note</button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Delete */}
                                        <button
                                            onClick={() => handleDelete(todo)}
                                            title="Delete task"
                                            style={{
                                                width: '28px', height: '28px', borderRadius: '7px',
                                                border: '1px solid transparent', background: 'transparent',
                                                color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.15s', marginTop: '-1px'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--error-light)'; e.currentTarget.style.borderColor = 'var(--error)'; e.currentTarget.style.color = 'var(--error)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                            onTouchStart={e => { e.currentTarget.style.background = 'var(--error-light)'; e.currentTarget.style.color = 'var(--error)'; }}
                                            onTouchEnd={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
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
                {total > 0 && (
                    <div style={{ padding: '10px 14px', borderTop: '1px solid var(--sidebar-border)', textAlign: 'center', flexShrink: 0 }}>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {pct === 100 ? '🎉 All done! Amazing work!' : `🔥 ${total - completed} task${total - completed !== 1 ? 's' : ''} left`}
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default TodoSidebar;
