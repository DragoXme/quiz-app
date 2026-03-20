const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);

    if (err.code === '23505') {
        return res.status(409).json({
            message: 'Duplicate entry. This record already exists.'
        });
    }

    if (err.code === '23503') {
        return res.status(400).json({
            message: 'Referenced record does not exist.'
        });
    }

    if (err.code === '23502') {
        return res.status(400).json({
            message: 'Required field is missing.'
        });
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error.';

    res.status(statusCode).json({ message });
};

module.exports = { errorHandler };