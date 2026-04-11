import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useCalendar from '../../hooks/useCalendar';
import type { CalendarViewMode } from '../../hooks/useCalendar';
import useNotifications from '../../hooks/useNotifications';
import { useIsMobile } from '../../hooks/useIsMobile';
import MiniCalendar from './MiniCalendar';
import CalendarMonthView from './CalendarMonthView';
import CalendarWeekView from './CalendarWeekView';
import CalendarDayView from './CalendarDayView';
import EventModal from './EventModal';
import DailyEventsView from './DailyEventsView';
import NotesView from './NotesView';
import TodosView from './TodosView';
import type { CalendarEvent } from '../../hooks/useStore';
import api from '../../services/api';

type RightTab = 'events' | 'notes' | 'todos';

const VIEW_OPTIONS: { value: CalendarViewMode; labelKey: string }[] = [
  { value: 'month', labelKey: 'calendar.month' },
  { value: 'week', labelKey: 'calendar.week' },
  { value: 'day', labelKey: 'calendar.day' },
];

export default function CalendarView() {
  const calendar = useCalendar();
  const { addTodo, addNotification } = useNotifications(); // using standard local wrapper minus events
  const isMobile = useIsMobile(1100);
  const { t } = useTranslation();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [defaultDate, setDefaultDate] = useState('');
  const [defaultTime, setDefaultTime] = useState('');
  const [rightTab, setRightTab] = useState<RightTab>('events');

  const handleConvertNoteToEvent = (note: any) => {
    setEditingEvent({
      id: '', // new event
      title: note.title || 'Note Event',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      description: note.content || '',
      createdAt: new Date().toISOString(),
      priority: note.tags?.includes('urgent') ? 'high' : 'normal',
      eventType: 'event',
    } as CalendarEvent);
    setDefaultDate(new Date().toISOString().split('T')[0]);
    setDefaultTime('09:00');
    setModalOpen(true);
  };

  const fetchEvents = () => {
    api.get('/dashboard/events')
      .then(res => {
        if (res.data) setEvents(res.data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Responsive mini calendar width
  const miniCalendarWidth = useMemo(() => {
    if (isMobile) return 180;
    if (window.innerWidth < 1200) return 200;
    if (window.innerWidth < 1400) return 220;
    return 230;
  }, [isMobile]);

  // Button styles
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

  const filteredEvents = useMemo(() => {
    return events;
  }, [events]);

  const handleCreateEvent = (date: string, time?: string) => {
    setEditingEvent(null);
    setDefaultDate(date);
    setDefaultTime(time || '09:00');
    setModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setDefaultDate(event.date);
    setDefaultTime(event.time);
    setModalOpen(true);
  };

  const handleSave = async (data: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    try {
      if (editingEvent) {
        await api.put(`/dashboard/events/${editingEvent.id}`, data);
      } else {
        await api.post('/dashboard/events', data);
      }
      fetchEvents();
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
        fetchEvents();
      } catch (error) {
        console.error('Failed to delete event', error);
      }
    }
    setModalOpen(false);
    setEditingEvent(null);
  };

  const handleConvertToTodo = async () => {
    if (!editingEvent) return;
    addTodo({
      text: editingEvent.title,
      done: false,
      dueAt: editingEvent.date,
      flag: editingEvent.priority === 'high' ? 'important' : 'none',
    });
    addNotification({
      type: 'success',
      title: 'Converted to todo',
      message: `"${editingEvent.title}" is now a todo`,
      targetType: 'todo',
    });
    try {
      await api.delete(`/dashboard/events/${editingEvent.id}`);
      fetchEvents();
    } catch (error) {
      console.error('Failed to delete event after conversion', error);
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
              background: 'var(--accent)', border: 'none', borderRadius: 6,
              padding: '6px 14px', color: 'var(--bg)',
              fontFamily: 'var(--font-m)', fontSize: 10, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Event
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Mini calendar sidebar (persistent across all views) */}
        <div style={{
          width: miniCalendarWidth, flexShrink: 0, padding: 10,
          borderRight: '1px solid var(--border)',
          overflowY: 'auto',
          display: isMobile ? 'none' : 'block', // Hide on mobile
        }}>
          <MiniCalendar
            currentDate={calendar.currentDate}
            onDateClick={(d) => {
              calendar.goToDate(d);
              calendar.setViewMode('day');
            }}
            onPrev={calendar.goPrev}
            onNext={calendar.goNext}
            events={filteredEvents}
          />
        </div>

        {/* Calendar view */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {calendar.viewMode === 'month' && (
            <CalendarMonthView
              year={calendar.currentDate.getFullYear()}
              month={calendar.currentDate.getMonth()}
              grid={calendar.monthGrid}
              events={filteredEvents}
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
              events={filteredEvents}
              today={calendar.today}
              onEventClick={handleEventClick}
              onCreateEvent={handleCreateEvent}
            />
          )}
          {calendar.viewMode === 'day' && (
            <CalendarDayView
              date={calendar.currentDate}
              events={filteredEvents}
              today={calendar.today}
              onEventClick={handleEventClick}
              onCreateEvent={handleCreateEvent}
            />
          )}
        </div>

        {/* Right side: Tabs (Events, Notes, Todos) */}
        {(!isMobile || calendar.viewMode === 'day') && (
          <div style={{
            width: isMobile ? '100%' : 280,
            flexShrink: 0,
            borderLeft: '1px solid var(--border)',
            background: 'var(--surface)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Tab switcher */}
            <div style={{
              display: 'flex', borderBottom: '1px solid var(--border)',
              padding: '0 10px', flexShrink: 0,
            }}>
              {(['events', 'notes', 'todos'] as RightTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setRightTab(tab)}
                  style={{
                    flex: 1,
                    fontFamily: 'var(--font-m)', fontSize: 10,
                    padding: '10px 0', border: 'none', cursor: 'pointer',
                    background: 'transparent',
                    color: rightTab === tab ? 'var(--accent)' : 'var(--text-dim)',
                    borderBottom: rightTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                    fontWeight: rightTab === tab ? 600 : 400,
                    letterSpacing: '.06em', textTransform: 'uppercase',
                    transition: 'all .12s',
                  }}
                >
                  {tab === 'events' ? t('calendar.events', 'Events') : tab === 'notes' ? t('reminders.notes', 'Notes') : t('reminders.todos', 'Todos')}
                </button>
              ))}
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {rightTab === 'events' && (
                <DailyEventsView 
                  date={calendar.currentDate} 
                  events={events} 
                  onEventClick={handleEventClick} 
                />
              )}
              {rightTab === 'notes' && (
                <div style={{ padding: 12 }}>
                  <NotesView onConvertToEvent={handleConvertNoteToEvent} />
                </div>
              )}
              {rightTab === 'todos' && (
                <div style={{ padding: 12 }}>
                  <TodosView />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Event modal */}
      <EventModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEvent(null); }}
        onSave={handleSave}
        onDelete={editingEvent ? handleDelete : undefined}
        onConvertToTodo={editingEvent ? handleConvertToTodo : undefined}
        initialData={editingEvent || undefined}
        defaultDate={defaultDate}
        defaultTime={defaultTime}
      />
    </div>
  );
}
