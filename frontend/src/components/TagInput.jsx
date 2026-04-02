import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import API from '../api/axios';

const TagInput = ({ selectedTags, onChange }) => {
    const [inputValue, setInputValue]       = useState('');
    const [suggestions, setSuggestions]     = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading]             = useState(false);
    const [showConfirm, setShowConfirm]     = useState(false);
    const [pendingTag, setPendingTag]       = useState('');
    const [dropdownPos, setDropdownPos]     = useState({ top: 0, left: 0, width: 0 });
    const inputRef      = useRef(null);
    const containerRef  = useRef(null);
    const dropdownRef   = useRef(null);

    // Reposition dropdown whenever it opens or window resizes
    const updateDropdownPos = () => {
        if (!inputRef.current) return;
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownPos({
            top:   rect.bottom + window.scrollY + 4,
            left:  rect.left   + window.scrollX,
            width: rect.width
        });
    };

    useEffect(() => {
        if (showSuggestions || showConfirm) updateDropdownPos();
    }, [showSuggestions, showConfirm]);

    useEffect(() => {
        window.addEventListener('resize', updateDropdownPos);
        return () => window.removeEventListener('resize', updateDropdownPos);
    }, []);

    // Close on click/touch outside
    useEffect(() => {
        const close = (e) => {
            const target = e.target || e.touches?.[0]?.target;
            if (
                containerRef.current && !containerRef.current.contains(target) &&
                dropdownRef.current  && !dropdownRef.current.contains(target)
            ) {
                setShowSuggestions(false);
                setShowConfirm(false);
            }
        };
        document.addEventListener('mousedown', close);
        document.addEventListener('touchstart', close);
        return () => {
            document.removeEventListener('mousedown', close);
            document.removeEventListener('touchstart', close);
        };
    }, []);

    const searchTags = async (query) => {
        if (!query.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            setShowConfirm(false);
            return;
        }
        setLoading(true);
        try {
            const res = await API.get(`/tags/search?query=${encodeURIComponent(query)}`);
            const filtered = res.data.tags.filter(t => !selectedTags.find(st => st.id === t.id));
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
            setShowConfirm(filtered.length === 0 && query.trim() !== '');
            updateDropdownPos();
        } catch {
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        setShowConfirm(false);
        searchTags(value);
    };

    const handleSelectTag = (tag) => {
        if (!selectedTags.find(t => t.id === tag.id)) {
            onChange([...selectedTags, tag]);
        }
        setInputValue('');
        setSuggestions([]);
        setShowSuggestions(false);
        setShowConfirm(false);
    };

    const handleCreateTag = async () => {
        const tagName = pendingTag || inputValue;
        if (!tagName.trim()) return;
        try {
            const res = await API.post('/tags', { name: tagName.trim() });
            const newTag = res.data.tag;
            if (!selectedTags.find(t => t.id === newTag.id)) {
                onChange([...selectedTags, newTag]);
            }
        } catch { /* tag might already exist */ }
        setInputValue('');
        setSuggestions([]);
        setShowSuggestions(false);
        setShowConfirm(false);
        setPendingTag('');
    };

    const handleRemoveTag = (tagId) => {
        onChange(selectedTags.filter(t => t.id !== tagId));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (showConfirm) {
                setPendingTag(inputValue);
                handleCreateTag();
            } else if (suggestions.length > 0) {
                handleSelectTag(suggestions[0]);
            }
        }
        if (e.key === 'Escape') {
            setShowSuggestions(false);
            setShowConfirm(false);
        }
    };

    const dropdownStyle = {
        position:        'absolute',
        top:             dropdownPos.top,
        left:            dropdownPos.left,
        width:           dropdownPos.width,
        backgroundColor: 'var(--dropdown-bg)',
        border:          '1px solid var(--border)',
        borderRadius:    '12px',
        boxShadow:       '0 8px 32px rgba(0,0,0,0.18)',
        zIndex:          99999,
        maxHeight:       '200px',
        overflowY:       'auto'
    };

    const DropdownContent = () => (
        <div ref={dropdownRef} style={dropdownStyle}>
            {showSuggestions && suggestions.map((tag, idx) => (
                <div
                    key={tag.id}
                    // Use onPointerDown so it fires before onBlur on mobile
                    onPointerDown={e => { e.preventDefault(); handleSelectTag(tag); }}
                    style={{
                        padding: '12px 14px', cursor: 'pointer', fontSize: '14px',
                        borderBottom: idx < suggestions.length - 1 ? '1px solid var(--border-light)' : 'none',
                        color: 'var(--text-primary)'
                    }}
                >
                    {tag.name}
                </div>
            ))}
            {showConfirm && inputValue.trim() !== '' && (
                <div style={{ padding: '14px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        Create tag <strong style={{ color: 'var(--text-primary)' }}>"{inputValue.trim()}"</strong>?
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onPointerDown={e => { e.preventDefault(); handleCreateTag(); }}
                            style={{ padding: '6px 14px', background: 'var(--gradient-accent)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}
                        >Yes, Create</button>
                        <button
                            onPointerDown={e => { e.preventDefault(); setShowConfirm(false); setInputValue(''); }}
                            style={{ padding: '6px 14px', background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
                        >Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );

    const showDropdown = (showSuggestions && suggestions.length > 0) || (showConfirm && inputValue.trim() !== '');

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            {/* Selected Tags */}
            {selectedTags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    {selectedTags.map(tag => (
                        <span key={tag.id} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            backgroundColor: 'var(--accent-light)', color: 'var(--accent-text)',
                            padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: '500'
                        }}>
                            {tag.name}
                            <button
                                onPointerDown={e => { e.preventDefault(); handleRemoveTag(tag.id); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-text)', fontSize: '16px', lineHeight: '1', padding: '0' }}
                            >×</button>
                        </span>
                    ))}
                </div>
            )}

            {/* Input */}
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => { if (inputValue) searchTags(inputValue); }}
                placeholder="Search or add tags..."
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                style={{
                    width: '100%', padding: '10px 14px', borderRadius: '10px',
                    border: '1.5px solid var(--input-border)', fontSize: '14px',
                    outline: 'none', boxSizing: 'border-box',
                    background: 'var(--glass-bg)', backdropFilter: 'blur(8px)',
                    color: 'var(--text-primary)'
                }}
            />

            {/* Portal dropdown — renders at document.body to escape any stacking context */}
            {showDropdown && ReactDOM.createPortal(<DropdownContent />, document.body)}
        </div>
    );
};

export default TagInput;
