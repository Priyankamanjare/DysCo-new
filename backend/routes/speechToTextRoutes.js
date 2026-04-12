const express = require('express');
const multer = require('multer');
const { speechToText } = require('../controllers/speechToTextController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).any();

router.post("/", upload, authMiddleware, speechToText);

module.exports = router;
