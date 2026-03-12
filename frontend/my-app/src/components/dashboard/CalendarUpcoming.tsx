import CalendarWidget from '../CalendarWidget';
import { useStore } from '../../hooks/useStore';
import { setWidgetComponent } from './WidgetRegistry';

/* ─────────────────────────────────────────────
   CALENDAR + UPCOMING — Wraps the existing
   CalendarWidget and adds an upcoming events
   list below (next 7 days)
───────────────────────────────────────────── */

function CalendarUpcoming() {
  const { events } = useStore();

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>
      {/* Calendar — takes most of the space */}
      <div style={{ flex: '1 1 auto', minHeight: 0 }}>
        <CalendarWidget />
      </div>

      {/* Upcoming events list */}
      <div style={{ padding: '12px 0 0', borderTop: '1px solid var(--border)' }}>
        <p style={{
          fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)',
          letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8,
        }}>
          Upcoming (7 days)
        </p>

        {upcoming.length === 0 ? (
          <p style={{
            fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)',
            textAlign: 'center', padding: '6px 0',
          }}>
            No upcoming events
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {upcoming.map((evt) => (
              <div
                key={evt.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 8px',
                  borderRadius: 4,
                  transition: 'background .12s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Date badge */}
                <div style={{
                  width: 32, minWidth: 32, textAlign: 'center',
                  background: 'var(--accent-bg)', borderRadius: 4, padding: '3px 0',
                }}>
                  <p style={{
                    fontFamily: 'var(--font-d)', fontSize: 12, fontWeight: 600,
                    color: 'var(--accent)', lineHeight: 1,
                  }}>
                    {new Date(evt.date + 'T12:00').getDate()}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-m)', fontSize: 7, color: 'var(--accent)',
                    letterSpacing: '.08em', textTransform: 'uppercase',
                  }}>
                    {new Date(evt.date + 'T12:00').toLocaleDateString('en-US', { month: 'short' })}
                  </p>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {evt.title}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)',
                  }}>
                    {evt.time} · {evt.timezone}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Register with the widget system
setWidgetComponent('calendar', CalendarUpcoming);

export default CalendarUpcoming;
