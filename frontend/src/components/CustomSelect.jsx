import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

const CustomSelect = ({ value, onChange, options, placeholder = 'Select...', style = {} }) => {
    const [open, setOpen] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (
                triggerRef.current && !triggerRef.current.contains(e.target) &&
                dropdownRef.current && !dropdownRef.current.contains(e.target)
            ) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Recalculate position when opening
    const handleOpen = () => {
        if (!open && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + window.scrollY + 6,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
        setOpen(prev => !prev);
    };

    const selected = options.find(o => o.value === value);

    // Render dropdown via portal so it's always above everything
    const dropdown = open && ReactDOM.createPortal(
        <div
            ref={dropdownRef}
            style={{
                position: 'absolute',
                top: dropdownPos.top,
                left: dropdownPos.left,
                width: dropdownPos.width,
                backgroundColor: 'var(--dropdown-bg)',
                border: '1.5px solid var(--accent)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
                zIndex: 99999,
                overflow: 'hidden'
            }}
        >
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
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'background 0.1s'
                    }}
                    onMouseEnter={e => {
                        if (opt.value !== value) e.currentTarget.style.background = 'var(--bg-hover)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = opt.value === value ? 'var(--accent-light)' : 'transparent';
                    }}
                >
                    {opt.label}
                    {opt.value === value && <span style={{ fontSize: '12px', color: 'var(--accent)' }}>✓</span>}
                </div>
            ))}
        </div>,
        document.body
    );

    return (
        <div ref={triggerRef} style={{ position: 'relative', ...style }}>
            <button
                type="button"
                onClick={handleOpen}
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
                    transition: 'transform 0.2s', flexShrink: 0
                }}>▼</span>
            </button>
            {dropdown}
        </div>
    );
};

export default CustomSelect;
