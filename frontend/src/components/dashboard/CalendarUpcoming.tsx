import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CalendarWidget from '../CalendarWidget';
import { useStore } from '../../hooks/useStore';
import { setWidgetComponent } from './WidgetRegistry';

/* ─────────────────────────────────────────────
   CALENDAR + UPCOMING — Responsive widget
   that adapts to container size:
     compact  (< 180px height) → next event only
     medium   (< 320px)        → upcoming list only
     full     (≥ 320px)        → calendar + list
───────────────────────────────────────────── */

type SizeMode = 'compact' | 'medium' | 'full';

function CalendarUpcoming() {
  const { t, i18n } = useTranslation();
  const { events } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [sizeMode, setSizeMode] = useState<SizeMode>('full');

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      const h = entry.contentRect.height;
      if (h < 180) setSizeMode('compact');
      else if (h < 320) setSizeMode('medium');
      else setSizeMode('full');
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

  const nextEvent = upcoming[0];

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%', minWidth: 0, overflow: 'hidden' }}>
      {/* Compact: next UP event */}
      {sizeMode === 'compact' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, flex: 1, minHeight: 0, minWidth: 0,
        }}>
          {nextEvent ? (
            <>
              <div style={{
                width: 32, minWidth: 32, textAlign: 'center',
                background: 'var(--accent-bg)', borderRadius: 4, padding: '3px 0',
              }}>
                <p style={{
                  fontFamily: 'var(--font-d)', fontSize: 12, fontWeight: 600,
                  color: 'var(--accent)', lineHeight: 1,
                }}>
                  {new Date(nextEvent.date + 'T12:00').getDate()}
                </p>
                <p style={{
                  fontFamily: 'var(--font-m)', fontSize: 7, color: 'var(--accent)',
                  letterSpacing: '.08em', textTransform: 'uppercase',
                }}>
                  {new Date(nextEvent.date + 'T12:00').toLocaleDateString(i18n.language, { month: 'short' })}
                </p>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {nextEvent.title}
                </p>
                <p style={{
                  fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {nextEvent.time} · {t('calendar.next_up')}
                </p>
              </div>
            </>
          ) : (
            <p style={{ fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)' }}>
              {t('calendar.no_upcoming')}
            </p>
          )}
        </div>
      )}

      {/* Medium: upcoming list only (no calendar) */}
      {sizeMode === 'medium' && (
        <UpcomingList upcoming={upcoming} />
      )}

      {/* Full: calendar + upcoming list */}
      {sizeMode === 'full' && (
        <>
          <div style={{ flex: '1 1 auto', minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <CalendarWidget />
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, minWidth: 0, flexShrink: 0 }}>
            <UpcomingList upcoming={upcoming} />
          </div>
        </>
      )}
    </div>
  );
}

/* Upcoming events sub-component */
function UpcomingList({ upcoming }: { upcoming: Array<{ id: string; date: string; time: string; title: string; timezone: string }> }) {
  const { t, i18n } = useTranslation();
  return (
    <div style={{ padding: '0', minWidth: 0, overflow: 'hidden' }}>
      <p style={{
        fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)',
        letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0
      }}>
        {t('calendar.upcoming_7_days')}
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
                minWidth: 0,
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
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
                  {new Date(evt.date + 'T12:00').toLocaleDateString(i18n.language, { month: 'short' })}
                </p>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {evt.title}
                </p>
                <p style={{
                  fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {evt.time} · {evt.timezone}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Register with the widget system
setWidgetComponent('calendar', CalendarUpcoming);

export default CalendarUpcoming;
