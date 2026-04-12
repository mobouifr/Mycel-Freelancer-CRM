import { useRef, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import CalendarWidget from '../CalendarWidget';
import type { CalendarEvent } from '../../hooks/useStore';
import api from '../../services/api';
import { setWidgetComponent } from './WidgetRegistry';

/* ─────────────────────────────────────────────
   CALENDAR + UPCOMING — Always renders
   CalendarWidget (it handles its own responsive
   modes). Upcoming list shows when tall enough.
───────────────────────────────────────────── */

function CalendarUpcoming() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerH, setContainerH] = useState(0);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerH(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    api.get<CalendarEvent[]>('/dashboard/events')
      .then((response) => {
        if (!cancelled && response.data) {
          setEvents(response.data);
        }
      })
      .catch(console.error);

    return () => {
      cancelled = true;
    };
  }, []);

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const todayEvents = useMemo(() => events
    .filter((evt) => evt.date === todayKey)
    .sort((a, b) => a.time.localeCompare(b.time)), [events, todayKey]);

  const nextEvent = todayEvents[0] || null;
  const remainingToday = Math.max(todayEvents.length - 1, 0);

  // Only show upcoming list when tall enough for both
  const showUpcoming = containerH >= 400;

  return (
    <div ref={containerRef} style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', minWidth: 0, overflow: 'hidden', gap: 0,
    }}>
      {/* Calendar always renders — handles its own tiny/medium/full modes */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <CalendarWidget
          events={events}
          onDayClick={(date) => navigate(`/reminders?date=${date}`)}
        />
      </div>

      {/* Upcoming list — only when there's room */}
      {showUpcoming && (
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 10,
          flexShrink: 0,
          minWidth: 0,
          overflow: 'hidden',
        }}>
          <p style={{
            fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)',
            letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6,
          }}>
            {t('calendar.today', 'Today')}
          </p>
          {!nextEvent ? (
            <p style={{
              fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)',
              textAlign: 'center', padding: '4px 0',
            }}>
              {t('calendar.no_events', 'No events for today.')}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                type="button"
                onClick={() => navigate(`/reminders?date=${nextEvent.date}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 8px', borderRadius: 6,
                  transition: 'background .12s', cursor: 'pointer',
                  minWidth: 0, overflow: 'hidden',
                  background: 'transparent', border: '1px solid var(--border)',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{
                  width: 32, minWidth: 32, textAlign: 'center',
                  background: 'var(--accent-bg)', borderRadius: 4, padding: '2px 0',
                }}>
                  <p style={{
                    fontFamily: 'var(--font-d)', fontSize: 12, fontWeight: 600,
                    color: 'var(--accent)', lineHeight: 1,
                  }}>
                    {new Date(`${nextEvent.date}T12:00:00`).getDate()}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-m)', fontSize: 6, color: 'var(--accent)',
                    letterSpacing: '.08em', textTransform: 'uppercase',
                  }}>
                    {new Date(`${nextEvent.date}T12:00:00`).toLocaleDateString(i18n.language, { month: 'short' })}
                  </p>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {nextEvent.title}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-m)', fontSize: 8, color: 'var(--text-dim)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {nextEvent.time}
                  </p>
                </div>
              </button>

              {remainingToday > 0 && (
                <p style={{
                  fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)',
                  paddingLeft: 2,
                }}>
                  {remainingToday} {remainingToday === 1 ? t('calendar.event', 'event') : t('calendar.events', 'events')} left today
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

setWidgetComponent('calendar', CalendarUpcoming);

export default CalendarUpcoming;
