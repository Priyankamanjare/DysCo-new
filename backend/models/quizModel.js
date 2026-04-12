const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'fill-blank'],
    required: true
  },
  question: {
    type: String,
    required: true
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: {
    type: String,
    required: true
  },
  explanation: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: {
    type: String,
    default: 'General Knowledge'
  }
});

const quizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note'
  },
  quizType: {
    type: String,
    enum: ['note-quiz', 'multiple-choice', 'summary-comprehension'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  content: {
    type: String,
    required: true
  },
  summary: String,
  questions: [questionSchema],
  totalQuestions: {
    type: Number,
    default: 0
  },
  passingScore: {
    type: Number,
    default: 70
  },
  attempts: {
    type: Number,
    default: 0
  },
  bestScore: {
    type: Number,
    default: 0
  },
  lastScore: {
    type: Number,
    default: 0
  },
  history: [{
    score: Number,
    correctAnswers: Number,
    totalQuestions: Number,
    passed: Boolean,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  timeLimit: {
    type: Number,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
