import React, { useState, useRef, useEffect } from 'react';
import API from '../api/axios';

const TagInput = ({ selectedTags, onChange }) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingTag, setPendingTag] = useState('');
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
                inputRef.current && !inputRef.current.contains(e.target)) {
                setShowSuggestions(false);
                setShowConfirm(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchTags = async (query) => {
        if (!query.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        setLoading(true);
        try {
            const res = await API.get(`/tags/search?query=${encodeURIComponent(query)}`);
            const filtered = res.data.tags.filter(
                t => !selectedTags.find(st => st.id === t.id)
            );
            setSuggestions(filtered);
            setShowSuggestions(true);
            setShowConfirm(filtered.length === 0 && query.trim() !== '');
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
        } catch {
            // tag might already exist
        }
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
            } else if (suggestions.length > 0) {
                handleSelectTag(suggestions[0]);
            }
        }
    };

    // Fully opaque dropdown — no transparency, strong blur behind it
    const dropdownStyle = {
        position: 'absolute',
        top: 'calc(100% + 4px)',
        left: 0,
        right: 0,
        // Light mode: pure white. Dark mode handled via CSS var below
        backgroundColor: 'var(--dropdown-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        zIndex: 9999,
        maxHeight: '200px',
        overflowY: 'auto'
    };

    return (
        <div style={{ position: 'relative', isolation: 'isolate' }}>
            {/* Selected Tags */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '8px',
                marginBottom: selectedTags.length > 0 ? '10px' : '0'
            }}>
                {selectedTags.map(tag => (
                    <span key={tag.id} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        backgroundColor: 'var(--accent-light)', color: 'var(--accent-text)',
                        padding: '4px 10px', borderRadius: '20px',
                        fontSize: '13px', fontWeight: '500'
                    }}>
                        {tag.name}
                        <button onClick={() => handleRemoveTag(tag.id)} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--accent-text)', fontSize: '16px',
                            lineHeight: '1', padding: '0'
                        }}>×</button>
                    </span>
                ))}
            </div>

            {/* Input */}
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Search or add tags..."
                style={{
                    width: '100%', padding: '10px 14px', borderRadius: '10px',
                    border: '1.5px solid var(--input-border)', fontSize: '14px',
                    outline: 'none', boxSizing: 'border-box',
                    background: 'var(--glass-bg)', backdropFilter: 'blur(8px)',
                    color: 'var(--text-primary)'
                }}
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div ref={suggestionsRef} style={dropdownStyle}>
                    {suggestions.map((tag, idx) => (
                        <div
                            key={tag.id}
                            onClick={() => handleSelectTag(tag)}
                            style={{
                                padding: '10px 14px', cursor: 'pointer', fontSize: '14px',
                                borderBottom: idx < suggestions.length - 1 ? '1px solid var(--border-light)' : 'none',
                                color: 'var(--text-primary)', transition: 'background 0.1s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            {tag.name}
                        </div>
                    ))}
                </div>
            )}

            {/* Confirm New Tag */}
            {showConfirm && inputValue.trim() !== '' && (
                <div ref={suggestionsRef} style={{ ...dropdownStyle, maxHeight: 'none', padding: '14px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        Create tag <strong style={{ color: 'var(--text-primary)' }}>"{inputValue.trim()}"</strong>?
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={handleCreateTag} style={{
                            padding: '6px 14px', background: 'var(--gradient-accent)',
                            color: '#fff', border: 'none', borderRadius: '8px',
                            fontSize: '13px', cursor: 'pointer', fontWeight: '600'
                        }}>Yes, Create</button>
                        <button onClick={() => { setShowConfirm(false); setInputValue(''); }} style={{
                            padding: '6px 14px', background: 'var(--bg-hover)',
                            color: 'var(--text-primary)', border: '1px solid var(--border)',
                            borderRadius: '8px', fontSize: '13px', cursor: 'pointer'
                        }}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TagInput;
