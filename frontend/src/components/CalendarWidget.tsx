import { useState, useRef, useEffect } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useStore, type CalendarEvent } from '../hooks/useStore';

/* ─────────────────────────────────────────────
   CALENDAR WIDGET — Responsive modes:
     tiny   (< 180h)  → Apple-style today card
     medium (< 300h)  → today card + month nav
     full   (≥ 300h)  → date panel (if wide) + grid
───────────────────────────────────────────── */

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

type SizeMode = 'tiny' | 'medium' | 'full';

interface CalendarWidgetProps {
  events?: CalendarEvent[];
  onDayClick?: (date: string) => void;
}

export default function CalendarWidget({ events: externalEvents, onDayClick }: CalendarWidgetProps) {
  const { events: storeEvents } = useStore();
  const events = externalEvents ?? storeEvents;
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(0);
  const [ch, setCh] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setCw(entry.contentRect.width);
      setCh(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const sizeMode: SizeMode = ch < 180 ? 'tiny' : ch < 300 ? 'medium' : 'full';

  // Today info
  const todayDay = today.getDate();
  const todayWeekday = today.toLocaleDateString('en-US', { weekday: 'short' });
  const todayMonthShort = today.toLocaleDateString('en-US', { month: 'short' });

  /* ─── TINY MODE: Apple-style today card ─── */
  if (sizeMode === 'tiny') {
    const s = Math.min(cw, ch);
    const isMicro = s < 60;
    const labelSize = Math.max(Math.min(s * 0.12, 12), 8);
    const numSize = Math.max(Math.min(s * 0.5, ch * 0.55, 80), 18);

    return (
      <div ref={containerRef} data-calendar-root style={{
        ...rootStyle,
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMicro ? 4 : '12px 10px',
        gap: 0,
      }}>
        {/* Weekday + Month top line */}
        {!isMicro && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              fontFamily: 'var(--font-m)', fontSize: labelSize,
              fontWeight: 700, color: 'var(--accent)', letterSpacing: '.04em',
            }}>
              {todayWeekday}
            </span>
            <span style={{
              fontFamily: 'var(--font-m)', fontSize: labelSize,
              fontWeight: 600, color: 'var(--text)', letterSpacing: '.04em',
            }}>
              {todayMonthShort}
            </span>
          </div>
        )}
        {/* Big day number */}
        <span style={{
          fontFamily: 'var(--font-d)', fontSize: numSize,
          fontWeight: 800, color: 'var(--text)',
          lineHeight: 0.9, letterSpacing: '-0.03em',
        }}>
          {todayDay}
        </span>
      </div>
    );
  }

  /* ─── MEDIUM MODE: today card with month nav ─── */
  if (sizeMode === 'medium') {
    return (
      <div ref={containerRef} data-calendar-root style={{
        ...rootStyle,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
      }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); } else setViewMonth(viewMonth - 1); }} style={navBtnStyle}>‹</button>
          <span style={{
            fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text)',
            letterSpacing: '.04em', textAlign: 'center', minWidth: 60,
          }}>
            {MONTHS[viewMonth].slice(0, 3)} {viewYear}
          </span>
          <button onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); } else setViewMonth(viewMonth + 1); }} style={navBtnStyle}>›</button>
        </div>
        {/* Weekday + Month */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
          <span style={{
            fontFamily: 'var(--font-m)', fontSize: Math.max(cw * 0.05, 12),
            fontWeight: 700, color: 'var(--accent)', letterSpacing: '.04em',
          }}>
            {todayWeekday}
          </span>
          <span style={{
            fontFamily: 'var(--font-m)', fontSize: Math.max(cw * 0.05, 12),
            fontWeight: 600, color: 'var(--text)', letterSpacing: '.04em',
          }}>
            {todayMonthShort}
          </span>
        </div>
        {/* Big day number */}
        <span style={{
          fontFamily: 'var(--font-d)',
          fontSize: Math.min(cw * 0.35, ch * 0.35, 90),
          fontWeight: 800, color: 'var(--text)',
          lineHeight: 0.85, letterSpacing: '-0.03em',
        }}>
          {todayDay}
        </span>
      </div>
    );
  }

  /* ─── FULL MODE: optional date panel + grid ─── */

  const grid = buildGrid(viewYear, viewMonth);
  const numRows = grid.length / 7;

  // Square cells from available height — also constrained by width so the
  // 7-column grid never overflows a narrow container.
  const headerH = 32;
  const dayHeadH = 22;
  const pad = 24;
  const availH = ch - headerH - dayHeadH - pad;
  const cellFromH = availH > 0 ? availH / numRows : 20;
  // 7 cells + 6 gaps (worst-case gap = 3px) must fit in the container width
  // minus horizontal padding (20px from rootStyle '12px 10px').
  const maxCellFromW = Math.max(Math.floor((cw - 20 - 6 * 3) / 7), 16);
  const cellSize = Math.max(Math.min(cellFromH, 44, maxCellFromW), 16);
  const gridGap = Math.max(Math.min(cellSize * 0.08, 3), 1);
  const gridW = cellSize * 7 + gridGap * 6;
  const gridH = cellSize * numRows + gridGap * (numRows - 1);

  // Date panel if there's leftover horizontal space
  const leftover = cw - 20 - gridW;
  const showDatePanel = leftover >= 90;
  const datePanelW = showDatePanel ? Math.min(leftover - 16, 180) : 0;

  const dayFontSize = Math.max(Math.min(cellSize * 0.38, 12), 8);
  const dotSize = Math.max(Math.min(cellSize * 0.1, 3.5), 2);

  const eventsByDate = buildEventMap(events);

  const toKey = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${viewYear}-${m}-${d}`;
  };

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const handleDayClick = (day: number, e: ReactMouseEvent) => {
    const key = toKey(day);
    if (onDayClick) {
      onDayClick(key);
      return;
    }
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
    <div ref={containerRef} data-calendar-root style={rootStyle}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        width: '100%', height: headerH, flexShrink: 0,
      }}>
        <p style={{
          fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-mid)',
          letterSpacing: '.1em', textTransform: 'uppercase',
        }}>
          Calendar
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); } else setViewMonth(viewMonth - 1); setSelectedDay(null); }} style={navBtnStyle}>‹</button>
          <span style={{
            fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text)',
            letterSpacing: '.04em', textAlign: 'center', minWidth: 70,
          }}>
            {MONTHS[viewMonth].slice(0, 3)} {viewYear}
          </span>
          <button onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); } else setViewMonth(viewMonth + 1); setSelectedDay(null); }} style={navBtnStyle}>›</button>
        </div>
      </div>

      {/* Body */}
      <div style={{
        flex: 1, minHeight: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: showDatePanel ? 12 : 0,
      }}>
        {/* ── Date panel (left) ── */}
        {showDatePanel && (
          <div style={{
            width: datePanelW, flexShrink: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Weekday + Month */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{
                fontFamily: 'var(--font-m)',
                fontSize: Math.min(datePanelW * 0.12, 13),
                fontWeight: 700, color: 'var(--accent)', letterSpacing: '.04em',
              }}>
                {todayWeekday}
              </span>
              <span style={{
                fontFamily: 'var(--font-m)',
                fontSize: Math.min(datePanelW * 0.12, 13),
                fontWeight: 600, color: 'var(--text)', letterSpacing: '.04em',
              }}>
                {todayMonthShort}
              </span>
            </div>
            {/* Big day number */}
            <span style={{
              fontFamily: 'var(--font-d)',
              fontSize: Math.min(datePanelW * 0.55, gridH * 0.45, 72),
              fontWeight: 800, color: 'var(--text)',
              lineHeight: 0.85, letterSpacing: '-0.03em',
            }}>
              {todayDay}
            </span>
            {/* Year */}
            <span style={{
              fontFamily: 'var(--font-m)',
              fontSize: Math.min(datePanelW * 0.09, 10),
              color: 'var(--text-dim)', letterSpacing: '.06em',
              marginTop: 4,
            }}>
              {today.getFullYear()}
            </span>
          </div>
        )}

        {/* ── Calendar grid ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Day headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(7, ${cellSize}px)`,
            gap: `0 ${gridGap}px`,
            height: dayHeadH, flexShrink: 0,
          }}>
            {DAYS.map(d => (
              <div key={d} style={{
                fontFamily: 'var(--font-m)', fontSize: Math.min(dayFontSize * 0.85, 9),
                color: 'var(--text-mid)', textAlign: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textTransform: 'uppercase', letterSpacing: '.05em',
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(7, ${cellSize}px)`,
            gridAutoRows: `${cellSize}px`,
            gap: `${gridGap}px`,
            width: gridW, height: gridH,
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
                    width: cellSize, height: cellSize,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    borderRadius: Math.max(cellSize * 0.18, 4),
                    border: isSel ? '1px solid var(--accent)' : '1px solid transparent',
                    background: isSel ? 'var(--accent-bg)' : isTd ? 'var(--glass)' : 'transparent',
                    cursor: 'pointer', transition: 'all .12s', padding: 0,
                  }}
                  onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = 'var(--glass)'; }}
                  onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = isTd ? 'var(--glass)' : 'transparent'; }}
                >
                  <span style={{
                    fontFamily: 'var(--font-m)', fontSize: dayFontSize,
                    color: isTd ? 'var(--accent)' : 'var(--text)',
                    fontWeight: isTd ? 600 : 400, lineHeight: 1,
                  }}>
                    {day}
                  </span>
                  {hasEvents && (
                    <div style={{
                      position: 'absolute',
                      bottom: Math.max(cellSize * 0.08, 2),
                      left: '50%', transform: 'translateX(-50%)',
                      display: 'flex', gap: 1.5,
                    }}>
                      {eventsByDate[key].slice(0, 5).map((_, idx) => (
                        <div key={idx} style={{
                          width: dotSize, height: dotSize, borderRadius: '50%',
                          background: 'var(--accent)',
                        }} />
                      ))}
                      {eventsByDate[key].length > 5 && (
                        <span style={{
                          fontFamily: 'var(--font-m)',
                          fontSize: Math.max(dayFontSize * 0.7, 8),
                          color: 'var(--accent)',
                          marginLeft: 2,
                        }}>
                          +{eventsByDate[key].length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
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
            <p style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)' }}>No events</p>
          ) : (
            selectedEvents.map((evt) => (
              <div key={evt.id} style={{ marginBottom: 8 }}>
                <p style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--white)', marginBottom: 2 }}>{evt.title}</p>
                <p style={{ fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--accent)', letterSpacing: '.04em' }}>{evt.time}</p>
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

/* ── Helpers ── */

function buildGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function buildEventMap(events: CalendarEvent[]) {
  const map: Record<string, CalendarEvent[]> = {};
  events.forEach((evt) => {
    if (!map[evt.date]) map[evt.date] = [];
    map[evt.date].push(evt);
  });
  return map;
}

const rootStyle = {
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '12px 10px',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minWidth: 0,
  overflow: 'hidden',
};

const navBtnStyle = {
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
