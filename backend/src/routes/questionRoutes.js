const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
    createQuestionHandler,
    getQuestionsHandler,
    getQuestionByIdHandler,
    updateQuestionHandler,
    deleteQuestionHandler
} = require('../controllers/questionController');

router.post('/', verifyToken, createQuestionHandler);
router.get('/', verifyToken, getQuestionsHandler);
router.get('/:id', verifyToken, getQuestionByIdHandler);
router.put('/:id', verifyToken, updateQuestionHandler);
router.delete('/:id', verifyToken, deleteQuestionHandler);

module.exports = router;