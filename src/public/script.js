// State
let allNotes = [];
let currentNoteId = null;
let currentAttachments = [];

// DOM Elements
const listView = document.getElementById('list-view');
const editorView = document.getElementById('editor-view');
const notesGrid = document.getElementById('notes-grid');
const searchBar = document.getElementById('search-bar');
const clearSearch = document.getElementById('clear-search');
const sortOrder = document.getElementById('sort-order');
const noteTitleInput = document.getElementById('note-title');
const noteBodyInput = document.getElementById('note-body');
const attachmentsContainer = document.getElementById('attachments-container');
const editorTitleLabel = document.getElementById('editor-title-label');

// Modal Elements
const imageModal = document.getElementById('image-modal');
const modalImg = document.getElementById('modal-img');
const closeModal = document.getElementById('close-modal');

// Buttons
const btnNewNote = document.getElementById('btn-new-note');
const btnCancel = document.getElementById('btn-cancel');
const btnSave = document.getElementById('btn-save');

// --- URL Query Persistence ---

function loadSettingsFromURL() {
    const params = new URLSearchParams(window.location.search);
    const sort = params.get('sort');
    const filter = params.get('filter');

    if (sort) sortOrder.value = sort;
    if (filter) searchBar.value = filter;
}

function updateURL() {
    const params = new URLSearchParams();
    if (sortOrder.value !== 'desc') params.set('sort', sortOrder.value);
    if (searchBar.value) params.set('filter', searchBar.value);

    const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', newURL);
}

// --- View Navigation ---

function showListView() {
    listView.classList.remove('hidden');
    editorView.classList.add('hidden');
    currentNoteId = null;
    currentAttachments = [];
    noteTitleInput.value = '';
    noteBodyInput.value = '';
    attachmentsContainer.innerHTML = '';
    loadNotes();
}

function showEditorView(note = null) {
    listView.classList.add('hidden');
    editorView.classList.remove('hidden');
    
    if (note) {
        editorTitleLabel.textContent = 'Edit Note';
        currentNoteId = note.id;
        noteTitleInput.value = note.title;
        noteBodyInput.value = note.body;
        currentAttachments = note.attachments || [];
        attachmentsContainer.innerHTML = '';
        currentAttachments.forEach(displayAttachment);
    } else {
        editorTitleLabel.textContent = 'New Note';
        currentNoteId = null;
    }
}

// --- Data Fetching ---

async function loadNotes() {
    try {
        const response = await fetch('/api/notes');
        allNotes = await response.json();
        renderNotes();
    } catch (error) {
        console.error('Failed to load notes:', error);
    }
}

function renderNotes() {
    const searchTerm = searchBar.value.toLowerCase();
    const order = sortOrder.value;
    
    // Toggle clear button visibility
    clearSearch.style.display = searchTerm ? 'block' : 'none';
    
    updateURL();

    let filtered = allNotes.filter(n => 
        (n.title || '').toLowerCase().includes(searchTerm) || 
        (n.body || '').toLowerCase().includes(searchTerm)
    );

    filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return order === 'desc' ? dateB - dateA : dateA - dateB;
    });

    notesGrid.innerHTML = '';
    filtered.forEach(note => {
        const card = document.createElement('div');
        card.className = 'note-card';
        card.innerHTML = `
            <div class="note-actions">
                <button class="icon-btn edit-btn" title="Edit">✎</button>
                <button class="icon-btn delete-btn delete" title="Delete">🗑</button>
            </div>
            <h3>${note.title}</h3>
            <p>${note.body.length > 100 ? note.body.substring(0, 100) + '...' : note.body}</p>
            <div class="attachments">
                ${(note.attachments || []).map(att => `<img src="${att.url}" class="thumb-img" style="width:40px;height:40px;object-fit:cover;border-radius:4px;cursor:pointer;">`).join('')}
            </div>
            <small style="margin-top:auto; color:#94a3b8;">${new Date(note.createdAt).toLocaleDateString()}</small>
        `;

        card.querySelectorAll('.thumb-img').forEach((img, idx) => {
            img.onclick = () => openImageModal(note.attachments[idx].url);
        });

        card.querySelector('.edit-btn').onclick = () => showEditorView(note);
        card.querySelector('.delete-btn').onclick = () => deleteNote(note.id);
        
        notesGrid.appendChild(card);
    });
}

async function deleteNote(id) {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
        await fetch(`/api/notes/${id}`, { method: 'DELETE' });
        loadNotes();
    } catch (error) {
        console.error('Delete failed:', error);
    }
}

// --- Modal Logic ---

function openImageModal(url) {
    modalImg.src = url;
    imageModal.style.display = 'flex';
}

closeModal.onclick = () => {
    imageModal.style.display = 'none';
};

window.onclick = (event) => {
    if (event.target === imageModal) {
        imageModal.style.display = 'none';
    }
};

// --- Save & Upload ---

async function uploadAttachment(blob) {
    const formData = new FormData();
    formData.append('image', blob, 'pasted-image.png');

    try {
        const response = await fetch('/api/notes/attachments', {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            const attachment = await response.json();
            currentAttachments.push(attachment);
            displayAttachment(attachment);
        }
    } catch (error) {
        console.error('Upload failed:', error);
    }
}

function displayAttachment(attachment) {
    const img = document.createElement('img');
    img.src = attachment.url;
    img.className = 'attachment-item';
    img.style.cursor = 'pointer';
    img.onclick = () => openImageModal(attachment.url);
    attachmentsContainer.appendChild(img);
}

// --- Event Listeners ---

btnNewNote.onclick = () => showEditorView();
btnCancel.onclick = () => showListView();

searchBar.oninput = renderNotes;
sortOrder.onchange = renderNotes;

clearSearch.onclick = () => {
    searchBar.value = '';
    searchBar.focus();
    renderNotes();
};

noteBodyInput.addEventListener('paste', async (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            await uploadAttachment(blob);
        }
    }
});

btnSave.onclick = async () => {
    const title = noteTitleInput.value;
    const body = noteBodyInput.value;

    if (!title) return alert('Title is required');

    const noteData = { title, body, attachments: currentAttachments };
    const method = currentNoteId ? 'PUT' : 'POST';
    const url = currentNoteId ? `/api/notes/${currentNoteId}` : '/api/notes';

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noteData)
        });

        if (response.ok) showListView();
        else alert('Save failed');
    } catch (error) {
        console.error('Save failed:', error);
    }
};

// Initial Load
loadSettingsFromURL();
loadNotes();
