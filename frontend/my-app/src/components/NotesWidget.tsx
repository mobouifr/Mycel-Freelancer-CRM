import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { Button } from '../components';

/* ─────────────────────────────────────────────
   NOTES WIDGET — Last 3 notes + quick CTA
   Used on the Dashboard right column
───────────────────────────────────────────── */

const TAG_COLORS: Record<string, string> = {
  personal:    'var(--info-bg)',
  work:        'var(--success-bg)',
  urgent:      'var(--danger-bg)',
  client:      'var(--tag-client)',
  project:     'var(--tag-project)',
  'follow-up': 'var(--glass)',
};

export default function NotesWidget() {
  const { notes, addNote } = useStore();
  const navigate = useNavigate();

  const recent = notes.slice(0, 3);

  const handleQuickCreate = () => {
    addNote({ title: 'Untitled Note', body: '', tags: [], eventId: undefined });
    navigate('/reminders');
  };

  return (
    <div style={{
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
      }}>
        <p style={{
          fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-mid)',
          letterSpacing: '.1em', textTransform: 'uppercase',
        }}>
          Recent Notes
        </p>
        <Button variant="ghost" size="sm" onClick={() => navigate('/reminders')}>
          View all →
        </Button>
      </div>

      {/* Note items */}
      {recent.length === 0 ? (
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)', marginBottom: 10,
          }}>
            No notes yet
          </p>
          <Button variant="secondary" size="sm" onClick={handleQuickCreate}>
            + Quick Note
          </Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {recent.map((note, i) => (
            <div
              key={note.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate('/reminders')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/reminders'); }}
              style={{
                padding: '10px 0',
                borderBottom: i < recent.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none',
                cursor: 'pointer',
                transition: 'background .15s',
                borderRadius: 4,
                marginLeft: -4, marginRight: -4, paddingLeft: 4, paddingRight: 4,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                <p style={{
                  fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--white)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                }}>
                  {note.title || 'Untitled'}
                </p>
                <span style={{
                  fontFamily: 'var(--font-m)', fontSize: 8, color: 'var(--text-dim)',
                  letterSpacing: '.04em', marginLeft: 8, whiteSpace: 'nowrap',
                }}>
                  {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p style={{
                fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                marginBottom: 4,
              }}>
                {note.body ? note.body.slice(0, 60) : 'Empty note...'}
              </p>
              {note.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 4 }}>
                  {note.tags.slice(0, 3).map((t) => (
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

          {/* Quick create at bottom */}
          <div style={{ marginTop: 10 }}>
            <Button variant="secondary" size="sm" onClick={handleQuickCreate} style={{ width: '100%' }}>
              + Quick Note <span style={{ opacity: .4, fontSize: 9, marginLeft: 4 }}>⌘K</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
