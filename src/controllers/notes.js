const { v4: uuidv4 } = require('uuid');
const storage = require('../utils/storage');
const path = require('path');
const fs = require('fs').promises;

exports.getAllNotes = async (req, res) => {
  try {
    const notes = await storage.readNotes();
    res.json(notes);
  } catch (error) {
    console.error('Error in getAllNotes:', error);
    res.status(500).json({ message: 'Error reading notes', error: error.message });
  }
};

exports.getNoteById = async (req, res) => {
  try {
    const notes = await storage.readNotes();
    const note = notes.find(n => n.id === req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    console.error('Error in getNoteById:', error);
    res.status(500).json({ message: 'Error reading note', error: error.message });
  }
};

exports.createNote = async (req, res) => {
  try {
    const { title, body, attachments } = req.body;
    console.log('Creating note with data:', { title, body, attachments });
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const notes = await storage.readNotes();
    const newNote = {
      id: uuidv4(),
      title,
      body: body || '',
      attachments: attachments || [], 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    notes.push(newNote);
    await storage.writeNotes(notes);
    console.log('Note created successfully:', newNote.id);
    res.status(201).json(newNote);
  } catch (error) {
    console.error('Error in createNote:', error);
    res.status(500).json({ message: 'Error creating note', error: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { title, body, attachments } = req.body;
    const notes = await storage.readNotes();
    const index = notes.findIndex(n => n.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const updatedNote = {
      ...notes[index],
      title: title || notes[index].title,
      body: body !== undefined ? body : notes[index].body,
      attachments: attachments || notes[index].attachments,
      updatedAt: new Date().toISOString()
    };

    notes[index] = updatedNote;
    await storage.writeNotes(notes);
    res.json(updatedNote);
  } catch (error) {
    console.error('Error in updateNote:', error);
    res.status(500).json({ message: 'Error updating note', error: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const notes = await storage.readNotes();
    const index = notes.findIndex(n => n.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Cleanup attachments (optional, but good for cleanup)
    const attachmentsDir = path.join(__dirname, '../../data/attachments');
    for (const attachment of (notes[index].attachments || [])) {
      try {
        await fs.unlink(path.join(attachmentsDir, attachment.filename));
      } catch (err) {
        console.error(`Failed to delete attachment file: ${attachment.filename}`, err);
      }
    }

    const filteredNotes = notes.filter(n => n.id !== req.params.id);
    await storage.writeNotes(filteredNotes);
    res.json({ message: 'Note deleted' });
  } catch (error) {
    console.error('Error in deleteNote:', error);
    res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
};

exports.uploadAttachment = async (req, res) => {
  try {
    console.log('Uploading attachment:', req.file?.originalname);
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const attachment = {
      id: uuidv4(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadDate: new Date().toISOString(),
      url: `/attachments/${req.file.filename}`
    };

    console.log('Attachment uploaded successfully:', attachment.id);
    res.status(201).json(attachment);
  } catch (error) {
    console.error('Error in uploadAttachment:', error);
    res.status(500).json({ message: 'Error uploading attachment', error: error.message });
  }
};
