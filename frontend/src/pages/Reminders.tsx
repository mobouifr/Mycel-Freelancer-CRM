import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../hooks/useIsMobile';
import CalendarView from '../components/reminders/CalendarView';
import NotesView from '../components/reminders/NotesView';
import TodosView from '../components/reminders/TodosView';
import type { Note } from '../hooks/useStore';

type RightTab = 'notes' | 'todos';

export default function Reminders() {
  const { t } = useTranslation();
  const isMobile = useIsMobile(1100);
  const [rightTab, setRightTab] = useState<RightTab>('notes');
  const [convertingNote, setConvertingNote] = useState<Note | null>(null);

  const handleConvertNoteToEvent = useCallback((_note: Note) => {
    setConvertingNote(_note);
  }, []);

  // Clear converting state after it's used (CalendarView picks it up)
  void convertingNote; // consumed if needed for pre-fill

  return (
    <div style={{
      animation: 'fadeUp .3s var(--ease) both',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'flex-end',
        marginBottom: 16, flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 8 : 0, flexShrink: 0,
      }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-d)', fontWeight: 500, fontSize: 24,
            color: 'var(--text)', letterSpacing: '.04em', lineHeight: 1.3, marginBottom: 2,
          }}>
            {t('reminders.title')}
          </h2>
          <p style={{
            fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '.04em',
          }}>
            {t('reminders.subtitle')}
          </p>
        </div>
      </div>

      {/* Main split layout */}
      <div style={{
        flex: 1, display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 12 : 16, overflow: 'hidden',
      }}>
        {/* Left: Calendar (~70%) */}
        <div style={{
          flex: isMobile ? 'none' : '7',
          minWidth: 0,
          height: isMobile ? 500 : '100%',
          display: 'flex', flexDirection: 'column',
          border: '1px solid var(--border)', borderRadius: 12,
          background: 'var(--surface)',
          overflow: 'hidden',
        }}>
          <CalendarView />
        </div>

        {/* Right: Notes + Todos (~30%) */}
        <div style={{
          flex: isMobile ? 'none' : '3',
          minWidth: isMobile ? undefined : 280,
          maxWidth: isMobile ? undefined : 420,
          display: 'flex', flexDirection: 'column',
          border: '1px solid var(--border)', borderRadius: 12,
          background: 'var(--surface)',
          overflow: 'hidden',
          padding: '10px 0', // Add padding to match calendar widget frame
        }}>
          {/* Tab switcher */}
          <div style={{
            display: 'flex', borderBottom: '1px solid var(--border)',
            padding: '0 10px', flexShrink: 0,
          }}>
            {(['notes', 'todos'] as RightTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                style={{
                  fontFamily: 'var(--font-m)', fontSize: 10,
                  padding: '10px 14px', border: 'none', cursor: 'pointer',
                  background: 'transparent',
                  color: rightTab === tab ? 'var(--accent)' : 'var(--text-dim)',
                  borderBottom: rightTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                  fontWeight: rightTab === tab ? 600 : 400,
                  letterSpacing: '.06em', textTransform: 'uppercase',
                  transition: 'all .12s',
                }}
              >
                {tab === 'notes' ? t('reminders.notes') : t('reminders.todos')}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            {rightTab === 'notes' && (
              <NotesView onConvertToEvent={handleConvertNoteToEvent} />
            )}
            {rightTab === 'todos' && <TodosView />}
          </div>
        </div>
      </div>
    </div>
  );
}
