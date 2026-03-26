import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as storage from '../utils/storage';
import * as path from 'path';
import { promises as fs } from 'fs';

const getCurrentUserId = (req: Request): string | undefined => req.session.userId;

export const getAllNotes = async (req: Request, res: Response) => {
  try {
    const currentUserId = getCurrentUserId(req);
    if (!currentUserId) return res.status(401).json({ message: 'Unauthorized' });

    const notes = await storage.readNotes();
    const users = await storage.readUsers();
    
    const userNotes = notes
      .filter(n => 
        n.ownerId === currentUserId || 
        (n.sharedWith && n.sharedWith.includes(currentUserId))
      )
      .map(n => {
        const owner = users.find(u => u.id === n.ownerId);
        return {
          ...n,
          ownerUsername: owner ? owner.username : 'Unknown'
        };
      });
    
    res.json(userNotes);
  } catch (error) {
    console.error('Error in getAllNotes:', error);
    res.status(500).json({ message: 'Error reading notes' });
  }
};

export const getNoteById = async (req: Request, res: Response) => {
  try {
    const currentUserId = getCurrentUserId(req);
    if (!currentUserId) return res.status(401).json({ message: 'Unauthorized' });

    const notes = await storage.readNotes();
    const note = notes.find(n => n.id === req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check permission
    if (note.ownerId !== currentUserId && (!note.sharedWith || !note.sharedWith.includes(currentUserId))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await storage.readUsers();
    const owner = users.find(u => u.id === note.ownerId);

    res.json({
      ...note,
      ownerUsername: owner ? owner.username : 'Unknown'
    });
  } catch (error) {
    console.error('Error in getNoteById:', error);
    res.status(500).json({ message: 'Error reading note' });
  }
};

export const createNote = async (req: Request, res: Response) => {
  try {
    const currentUserId = getCurrentUserId(req);
    if (!currentUserId) return res.status(401).json({ message: 'Unauthorized' });

    const { title, body, attachments, sharedWith } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const notes = await storage.readNotes();
    const newNote: storage.Note = {
      id: uuidv4(),
      ownerId: currentUserId,
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

export const updateNote = async (req: Request, res: Response) => {
  try {
    const currentUserId = getCurrentUserId(req);
    if (!currentUserId) return res.status(401).json({ message: 'Unauthorized' });

    const { title, body, attachments, sharedWith } = req.body;
    const notes = await storage.readNotes();
    const index = notes.findIndex(n => n.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (notes[index].ownerId !== currentUserId) {
      return res.status(403).json({ message: 'Only the owner can update this note' });
    }

    const updatedNote: storage.Note = {
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

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const currentUserId = getCurrentUserId(req);
    if (!currentUserId) return res.status(401).json({ message: 'Unauthorized' });

    const notes = await storage.readNotes();
    const index = notes.findIndex(n => n.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (notes[index].ownerId !== currentUserId) {
      return res.status(403).json({ message: 'Only the owner can delete this note' });
    }

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

export const uploadAttachment = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const attachment: storage.Attachment = {
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

export const getUsers = async (req: Request, res: Response) => {
  try {
    const currentUserId = getCurrentUserId(req);
    if (!currentUserId) return res.status(401).json({ message: 'Unauthorized' });

    const users = await storage.readUsers();
    const otherUsers = users
      .filter(u => u.id !== currentUserId)
      .map(u => ({ id: u.id, username: u.username }));
    res.json(otherUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};
