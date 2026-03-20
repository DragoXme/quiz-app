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

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    const btnStyle = (isActive) => ({
        padding: '8px 14px',
        borderRadius: '8px',
        border: isActive ? 'none' : '1px solid #ddd',
        backgroundColor: isActive ? '#4F46E5' : '#fff',
        color: isActive ? '#fff' : '#333',
        fontSize: '14px',
        fontWeight: isActive ? '700' : '400',
        cursor: 'pointer',
        transition: 'all 0.2s'
    });

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '24px',
            flexWrap: 'wrap'
        }}>
            <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                style={{
                    ...btnStyle(false),
                    opacity: currentPage === 1 ? 0.4 : 1
                }}
            >
                «
            </button>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                    ...btnStyle(false),
                    opacity: currentPage === 1 ? 0.4 : 1
                }}
            >
                ‹
            </button>

            {startPage > 1 && (
                <>
                    <button onClick={() => onPageChange(1)} style={btnStyle(false)}>1</button>
                    {startPage > 2 && <span style={{ color: '#999' }}>...</span>}
                </>
            )}

            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    style={btnStyle(page === currentPage)}
                >
                    {page}
                </button>
            ))}

            {endPage < totalPages && (
                <>
                    {endPage < totalPages - 1 && <span style={{ color: '#999' }}>...</span>}
                    <button onClick={() => onPageChange(totalPages)} style={btnStyle(false)}>
                        {totalPages}
                    </button>
                </>
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                    ...btnStyle(false),
                    opacity: currentPage === totalPages ? 0.4 : 1
                }}
            >
                ›
            </button>
            <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                style={{
                    ...btnStyle(false),
                    opacity: currentPage === totalPages ? 0.4 : 1
                }}
            >
                »
            </button>
        </div>
    );
};

export default Pagination;