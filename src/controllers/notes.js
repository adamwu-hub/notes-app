const { v4: uuidv4 } = require('uuid');
const storage = require('../utils/storage');
const path = require('path');
const fs = require('fs').promises;

exports.getAllNotes = async (req, res) => {
  try {
    const currentUserId = req.session.userId;
    const notes = await storage.readNotes();
    
    // Filter: Notes owned by user OR shared with user
    const userNotes = notes.filter(n => 
      n.ownerId === currentUserId || 
      (n.sharedWith && n.sharedWith.includes(currentUserId))
    );
    
    res.json(userNotes);
  } catch (error) {
    console.error('Error in getAllNotes:', error);
    res.status(500).json({ message: 'Error reading notes' });
  }
};

exports.getNoteById = async (req, res) => {
  try {
    const currentUserId = req.session.userId;
    const notes = await storage.readNotes();
    const note = notes.find(n => n.id === req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check permission
    if (note.ownerId !== currentUserId && (!note.sharedWith || !note.sharedWith.includes(currentUserId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(note);
  } catch (error) {
    console.error('Error in getNoteById:', error);
    res.status(500).json({ message: 'Error reading note' });
  }
};

exports.createNote = async (req, res) => {
  try {
    const { title, body, attachments, sharedWith } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const notes = await storage.readNotes();
    const newNote = {
      id: uuidv4(),
      ownerId: req.session.userId,
      title,
      body: body || '',
      attachments: attachments || [], 
      sharedWith: sharedWith || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    notes.push(newNote);
    await storage.writeNotes(notes);
    res.status(201).json(newNote);
  } catch (error) {
    console.error('Error in createNote:', error);
    res.status(500).json({ message: 'Error creating note' });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { title, body, attachments, sharedWith } = req.body;
    const currentUserId = req.session.userId;
    const notes = await storage.readNotes();
    const index = notes.findIndex(n => n.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Only owner can update the content and sharing
    if (notes[index].ownerId !== currentUserId) {
      return res.status(403).json({ message: 'Only the owner can update this note' });
    }

    const updatedNote = {
      ...notes[index],
      title: title || notes[index].title,
      body: body !== undefined ? body : notes[index].body,
      attachments: attachments || notes[index].attachments,
      sharedWith: sharedWith !== undefined ? sharedWith : notes[index].sharedWith,
      updatedAt: new Date().toISOString()
    };

    notes[index] = updatedNote;
    await storage.writeNotes(notes);
    res.json(updatedNote);
  } catch (error) {
    console.error('Error in updateNote:', error);
    res.status(500).json({ message: 'Error updating note' });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const currentUserId = req.session.userId;
    const notes = await storage.readNotes();
    const index = notes.findIndex(n => n.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Only owner can delete
    if (notes[index].ownerId !== currentUserId) {
      return res.status(403).json({ message: 'Only the owner can delete this note' });
    }

    // Cleanup attachments
    const attachmentsDir = path.join(__dirname, '../../data/attachments');
    for (const attachment of (notes[index].attachments || [])) {
      try {
        await fs.unlink(path.join(attachmentsDir, attachment.filename));
      } catch (err) {
        console.error(`Failed to delete attachment: ${attachment.filename}`, err);
      }
    }

    const filteredNotes = notes.filter(n => n.id !== req.params.id);
    await storage.writeNotes(filteredNotes);
    res.json({ message: 'Note deleted' });
  } catch (error) {
    console.error('Error in deleteNote:', error);
    res.status(500).json({ message: 'Error deleting note' });
  }
};

exports.uploadAttachment = async (req, res) => {
  try {
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

    res.status(201).json(attachment);
  } catch (error) {
    console.error('Error in uploadAttachment:', error);
    res.status(500).json({ message: 'Error uploading attachment' });
  }
};

// Helper to list users for sharing
exports.getUsers = async (req, res) => {
  try {
    const users = await storage.readUsers();
    const currentUserId = req.session.userId;
    // Return list of other users (just username and id)
    const otherUsers = users
      .filter(u => u.id !== currentUserId)
      .map(u => ({ id: u.id, username: u.username }));
    res.json(otherUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};
