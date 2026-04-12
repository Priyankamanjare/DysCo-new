const express = require('express');
const { createCard, deleteCard, getAllCards } = require('../controllers/cardController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/add', authMiddleware, createCard);
router.get('/', authMiddleware, getAllCards);
router.delete('/delete/:id', authMiddleware, deleteCard);

module.exports = router;
