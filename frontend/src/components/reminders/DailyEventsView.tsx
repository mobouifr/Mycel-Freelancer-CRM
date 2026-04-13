import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { CalendarEvent } from '../../hooks/useStore';

interface DailyEventsViewProps {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const PRIORITY_ORDER = { high: 1, normal: 2, low: 3 };

const PRIORITY_THEMES = {
  high: { border: 'var(--danger)', bg: 'var(--danger-bg)' },
  normal: { border: 'var(--border)', bg: 'var(--surface)' },
  low: { border: 'var(--border)', bg: 'var(--surface-2)' },
};

export default function DailyEventsView({ date, events, onEventClick }: DailyEventsViewProps) {
  const { t, i18n } = useTranslation();

  const currentIsoDate = date.toISOString().split('T')[0];

  const dailyEvents = useMemo(() => {
    return events
      .filter(e => e.date === currentIsoDate)
      .sort((a, b) => {
        const diff = (PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] || 2) - 
                     (PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] || 2);
        if (diff !== 0) return diff;
        return a.time.localeCompare(b.time);
      });
  }, [events, currentIsoDate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '16px 14px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-m)', fontWeight: 600, fontSize: 13,
          color: 'var(--text)', margin: 0,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          {t('calendar.daily_agenda', 'Daily Agenda')}
          <span style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 400 }}>
            {date.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}
          </span>
        </h3>
      </div>

      {/* Events List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {dailyEvents.length === 0 ? (
          <p style={{
            fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--text-dim)',
            textAlign: 'center', marginTop: 30,
          }}>
            {t('calendar.no_events', 'No events for today.')}
          </p>
        ) : (
          dailyEvents.map((event) => {
            const theme = PRIORITY_THEMES[event.priority as keyof typeof PRIORITY_THEMES] || PRIORITY_THEMES.normal;
            return (
              <div
                key={event.id}
                onClick={() => onEventClick(event)}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: `1px solid ${theme.border}`,
                  background: theme.bg,
                  cursor: 'pointer',
                  transition: 'transform .1s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <span style={{
                    fontFamily: 'var(--font-m)', fontSize: 12, fontWeight: 600,
                    color: 'var(--text)', wordBreak: 'break-word'
                  }}>
                    {event.title}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)',
                    background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 4,
                  }}>
                    {event.time}
                  </span>
                </div>
                
                {event.description && (
                  <p style={{
                    fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)',
                    margin: '6px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {event.description}
                  </p>
                )}

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                  {event.priority === 'high' && (
                    <span style={{
                      fontFamily: 'var(--font-m)', fontSize: 9, padding: '2px 6px', borderRadius: 4,
                      background: 'var(--danger)', color: 'var(--bg)', fontWeight: 600
                    }}>
                      URGENT
                    </span>
                  )}
                  <span style={{
                    fontFamily: 'var(--font-m)', fontSize: 9, padding: '2px 6px', borderRadius: 4,
                    background: 'var(--glass)', color: 'var(--text-mid)', textTransform: 'capitalize'
                  }}>
                    {event.eventType}
                  </span>
                  {event.projectTag && (
                    <span style={{
                      fontFamily: 'var(--font-m)', fontSize: 9, padding: '2px 6px', borderRadius: 4,
                      background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-mid)'
                    }}>
                      {event.projectTag}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
