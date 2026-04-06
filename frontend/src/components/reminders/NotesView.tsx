import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useNotifications from '../../hooks/useNotifications';
import StickyNote from './StickyNote';
import type { Note, NoteColor } from '../../hooks/useStore';

interface NotesViewProps {
  onConvertToEvent?: (note: Note) => void;
}

export default function NotesView({ onConvertToEvent }: NotesViewProps) {
  const { t } = useTranslation();
  const { notes, createNote, editNote, removeNote } = useNotifications();
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');

  const pinned = notes.filter((n) => n.pinned);
  const unpinned = notes.filter((n) => !n.pinned);
  const sorted = [...pinned, ...unpinned];

  const handleCreate = () => {
    if (!newTitle.trim() && !newBody.trim()) return;
    createNote({
      title: newTitle.trim() || 'Untitled',
      body: newBody,
      tags: [],
      pinned: false,
      color: 'default' as NoteColor,
      todos: [],
    });
    setNewTitle('');
    setNewBody('');
    setShowNew(false);
  };

  const handleConvert = (note: Note) => {
    if (onConvertToEvent) onConvertToEvent(note);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)',
          letterSpacing: '.1em', textTransform: 'uppercase',
        }}>
          {t('notes.sticky_notes')} ({notes.length})
        </span>
        <button
          onClick={() => setShowNew(!showNew)}
          style={{
            background: 'var(--accent-bg)', border: '1px solid var(--accent)',
            borderRadius: 4, padding: '3px 10px', cursor: 'pointer',
            fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--accent)',
          }}
        >
          {t('notes.new')}
        </button>
      </div>

      {/* New note form */}
      {showNew && (
        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={t('notes.title_placeholder')}
            autoFocus
            style={inputStyle}
          />
          <textarea
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder={t('notes.content_placeholder')}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 40 }}
          />
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowNew(false)}
              style={cancelBtn}
            >
              {t('common.cancel')}
            </button>
            <button onClick={handleCreate} style={saveBtn}>
              {t('common.create')}
            </button>
          </div>
        </div>
      )}

      {/* Notes grid */}
      {sorted.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '24px 0',
          fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)',
        }}>
          {t('notes.empty')}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 10,
        }}>
          {sorted.map((note) => (
            <StickyNote
              key={note.id}
              note={note}
              onUpdate={editNote}
              onDelete={(id) => removeNote(id, note.title)}
              onConvertToEvent={handleConvert}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '6px 8px',
  background: 'var(--bg2)', border: '1px solid var(--border)',
  borderRadius: 4, color: 'var(--text)',
  fontFamily: 'var(--font-m)', fontSize: 11, outline: 'none',
};

const cancelBtn: React.CSSProperties = {
  padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border)',
  background: 'transparent', color: 'var(--text-mid)',
  fontFamily: 'var(--font-m)', fontSize: 9, cursor: 'pointer',
};

const saveBtn: React.CSSProperties = {
  padding: '4px 12px', borderRadius: 4, border: 'none',
  background: 'var(--accent)', color: 'var(--bg)',
  fontFamily: 'var(--font-m)', fontSize: 9, fontWeight: 600, cursor: 'pointer',
};
