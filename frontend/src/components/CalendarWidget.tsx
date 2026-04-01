import { useState, useMemo } from 'react';
import { useStore, type CalendarEvent } from '../hooks/useStore';

/* ─────────────────────────────────────────────
   CALENDAR WIDGET — Compact month-view with
   event dots and click-to-popover detail
───────────────────────────────────────────── */

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function CalendarWidget() {
  const { events } = useStore();
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);

  // Build calendar grid
  const grid = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = [];

    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    // pad to fill last row
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [viewMonth, viewYear]);

  // Map dates to event arrays
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((evt) => {
      const key = evt.date; // yyyy-mm-dd
      if (!map[key]) map[key] = [];
      map[key].push(evt);
    });
    return map;
  }, [events]);

  const toKey = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${viewYear}-${m}-${d}`;
  };

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
    setSelectedDay(null);
  };

  const handleDayClick = (day: number, e: React.MouseEvent) => {
    const key = toKey(day);
    if (selectedDay === key) { setSelectedDay(null); setPopoverPos(null); return; }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const parent = (e.currentTarget as HTMLElement).closest('[data-calendar-root]')?.getBoundingClientRect();
    if (parent) {
      setPopoverPos({ top: rect.bottom - parent.top + 4, left: rect.left - parent.left });
    }
    setSelectedDay(key);
  };

  const selectedEvents = selectedDay ? (eventsByDate[selectedDay] || []) : [];

  return (
    <div
      data-calendar-root
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '12px 10px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minWidth: 0,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 4 }}>
        <p style={{
          fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-mid)',
          letterSpacing: '.1em', textTransform: 'uppercase', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
          Calendar
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 1, minWidth: 0 }}>
          <button onClick={prevMonth} aria-label="Previous month" style={navBtnStyle}>‹</button>
          <span style={{
            fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text)', letterSpacing: '.04em',
            textAlign: 'center', flex: '1 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {MONTHS[viewMonth].slice(0,3)} {viewYear}
          </span>
          <button onClick={nextMonth} aria-label="Next month" style={navBtnStyle}>›</button>
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 2, marginBottom: 4 }}>
        {DAYS.map(d => (
          <div key={d} style={{
            fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-mid)',
            textAlign: 'center', padding: '4px 0', textTransform: 'uppercase', letterSpacing: '.05em', minWidth: 0, overflow: 'hidden', textOverflow: 'clip'
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '2px',
        flex: 1, minHeight: 0
      }}>
        {grid.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;
          const key = toKey(day);
          const hasEvents = !!eventsByDate[key];
          const isSel = selectedDay === key;
          const isTd = isToday(day);

          return (
            <button
              key={key}
              onClick={(e) => handleDayClick(day, e)}
              aria-label={`${day} ${MONTHS[viewMonth]}`}
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 6,
                border: isSel ? '1px solid var(--accent)' : '1px solid transparent',
                background: isSel ? 'var(--accent-bg)' : isTd ? 'var(--glass)' : 'transparent',
                cursor: 'pointer',
                transition: 'all .12s',
                padding: 0,
              }}
              onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = 'var(--glass)'; }}
              onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = isTd ? 'var(--glass)' : 'transparent'; }}
            >
              <span style={{
                fontFamily: 'var(--font-m)', fontSize: 10,
                color: isTd ? 'var(--accent)' : 'var(--text)',
                fontWeight: isTd ? 600 : 400,
              }}>
                {day}
              </span>
              {hasEvents && (
                <div style={{
                  position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', gap: 2,
                }}>
                  {eventsByDate[key].slice(0, 3).map((_, idx) => (
                    <div key={idx} style={{
                      width: 3, height: 3, borderRadius: '50%',
                      background: 'var(--accent)',
                    }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Popover */}
      {selectedDay && popoverPos && (
        <div style={{
          position: 'absolute',
          top: popoverPos.top,
          left: Math.max(8, Math.min(popoverPos.left, 200)),
          width: 220,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          padding: '12px 14px',
          boxShadow: '0 8px 32px rgba(0,0,0,.4)',
          zIndex: 10,
          animation: 'fadeUp .15s var(--ease) both',
        }}>
          <p style={{
            fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)',
            letterSpacing: '.08em', marginBottom: 8, textTransform: 'uppercase',
          }}>
            {new Date(selectedDay + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          {selectedEvents.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)' }}>
              No events
            </p>
          ) : (
            selectedEvents.map((evt) => (
              <div key={evt.id} style={{ marginBottom: 8 }}>
                <p style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--white)', marginBottom: 2 }}>
                  {evt.title}
                </p>
                <p style={{ fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--accent)', letterSpacing: '.04em' }}>
                  {evt.time} · {evt.timezone}
                </p>
                {evt.description && (
                  <p style={{ fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)', marginTop: 2 }}>
                    {evt.description.slice(0, 60)}{evt.description.length > 60 ? '…' : ''}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid var(--border)',
  borderRadius: 4,
  padding: '2px 8px',
  color: 'var(--text-dim)',
  fontFamily: 'var(--font-m)',
  fontSize: 14,
  cursor: 'pointer',
  transition: 'border-color .15s, color .15s',
  lineHeight: 1,
};
