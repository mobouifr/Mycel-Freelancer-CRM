import { useMemo } from 'react';
import { toDateKey, isSameDay, DAYS } from '../../hooks/useCalendar';
import type { CalendarEvent } from '../../hooks/useStore';
import EventChip from './EventChip';

interface CalendarMonthViewProps {
  year: number;
  month: number;
  grid: (number | null)[];
  events: CalendarEvent[];
  today: Date;
  selectedDate: Date;
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onCreateEvent: (date: string) => void;
}

export default function CalendarMonthView({
  year, month, grid, events, today, selectedDate,
  onDateClick, onEventClick, onCreateEvent,
}: CalendarMonthViewProps) {
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((evt) => {
      if (!map[evt.date]) map[evt.date] = [];
      map[evt.date].push(evt);
    });
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => a.time.localeCompare(b.time)),
    );
    return map;
  }, [events]);

  const makeDate = (day: number) => new Date(year, month, day);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Weekday headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        borderBottom: '1px solid var(--border)',
      }}>
        {DAYS.map((d) => (
          <div key={d} style={{
            fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)',
            letterSpacing: '.08em', textAlign: 'center', padding: '6px 0',
            minWidth: 0, overflow: 'hidden', textOverflow: 'clip'
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        flex: 1, gridAutoRows: '1fr',
        minWidth: 0
      }}>
        {grid.map((day, i) => {
          if (day === null) {
            return (
              <div key={`e-${i}`} style={{
                borderRight: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg)',
                minWidth: 0
              }} />
            );
          }

          const d = makeDate(day);
          const key = toDateKey(d);
          const isToday = isSameDay(d, today);
          const isSelected = isSameDay(d, selectedDate);
          const dayEvents = eventsByDate[key] || [];

          return (
            <div
              key={key}
              onClick={() => onDateClick(d)}
              onDoubleClick={() => onCreateEvent(key)}
              style={{
                borderRight: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                padding: '4px 5px', cursor: 'pointer',
                background: isSelected ? 'var(--accent-bg)' : 'transparent',
                transition: 'background .12s', minHeight: 70,
                display: 'flex', flexDirection: 'column',
                minWidth: 0,
                overflow: 'hidden'
              }}
            >
              <span style={{
                fontFamily: 'var(--font-m)', fontSize: 10,
                color: isToday ? 'var(--accent)' : 'var(--text)',
                fontWeight: isToday ? 700 : 400,
                width: 22, height: 22, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
                background: isToday ? 'var(--accent-bg)' : 'transparent',
                marginBottom: 2,
              }}>
                {day}
              </span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
                {dayEvents.slice(0, 3).map((evt) => (
                  <div key={evt.id} onClick={(e) => e.stopPropagation()}>
                    <EventChip
                      event={evt}
                      compact
                      onClick={() => onEventClick(evt)}
                    />
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <span style={{
                    fontFamily: 'var(--font-m)', fontSize: 8,
                    color: 'var(--text-dim)', paddingLeft: 4,
                  }}>
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
