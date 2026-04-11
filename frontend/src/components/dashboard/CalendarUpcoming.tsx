import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CalendarWidget from '../CalendarWidget';
import { useStore } from '../../hooks/useStore';
import { setWidgetComponent } from './WidgetRegistry';

/* ─────────────────────────────────────────────
   CALENDAR + UPCOMING — Always renders
   CalendarWidget (it handles its own responsive
   modes). Upcoming list shows when tall enough.
───────────────────────────────────────────── */

function CalendarUpcoming() {
  const { t, i18n } = useTranslation();
  const { events } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerH, setContainerH] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerH(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Next 7 days events
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  const upcoming = events
    .filter((evt) => {
      const d = new Date(evt.date + 'T00:00');
      return d >= today && d <= weekFromNow;
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 5);

  // Only show upcoming list when tall enough for both
  const showUpcoming = containerH >= 400;

  return (
    <div ref={containerRef} style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', minWidth: 0, overflow: 'hidden', gap: 0,
    }}>
      {/* Calendar always renders — handles its own tiny/medium/full modes */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <CalendarWidget />
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
            {t('calendar.upcoming_7_days')}
          </p>
          {upcoming.length === 0 ? (
            <p style={{
              fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)',
              textAlign: 'center', padding: '4px 0',
            }}>
              No upcoming events
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {upcoming.map((evt) => (
                <div key={evt.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '4px 8px', borderRadius: 4,
                  transition: 'background .12s', cursor: 'default',
                  minWidth: 0, overflow: 'hidden',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width: 28, minWidth: 28, textAlign: 'center',
                    background: 'var(--accent-bg)', borderRadius: 4, padding: '2px 0',
                  }}>
                    <p style={{
                      fontFamily: 'var(--font-d)', fontSize: 11, fontWeight: 600,
                      color: 'var(--accent)', lineHeight: 1,
                    }}>
                      {new Date(evt.date + 'T12:00').getDate()}
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-m)', fontSize: 6, color: 'var(--accent)',
                      letterSpacing: '.08em', textTransform: 'uppercase',
                    }}>
                      {new Date(evt.date + 'T12:00').toLocaleDateString(i18n.language, { month: 'short' })}
                    </p>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {evt.title}
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-m)', fontSize: 8, color: 'var(--text-dim)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {evt.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

setWidgetComponent('calendar', CalendarUpcoming);

export default CalendarUpcoming;
