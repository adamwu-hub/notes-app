import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadDate: string;
  url: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  attachments: Attachment[];
  ownerId?: string;
  sharedWith?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  password?: string;
}

const NOTES_FILE = path.join(__dirname, '../../data/notes.json');
const USERS_FILE = path.join(__dirname, '../../data/users.json');

async function readFile<T>(filePath: string): Promise<T[]> {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data) as T[];
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeFile<T>(filePath: string, data: T[]): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export const readNotes = (): Promise<Note[]> => readFile<Note>(NOTES_FILE);
export const writeNotes = (notes: Note[]): Promise<void> => writeFile<Note>(NOTES_FILE, notes);
export const readUsers = (): Promise<User[]> => readFile<User>(USERS_FILE);
export const writeUsers = (users: User[]): Promise<void> => writeFile<User>(USERS_FILE, users);
