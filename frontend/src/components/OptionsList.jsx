import React from 'react';
import ImageUpload from './ImageUpload';

const OptionsList = ({ options, onChange, allowMultiple }) => {
    const handleOptionTextChange = (index, value) => {
        const updated = options.map((opt, i) =>
            i === index ? { ...opt, optionText: value } : opt
        );
        onChange(updated);
    };

    const handleOptionImageChange = (index, imageUrl) => {
        const updated = options.map((opt, i) =>
            i === index ? { ...opt, optionImageUrl: imageUrl } : opt
        );
        onChange(updated);
    };

    const handleOptionImageClear = (index) => {
        const updated = options.map((opt, i) =>
            i === index ? { ...opt, optionImageUrl: null } : opt
        );
        onChange(updated);
    };

    const handleCorrectChange = (index) => {
        let updated;
        if (allowMultiple) {
            updated = options.map((opt, i) =>
                i === index ? { ...opt, isCorrect: !opt.isCorrect } : opt
            );
        } else {
            updated = options.map((opt, i) => ({
                ...opt,
                isCorrect: i === index
            }));
        }
        onChange(updated);
    };

    const handleAddOption = () => {
        onChange([...options, { optionText: '', optionImageUrl: null, isCorrect: false }]);
    };

    const handleDeleteOption = (index) => {
        if (options.length <= 2) {
            alert('At least 2 options are required.');
            return;
        }
        onChange(options.filter((_, i) => i !== index));
    };

    return (
        <div>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
                {allowMultiple
                    ? '✅ Select all correct answers (at least 1)'
                    : '✅ Select exactly 1 correct answer'}
            </p>
            {options.map((option, index) => (
                <div key={index} style={{
                    border: `2px solid ${option.isCorrect ? '#10B981' : '#e5e7eb'}`,
                    borderRadius: '10px',
                    padding: '14px',
                    marginBottom: '12px',
                    backgroundColor: option.isCorrect ? '#F0FDF4' : '#fff',
                    transition: 'all 0.2s'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '10px'
                    }}>
                        <input
                            type={allowMultiple ? 'checkbox' : 'radio'}
                            name="correct_option"
                            checked={option.isCorrect}
                            onChange={() => handleCorrectChange(index)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#333',
                            minWidth: '80px'
                        }}>
                            Option {index + 1}
                        </span>
                        <button
                            type="button"
                            onClick={() => handleDeleteOption(index)}
                            style={{
                                marginLeft: 'auto',
                                padding: '4px 10px',
                                backgroundColor: '#FEE2E2',
                                color: '#EF4444',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Delete
                        </button>
                    </div>
                    <input
                        type="text"
                        value={option.optionText || ''}
                        onChange={(e) => handleOptionTextChange(index, e.target.value)}
                        placeholder={`Enter option ${index + 1} text (or upload image below)`}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            marginBottom: '10px',
                            boxSizing: 'border-box'
                        }}
                    />
                    <ImageUpload
                        label={`Option ${index + 1} Image`}
                        imageUrl={option.optionImageUrl}
                        onImageChange={(url) => handleOptionImageChange(index, url)}
                        onClear={() => handleOptionImageClear(index)}
                    />
                </div>
            ))}
            <button
                type="button"
                onClick={handleAddOption}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#EEF2FF',
                    color: '#4F46E5',
                    border: '2px dashed #4F46E5',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    width: '100%'
                }}
            >
                + Add Option
            </button>
        </div>
    );
};

export default OptionsList;