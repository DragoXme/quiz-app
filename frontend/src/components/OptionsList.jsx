import React, { useState } from 'react';
import ImageUpload from './ImageUpload';

// Size map: label → max-width (no cropping, just constrained width)
const IMAGE_SIZES = [
    { key: 'small',    label: 'S',        maxWidth: '80px'  },
    { key: 'medium',   label: 'M',        maxWidth: '160px' },
    { key: 'large',    label: 'L',        maxWidth: '280px' },
    { key: 'original', label: 'Original', maxWidth: '100%'  },
];

const OptionsList = ({ options, onChange, allowMultiple }) => {
    // One image size setting for all options in this question
    const [imageSize, setImageSize] = useState('medium');

    const handleOptionTextChange = (index, value) => {
        onChange(options.map((opt, i) => i === index ? { ...opt, optionText: value } : opt));
    };

    const handleOptionImageChange = (index, imageUrl) => {
        onChange(options.map((opt, i) => i === index ? { ...opt, optionImageUrl: imageUrl } : opt));
    };

    const handleOptionImageClear = (index) => {
        onChange(options.map((opt, i) => i === index ? { ...opt, optionImageUrl: null } : opt));
    };

    const handleCorrectChange = (index) => {
        let updated;
        if (allowMultiple) {
            updated = options.map((opt, i) => i === index ? { ...opt, isCorrect: !opt.isCorrect } : opt);
        } else {
            updated = options.map((opt, i) => ({ ...opt, isCorrect: i === index }));
        }
        onChange(updated);
    };

    const handleAddOption = () => {
        onChange([...options, { optionText: '', optionImageUrl: null, isCorrect: false }]);
    };

    const handleDeleteOption = (index) => {
        if (options.length <= 2) { alert('At least 2 options are required.'); return; }
        onChange(options.filter((_, i) => i !== index));
    };

    const hasAnyImage = options.some(o => o.optionImageUrl);
    const currentSize = IMAGE_SIZES.find(s => s.key === imageSize) || IMAGE_SIZES[1];

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {allowMultiple ? '✅ Select all correct answers (at least 1)' : '✅ Select exactly 1 correct answer'}
                </p>
                {/* Image size selector — only shown when at least one option has an image */}
                {hasAnyImage && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Image size:</span>
                        {IMAGE_SIZES.map(s => (
                            <button
                                key={s.key}
                                type="button"
                                onClick={() => setImageSize(s.key)}
                                style={{
                                    padding: '3px 8px', borderRadius: '6px', border: 'none',
                                    background: imageSize === s.key ? 'var(--gradient-accent)' : 'var(--accent-light)',
                                    color: imageSize === s.key ? '#fff' : 'var(--accent-text)',
                                    fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                                    transition: 'all 0.15s'
                                }}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {options.map((option, index) => (
                <div key={index} style={{
                    border: `2px solid ${option.isCorrect ? 'var(--success)' : 'var(--border)'}`,
                    borderRadius: '10px', padding: '14px', marginBottom: '12px',
                    backgroundColor: option.isCorrect ? 'var(--success-light)' : 'var(--bg-card)',
                    transition: 'all 0.2s'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <input
                            type={allowMultiple ? 'checkbox' : 'radio'}
                            name="correct_option"
                            checked={option.isCorrect}
                            onChange={() => handleCorrectChange(index)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent)' }}
                        />
                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', minWidth: '80px' }}>
                            Option {String.fromCharCode(65 + index)}
                        </span>
                        <button type="button" onClick={() => handleDeleteOption(index)} style={{
                            marginLeft: 'auto', padding: '4px 10px',
                            backgroundColor: 'var(--error-light)', color: 'var(--error)',
                            border: 'none', borderRadius: '6px', fontSize: '12px',
                            cursor: 'pointer', fontWeight: '600'
                        }}>Delete</button>
                    </div>

                    <input
                        type="text"
                        value={option.optionText || ''}
                        onChange={(e) => handleOptionTextChange(index, e.target.value)}
                        placeholder={`Text for option ${String.fromCharCode(65 + index)} (optional if image provided)`}
                        style={{
                            width: '100%', padding: '8px 12px', borderRadius: '6px',
                            border: '1px solid var(--input-border)', fontSize: '14px',
                            marginBottom: '10px', boxSizing: 'border-box',
                            backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)'
                        }}
                    />

                    {/* Show actual image preview if uploaded, sized by selector */}
                    {option.optionImageUrl ? (
                        <div style={{ marginBottom: '8px' }}>
                            <img
                                src={option.optionImageUrl}
                                alt={`Option ${String.fromCharCode(65 + index)}`}
                                style={{
                                    maxWidth: currentSize.maxWidth,
                                    width: '100%',
                                    height: 'auto',        // never crop
                                    borderRadius: '8px',
                                    display: 'block',
                                    border: '1px solid var(--border)'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => handleOptionImageClear(index)}
                                style={{
                                    marginTop: '6px', padding: '4px 10px',
                                    backgroundColor: 'var(--error-light)', color: 'var(--error)',
                                    border: 'none', borderRadius: '6px',
                                    fontSize: '12px', cursor: 'pointer', fontWeight: '600'
                                }}
                            >
                                🗑️ Remove Image
                            </button>
                        </div>
                    ) : (
                        <ImageUpload
                            label={`Option ${String.fromCharCode(65 + index)} Image`}
                            imageUrl={null}
                            onImageChange={(url) => handleOptionImageChange(index, url)}
                            onClear={() => handleOptionImageClear(index)}
                        />
                    )}
                </div>
            ))}

            <button type="button" onClick={handleAddOption} style={{
                padding: '10px 20px', backgroundColor: 'var(--accent-light)',
                color: 'var(--accent-text)', border: '2px dashed var(--accent)',
                borderRadius: '8px', fontSize: '14px', cursor: 'pointer',
                fontWeight: '600', width: '100%'
            }}>
                + Add Option
            </button>
        </div>
    );
};

export default OptionsList;
