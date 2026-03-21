import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);

    const btnStyle = (isActive, isDisabled) => ({
        padding: '8px 13px',
        borderRadius: '10px',
        border: isActive ? 'none' : '1px solid var(--border)',
        background: isActive ? 'var(--gradient-accent)' : 'var(--glass-bg)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        color: isActive ? '#fff' : 'var(--text-secondary)',
        fontSize: '13px',
        fontWeight: isActive ? '700' : '500',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.35 : 1,
        transition: 'all 0.15s',
        boxShadow: isActive ? '0 4px 12px var(--shadow-md)' : 'none',
        minWidth: '36px',
        textAlign: 'center'
    });

    return (
        <div style={{
            display: 'flex', justifyContent: 'center',
            alignItems: 'center', gap: '6px',
            marginTop: '24px', flexWrap: 'wrap'
        }}>
            <button onClick={() => onPageChange(1)} disabled={currentPage === 1}
                style={btnStyle(false, currentPage === 1)}>«</button>
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
                style={btnStyle(false, currentPage === 1)}>‹</button>

            {startPage > 1 && (
                <>
                    <button onClick={() => onPageChange(1)} style={btnStyle(false, false)}>1</button>
                    {startPage > 2 && <span style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '0 2px' }}>···</span>}
                </>
            )}

            {pages.map(page => (
                <button key={page} onClick={() => onPageChange(page)} style={btnStyle(page === currentPage, false)}>
                    {page}
                </button>
            ))}

            {endPage < totalPages && (
                <>
                    {endPage < totalPages - 1 && <span style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '0 2px' }}>···</span>}
                    <button onClick={() => onPageChange(totalPages)} style={btnStyle(false, false)}>{totalPages}</button>
                </>
            )}

            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
                style={btnStyle(false, currentPage === totalPages)}>›</button>
            <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}
                style={btnStyle(false, currentPage === totalPages)}>»</button>
        </div>
    );
};

export default Pagination;
