'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Note } from '../types';
import Auth from '../components/Auth';
import NoteList from '../components/NoteList';
import NoteEditor from '../components/NoteEditor';
import ImageModal from '../components/ImageModal';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [modalImage, setModalImage] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    } catch (e) {
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadNotes = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (e) {
      console.error('Failed to load notes', e);
    }
  }, [currentUser]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (currentUser) {
      loadNotes();
      
      // Load URL params
      const params = new URLSearchParams(window.location.search);
      if (params.get('sort')) setSortOrder(params.get('sort') as 'asc' | 'desc');
      if (params.get('filter')) setSearchQuery(params.get('filter') || '');
    }
  }, [currentUser, loadNotes]);

  // Update URL on state change
  useEffect(() => {
    if (currentUser) {
      const params = new URLSearchParams();
      if (sortOrder !== 'desc') params.set('sort', sortOrder);
      if (searchQuery) params.set('filter', searchQuery);
      const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState({}, '', newURL);
    }
  }, [currentUser, sortOrder, searchQuery]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    setNotes([]);
    setView('list');
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setView('editor');
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setView('editor');
  };

  const handleDeleteNote = async (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadNotes();
      }
    }
  };

  const handleSaveNote = () => {
    setView('list');
    loadNotes();
  };

  if (loading) return <div className="container">Loading...</div>;

  if (!currentUser) {
    return <Auth onLogin={checkAuth} />;
  }

  return (
    <div id="main-app">
      <header className="header">
        <h1 style={{ fontSize: '1.2rem', margin: 0 }}>
          Secure Notes: <span id="user-display">{currentUser.username}</span>
        </h1>
        <div>
          <button onClick={handleCreateNote} className="btn-primary btn-small">+ New Note</button>
          <button onClick={handleLogout} className="btn-secondary btn-small">Logout</button>
        </div>
      </header>

      <main className="container">
        {view === 'list' ? (
          <NoteList
            notes={notes}
            currentUser={currentUser}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
            onOpenImage={setModalImage}
          />
        ) : (
          <NoteEditor
            note={editingNote}
            currentUser={currentUser}
            onSave={handleSaveNote}
            onCancel={() => setView('list')}
            onOpenImage={setModalImage}
          />
        )}
      </main>

      {modalImage && (
        <ImageModal url={modalImage} onClose={() => setModalImage(null)} />
      )}
    </div>
  );
}
