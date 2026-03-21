const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
    getAllContestSummaries,
    getContestSummaryDetails,
    deleteContest
} = require('../controllers/contestController');

router.get('/', verifyToken, getAllContestSummaries);
router.get('/:contestId', verifyToken, getContestSummaryDetails);
router.delete('/:contestId', verifyToken, deleteContest);

module.exports = router;