import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../hooks/useIsMobile';
import CalendarView from '../components/reminders/CalendarView';
import DailyEventsView from '../components/reminders/DailyEventsView';
import NotesView from '../components/reminders/NotesView';
import type { CalendarEvent } from '../hooks/useStore';
import api from '../services/api';

type RightTab = 'events' | 'notes';

export default function Reminders() {
  const { t } = useTranslation();
  const isMobile = useIsMobile(1100);
  const [rightTab, setRightTab] = useState<RightTab>('notes');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchEvents = useCallback(() => {
    api.get('/dashboard/events')
      .then(res => { if (res.data) setEvents(res.data); })
      .catch(console.error);
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleConvertNoteToEvent = useCallback(() => {
    // Pre-fill handled by CalendarView modal
  }, []);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    // Dispatched via custom event so CalendarView can open its modal
    window.dispatchEvent(new CustomEvent('open-event-modal', { detail: event }));
  }, []);

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
          <CalendarView
            events={events}
            onEventsChange={fetchEvents}
            onDateChange={setCurrentDate}
          />
        </div>

        {/* Right: Events + Notes + Todos (~30%) */}
        <div style={{
          flex: isMobile ? 'none' : '3',
          minWidth: isMobile ? undefined : 280,
          maxWidth: isMobile ? undefined : 420,
          display: 'flex', flexDirection: 'column',
          border: '1px solid var(--border)', borderRadius: 12,
          background: 'var(--surface)',
          overflow: 'hidden',
          padding: '10px 0',
        }}>
          {/* Tab switcher */}
          <div style={{
            display: 'flex', borderBottom: '1px solid var(--border)',
            padding: '0 10px', flexShrink: 0,
          }}>
            {(['events', 'notes'] as RightTab[]).map((tab) => (
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
                {tab === 'events'
                  ? t('calendar.events', 'Events')
                  : t('reminders.notes')}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {rightTab === 'events' && (
              <DailyEventsView
                date={currentDate}
                events={events}
                onEventClick={handleEventClick}
              />
            )}
            {rightTab === 'notes' && (
              <div style={{ padding: 12 }}>
                <NotesView onConvertToEvent={handleConvertNoteToEvent} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
