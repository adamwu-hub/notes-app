const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/notes.json');

async function readNotes() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeNotes(notes) {
  await fs.writeFile(DATA_FILE, JSON.stringify(notes, null, 2), 'utf8');
}

module.exports = {
  readNotes,
  writeNotes
};
