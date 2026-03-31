import { useMemo, useCallback } from 'react';
import { toDateKey, formatHour, parseTimeToMinutes, MONTHS, DAYS } from '../../hooks/useCalendar';
import type { CalendarEvent, EventType } from '../../hooks/useStore';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const SLOT_HEIGHT = 56;

const TYPE_COLORS: Record<EventType, { fg: string; bg: string }> = {
  event:       { fg: 'var(--cal-event)',     bg: 'var(--cal-event-bg)' },
  deadline:    { fg: 'var(--cal-deadline)',   bg: 'var(--cal-deadline-bg)' },
  meeting:     { fg: 'var(--cal-meeting)',    bg: 'var(--cal-meeting-bg)' },
  milestone:   { fg: 'var(--cal-milestone)',  bg: 'var(--cal-milestone-bg)' },
  'follow-up': { fg: 'var(--cal-follow-up)', bg: 'var(--cal-follow-up-bg)' },
};

interface CalendarDayViewProps {
  date: Date;
  events: CalendarEvent[];
  today: Date;
  onEventClick: (event: CalendarEvent) => void;
  onCreateEvent: (date: string, time?: string) => void;
}

export default function CalendarDayView({
  date, events, today, onEventClick, onCreateEvent,
}: CalendarDayViewProps) {
  const dateKey = toDateKey(date);

  const dayEvents = useMemo(
    () => events.filter((e) => e.date === dateKey),
    [events, dateKey],
  );

  const handleSlotClick = useCallback((hour: number) => {
    const time = `${String(hour).padStart(2, '0')}:00`;
    onCreateEvent(dateKey, time);
  }, [dateKey, onCreateEvent]);

  const isToday = date.toDateString() === today.toDateString();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: isToday ? 'var(--accent-bg)' : 'var(--glass)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-m)', fontSize: 18,
          color: isToday ? 'var(--accent)' : 'var(--text)', fontWeight: 600,
        }}>
          {date.getDate()}
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--text)',
            fontWeight: 500,
          }}>
            {DAYS[date.getDay()]}
          </div>
          <div style={{
            fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)',
          }}>
            {MONTHS[date.getMonth()]} {date.getFullYear()}
          </div>
        </div>
        <div style={{
          marginLeft: 'auto', fontFamily: 'var(--font-m)', fontSize: 10,
          color: 'var(--text-dim)',
        }}>
          {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Time grid */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', position: 'relative' }}>
          {/* Time labels */}
          <div style={{ width: 60, flexShrink: 0 }}>
            {HOURS.map((h) => (
              <div key={h} style={{
                height: SLOT_HEIGHT, display: 'flex', alignItems: 'flex-start',
                justifyContent: 'flex-end', paddingRight: 10, paddingTop: 2,
              }}>
                <span style={{
                  fontFamily: 'var(--font-m)', fontSize: 10,
                  color: 'var(--text-dim)',
                }}>
                  {formatHour(h)}
                </span>
              </div>
            ))}
          </div>

          {/* Main column */}
          <div style={{
            flex: 1, position: 'relative',
            borderLeft: '1px solid var(--border)',
          }}>
            {HOURS.map((h) => (
              <div
                key={h}
                onClick={() => handleSlotClick(h)}
                style={{
                  height: SLOT_HEIGHT,
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer', transition: 'background .1s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              />
            ))}

            {/* Event blocks */}
            {dayEvents.map((evt) => {
              const startMin = parseTimeToMinutes(evt.time);
              const endMin = evt.endTime ? parseTimeToMinutes(evt.endTime) : startMin + 60;
              const duration = Math.max(endMin - startMin, 20);
              const top = (startMin / 60) * SLOT_HEIGHT;
              const height = (duration / 60) * SLOT_HEIGHT;
              const colors = TYPE_COLORS[evt.eventType] || TYPE_COLORS.event;

              return (
                <button
                  key={evt.id}
                  onClick={(e) => { e.stopPropagation(); onEventClick(evt); }}
                  style={{
                    position: 'absolute', top, left: 4, right: 4,
                    height: Math.max(height, 22),
                    background: colors.bg,
                    borderLeft: `3px solid ${colors.fg}`,
                    borderRadius: 6, padding: '4px 8px',
                    cursor: 'pointer', overflow: 'hidden',
                    border: 'none', textAlign: 'left',
                    width: 'calc(100% - 8px)',
                  }}
                >
                  <div style={{
                    fontFamily: 'var(--font-m)', fontSize: 11,
                    color: colors.fg, fontWeight: 500,
                  }}>
                    {evt.title}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-m)', fontSize: 9,
                    color: 'var(--text-dim)', marginTop: 1,
                  }}>
                    {evt.time}{evt.endTime ? ` – ${evt.endTime}` : ''}
                    {evt.projectTag ? ` · ${evt.projectTag}` : ''}
                  </div>
                  {height > 50 && evt.description && (
                    <div style={{
                      fontFamily: 'var(--font-m)', fontSize: 9,
                      color: 'var(--text-dim)', marginTop: 2,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {evt.description}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
