import { Router } from 'express';
import * as notesController from '../controllers/notes.js';
import { isAuthenticated } from '../controllers/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

router.use(isAuthenticated);

router.get('/', notesController.getAllNotes);
router.get('/users/list', notesController.getUsers);
router.get('/:id', notesController.getNoteById);
router.post('/', notesController.createNote);
router.put('/:id', notesController.updateNote);
router.delete('/:id', notesController.deleteNote);
router.post('/attachments', upload.single('image'), notesController.uploadAttachment);

export default router;
