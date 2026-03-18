const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notes');
const upload = require('../middleware/upload');

// Notes CRUD
router.get('/', notesController.getAllNotes);
router.get('/:id', notesController.getNoteById);
router.post('/', notesController.createNote);
router.put('/:id', notesController.updateNote);
router.delete('/:id', notesController.deleteNote);

// Independent upload for pasted images
router.post('/attachments', upload.single('image'), notesController.uploadAttachment);

module.exports = router;
