const express = require('express');
const { createNote, getAllNotes, getSingleNote, updateNote, deleteNote } = require('../controllers/noteController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/add', authMiddleware, createNote)
router.get('/all', authMiddleware, getAllNotes);
router.get('/:id', authMiddleware, getSingleNote); 
router.put('/update/:id', authMiddleware, updateNote);
router.delete('/delete/:id', authMiddleware, deleteNote);

module.exports = router;
