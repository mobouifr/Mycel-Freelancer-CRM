import { useState } from 'react';
import type { Note, NoteColor } from '../../hooks/useStore';

const COLOR_MAP: Record<NoteColor, string> = {
  yellow: 'var(--note-yellow)',
  green: 'var(--note-green)',
  blue: 'var(--note-blue)',
  pink: 'var(--note-pink)',
  purple: 'var(--note-purple)',
  default: 'var(--note-default)',
};

const COLOR_SWATCHES: NoteColor[] = ['default', 'yellow', 'green', 'blue', 'pink', 'purple'];
const SWATCH_COLORS: Record<NoteColor, string> = {
  default: 'var(--text-dim)',
  yellow: 'rgba(250, 220, 80, 0.7)',
  green: 'rgba(72, 200, 100, 0.7)',
  blue: 'rgba(80, 160, 240, 0.7)',
  pink: 'rgba(240, 100, 160, 0.7)',
  purple: 'rgba(180, 130, 240, 0.7)',
};

interface StickyNoteProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onConvertToEvent: (note: Note) => void;
}

export default function StickyNote({ note, onUpdate, onDelete, onConvertToEvent }: StickyNoteProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [showColors, setShowColors] = useState(false);

  const save = () => {
    onUpdate(note.id, { title, body });
    setEditing(false);
  };

  return (
    <div style={{
      background: COLOR_MAP[note.color] || COLOR_MAP.default,
      border: '1px solid var(--border)',
      borderRadius: 8, padding: '12px 14px',
      display: 'flex', flexDirection: 'column', gap: 6,
      transition: 'transform .12s, box-shadow .12s',
      position: 'relative',
    }}>
      {/* Top bar: pin + actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => onUpdate(note.id, { pinned: !note.pinned })}
          title={note.pinned ? 'Unpin' : 'Pin'}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, color: note.pinned ? 'var(--accent)' : 'var(--text-dim)',
            padding: 0, transition: 'color .12s',
          }}
        >
          {note.pinned ? 'Pinned' : 'Pin'}
        </button>

        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setShowColors(!showColors)}
            title="Change color"
            style={iconBtn}
          >
            Color
          </button>
          <button
            onClick={() => onConvertToEvent(note)}
            title="Convert to event"
            style={iconBtn}
          >
            Event
          </button>
          <button
            onClick={() => onDelete(note.id)}
            title="Delete note"
            style={{ ...iconBtn, color: 'var(--danger)' }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Color picker */}
      {showColors && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 2 }}>
          {COLOR_SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => { onUpdate(note.id, { color: c }); setShowColors(false); }}
              style={{
                width: 16, height: 16, borderRadius: '50%', border: 'none',
                background: SWATCH_COLORS[c], cursor: 'pointer',
                outline: note.color === c ? '2px solid var(--accent)' : 'none',
                outlineOffset: 2,
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      {editing ? (
        <>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            style={{
              background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)',
              color: 'var(--text)', fontFamily: 'var(--font-m)', fontSize: 12,
              fontWeight: 600, outline: 'none', paddingBottom: 4,
            }}
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write something..."
            rows={3}
            style={{
              background: 'transparent', border: 'none',
              color: 'var(--text)', fontFamily: 'var(--font-m)', fontSize: 10,
              outline: 'none', resize: 'vertical', minHeight: 40,
            }}
          />
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <button onClick={() => setEditing(false)} style={smallBtn}>Cancel</button>
            <button onClick={save} style={{ ...smallBtn, background: 'var(--accent)', color: 'var(--bg)' }}>
              Save
            </button>
          </div>
        </>
      ) : (
        <div onClick={() => setEditing(true)} style={{ cursor: 'pointer', minHeight: 40 }}>
          <div style={{
            fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--text)',
            fontWeight: 600, marginBottom: 4,
          }}>
            {note.title || 'Untitled'}
          </div>
          <div style={{
            fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-mid)',
            lineHeight: 1.5, whiteSpace: 'pre-wrap',
            overflow: 'hidden', maxHeight: 80,
          }}>
            {note.body || 'Click to edit...'}
          </div>
        </div>
      )}

      {/* Todos inside note */}
      {note.todos.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 6, marginTop: 2 }}>
          {note.todos.map((t) => (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '2px 0',
            }}>
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => {
                  const updated = note.todos.map((td) =>
                    td.id === t.id ? { ...td, done: !td.done } : td,
                  );
                  onUpdate(note.id, { todos: updated });
                }}
                style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
              <span style={{
                fontFamily: 'var(--font-m)', fontSize: 10,
                color: t.done ? 'var(--text-dim)' : 'var(--text)',
                textDecoration: t.done ? 'line-through' : 'none',
              }}>
                {t.text}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Timestamp */}
      <div style={{
        fontFamily: 'var(--font-m)', fontSize: 8, color: 'var(--text-dim)',
        marginTop: 'auto', letterSpacing: '.04em',
      }}>
        {new Date(note.updatedAt).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric',
        })}
      </div>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 10, color: 'var(--text-dim)', padding: 0,
};

const smallBtn: React.CSSProperties = {
  padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border)',
  background: 'transparent', color: 'var(--text-mid)',
  fontFamily: 'var(--font-m)', fontSize: 9, cursor: 'pointer',
};
