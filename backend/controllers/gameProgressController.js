const GameProgress = require('../models/gameProgressModel');

const recordGameProgress = async (req, res) => {
  try {
    const userId = req.user;
    const { gameType, score, total, passed, metadata } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized - User not found' });
    }

    if (!gameType || score === undefined || total === undefined) {
      return res.status(400).json({ message: 'gameType, score, and total are required' });
    }

    const progress = new GameProgress({
      userId,
      gameType,
      score,
      total,
      passed: typeof passed === 'boolean' ? passed : score >= 0,
      metadata: metadata || {}
    });

    await progress.save();

    return res.status(201).json({ message: 'Game progress recorded', progress });
  } catch (error) {
    console.error('Game progress error:', error);
    return res.status(500).json({ message: 'Error recording game progress', error: error.message });
  }
};

const getUserGameProgress = async (req, res) => {
  try {
    const userId = req.user;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized - User not found' });
    }

    const progress = await GameProgress.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({ message: 'Game progress fetched', progress });
  } catch (error) {
    console.error('Failed to fetch game progress:', error);
    return res.status(500).json({ message: 'Error fetching progress', error: error.message });
  }
};

module.exports = {
  recordGameProgress,
  getUserGameProgress
};
