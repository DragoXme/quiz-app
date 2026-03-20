const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { search, getAll, createNewTag } = require('../controllers/tagController');

router.get('/search', verifyToken, search);
router.get('/', verifyToken, getAll);
router.post('/', verifyToken, createNewTag);

module.exports = router;