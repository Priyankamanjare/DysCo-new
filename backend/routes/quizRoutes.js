const express = require('express');
const { createNoteQuiz, submitQuizAnswers, getQuiz, getUserQuizzes } = require('../controllers/quizController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Create quiz from notes
router.post('/create', authMiddleware, createNoteQuiz);

// Submit quiz answers and get score
router.post('/submit', authMiddleware, submitQuizAnswers);

// Get all user quizzes (must come BEFORE /:quizId)
router.get('/user/all', authMiddleware, getUserQuizzes);

// Get specific quiz
router.get('/:quizId', authMiddleware, getQuiz);

module.exports = router;
