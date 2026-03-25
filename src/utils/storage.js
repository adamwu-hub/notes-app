const fs = require('fs').promises;
const path = require('path');

const NOTES_FILE = path.join(__dirname, '../../data/notes.json');
const USERS_FILE = path.join(__dirname, '../../data/users.json');

async function readFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
  readNotes: () => readFile(NOTES_FILE),
  writeNotes: (notes) => writeFile(NOTES_FILE, notes),
  readUsers: () => readFile(USERS_FILE),
  writeUsers: (users) => writeFile(USERS_FILE, users)
};
