import React, { useState, useRef } from 'react';

const ImageUpload = ({ label, imageUrl, onImageChange, onClear }) => {
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const handleFile = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            onImageChange(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleFileInput = (e) => {
        handleFile(e.target.files[0]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    return (
        <div style={{ marginBottom: '8px' }}>
            {imageUrl ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                        src={imageUrl}
                        alt={label}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '300px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            display: 'block'
                        }}
                    />
                    <button
                        onClick={onClear}
                        style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            backgroundColor: '#EF4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700'
                        }}
                    >
                        ×
                    </button>
                </div>
            ) : (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    style={{
                        border: `2px dashed ${dragOver ? '#4F46E5' : '#ddd'}`,
                        borderRadius: '8px',
                        padding: '24px',
                        textAlign: 'center',
                        backgroundColor: dragOver ? '#EEF2FF' : '#fafafa',
                        transition: 'all 0.2s'
                    }}
                >
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>
                        Drag & drop an image or
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#4F46E5',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '13px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            📁 Upload File
                        </button>
                        <button
                            type="button"
                            onClick={() => cameraInputRef.current.click()}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#10B981',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '13px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            📷 Use Camera
                        </button>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        style={{ display: 'none' }}
                    />
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileInput}
                        style={{ display: 'none' }}
                    />
                </div>
            )}
        </div>
    );
};

export default ImageUpload;