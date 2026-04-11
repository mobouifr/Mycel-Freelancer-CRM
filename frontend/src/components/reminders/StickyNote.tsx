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

  const save = () => {
    onUpdate(note.id, { title, content: body, tags: tag ? [tag] : [] });
    setEditing(false);
  };

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 8, padding: '12px 14px',
      display: 'flex', flexDirection: 'column', gap: 6,
      transition: 'transform .12s, box-shadow .12s',
      position: 'relative',
    }}>
      {/* Top bar: pin + actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => onConvertToEvent(note)}
            title="Convert to event"
            style={iconBtn}
          >
            {t('notes.event')}
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
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontFamily: 'var(--font-m)',
                  fontSize: 9,
                  cursor: 'pointer',
                  background: tag === tOption ? TAG_COLORS[tOption] || 'var(--glass)' : 'transparent',
                  color: tag === tOption ? 'var(--white)' : 'var(--text-dim)',
                  border: `1px solid ${tag === tOption ? 'transparent' : 'var(--border)'}`,
                  fontWeight: tag === tOption ? 600 : 400,
                  transition: 'all 0.15s ease'
                }}
              >
                {tOption}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 10 }}>
            <button onClick={() => setEditing(false)} style={smallBtn}>{t('common.cancel')}</button>
            <button onClick={save} style={{ ...smallBtn, background: 'var(--accent)', color: 'var(--bg)' }}>
              {t('common.save')}
            </button>
          </div>
        </>
      ) : (
        <div onClick={() => setEditing(true)} style={{ cursor: 'pointer', minHeight: 40 }}>
          <div style={{
            fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--text)',
            fontWeight: 600, marginBottom: 4,
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
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
              {note.tags.map((t: string) => (
                <span key={t} style={{
                  fontFamily: 'var(--font-m)', fontSize: 8, letterSpacing: '.04em',
                  padding: '2px 6px', borderRadius: 4,
                  background: TAG_COLORS[t] || 'var(--glass)',
                  color: t === 'urgent' ? 'var(--white)' : 'var(--text-mid)',
                  fontWeight: t === 'urgent' ? 'bold' : 'normal'
                }}>
                  {t}
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
        paddingTop: 8, borderTop: '1px solid var(--border)'
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
};

const smallBtn: React.CSSProperties = {
  padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border)',
  background: 'transparent', color: 'var(--text-mid)',
  fontFamily: 'var(--font-m)', fontSize: 9, cursor: 'pointer',
};
