import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { setWidgetComponent } from './WidgetRegistry';
import api from '../../services/api';

/* ─────────────────────────────────────────────
   NOTES QUICK-CAPTURE — Fast composer + 3
   most recent notes (api calls directly)
───────────────────────────────────────────── */

const TAG_COLORS: Record<string, string> = {
  personal:    'var(--info-bg)',
  work:        'var(--success-bg)',
  urgent:      'var(--danger-bg)',
  client:      'var(--tag-client)',
  project:     'var(--tag-project)',
  'follow-up': 'var(--glass)',
};

function NotesCapture() {
  const { t, i18n } = useTranslation();
  const [notes, setNotes] = useState<any[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tag, setTag] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  const fetchNotes = () => {
    api.get('/dashboard/notes')
      .then(res => {
        if (res.data) setNotes(res.data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreate = async () => {
    if (!title && !body) return;
    const tags = tag.trim() ? [tag.trim().toLowerCase()] : [];
    
    try {
      await api.post('/dashboard/notes', {
        title: title || 'Untitled Note',
        content: body,
        tags
      });
      // Refresh on success and close
      fetchNotes();
      setTitle('');
      setBody('');
      setTag('');
      setComposerOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const recent = notes.slice(0, 3);

  // Global keybind ⌘K
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setComposerOpen(true);
        setTimeout(() => titleRef.current?.focus(), 50);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Quick Composer */}
      {composerOpen ? (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--accent-hover)',
          borderRadius: 6,
          padding: 12,
          marginBottom: 10,
          animation: 'fadeUp .15s var(--ease) both',
        }}>
          <input
            ref={titleRef}
            type="text"
            placeholder={t('notes_capture.title_placeholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              fontFamily: 'var(--font-m)',
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--white)',
              outline: 'none',
              marginBottom: 6,
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
          />
          <textarea
            placeholder={t('notes_capture.body_placeholder')}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              fontFamily: 'var(--font-m)',
              fontSize: 11,
              color: 'var(--text)',
              outline: 'none',
              resize: 'none',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 6 }}>
            <button
              onClick={() => { setComposerOpen(false); setTitle(''); setBody(''); }}
              style={{
                padding: '4px 10px', borderRadius: 4,
                background: 'none', border: '1px solid var(--border)',
                fontFamily: 'var(--font-m)', fontSize: 10,
                color: 'var(--text-dim)', cursor: 'pointer',
              }}
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleCreate}
              style={{
                padding: '4px 10px', borderRadius: 4,
                background: 'var(--accent)', border: 'none',
                fontFamily: 'var(--font-m)', fontSize: 10,
                color: 'var(--bg)', cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              {t('notes_capture.save')}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            setComposerOpen(true);
            setTimeout(() => titleRef.current?.focus(), 50);
          }}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'var(--surface)',
            border: '1px dashed var(--border)',
            borderRadius: 6,
            fontFamily: 'var(--font-m)',
            fontSize: 11,
            color: 'var(--text-dim)',
            cursor: 'pointer',
            textAlign: 'left',
            marginBottom: 10,
            transition: 'all .15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--text-mid)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-dim)';
          }}
        >
          {t('notes_capture.quick_note')}{' '}
          <span style={{ opacity: 0.4, fontSize: 9 }}>⌘K</span>
        </button>
      )}

      {/* Recent notes */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {recent.length === 0 ? (
          <p style={{
            fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)',
            textAlign: 'center', padding: '16px 0',
          }}>
            {t('notes_capture.no_notes')}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {recent.map((note, i) => (
              <div
                key={note.id}
                style={{
                  padding: '8px 6px',
                  borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none',
                  borderRadius: 4,
                  transition: 'background .12s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                  <p style={{
                    fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--white)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                  }}>
                    {note.title || t('notes_capture.untitled')}
                  </p>
                  <span style={{
                    fontFamily: 'var(--font-m)', fontSize: 8, color: 'var(--text-dim)',
                    letterSpacing: '.04em', marginLeft: 8, whiteSpace: 'nowrap',
                  }}>
                    {new Date(note.updatedAt).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p style={{
                  fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  marginBottom: 3,
                }}>
                  {note.content ? note.content.slice(0, 60) : t('notes_capture.empty_note')}
                </p>
                {note.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 3 }}>
                    {note.tags.slice(0, 3).map((t: string) => (
                      <span key={t} style={{
                        fontFamily: 'var(--font-m)', fontSize: 7, letterSpacing: '.06em',
                        padding: '1px 5px', borderRadius: 3,
                        background: TAG_COLORS[t] || 'var(--glass)',
                        color: 'var(--text-mid)',
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View all link */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)',
          letterSpacing: '.04em',
        }}>
          {notes.length} recent note{notes.length !== 1 && 's'}
        </span>
        <span style={{
          fontFamily: 'var(--font-m)', fontSize: 8, color: 'var(--text-dim)',
          opacity: 0.5,
        }}>
          ⌘K to compose
        </span>
      </div>
    </div>
  );
}

setWidgetComponent('notes', NotesCapture);

export default NotesCapture;
