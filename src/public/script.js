// State
let allNotes = [];
let currentNoteId = null;
let currentAttachments = [];
let currentUser = null;
let selectedShareUsers = [];
let isLoginMode = true;

// DOM Elements
const authSection = document.getElementById('auth-section');
const mainApp = document.getElementById('main-app');
const listView = document.getElementById('list-view');
const editorView = document.getElementById('editor-view');
const notesGrid = document.getElementById('notes-grid');
const searchBar = document.getElementById('search-bar');
const clearSearch = document.getElementById('clear-search');
const sortOrder = document.getElementById('sort-order');
const userDisplay = document.getElementById('user-display');
const userSearchInput = document.getElementById('user-search');
const userSearchResults = document.getElementById('user-search-results');
const selectedUsersList = document.getElementById('selected-users-list');

// Inputs
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const noteTitleInput = document.getElementById('note-title');
const noteBodyInput = document.getElementById('note-body');
const attachmentsContainer = document.getElementById('attachments-container');

// Buttons
const btnAuthAction = document.getElementById('btn-auth-action');
const btnToggleAuth = document.getElementById('btn-toggle-auth');
const btnLogout = document.getElementById('btn-logout');
const btnNewNote = document.getElementById('btn-new-note');
const btnSave = document.getElementById('btn-save');
const btnCancel = document.getElementById('btn-cancel');

// --- Auth Logic ---

async function checkAuth() {
    try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
            currentUser = await res.json();
            showApp();
        } else {
            showAuth();
        }
    } catch (e) { showAuth(); }
}

function showAuth() {
    authSection.classList.remove('hidden');
    mainApp.classList.add('hidden');
}

function showApp() {
    authSection.classList.add('hidden');
    mainApp.classList.remove('hidden');
    userDisplay.textContent = currentUser.username;
    loadSettingsFromURL();
    loadNotes();
}

btnToggleAuth.onclick = () => {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').textContent = isLoginMode ? 'Login' : 'Register';
    btnAuthAction.textContent = isLoginMode ? 'Login' : 'Register';
    btnToggleAuth.textContent = isLoginMode ? 'Need an account? Register' : 'Have an account? Login';
};

btnAuthAction.onclick = async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';

    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (res.ok) {
        if (isLoginMode) {
            currentUser = await res.json();
            showApp();
        } else {
            alert('Registered! Now please login.');
            isLoginMode = true;
            btnToggleAuth.click();
        }
    } else {
        const data = await res.json();
        alert(data.message || 'Auth failed');
    }
};

btnLogout.onclick = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    currentUser = null;
    showAuth();
};

// --- URL & Navigation ---

function loadSettingsFromURL() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('sort')) sortOrder.value = params.get('sort');
    if (params.get('filter')) searchBar.value = params.get('filter');
}

function updateURL() {
    const params = new URLSearchParams();
    if (sortOrder.value !== 'desc') params.set('sort', sortOrder.value);
    if (searchBar.value) params.set('filter', searchBar.value);
    const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', newURL);
}

function showListView() {
    listView.classList.remove('hidden');
    editorView.classList.add('hidden');
    currentNoteId = null;
    currentAttachments = [];
    selectedShareUsers = [];
    noteTitleInput.value = '';
    noteBodyInput.innerHTML = '';
    attachmentsContainer.innerHTML = '';
    loadNotes();
}

async function showEditorView(note = null) {
    listView.classList.add('hidden');
    editorView.classList.remove('hidden');
    userSearchInput.value = '';
    userSearchResults.innerHTML = '';
    userSearchResults.classList.add('hidden');
    
    // Load users for sharing
    const usersRes = await fetch('/api/notes/users/list');
    const allUsers = await usersRes.json();
    
    if (note) {
        document.getElementById('editor-title-label').textContent = 'Edit Note';
        currentNoteId = note.id;
        noteTitleInput.value = note.title;
        noteBodyInput.innerHTML = note.body;
        currentAttachments = note.attachments || [];
        selectedShareUsers = note.sharedWith || [];
        attachmentsContainer.innerHTML = '';
        currentAttachments.forEach(displayAttachment);
    } else {
        document.getElementById('editor-title-label').textContent = 'New Note';
        currentNoteId = null;
        currentAttachments = [];
        selectedShareUsers = [];
        noteBodyInput.innerHTML = '';
    }

    const isOwner = !note || note.ownerId === currentUser.id;
    noteTitleInput.readOnly = !isOwner;
    noteBodyInput.contentEditable = isOwner;
    document.getElementById('editor-toolbar').style.display = isOwner ? 'flex' : 'none';

    setupUserSearch(allUsers);
    renderSelectedUsers(allUsers);
}

function setupUserSearch(allUsers) {
    userSearchInput.oninput = () => {
        const query = userSearchInput.value.toLowerCase();
        if (!query) {
            userSearchResults.classList.add('hidden');
            return;
        }

        const matches = allUsers.filter(u => 
            u.username.toLowerCase().includes(query) && 
            !selectedShareUsers.includes(u.id)
        );

        if (matches.length > 0) {
            userSearchResults.innerHTML = matches.map(u => `
                <div class="search-result-item" data-id="${u.id}">${u.username}</div>
            `).join('');
            userSearchResults.classList.remove('hidden');

            userSearchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.onclick = () => {
                    const id = item.getAttribute('data-id');
                    selectedShareUsers.push(id);
                    userSearchInput.value = '';
                    userSearchResults.classList.add('hidden');
                    renderSelectedUsers(allUsers);
                };
            });
        } else {
            userSearchResults.classList.add('hidden');
        }
    };

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (!userSearchInput.contains(e.target) && !userSearchResults.contains(e.target)) {
            userSearchResults.classList.add('hidden');
        }
    });
}

