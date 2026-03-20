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

    return (
        <div style={{ position: 'relative' }}>
            {/* Selected Tags */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: selectedTags.length > 0 ? '10px' : '0'
            }}>
                {selectedTags.map(tag => (
                    <span key={tag.id} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#EEF2FF',
                        color: '#4F46E5',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '500'
                    }}>
                        {tag.name}
                        <button
                            onClick={() => handleRemoveTag(tag.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#4F46E5',
                                fontSize: '16px',
                                lineHeight: '1',
                                padding: '0'
                            }}
                        >
                            ×
                        </button>
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
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                }}
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div ref={suggestionsRef} style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 100,
                    maxHeight: '200px',
                    overflowY: 'auto'
                }}>
                    {suggestions.map(tag => (
                        <div
                            key={tag.id}
                            onClick={() => handleSelectTag(tag)}
                            style={{
                                padding: '10px 14px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                borderBottom: '1px solid #f0f0f0'
                            }}
                            onMouseEnter={e => e.target.style.backgroundColor = '#f5f5f5'}
                            onMouseLeave={e => e.target.style.backgroundColor = '#fff'}
                        >
                            {tag.name}
                        </div>
                    ))}
                </div>
            )}

            {/* Confirm New Tag */}
            {showConfirm && inputValue.trim() !== '' && (
                <div ref={suggestionsRef} style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 100,
                    padding: '12px 14px'
                }}>
                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
                        Would you like to create the tag <strong>"{inputValue.trim()}"</strong>?
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={handleCreateTag}
                            style={{
                                padding: '6px 14px',
                                backgroundColor: '#4F46E5',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '13px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Yes, Create
                        </button>
                        <button
                            onClick={() => { setShowConfirm(false); setInputValue(''); }}
                            style={{
                                padding: '6px 14px',
                                backgroundColor: '#fff',
                                color: '#333',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '13px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TagInput;