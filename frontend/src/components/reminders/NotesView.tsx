import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import StickyNote from './StickyNote';

const TAG_COLORS: Record<string, string> = {
  personal: 'var(--info-bg)',
  work: 'var(--success-bg)',
  urgent: 'var(--danger-bg)',
  client: 'var(--tag-client)',
  project: 'var(--tag-project)',
  'follow-up': 'var(--glass)',
};

const NOTE_COLORS: { key: string; label: string }[] = [
  { key: 'default', label: 'Default' },
  { key: 'yellow',  label: 'Yellow' },
  { key: 'green',   label: 'Green' },
  { key: 'blue',    label: 'Blue' },
  { key: 'pink',    label: 'Pink' },
  { key: 'purple',  label: 'Purple' },
];

const COLOR_BG: Record<string, string> = {
  default: 'var(--surface)',
  yellow:  'color-mix(in srgb, #f59e0b 30%, var(--surface))',
  green:   'color-mix(in srgb, var(--success) 30%, var(--surface))',
  blue:    'color-mix(in srgb, var(--info) 30%, var(--surface))',
  pink:    'color-mix(in srgb, #ec4899 30%, var(--surface))',
  purple:  'color-mix(in srgb, #8b5cf6 30%, var(--surface))',
};

interface NotesViewProps {
  onConvertToEvent?: (note: any) => void;
}

export default function NotesView({ onConvertToEvent }: NotesViewProps) {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newColor, setNewColor] = useState('default');

  const fetchNotes = () => {
    api.get('/dashboard/notes')
      .then(res => setNotes(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreate = async () => {
    if (!newTitle.trim() && !newBody.trim()) return;
    try {
      await api.post('/dashboard/notes', {
        title: newTitle.trim() || 'Untitled',
        content: newBody,
        tags: newTag ? [newTag] : [],
        color: newColor,
        pinned: false,
      });
      fetchNotes();
      setNewTitle('');
      setNewBody('');
      setNewTag('');
      setNewColor('default');
      setShowNew(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async (id: string, updates: any) => {
    try {
      await api.put(`/dashboard/notes/${id}`, updates);
      fetchNotes();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/dashboard/notes/${id}`);
      fetchNotes();
    } catch (e) {
      console.error(e);
    }
  };

  const handleConvert = (note: any) => {
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
          {/* Tag picker */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['urgent', 'work', 'personal', 'client'].map(tOption => (
              <button
                key={tOption}
                onClick={() => setNewTag(newTag === tOption ? '' : tOption)}
                style={{
                  padding: '2px 8px', borderRadius: 12,
                  fontFamily: 'var(--font-m)', fontSize: 9, cursor: 'pointer',
                  background: newTag === tOption ? TAG_COLORS[tOption] || 'var(--glass)' : 'transparent',
                  color: newTag === tOption ? 'var(--white)' : 'var(--text-dim)',
                  border: `1px solid ${newTag === tOption ? 'transparent' : 'var(--border)'}`,
                  fontWeight: newTag === tOption ? 600 : 400,
                  transition: 'all 0.15s ease',
                }}
              >
                {tOption}
              </button>
            ))}
          </div>
          {/* Color picker */}
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-m)', fontSize: 8, color: 'var(--text-dim)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
              Color
            </span>
            {NOTE_COLORS.map(c => (
              <button
                key={c.key}
                onClick={() => setNewColor(c.key)}
                title={c.label}
                style={{
                  width: 16, height: 16, borderRadius: '50%', padding: 0,
                  background: COLOR_BG[c.key],
                  border: `2px solid ${newColor === c.key ? 'var(--accent)' : 'var(--border)'}`,
                  cursor: 'pointer', transition: 'border-color .12s',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowNew(false)} style={cancelBtn}>
              {t('common.cancel')}
            </button>
            <button onClick={handleCreate} style={saveBtn}>
              {t('common.create')}
            </button>
          </div>
        </div>
      )}

      {/* Notes grid */}
      {notes.length === 0 ? (
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
          {notes.map((note) => (
            <StickyNote
              key={note.id}
              note={note}
              onUpdate={handleUpdate}
              onDelete={(id) => handleDelete(id)}
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
