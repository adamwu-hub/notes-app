import express from 'express';
import * as notesController from '../controllers/notes';
import * as authController from '../controllers/auth';
import upload from '../middleware/upload';

const router = express.Router();

// All note routes require authentication
router.use(authController.isAuthenticated);

// List users for sharing - Must be before /:id to avoid collision
router.get('/users/list', notesController.getUsers);

// Independent upload for pasted images
router.post('/attachments', upload.single('image'), notesController.uploadAttachment);

// Notes CRUD
router.get('/', notesController.getAllNotes);
router.post('/', notesController.createNote);
router.get('/:id', notesController.getNoteById);
router.put('/:id', notesController.updateNote);
router.delete('/:id', notesController.deleteNote);

export default router;
