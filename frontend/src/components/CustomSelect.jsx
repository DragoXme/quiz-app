import React, { useState, useRef, useEffect } from 'react';

const CustomSelect = ({ value, onChange, options, placeholder = 'Select...', style = {} }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const selected = options.find(o => o.value === value);

    return (
        <div ref={ref} style={{ position: 'relative', isolation: 'isolate', ...style }}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                style={{
                    width: '100%', padding: '9px 12px',
                    borderRadius: '10px',
                    border: `1.5px solid ${open ? 'var(--accent)' : 'var(--input-border)'}`,
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    color: selected ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontSize: '13px', fontWeight: '500',
                    cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: '8px',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                }}
            >
                <span>{selected ? selected.label : placeholder}</span>
                <span style={{
                    fontSize: '10px', color: 'var(--text-muted)',
                    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                    flexShrink: 0
                }}>▼</span>
            </button>

            {/* Dropdown — fully opaque for readability */}
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                    backgroundColor: 'var(--dropdown-bg)',
                    border: '1.5px solid var(--accent)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                    zIndex: 9999,
                    overflow: 'hidden'
                }}>
                    {options.map((opt, idx) => (
                        <div
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setOpen(false); }}
                            style={{
                                padding: '10px 13px',
                                fontSize: '13px',
                                fontWeight: opt.value === value ? '700' : '400',
                                color: opt.value === value ? 'var(--accent-text)' : 'var(--text-primary)',
                                backgroundColor: opt.value === value ? 'var(--accent-light)' : 'transparent',
                                cursor: 'pointer',
                                borderBottom: idx < options.length - 1 ? '1px solid var(--border-light)' : 'none',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'background 0.1s'
                            }}
                            onMouseEnter={e => {
                                if (opt.value !== value) e.currentTarget.style.background = 'var(--bg-hover)';
                            }}
                            onMouseLeave={e => {
                                if (opt.value !== value) e.currentTarget.style.background = 'transparent';
                                else e.currentTarget.style.background = 'var(--accent-light)';
                            }}
                        >
                            {opt.label}
                            {opt.value === value && <span style={{ fontSize: '12px', color: 'var(--accent)' }}>✓</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
