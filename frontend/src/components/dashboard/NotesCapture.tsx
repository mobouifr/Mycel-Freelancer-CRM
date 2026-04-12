import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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

const COLOR_DOT: Record<string, string> = {
  default: 'var(--text-dim)', yellow: '#a0a040', green: '#40a040',
  blue: '#4060c0', pink: '#c040a0', purple: '#8040c0',
};

function NotesCapture() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<any[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
      if (editingId) {
        await api.put(`/dashboard/notes/${editingId}`, {
          title: title || 'Untitled Note',
          content: body,
          tags
        });
      } else {
        await api.post('/dashboard/notes', {
          title: title || 'Untitled Note',
          content: body,
          tags
        });
      }
      // Refresh on success and close
      fetchNotes();
      setTitle('');
      setBody('');
      setTag('');
      setEditingId(null);
      setComposerOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (note: any) => {
    setEditingId(note.id);
    setTitle(note.title);
    setBody(note.content || '');
    setTag(note.tags?.[0] || '');
    setComposerOpen(true);
  };

  const deleteNote = async (id: string) => {
    if (!window.confirm(t('common.confirm_delete', 'Are you sure you want to delete this note?'))) return;
    try {
      await api.delete(`/dashboard/notes/${id}`);
      fetchNotes();
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
        setEditingId(null);
        setTitle('');
        setBody('');
        setTag('');
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 6 }}>
            <button
              onClick={() => { setComposerOpen(false); setEditingId(null); setTitle(''); setBody(''); setTag(''); }}
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
            setEditingId(null);
            setTitle('');
            setBody('');
            setTag('');
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
                  position: 'relative'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                      background: COLOR_DOT[note.color] || COLOR_DOT.default,
                    }} />
                    {note.pinned && (
                      <span style={{ fontFamily: 'var(--font-m)', fontSize: 7, color: 'var(--accent)', fontWeight: 600, flexShrink: 0 }}>
                        Pinned
                      </span>
                    )}
                    <p style={{
                      fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--white)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, margin: 0,
                    }}>
                      {note.title || t('notes_capture.untitled')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button
                      onClick={() => startEdit(note)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '2px', color: 'var(--text-dim)',
                      }}
                      title={t('common.edit', 'Edit')}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--white)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '2px', color: 'var(--text-dim)',
                      }}
                      title={t('common.delete', 'Delete')}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                    <span style={{
                      fontFamily: 'var(--font-m)', fontSize: 8, color: 'var(--text-dim)',
                      letterSpacing: '.04em', whiteSpace: 'nowrap',
                    }}>
                      {new Date(note.updatedAt).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                <p style={{
                  fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  marginBottom: 4,
                }}>
                  {note.content ? note.content.slice(0, 60) : t('notes_capture.empty_note')}
                </p>
                {note.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
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
            ))}
          </div>
        )}
      </div>

      {/* View all link */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => navigate('/reminders')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--accent)',
            padding: 0, textDecoration: 'underline',
          }}
        >
          {t('notes_capture.view_all', 'View all notes')}
        </button>
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
