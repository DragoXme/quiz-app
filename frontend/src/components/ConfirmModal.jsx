import React from 'react';

// Spinner dots animation via inline keyframes injected once
const spinnerStyle = `
@keyframes confirmDot {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40%            { transform: scale(1.0); opacity: 1;   }
}
`;

const ConfirmModal = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmColor = 'var(--error)',
    loading = false,
    loadingText = 'Please wait...'
}) => {
    if (!isOpen) return null;

    return (
        <>
            <style>{spinnerStyle}</style>
            <div style={{
                position: 'fixed', inset: 0,
                backgroundColor: 'rgba(0,0,0,0.55)',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                zIndex: 1000,
                backdropFilter: 'blur(4px)'
            }}>
                <div style={{
                    backgroundColor: 'var(--dropdown-bg)',
                    borderRadius: '16px', padding: '32px',
                    maxWidth: '420px', width: '90%',
                    boxShadow: '0 24px 64px var(--shadow-md)',
                    border: '1px solid var(--border)',
                    animation: 'fadeIn 0.18s ease'
                }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '10px' }}>
                        {title}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: '1.6' }}>
                        {message}
                    </p>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        {/* Cancel — hidden while loading */}
                        {!loading && (
                            <button onClick={onCancel} style={{
                                padding: '10px 20px', borderRadius: '10px',
                                border: '1px solid var(--border)',
                                backgroundColor: 'transparent',
                                color: 'var(--text-primary)',
                                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                transition: 'background 0.15s'
                            }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                {cancelText}
                            </button>
                        )}

                        {/* Confirm button */}
                        <button
                            onClick={!loading ? onConfirm : undefined}
                            disabled={loading}
                            style={{
                                padding: '10px 24px', borderRadius: '10px', border: 'none',
                                backgroundColor: confirmColor,
                                color: '#fff', fontSize: '14px', fontWeight: '700',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.85 : 1,
                                display: 'flex', alignItems: 'center', gap: '10px',
                                minWidth: '140px', justifyContent: 'center',
                                transition: 'opacity 0.2s'
                            }}
                        >
                            {loading ? (
                                <>
                                    {/* Three bouncing dots */}
                                    <span style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                        {[0, 1, 2].map(i => (
                                            <span key={i} style={{
                                                width: '7px', height: '7px',
                                                borderRadius: '50%',
                                                backgroundColor: '#fff',
                                                display: 'inline-block',
                                                animation: `confirmDot 1.2s ease-in-out ${i * 0.2}s infinite`
                                            }} />
                                        ))}
                                    </span>
                                    <span>{loadingText}</span>
                                </>
                            ) : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ConfirmModal;
