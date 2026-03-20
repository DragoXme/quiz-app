// Format seconds into human readable time
export const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return 'N/A';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
};

// Format seconds into mm:ss for test timer
export const formatTimerDisplay = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// Normalize tag name
export const normalizeTag = (tag) => {
    return tag.toLowerCase().trim();
};

// Truncate long text
export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Get question type label
export const getQuestionTypeLabel = (type) => {
    const labels = {
        mcq_single: 'MCQ - Single Correct',
        mcq_multiple: 'MCQ - Multiple Correct',
        fill_blank: 'Fill in the Blank'
    };
    return labels[type] || type;
};

// Format date
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};