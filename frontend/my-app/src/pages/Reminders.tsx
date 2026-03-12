import { useState, useEffect, useCallback } from 'react';
import { useStore, type Note } from '../hooks/useStore';
import { Button, Input, Modal } from '../components';

/* ─────────────────────────────────────────────
   REMINDERS PAGE — Split view: Notes + Events
   Left: note-taking list with editor
   Right: event manager with add modal
───────────────────────────────────────────── */

// ── Tag presets ──────────────────────────────
const TAG_PRESETS = ['personal', 'work', 'urgent', 'client', 'project', 'follow-up'];
const TAG_COLORS: Record<string, string> = {
  personal:    'var(--info-bg)',
  work:        'var(--success-bg)',
  urgent:      'var(--danger-bg)',
  client:      'var(--tag-client)',
  project:     'var(--tag-project)',
  'follow-up': 'var(--glass)',
};

export default function Reminders() {
  const {
    notes, events,
    addNote, updateNote, deleteNote,
    addEvent, deleteEvent,
    undo, canUndo,
  } = useStore();

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const [undoLabel, setUndoLabel] = useState('');

  // ── Note editor state ──────────────────────
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [noteTags, setNoteTags] = useState<string[]>([]);

  // ── Event form state ───────────────────────
  const [evtTitle, setEvtTitle] = useState('');
  const [evtDate, setEvtDate] = useState('');
  const [evtTime, setEvtTime] = useState('09:00');
  const [evtTimezone, setEvtTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [evtDesc, setEvtDesc] = useState('');
  const [evtClientTag, setEvtClientTag] = useState('');
  const [evtReminder, setEvtReminder] = useState('15');
  const [evtNoteId, setEvtNoteId] = useState('');

  // Load active note into editor
  useEffect(() => {
    if (activeNoteId) {
      const n = notes.find((x: Note) => x.id === activeNoteId);
      if (n) {
        setNoteTitle(n.title);
        setNoteBody(n.body);
        setNoteTags(n.tags);
        return;
      }
    }
    setNoteTitle('');
    setNoteBody('');
    setNoteTags([]);
  }, [activeNoteId, notes]);

  // Keyboard shortcut Cmd/Ctrl+K for quick-create note
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleNewNote();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const handleNewNote = useCallback(() => {
    const note = addNote({ title: 'Untitled Note', body: '', tags: [], eventId: undefined });
    setActiveNoteId(note.id);
  }, [addNote]);

  const handleSaveNote = useCallback(() => {
    if (!activeNoteId) return;
    updateNote(activeNoteId, { title: noteTitle || 'Untitled', body: noteBody, tags: noteTags });
  }, [activeNoteId, noteTitle, noteBody, noteTags, updateNote]);

  const handleDeleteNote = useCallback((id: string) => {
    deleteNote(id);
    if (activeNoteId === id) setActiveNoteId(null);
    setUndoLabel('Note deleted');
    setShowUndo(true);
    setTimeout(() => setShowUndo(false), 4000);
  }, [deleteNote, activeNoteId]);

  const handleAddEvent = useCallback(() => {
    if (!evtTitle.trim() || !evtDate) return;
    addEvent({
      title: evtTitle,
      date: evtDate,
      time: evtTime,
      timezone: evtTimezone,
      description: evtDesc,
      clientTag: evtClientTag || undefined,
      projectTag: undefined,
      reminderOffset: parseInt(evtReminder) || 15,
      noteId: evtNoteId || undefined,
    });
    setShowEventModal(false);
    setEvtTitle(''); setEvtDate(''); setEvtTime('09:00');
    setEvtDesc(''); setEvtClientTag(''); setEvtReminder('15'); setEvtNoteId('');
  }, [evtTitle, evtDate, evtTime, evtTimezone, evtDesc, evtClientTag, evtReminder, evtNoteId, addEvent]);

  const handleDeleteEvent = useCallback((id: string) => {
    deleteEvent(id);
    setUndoLabel('Event deleted');
    setShowUndo(true);
    setTimeout(() => setShowUndo(false), 4000);
  }, [deleteEvent]);

  const toggleTag = (tag: string) => {
    setNoteTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const sortedEvents = [...events].sort((a, b) => {
    const da = new Date(`${a.date}T${a.time}`).getTime();
    const db = new Date(`${b.date}T${b.time}`).getTime();
    return da - db;
  });

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return d; }
  };

  return (
    <div style={{ animation: 'fadeUp .3s var(--ease) both', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-d)', fontWeight: 700, fontSize: 26,
            color: 'var(--white)', letterSpacing: '-.01em', marginBottom: 4,
          }}>
            Reminders
          </h2>
          <p style={{
            fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '.04em',
          }}>
            Notes & events — stay organized
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="md" onClick={handleNewNote}>
            + New Note <span style={{ opacity: .4, fontSize: 9, marginLeft: 4 }}>⌘K</span>
          </Button>
          <Button variant="primary" size="md" onClick={() => setShowEventModal(true)}>
            + New Event
          </Button>
        </div>
      </div>

      {/* Split View */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1, minHeight: 0 }}>

        {/* ── LEFT: Notes ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Notes list */}
          <div style={{
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 8, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{
              padding: '14px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <p style={{
                fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-mid)',
                letterSpacing: '.1em', textTransform: 'uppercase',
              }}>
                Notes ({notes.length})
              </p>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
              {notes.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>
                    No notes yet
                  </p>
                  <Button variant="secondary" size="sm" onClick={handleNewNote}>Create your first note</Button>
                </div>
              ) : (
                notes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '12px 20px', cursor: 'pointer',
                      background: activeNoteId === note.id ? 'var(--accent-bg)' : 'transparent',
                      border: 'none', borderLeft: activeNoteId === note.id ? '2px solid var(--accent)' : '2px solid transparent',
                      transition: 'all .15s',
                    }}
                    onMouseEnter={(e) => { if (activeNoteId !== note.id) e.currentTarget.style.background = 'var(--glass)'; }}
                    onMouseLeave={(e) => { if (activeNoteId !== note.id) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <p style={{
                        fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--white)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                      }}>
                        {note.title || 'Untitled'}
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                        aria-label="Delete note"
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--text-dim)', fontSize: 12, padding: '0 4px',
                          transition: 'color .15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; }}
                      >
                        ✕
                      </button>
                    </div>
                    <p style={{
                      fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      marginBottom: 6,
                    }}>
                      {note.body ? note.body.slice(0, 80) : 'Empty note...'}
                    </p>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                      {note.tags.map((t) => (
                        <span key={t} style={{
                          fontFamily: 'var(--font-m)', fontSize: 8, letterSpacing: '.06em',
                          padding: '2px 6px', borderRadius: 4,
                          background: TAG_COLORS[t] || 'var(--glass)',
                          color: 'var(--text-mid)',
                        }}>
                          {t}
                        </span>
                      ))}
                      <span style={{
                        fontFamily: 'var(--font-m)', fontSize: 8, color: 'var(--text-dim)',
                        letterSpacing: '.04em', marginLeft: 'auto',
                      }}>
                        {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Note editor */}
          {activeNoteId && (
            <div style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '20px 24px',
              animation: 'fadeUp .2s var(--ease) both',
            }}>
              <input
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Note title..."
                aria-label="Note title"
                style={{
                  width: '100%', background: 'none', border: 'none', outline: 'none',
                  fontFamily: 'var(--font-d)', fontWeight: 700, fontSize: 18,
                  color: 'var(--white)', marginBottom: 12,
                }}
              />
              <textarea
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                placeholder="Write your note... (supports basic formatting)"
                aria-label="Note body"
                rows={6}
                style={{
                  width: '100%', background: 'none', border: 'none', outline: 'none',
                  fontFamily: 'var(--font-m)', fontSize: 12, lineHeight: 1.8,
                  color: 'var(--text)', resize: 'vertical',
                }}
              />
              {/* Tags */}
              <div role="group" aria-label="Note tags" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12, marginBottom: 16 }}>
                {TAG_PRESETS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    aria-pressed={noteTags.includes(tag)}
                    style={{
                      fontFamily: 'var(--font-m)', fontSize: 9, letterSpacing: '.06em',
                      padding: '3px 8px', borderRadius: 4,
                      background: noteTags.includes(tag) ? TAG_COLORS[tag] || 'var(--accent-bg)' : 'transparent',
                      border: `1px solid ${noteTags.includes(tag) ? 'transparent' : 'var(--border)'}`,
                      color: noteTags.includes(tag) ? 'var(--white)' : 'var(--text-dim)',
                      cursor: 'pointer', transition: 'all .15s',
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="primary" size="sm" onClick={handleSaveNote}>
                  Save Note
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Events ── */}
        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            padding: '14px 20px', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <p style={{
              fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-mid)',
              letterSpacing: '.1em', textTransform: 'uppercase',
            }}>
              Events ({events.length})
            </p>
            <Button variant="ghost" size="sm" onClick={() => setShowEventModal(true)}>
              + Add
            </Button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {sortedEvents.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>
                  No events scheduled
                </p>
                <Button variant="secondary" size="sm" onClick={() => setShowEventModal(true)}>
                  Add your first event
                </Button>
              </div>
            ) : (
              sortedEvents.map((evt) => {
                const isPast = new Date(`${evt.date}T${evt.time}`) < new Date();
                return (
                  <div
                    key={evt.id}
                    style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid rgba(255,255,255,.03)',
                      opacity: isPast ? 0.5 : 1,
                      transition: 'background .15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <p style={{
                        fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--white)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                      }}>
                        {evt.title}
                      </p>
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        aria-label="Delete event"
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--text-dim)', fontSize: 12, padding: '0 4px',
                          transition: 'color .15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; }}
                      >
                        ✕
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
                      <span style={{
                        fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--accent)',
                        letterSpacing: '.04em',
                      }}>
                        {formatDate(evt.date)}
                      </span>
                      <span style={{ fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)' }}>
                        {evt.time}
                      </span>
                      <span style={{ fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)', letterSpacing: '.04em' }}>
                        {evt.timezone}
                      </span>
                    </div>
                    {evt.description && (
                      <p style={{
                        fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)',
                        lineHeight: 1.5, marginBottom: 4,
                      }}>
                        {evt.description.slice(0, 100)}{evt.description.length > 100 ? '...' : ''}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {evt.clientTag && (
                        <span style={{
                          fontFamily: 'var(--font-m)', fontSize: 8, letterSpacing: '.06em',
                          padding: '2px 6px', borderRadius: 4,
                          background: 'var(--tag-client)', color: 'var(--text-mid)',
                        }}>
                          {evt.clientTag}
                        </span>
                      )}
                      {evt.noteId && (
                        <button
                          onClick={() => setActiveNoteId(evt.noteId!)}
                          style={{
                            fontFamily: 'var(--font-m)', fontSize: 8, letterSpacing: '.06em',
                            padding: '2px 6px', borderRadius: 4,
                            background: 'var(--accent-bg)', color: 'var(--accent)',
                            border: 'none', cursor: 'pointer',
                          }}
                        >  
                          ↗ linked note
                        </button>
                      )}
                      <span style={{
                        fontFamily: 'var(--font-m)', fontSize: 8, color: 'var(--text-dim)',
                        marginLeft: 'auto', letterSpacing: '.04em',
                      }}>
                        ⏱ {evt.reminderOffset}min before
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Add Event Modal ── */}
      <Modal isOpen={showEventModal} onClose={() => setShowEventModal(false)} title="Add Event" width={480}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Input label="Event Title" placeholder="Meeting with client..." value={evtTitle} onChange={setEvtTitle} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{
                fontFamily: 'var(--font-m)', fontSize: 10, letterSpacing: '.12em',
                textTransform: 'uppercase', color: 'var(--text-dim)',
              }}>
                Date
              </label>
              <input
                type="date"
                value={evtDate}
                onChange={(e) => setEvtDate(e.target.value)}
                style={{
                  background: 'none', border: 'none',
                  borderBottom: '1px solid var(--border)',
                  padding: '10px 0', color: 'var(--white)',
                  fontFamily: 'var(--font-m)', fontSize: 14, outline: 'none',
                  colorScheme: 'dark',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{
                fontFamily: 'var(--font-m)', fontSize: 10, letterSpacing: '.12em',
                textTransform: 'uppercase', color: 'var(--text-dim)',
              }}>
                Time
              </label>
              <input
                type="time"
                value={evtTime}
                onChange={(e) => setEvtTime(e.target.value)}
                style={{
                  background: 'none', border: 'none',
                  borderBottom: '1px solid var(--border)',
                  padding: '10px 0', color: 'var(--white)',
                  fontFamily: 'var(--font-m)', fontSize: 14, outline: 'none',
                  colorScheme: 'dark',
                }}
              />
            </div>
          </div>
          <Input label="Timezone" placeholder="America/New_York" value={evtTimezone} onChange={setEvtTimezone} />
          <Input label="Description" placeholder="Optional description..." value={evtDesc} onChange={setEvtDesc} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input label="Client / Project Tag" placeholder="e.g. Arca Studio" value={evtClientTag} onChange={setEvtClientTag} />
            <Input label="Reminder (minutes before)" placeholder="15" value={evtReminder} onChange={setEvtReminder} />
          </div>
          {/* Link to a note */}
          {notes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{
                fontFamily: 'var(--font-m)', fontSize: 10, letterSpacing: '.12em',
                textTransform: 'uppercase', color: 'var(--text-dim)',
              }}>
                Link to Note (optional)
              </label>
              <select
                value={evtNoteId}
                onChange={(e) => setEvtNoteId(e.target.value)}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 4, padding: '8px 10px', color: 'var(--white)',
                  fontFamily: 'var(--font-m)', fontSize: 12, outline: 'none',
                }}
              >
                <option value="">None</option>
                {notes.map((n) => (
                  <option key={n.id} value={n.id}>{n.title || 'Untitled'}</option>
                ))}
              </select>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="ghost" size="md" onClick={() => setShowEventModal(false)}>Cancel</Button>
            <Button variant="primary" size="md" onClick={handleAddEvent} disabled={!evtTitle.trim() || !evtDate}>
              Add Event
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Undo snackbar ── */}
      {showUndo && canUndo && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '10px 20px',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,.5)',
          animation: 'slideUp .25s var(--ease) both',
          zIndex: 999,
        }}>
          <span style={{ fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--text)' }}>
            {undoLabel}
          </span>
          <button
            onClick={() => { undo(); setShowUndo(false); }}
            style={{
              background: 'var(--accent-bg)', border: '1px solid var(--accent)',
              borderRadius: 4, padding: '4px 12px', cursor: 'pointer',
              fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--accent)',
              letterSpacing: '.04em',
            }}
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
