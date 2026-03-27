'use client';

import { User, Note } from '../types';

interface NoteListProps {
  notes: Note[];
  currentUser: User;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (o: 'asc' | 'desc') => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onOpenImage: (url: string) => void;
}

export default function NoteList({
  notes,
  currentUser,
  searchQuery,
  setSearchQuery,
  sortOrder,
  setSortOrder,
  onEditNote,
  onDeleteNote,
  onOpenImage,
}: NoteListProps) {
  const stripTags = (html: string) => {
    if (typeof document === 'undefined') return html;
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const filteredNotes = notes
    .filter((n) =>
      (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      stripTags(n.body || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dA = new Date(a.createdAt).getTime();
      const dB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? dB - dA : dA - dB;
    });

  return (
    <div id="list-view">
      <div className="controls">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Filter notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <span className="clear-search" onClick={() => setSearchQuery('')}>
              &times;
            </span>
          )}
        </div>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      <div className="notes-grid">
        {filteredNotes.map((note) => {
          const isOwner = note.ownerId === currentUser.id;
          return (
            <div key={note.id} className="note-card">
              {!isOwner ? (
                <div className="badge shared" title={`Shared by ${note.ownerUsername}`}>
                  Shared with me
                </div>
              ) : (
                <div className="badge">My Note</div>
              )}
              <div className="note-actions">
                {isOwner ? (
                  <>
                    <button className="icon-btn" onClick={() => onEditNote(note)}>✎</button>
                    <button className="icon-btn" onClick={() => onDeleteNote(note.id)}>🗑</button>
                  </>
                ) : (
                  <button className="icon-btn" onClick={() => onEditNote(note)}>👁</button>
                )}
              </div>
              <h3>{note.title}</h3>
              <div
                className="note-card-content"
                dangerouslySetInnerHTML={{ __html: note.body }}
              />
              <div className="attachments">
                {(note.attachments || []).map((a) => (
                  <img
                    key={a.id}
                    src={a.url}
                    className="thumb"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenImage(a.url);
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
