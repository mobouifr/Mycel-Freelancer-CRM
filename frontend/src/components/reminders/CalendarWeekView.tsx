import { useMemo, useCallback } from 'react';
import { toDateKey, isSameDay, formatHour, parseTimeToMinutes, DAYS } from '../../hooks/useCalendar';
import type { CalendarEvent, EventType } from '../../hooks/useStore';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const SLOT_HEIGHT = 48;

const TYPE_COLORS: Record<EventType, { fg: string; bg: string }> = {
  event:       { fg: 'var(--cal-event)',     bg: 'var(--cal-event-bg)' },
  deadline:    { fg: 'var(--cal-deadline)',   bg: 'var(--cal-deadline-bg)' },
  meeting:     { fg: 'var(--cal-meeting)',    bg: 'var(--cal-meeting-bg)' },
  milestone:   { fg: 'var(--cal-milestone)',  bg: 'var(--cal-milestone-bg)' },
  'follow-up': { fg: 'var(--cal-follow-up)', bg: 'var(--cal-follow-up-bg)' },
};

interface CalendarWeekViewProps {
  weekDates: Date[];
  events: CalendarEvent[];
  today: Date;
  onEventClick: (event: CalendarEvent) => void;
  onCreateEvent: (date: string, time?: string) => void;
}

export default function CalendarWeekView({
  weekDates, events, today, onEventClick, onCreateEvent,
}: CalendarWeekViewProps) {
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((evt) => {
      if (!map[evt.date]) map[evt.date] = [];
      map[evt.date].push(evt);
    });
    return map;
  }, [events]);

  const handleSlotClick = useCallback((date: Date, hour: number) => {
    const key = toDateKey(date);
    const time = `${String(hour).padStart(2, '0')}:00`;
    onCreateEvent(key, time);
  }, [onCreateEvent]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Day headers */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 56, flexShrink: 0 }} />
        {weekDates.map((d) => {
          const isToday = isSameDay(d, today);
          return (
            <div key={toDateKey(d)} style={{
              flex: 1, textAlign: 'center', padding: '8px 0',
              borderLeft: '1px solid var(--border)', minWidth: 0, overflow: 'hidden'
            }}>
              <div style={{
                fontFamily: 'var(--font-m)', fontSize: 9,
                color: 'var(--text-dim)', letterSpacing: '.06em',
              }}>
                {DAYS[d.getDay()]}
              </div>
              <div style={{
                fontFamily: 'var(--font-m)', fontSize: 16, fontWeight: isToday ? 700 : 400,
                color: isToday ? 'var(--accent)' : 'var(--text)',
                width: 28, height: 28, display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
                background: isToday ? 'var(--accent-bg)' : 'transparent',
              }}>
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        <div style={{ display: 'flex', position: 'relative' }}>
          {/* Time labels */}
          <div style={{ width: 56, flexShrink: 0 }}>
            {HOURS.map((h) => (
              <div key={h} style={{
                height: SLOT_HEIGHT, display: 'flex', alignItems: 'flex-start',
                justifyContent: 'flex-end', paddingRight: 8, paddingTop: 2,
              }}>
                <span style={{
                  fontFamily: 'var(--font-m)', fontSize: 9,
                  color: 'var(--text-dim)', letterSpacing: '.04em',
                }}>
                  {formatHour(h)}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDates.map((d) => {
            const key = toDateKey(d);
            const dayEvents = eventsByDate[key] || [];

            return (
              <div key={key} style={{
                flex: 1, position: 'relative',
                borderLeft: '1px solid var(--border)',
                minWidth: 0, overflow: 'hidden'
              }}>
                {/* Hour slots */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    onClick={() => handleSlotClick(d, h)}
                    style={{
                      height: SLOT_HEIGHT,
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'background .1s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  />
                ))}

                {/* Event blocks (absolutely positioned) */}
                {dayEvents.map((evt) => {
                  const startMin = parseTimeToMinutes(evt.time);
                  const endMin = evt.endTime
                    ? parseTimeToMinutes(evt.endTime)
                    : startMin + 60;
                  const duration = Math.max(endMin - startMin, 20);
                  const top = (startMin / 60) * SLOT_HEIGHT;
                  const height = (duration / 60) * SLOT_HEIGHT;
                  const colors = TYPE_COLORS[evt.eventType] || TYPE_COLORS.event;

                  return (
                    <button
                      key={evt.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(evt); }}
                      style={{
                        position: 'absolute', top, left: 2, right: 2,
                        height: Math.max(height, 18),
                        background: colors.bg,
                        borderLeft: `3px solid ${colors.fg}`,
                        borderRadius: 4, padding: '2px 5px',
                        cursor: 'pointer', overflow: 'hidden',
                        border: 'none', textAlign: 'left', width: 'calc(100% - 4px)',
                        transition: 'opacity .12s',
                      }}
                    >
                      <div style={{
                        fontFamily: 'var(--font-m)', fontSize: 9,
                        color: colors.fg, fontWeight: 500,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {evt.title}
                      </div>
                      {height > 24 && (
                        <div style={{
                          fontFamily: 'var(--font-m)', fontSize: 8,
                          color: 'var(--text-dim)',
                        }}>
                          {evt.time}{evt.endTime ? ` – ${evt.endTime}` : ''}
                        </div>
                      )}
                      {height > 36 && evt.projectTag && (
                        <div style={{
                          fontFamily: 'var(--font-m)', fontSize: 7,
                          color: 'var(--text-dim)', marginTop: 1,
                        }}>
                          {evt.projectTag}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
