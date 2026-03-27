const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo
} = require('../controllers/todoController');

router.get('/', verifyToken, getTodos);
router.post('/', verifyToken, createTodo);
router.patch('/:id', verifyToken, updateTodo);
router.delete('/:id', verifyToken, deleteTodo);

module.exports = router;
