import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { setWidgetComponent } from './WidgetRegistry';

/* ─────────────────────────────────────────────
   NOTES QUICK-CAPTURE — Fast composer + 3
   most recent notes (wraps store directly)
───────────────────────────────────────────── */

const TAG_COLORS: Record<string, string> = {
  personal: 'var(--info-bg)',
  work: 'var(--success-bg)',
  urgent: 'var(--danger-bg)',
  client: 'var(--tag-client)',
  project: 'var(--tag-project)',
  'follow-up': 'var(--glass)',
};

function NotesCapture() {
  const { notes, addNote } = useStore();
  const navigate = useNavigate();
  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  const recent = notes.slice(0, 3);

  // Keyboard shortcut: Cmd/Ctrl + K to open composer
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setComposerOpen(true);
        setTimeout(() => titleRef.current?.focus(), 50);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleCreate = () => {
    if (!title.trim() && !body.trim()) return;
    addNote({
      title: title.trim() || 'Untitled Note',
      body: body.trim(),
      tags: [],
      eventId: undefined,
    });
    setTitle('');
    setBody('');
    setComposerOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Quick Composer */}
      {composerOpen ? (
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--accent-hover)',
            borderRadius: 6,
            padding: 12,
            marginBottom: 10,
            animation: 'fadeUp .15s var(--ease) both',
          }}
        >
          <input
            ref={titleRef}
            type="text"
            placeholder="Note title…"
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
            }}
          />
          <textarea
            placeholder="Start typing… (optional)"
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 6,
              marginTop: 6,
            }}
          >
            <button
              onClick={() => {
                setComposerOpen(false);
                setTitle('');
                setBody('');
              }}
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                background: 'none',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font-m)',
                fontSize: 10,
                color: 'var(--text-dim)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                background: 'var(--accent)',
                border: 'none',
                fontFamily: 'var(--font-m)',
                fontSize: 10,
                color: 'var(--white)',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Save
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
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-mid)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-dim)';
          }}
        >
          + Quick Note <span style={{ opacity: 0.4, fontSize: 9 }}>⌘K</span>
        </button>
      )}

      {/* Recent notes */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {recent.length === 0 ? (
          <p
            style={{
              fontFamily: 'var(--font-m)',
              fontSize: 11,
              color: 'var(--text-dim)',
              textAlign: 'center',
              padding: '16px 0',
            }}
          >
            No notes yet — start typing above
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {recent.map((note, i) => (
              <div
                key={note.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate('/reminders')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate('/reminders');
                }}
                style={{
                  padding: '8px 6px',
                  borderBottom:
                    i < recent.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none',
                  cursor: 'pointer',
                  borderRadius: 4,
                  transition: 'background .12s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'var(--glass)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 2,
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-m)',
                      fontSize: 11,
                      color: 'var(--white)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                    }}
                  >
                    {note.title || 'Untitled'}
                  </p>
                  <span
                    style={{
                      fontFamily: 'var(--font-m)',
                      fontSize: 8,
                      color: 'var(--text-dim)',
                      letterSpacing: '.04em',
                      marginLeft: 8,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {new Date(note.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-m)',
                    fontSize: 10,
                    color: 'var(--text-dim)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: 3,
                  }}
                >
                  {note.body ? note.body.slice(0, 60) : 'Empty note...'}
                </p>
                {note.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 3 }}>
                    {note.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        style={{
                          fontFamily: 'var(--font-m)',
                          fontSize: 7,
                          letterSpacing: '.06em',
                          padding: '1px 5px',
                          borderRadius: 3,
                          background: TAG_COLORS[t] || 'var(--glass)',
                          color: 'var(--text-mid)',
                        }}
                      >
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
      <div
        style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 8,
          marginTop: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <button
          onClick={() => navigate('/reminders')}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-m)',
            fontSize: 10,
            color: 'var(--accent)',
            cursor: 'pointer',
            letterSpacing: '.04em',
            transition: 'opacity .15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = '1';
          }}
        >
          View all in Reminders →
        </button>
        <span
          style={{
            fontFamily: 'var(--font-m)',
            fontSize: 8,
            color: 'var(--text-dim)',
            opacity: 0.5,
          }}
        >
          ⌘K to compose
        </span>
      </div>
    </div>
  );
}

setWidgetComponent('notes', NotesCapture);

export default NotesCapture;



