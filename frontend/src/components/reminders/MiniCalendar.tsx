import { useMemo } from 'react';
import { getMonthGrid, MONTHS, isSameDay, toDateKey } from '../../hooks/useCalendar';
import type { CalendarEvent } from '../../hooks/useStore';

interface MiniCalendarProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onPrev: () => void;
  onNext: () => void;
  events: CalendarEvent[];
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function MiniCalendar({ currentDate, onDateClick, onPrev, onNext, events }: MiniCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const grid = useMemo(() => getMonthGrid(year, month), [year, month]);

  const eventDates = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => set.add(e.date));
    return set;
  }, [events]);

  const makeDate = (day: number) => new Date(year, month, day);

  return (
    <div style={{
      background: 'var(--surface-2)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px', minWidth: 0, overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 4 }}>
        <button onClick={onPrev} aria-label="Previous month" style={navBtn}>‹</button>
        <span style={{
          fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text)',
          letterSpacing: '.04em', fontWeight: 500, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>
          {MONTHS[month]} {year}
        </span>
        <button onClick={onNext} aria-label="Next month" style={navBtn}>›</button>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 1, marginBottom: 2 }}>
        {WEEKDAYS.map((d) => (
          <div key={d} style={{
            fontFamily: 'var(--font-m)', fontSize: 8, color: 'var(--text-dim)',
            letterSpacing: '.1em', textAlign: 'center', padding: '2px 0', minWidth: 0, overflow: 'hidden', textOverflow: 'clip'
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 1, minWidth: 0 }}>
        {grid.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;
          const d = makeDate(day);
          const isToday = isSameDay(d, today);
          const isSelected = isSameDay(d, currentDate);
          const hasEvents = eventDates.has(toDateKey(d));

          return (
            <button
              key={`${toDateKey(d)}-${i}`}
              onClick={() => onDateClick(d)}
              aria-label={`${day} ${MONTHS[month]}`}
              style={{
                position: 'relative', width: '100%', aspectRatio: '1',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                borderRadius: 5, border: isSelected ? '1px solid var(--accent)' : '1px solid transparent',
                background: isSelected ? 'var(--accent-bg)' : 'transparent',
                cursor: 'pointer', transition: 'all .12s', padding: 0,
              }}
            >
              <span style={{
                fontFamily: 'var(--font-m)', fontSize: 9,
                color: isToday ? 'var(--accent)' : 'var(--text)',
                fontWeight: isToday ? 600 : 400,
              }}>
                {day}
              </span>
              {hasEvents && (
                <div style={{
                  position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
                  width: 3, height: 3, borderRadius: '50%', background: 'var(--accent)',
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const navBtn: React.CSSProperties = {
  background: 'none', border: '1px solid var(--border)', borderRadius: 4,
  padding: '2px 8px', color: 'var(--text-dim)', fontFamily: 'var(--font-m)',
  fontSize: 13, cursor: 'pointer', lineHeight: 1,
};
