import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const TAG_COLORS: Record<string, string> = {
  personal: 'var(--info-bg)',
  work: 'var(--success-bg)',
  urgent: 'var(--danger-bg)',
  client: 'var(--tag-client)',
  project: 'var(--tag-project)',
  'follow-up': 'var(--glass)',
};

const NOTE_COLORS: { key: string; bg: string; border: string }[] = [
  { key: 'default', bg: 'var(--surface)',    border: 'var(--border)' },
  { key: 'yellow',  bg: '#2a2a1a',          border: '#5a5a2a' },
  { key: 'green',   bg: '#1a2a1a',          border: '#2a5a2a' },
  { key: 'blue',    bg: '#1a1a2a',          border: '#2a2a5a' },
  { key: 'pink',    bg: '#2a1a2a',          border: '#5a2a4a' },
  { key: 'purple',  bg: '#221a2a',          border: '#4a2a5a' },
];

interface StickyNoteProps {
  note: any;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  onConvertToEvent: (note: any) => void;
}

export default function StickyNote({ note, onUpdate, onDelete, onConvertToEvent }: StickyNoteProps) {
  const { t, i18n } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.content);
  const [tag, setTag] = useState(note.tags?.[0] || '');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const noteColor = NOTE_COLORS.find(c => c.key === (note.color || 'default')) || NOTE_COLORS[0];

  const save = () => {
    onUpdate(note.id, { title, content: body, tags: tag ? [tag] : [] });
    setEditing(false);
  };

  const togglePin = () => {
    onUpdate(note.id, { title: note.title, content: note.content, tags: note.tags || [], pinned: !note.pinned });
  };

  const setColor = (color: string) => {
    onUpdate(note.id, { title: note.title, content: note.content, tags: note.tags || [], color });
    setShowColorPicker(false);
  };

  return (
    <div style={{
      background: noteColor.bg,
      border: `1px solid ${noteColor.border}`,
      borderRadius: 8, padding: '10px 12px',
      display: 'flex', flexDirection: 'column', gap: 4,
      transition: 'transform .12s, box-shadow .12s',
      position: 'relative',
    }}>
      {/* Top bar: pin + color + actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        {/* Left: pin badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {note.pinned && (
            <span style={{
              fontFamily: 'var(--font-m)', fontSize: 8, fontWeight: 600,
              color: 'var(--accent)', letterSpacing: '.04em',
            }}>
              Pinned
            </span>
          )}
        </div>

        {/* Right: actions */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {/* Color picker toggle */}
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Color"
            style={iconBtn}
          >
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: noteColor.border,
              border: '1px solid var(--text-dim)',
            }} />
          </button>
          {/* Pin toggle */}
          <button
            onClick={togglePin}
            title={note.pinned ? 'Unpin' : 'Pin'}
            style={{ ...iconBtn, color: note.pinned ? 'var(--accent)' : 'var(--text-dim)' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill={note.pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 17v5M9 2h6l-1 7h4l-7 8 1-7H8l1-8z" />
            </svg>
          </button>
          {/* Convert to event */}
          <button onClick={() => onConvertToEvent(note)} title="Convert to event" style={iconBtn}>
            {t('notes.event')}
          </button>
          {/* Delete */}
          <button onClick={() => onDelete(note.id)} title="Delete" style={{ ...iconBtn, color: 'var(--danger)' }}>
            ×
          </button>
        </div>
      </div>

      {/* Color picker dropdown */}
      {showColorPicker && (
        <div style={{
          display: 'flex', gap: 4, padding: '4px 0', marginBottom: 4,
        }}>
          {NOTE_COLORS.map(c => (
            <button
              key={c.key}
              onClick={() => setColor(c.key)}
              style={{
                width: 18, height: 18, borderRadius: '50%',
                background: c.bg, border: `2px solid ${note.color === c.key ? 'var(--accent)' : c.border}`,
                cursor: 'pointer', padding: 0,
                transition: 'border-color .12s',
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
            placeholder={t('notes.title_label')}
            style={{
              background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)',
              color: 'var(--text)', fontFamily: 'var(--font-m)', fontSize: 12,
              fontWeight: 600, outline: 'none', paddingBottom: 4,
            }}
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t('notes.content_placeholder')}
            rows={3}
            style={{
              background: 'transparent', border: 'none',
              color: 'var(--text)', fontFamily: 'var(--font-m)', fontSize: 10,
              outline: 'none', resize: 'vertical', minHeight: 40,
            }}
          />
          <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
            {['urgent', 'work', 'personal', 'client'].map(tOption => (
              <button
                key={tOption}
                onClick={() => setTag(tag === tOption ? '' : tOption)}
                style={{
                  padding: '2px 8px', borderRadius: 12,
                  fontFamily: 'var(--font-m)', fontSize: 9, cursor: 'pointer',
                  background: tag === tOption ? TAG_COLORS[tOption] || 'var(--glass)' : 'transparent',
                  color: tag === tOption ? 'var(--white)' : 'var(--text-dim)',
                  border: `1px solid ${tag === tOption ? 'transparent' : 'var(--border)'}`,
                  fontWeight: tag === tOption ? 600 : 400,
                  transition: 'all 0.15s ease',
                }}
              >
                {tOption}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 8 }}>
            <button onClick={() => setEditing(false)} style={smallBtn}>{t('common.cancel')}</button>
            <button onClick={save} style={{ ...smallBtn, background: 'var(--accent)', color: 'var(--bg)' }}>
              {t('common.save')}
            </button>
          </div>
        </>
      ) : (
        <div onClick={() => setEditing(true)} style={{ cursor: 'pointer', minHeight: 36 }}>
          <div style={{
            fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--text)',
            fontWeight: 600, marginBottom: 3,
          }}>
            {note.title || t('notes.untitled')}
          </div>
          <div style={{
            fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-mid)',
            lineHeight: 1.5, whiteSpace: 'pre-wrap',
            overflow: 'hidden', maxHeight: 80,
          }}>
            {note.content || t('notes.click_to_edit')}
          </div>

          {note.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
              {note.tags.map((tg: string) => (
                <span key={tg} style={{
                  fontFamily: 'var(--font-m)', fontSize: 8, letterSpacing: '.04em',
                  padding: '2px 6px', borderRadius: 4,
                  background: TAG_COLORS[tg] || 'var(--glass)',
                  color: tg === 'urgent' ? 'var(--white)' : 'var(--text-mid)',
                  fontWeight: tg === 'urgent' ? 'bold' : 'normal',
                }}>
                  {tg}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Timestamp */}
      <div style={{
        fontFamily: 'var(--font-m)', fontSize: 8, color: 'var(--text-dim)',
        marginTop: 'auto', letterSpacing: '.04em',
        paddingTop: 6, borderTop: `1px solid ${noteColor.border}`,
      }}>
        {new Date(note.updatedAt).toLocaleDateString(i18n.language, {
          month: 'short', day: 'numeric',
        })}
      </div>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 10, color: 'var(--text-dim)', padding: 0,
  display: 'flex', alignItems: 'center',
};

const smallBtn: React.CSSProperties = {
  padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border)',
  background: 'transparent', color: 'var(--text-mid)',
  fontFamily: 'var(--font-m)', fontSize: 9, cursor: 'pointer',
};
