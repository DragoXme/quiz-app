const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
    configureTest,
    getTestQuestions,
    submitAnswer,
    submitTest,
    abandonTest
} = require('../controllers/testController');

router.post('/configure', verifyToken, configureTest);
router.get('/:contestId/questions', verifyToken, getTestQuestions);
router.post('/submit-answer', verifyToken, submitAnswer);
router.post('/:contestId/submit', verifyToken, submitTest);
router.delete('/:contestId/abandon', verifyToken, abandonTest);

module.exports = router;