function renderSelectedUsers(allUsers) {
    selectedUsersList.innerHTML = '';
    selectedShareUsers.forEach(id => {
        const user = allUsers.find(u => u.id === id);
        if (user) {
            const tag = document.createElement('div');
            tag.className = 'user-tag';
            tag.innerHTML = `
                ${user.username}
                <span class="remove-user">&times;</span>
            `;
            tag.querySelector('.remove-user').onclick = () => {
                selectedShareUsers = selectedShareUsers.filter(sid => sid !== id);
                renderSelectedUsers(allUsers);
            };
            selectedUsersList.appendChild(tag);
        }
    });
}

// --- Note Logic ---

async function loadNotes() {
    try {
        const res = await fetch('/api/notes');
        if (res.status === 401) return showAuth();
        allNotes = await res.json();
        renderNotes();
    } catch (e) { console.error(e); }
}

function stripTags(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
}

function renderNotes() {
    const term = searchBar.value.toLowerCase();
    const order = sortOrder.value;
    clearSearch.style.display = term ? 'block' : 'none';
    updateURL();

    let filtered = allNotes.filter(n => 
        (n.title || '').toLowerCase().includes(term) || 
        stripTags(n.body || '').toLowerCase().includes(term)
    );

    filtered.sort((a, b) => {
        const dA = new Date(a.createdAt);
        const dB = new Date(b.createdAt);
        return order === 'desc' ? dB - dA : dA - dB;
    });

    notesGrid.innerHTML = '';
    filtered.forEach(note => {
        const isOwner = note.ownerId === currentUser.id;
        const card = document.createElement('div');
        card.className = 'note-card';
        const plainBody = stripTags(note.body);
        card.innerHTML = `
            ${!isOwner ? `<div class="badge shared" title="Shared by ${note.ownerUsername}">Shared with me</div>` : '<div class="badge">My Note</div>'}
            <div class="note-actions">
                ${isOwner ? '<button class="icon-btn edit-btn">✎</button><button class="icon-btn del-btn">🗑</button>' : '<button class="icon-btn view-btn">👁</button>'}
            </div>
            <h3>${note.title}</h3>
            <p>${plainBody.substring(0, 100)}${plainBody.length > 100 ? '...' : ''}</p>
            <div class="attachments">
                ${(note.attachments || []).map(a => `<img src="${a.url}" class="thumb">`).join('')}
            </div>
        `;
        
        const thumbs = card.querySelectorAll('.thumb');
        thumbs.forEach((t, i) => t.onclick = () => openModal(note.attachments[i].url));

        if (isOwner) {
            card.querySelector('.edit-btn').onclick = () => showEditorView(note);
            card.querySelector('.del-btn').onclick = () => deleteNote(note.id);
        } else {
            card.querySelector('.view-btn').onclick = () => {
                showEditorView(note);
                // Disable editing for shared notes (simple version)
                btnSave.classList.add('hidden');
            };
        }
        notesGrid.appendChild(card);
    });
}

async function deleteNote(id) {
    if (confirm('Delete?')) {
        await fetch(`/api/notes/${id}`, { method: 'DELETE' });
        loadNotes();
    }
}

btnSave.onclick = async () => {
    const title = noteTitleInput.value;
    const body = noteBodyInput.innerHTML;
    if (!title) return alert('Title req');

    const data = { title, body, attachments: currentAttachments, sharedWith: selectedShareUsers };
    const method = currentNoteId ? 'PUT' : 'POST';
    const url = currentNoteId ? `/api/notes/${currentNoteId}` : '/api/notes';

    const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) showListView();
    else alert('Save failed');
};

// --- Attachments & Modal ---

async function uploadAttachment(blob) {
    const formData = new FormData();
    formData.append('image', blob, 'pasted.png');
    const res = await fetch('/api/notes/attachments', { method: 'POST', body: formData });
    if (res.ok) {
        const att = await res.json();
        currentAttachments.push(att);
        displayAttachment(att);
    }
}

function displayAttachment(att) {
    const img = document.createElement('img');
    img.src = att.url;
    img.className = 'attachment-item';
    img.onclick = () => openModal(att.url);
    attachmentsContainer.appendChild(img);
}

function openModal(url) {
    document.getElementById('modal-img').src = url;
    document.getElementById('image-modal').style.display = 'flex';
}

document.getElementById('image-modal').onclick = () => {
    document.getElementById('image-modal').style.display = 'none';
};

// --- Init ---

btnNewNote.onclick = () => {
    btnSave.classList.remove('hidden');
    showEditorView();
};
btnCancel.onclick = showListView;
searchBar.oninput = renderNotes;
sortOrder.onchange = renderNotes;
clearSearch.onclick = () => { searchBar.value = ''; renderNotes(); };

noteBodyInput.onpaste = async (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
            await uploadAttachment(item.getAsFile());
        }
    }
};

// Toolbar Logic
document.querySelectorAll('#editor-toolbar button').forEach(btn => {
    btn.onclick = (e) => {
        const command = btn.getAttribute('data-command');
        document.execCommand(command, false, null);
        noteBodyInput.focus();
    };
});

checkAuth();

