const express = require('express');
const { recordGameProgress, getUserGameProgress } = require('../controllers/gameProgressController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/record', authMiddleware, recordGameProgress);
router.get('/user/all', authMiddleware, getUserGameProgress);

module.exports = router;
