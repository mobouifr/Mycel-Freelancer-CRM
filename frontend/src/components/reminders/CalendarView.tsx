import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useCalendar from '../../hooks/useCalendar';
import type { CalendarViewMode } from '../../hooks/useCalendar';
import { useIsMobile } from '../../hooks/useIsMobile';
import MiniCalendar from './MiniCalendar';
import CalendarMonthView from './CalendarMonthView';
import CalendarWeekView from './CalendarWeekView';
import CalendarDayView from './CalendarDayView';
import EventModal from './EventModal';
import type { CalendarEvent } from '../../hooks/useStore';
import api from '../../services/api';

const VIEW_OPTIONS: { value: CalendarViewMode; labelKey: string }[] = [
  { value: 'month', labelKey: 'calendar.month' },
  { value: 'week', labelKey: 'calendar.week' },
  { value: 'day', labelKey: 'calendar.day' },
];

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventsChange: () => void;
  onDateChange?: (date: Date) => void;
}

export default function CalendarView({ events, onEventsChange, onDateChange }: CalendarViewProps) {
  const calendar = useCalendar();
  const isMobile = useIsMobile(1100);
  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [defaultDate, setDefaultDate] = useState('');
  const [defaultTime, setDefaultTime] = useState('');

  // Notify parent of date changes
  useEffect(() => {
    onDateChange?.(calendar.currentDate);
  }, [calendar.currentDate, onDateChange]);

  // Listen for external event-click requests (from DailyEventsView in the right panel)
  useEffect(() => {
    const handler = (e: Event) => {
      const event = (e as CustomEvent).detail as CalendarEvent;
      if (event) {
        setEditingEvent(event);
        setDefaultDate(event.date);
        setDefaultTime(event.time);
        setModalOpen(true);
      }
    };
    window.addEventListener('open-event-modal', handler);
    return () => window.removeEventListener('open-event-modal', handler);
  }, []);

  // Responsive mini calendar width
  const miniCalendarWidth = useMemo(() => {
    if (isMobile) return 180;
    if (window.innerWidth < 1200) return 200;
    if (window.innerWidth < 1400) return 220;
    return 230;
  }, [isMobile]);

  const navBtn = {
    width: 28, height: 28, borderRadius: 6,
    background: 'var(--surface-2)', border: '1px solid var(--border)',
    color: 'var(--text)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-m)', fontSize: 14,
    transition: 'all .15s',
  };

  const todayBtn = {
    padding: '4px 10px', borderRadius: 6,
    background: 'var(--glass)', border: '1px solid var(--border)',
    color: 'var(--text-mid)', cursor: 'pointer',
    fontFamily: 'var(--font-m)', fontSize: 10, fontWeight: 500,
    transition: 'all .15s',
  };

  const handleCreateEvent = useCallback((date: string, time?: string) => {
    setEditingEvent(null);
    setDefaultDate(date);
    setDefaultTime(time || '09:00');
    setModalOpen(true);
  }, []);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setEditingEvent(event);
    setDefaultDate(event.date);
    setDefaultTime(event.time);
    setModalOpen(true);
  }, []);

  const handleSave = async (data: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    try {
      if (editingEvent) {
        await api.put(`/dashboard/events/${editingEvent.id}`, data);
      } else {
        await api.post('/dashboard/events', data);
      }
      onEventsChange();
      setModalOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Failed to save event', error);
    }
  };

  const handleDelete = async () => {
    if (editingEvent) {
      try {
        await api.delete(`/dashboard/events/${editingEvent.id}`);
        onEventsChange();
      } catch (error) {
        console.error('Failed to delete event', error);
      }
    }
    setModalOpen(false);
    setEditingEvent(null);
  };



  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 14px', borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap', gap: 8,
      }}>
        {/* Left: nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={calendar.goPrev} style={navBtn} aria-label={t('calendar.previous')}>‹</button>
          <button onClick={calendar.goNext} style={navBtn} aria-label={t('calendar.next')}>›</button>
          <button onClick={calendar.goToday} style={todayBtn}>{t('calendar.today')}</button>
          <span style={{
            fontFamily: 'var(--font-m)', fontSize: 13, color: 'var(--text)',
            fontWeight: 500, letterSpacing: '.02em',
          }}>
            {calendar.headerLabel}
          </span>
        </div>

        {/* Right: view switcher + create */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            display: 'flex', background: 'transparent',
            borderRadius: 8, border: '1px solid var(--border)', padding: 1,
          }}>
            {VIEW_OPTIONS.map((v) => (
              <button
                key={v.value}
                onClick={() => calendar.setViewMode(v.value)}
                style={{
                  fontFamily: 'var(--font-m)', fontSize: 10, padding: '6px 12px',
                  borderRadius: 7, cursor: 'pointer',
                  background: calendar.viewMode === v.value
                    ? 'var(--sidebar-active-bg)'
                    : 'transparent',
                  color: calendar.viewMode === v.value
                    ? 'var(--sidebar-active)'
                    : 'var(--text-mid)',
                  fontWeight: calendar.viewMode === v.value ? 600 : 400,
                  transition: 'all .18s',
                  border: calendar.viewMode === v.value
                    ? '1px solid var(--sidebar-active-border)'
                    : '1px solid transparent',
                  margin: 1,
                }}
              >
                {t(v.labelKey)}
              </button>
            ))}
          </div>
          <button
            onClick={() => handleCreateEvent(
              calendar.currentDate.toISOString().split('T')[0],
            )}
            style={{
              background: 'var(--accent-bg)',
              border: '1px solid var(--accent-hover)',
              borderRadius: 6,
              padding: '6px 14px',
              color: 'var(--accent)',
              fontFamily: 'var(--font-m)', fontSize: 10, fontWeight: 500,
              cursor: 'pointer',
              letterSpacing: '.05em',
              transition: 'background .15s, color .15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'var(--bg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent-bg)'; e.currentTarget.style.color = 'var(--accent)'; }}
          >
            + Event
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Mini calendar sidebar */}
        <div style={{
          width: miniCalendarWidth, flexShrink: 0, padding: 10,
          borderRight: '1px solid var(--border)',
          overflowY: 'auto',
          display: isMobile ? 'none' : 'block',
        }}>
          <MiniCalendar
            currentDate={calendar.currentDate}
            onDateClick={(d) => {
              calendar.goToDate(d);
              calendar.setViewMode('day');
            }}
            onPrev={calendar.goPrev}
            onNext={calendar.goNext}
            events={events}
          />
        </div>

        {/* Calendar view */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {calendar.viewMode === 'month' && (
            <CalendarMonthView
              year={calendar.currentDate.getFullYear()}
              month={calendar.currentDate.getMonth()}
              grid={calendar.monthGrid}
              events={events}
              today={calendar.today}
              selectedDate={calendar.currentDate}
              onDateClick={(d) => {
                calendar.goToDate(d);
                calendar.setViewMode('day');
              }}
              onEventClick={handleEventClick}
              onCreateEvent={handleCreateEvent}
            />
          )}
          {calendar.viewMode === 'week' && (
            <CalendarWeekView
              weekDates={calendar.weekDates}
              events={events}
              today={calendar.today}
              onEventClick={handleEventClick}
              onCreateEvent={handleCreateEvent}
            />
          )}
          {calendar.viewMode === 'day' && (
            <CalendarDayView
              date={calendar.currentDate}
              events={events}
              today={calendar.today}
              onEventClick={handleEventClick}
              onCreateEvent={handleCreateEvent}
            />
          )}
        </div>
      </div>

      {/* Event modal */}
      <EventModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEvent(null); }}
        onSave={handleSave}
        onDelete={editingEvent ? handleDelete : undefined}
        initialData={editingEvent || undefined}
        defaultDate={defaultDate}
        defaultTime={defaultTime}
      />
    </div>
  );
}
