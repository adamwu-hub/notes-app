'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Note, Attachment } from '../types';

interface NoteEditorProps {
  note: Note | null;
  currentUser: User;
  onSave: () => void;
  onCancel: () => void;
  onOpenImage: (url: string) => void;
}

export default function NoteEditor({
  note,
  currentUser,
  onSave,
  onCancel,
  onOpenImage,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [attachments, setAttachments] = useState<Attachment[]>(note?.attachments || []);
  const [selectedShareUsers, setSelectedShareUsers] = useState<string[]>(note?.sharedWith || []);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userSearchResults, setUserSearchResults] = useState<User[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);

  const isOwner = !note || note.ownerId === currentUser.id;

  useEffect(() => {
    if (bodyRef.current && note) {
      bodyRef.current.innerHTML = note.body;
    }
  }, [note]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch('/api/notes/users/list');
      if (res.ok) {
        setAllUsers(await res.json());
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (userSearchQuery) {
      const matches = allUsers.filter(
        (u) =>
          u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) &&
          !selectedShareUsers.includes(u.id)
      );
      setUserSearchResults(matches);
    } else {
      setUserSearchResults([]);
    }
  }, [userSearchQuery, allUsers, selectedShareUsers]);

  const handleSave = async () => {
    if (!title) {
      alert('Title is required');
      return;
    }

    const body = bodyRef.current?.innerHTML || '';
    const data = {
      title,
      body,
      attachments,
      sharedWith: selectedShareUsers,
    };

    const method = note ? 'PUT' : 'POST';
    const url = note ? `/api/notes/${note.id}` : '/api/notes';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      onSave();
    } else {
      alert('Save failed');
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const formData = new FormData();
          formData.append('image', blob, 'pasted.png');
          const res = await fetch('/api/notes/attachments', {
            method: 'POST',
            body: formData,
          });
          if (res.ok) {
            const att = await res.json();
            setAttachments((prev) => [...prev, att]);
          }
        }
      }
    }
  };

  const execCommand = (command: string) => {
    document.execCommand(command, false);
    bodyRef.current?.focus();
  };

  const removeShareUser = (userId: string) => {
    setSelectedShareUsers((prev) => prev.filter((id) => id !== userId));
  };

  const addShareUser = (user: User) => {
    setSelectedShareUsers((prev) => [...prev, user.id]);
    setUserSearchQuery('');
  };

  return (
    <div className="editor-view">
      <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>{note ? (isOwner ? 'Edit Note' : 'View Note') : 'New Note'}</h2>
        <button onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>

      <input
        type="text"
        className="full-width"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        readOnly={!isOwner}
      />

      {isOwner && (
        <div className="toolbar">
          <button type="button" onClick={() => execCommand('bold')}><b>B</b></button>
          <button type="button" onClick={() => execCommand('italic')}><i>I</i></button>
          <button type="button" onClick={() => execCommand('underline')}><u>U</u></button>
          <button type="button" onClick={() => execCommand('strikeThrough')}><s>S</s></button>
          <button type="button" onClick={() => execCommand('insertUnorderedList')}>• List</button>
          <button type="button" onClick={() => execCommand('insertOrderedList')}>1. List</button>
          <button type="button" onClick={() => execCommand('removeFormat')}>Tx</button>
        </div>
      )}

      <div
        ref={bodyRef}
        contentEditable={isOwner}
        className="note-body"
        onPaste={handlePaste}
        style={{ minHeight: '250px' }}
      ></div>

      <div className="attachments">
        {attachments.map((att) => (
          <img
            key={att.id}
            src={att.url}
            className="attachment-item"
            onClick={() => onOpenImage(att.url)}
          />
        ))}
      </div>

      <div className="share-section">
        <strong>Share with users:</strong>
        <div className="user-search-container">
          <input
            type="text"
            className="full-width"
            placeholder="Search users by name..."
            style={{ marginBottom: 0 }}
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
            readOnly={!isOwner}
          />
          {userSearchResults.length > 0 && (
            <div className="user-search-results">
              {userSearchResults.map((u) => (
                <div
                  key={u.id}
                  className="search-result-item"
                  onClick={() => addShareUser(u)}
                >
                  {u.username}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="selected-users">
          {selectedShareUsers.map((id) => {
            const user = allUsers.find((u) => u.id === id);
            return user ? (
              <div key={user.id} className="user-tag">
                {user.username}
                {isOwner && (
                  <span className="remove-user" onClick={() => removeShareUser(user.id)}>
                    &times;
                  </span>
                )}
              </div>
            ) : null;
          })}
        </div>
      </div>

      {isOwner && (
        <button onClick={handleSave} className="btn-primary" style={{ marginTop: '1.5rem' }}>
          Save Note
        </button>
      )}
    </div>
  );
}
