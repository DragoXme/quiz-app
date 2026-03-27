const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const tagRoutes = require('./routes/tagRoutes');
const testRoutes = require('./routes/testRoutes');
const contestRoutes = require('./routes/contestRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const profileRoutes = require('./routes/profileRoutes');
const todoRoutes = require('./routes/todoRoutes');

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/todos', todoRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

app.use(errorHandler);

module.exports = app;
