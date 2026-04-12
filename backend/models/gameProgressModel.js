const mongoose = require('mongoose');

const gameProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameType: {
    type: String,
    enum: ['listening', 'pronunciation', 'flashcards', 'quiz', 'other'],
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const GameProgress = mongoose.model('GameProgress', gameProgressSchema);
module.exports = GameProgress;
