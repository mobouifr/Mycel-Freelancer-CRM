import type { CalendarEvent, EventType } from '../../hooks/useStore';

const TYPE_COLORS: Record<EventType, { fg: string; bg: string }> = {
  event:       { fg: 'var(--accent)',     bg: 'var(--glass)' },
  deadline:    { fg: 'var(--danger)',   bg: 'var(--danger-bg)' },
  meeting:     { fg: 'var(--success)',    bg: 'var(--success-bg)' },
  milestone:   { fg: 'var(--sidebar-active)',  bg: 'var(--sidebar-active-bg)' },
  'follow-up': { fg: 'var(--info)', bg: 'var(--info-bg)' },
};

const TYPE_ICONS: Record<EventType, string> = {
  event: '●', deadline: '⚑', meeting: '◉', milestone: '◆', 'follow-up': '↩',
};

const PRIORITY_DOTS: Record<string, string> = {
  high: 'var(--danger)', normal: 'var(--text-dim)', low: 'var(--text-dim)',
};

interface EventChipProps {
  event: CalendarEvent;
  compact?: boolean;
  onClick?: (e: CalendarEvent) => void;
}

export default function EventChip({ event, compact, onClick }: EventChipProps) {
  const colors = TYPE_COLORS[event.eventType] || TYPE_COLORS.event;

  return (
    <button
      onClick={() => onClick?.(event)}
      title={`${event.title} · ${event.time}${event.endTime ? ` – ${event.endTime}` : ''}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: colors.bg,
        borderTop: 'none', borderRight: 'none', borderBottom: 'none',
        borderLeft: `2px solid ${colors.fg}`,
        borderRadius: 4,
        padding: compact ? '1px 5px' : '3px 7px',
        cursor: 'pointer', width: '100%', textAlign: 'left',
        transition: 'opacity .12s',
      }}
    >
      {!compact && (
        <span style={{ fontSize: 8, color: colors.fg, flexShrink: 0 }}>
          {TYPE_ICONS[event.eventType]}
        </span>
      )}
      <span style={{
        fontFamily: 'var(--font-m)', fontSize: compact ? 8 : 10,
        color: colors.fg, overflow: 'hidden', textOverflow: 'ellipsis',
        whiteSpace: 'nowrap', flex: 1,
      }}>
        {event.title}
      </span>
      {!compact && (
        <span style={{
          fontFamily: 'var(--font-m)', fontSize: 8, color: 'var(--text-dim)',
          flexShrink: 0,
        }}>
          {event.time}
        </span>
      )}
      {event.priority === 'high' && (
        <span style={{
          width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
          background: PRIORITY_DOTS.high,
        }} />
      )}
    </button>
  );
}
