const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
    getAllContestSummaries,
    getContestSummaryDetails
} = require('../controllers/contestController');

router.get('/', verifyToken, getAllContestSummaries);
router.get('/:contestId', verifyToken, getContestSummaryDetails);

module.exports = router;