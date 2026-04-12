const express = require('express');
const { textToSpeech } = require('../controllers/textToSpeechController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post("/", authMiddleware, textToSpeech);

module.exports = router;
