import { useState } from 'react';
import Modal from '../Modal';
import type { CalendarEvent, EventType, EventPriority } from '../../hooks/useStore';
import { useTheme } from '../../hooks/useTheme';

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'event', label: 'Event' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'follow-up', label: 'Follow-up' },
];

const PRIORITIES: { value: EventPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
];

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'No repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
  onDelete?: () => void;
  onConvertToTodo?: () => void;
  initialData?: Partial<CalendarEvent>;
  defaultDate?: string;
  defaultTime?: string;
}

export default function EventModal({
  isOpen, onClose, onSave, onDelete, onConvertToTodo,
  initialData, defaultDate, defaultTime,
}: EventModalProps) {
  if (!isOpen) return null;
  return (
    <EventModalInner
      key={initialData?.id || `new-${defaultDate}-${defaultTime}`}
      onClose={onClose} onSave={onSave} onDelete={onDelete}
      onConvertToTodo={onConvertToTodo}
      initialData={initialData} defaultDate={defaultDate} defaultTime={defaultTime}
    />
  );
}

function EventModalInner({
  onClose, onSave, onDelete, onConvertToTodo,
  initialData, defaultDate, defaultTime,
}: Omit<EventModalProps, 'isOpen'>) {
  const { mode } = useTheme();
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [eventType, setEventType] = useState<EventType>(initialData?.eventType || 'event');
  const [date, setDate] = useState(initialData?.date || defaultDate || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(initialData?.time || defaultTime || '09:00');
  const [endDate, setEndDate] = useState(initialData?.endDate || initialData?.date || defaultDate || '');
  const [endTime, setEndTime] = useState(initialData?.endTime || '10:00');
  const [priority, setPriority] = useState<EventPriority>(initialData?.priority || 'normal');
  const [projectTag, setProjectTag] = useState(initialData?.projectTag || '');
  const [clientTag, setClientTag] = useState(initialData?.clientTag || '');
  const [reminderOffset, setReminderOffset] = useState(initialData?.reminderOffset ?? 15);
  const [recurrence, setRecurrence] = useState(initialData?.recurrence || 'none');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description,
      eventType,
      date,
      time,
      endDate: endDate || date,
      endTime,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      priority,
      projectTag: projectTag || undefined,
      clientTag: clientTag || undefined,
      reminderOffset,
      recurrence,
    });
    onClose();
  };

  const isEditing = !!initialData?.id;

  return (
    <Modal isOpen onClose={onClose} title={isEditing ? 'Edit Event' : 'New Event'} width={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
          autoFocus
          style={inputStyle}
        />

        {/* Type & Priority row */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType)}
              style={selectStyle}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as EventPriority)}
              style={selectStyle}
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date/Time row */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Start Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ ...inputStyle, colorScheme: mode }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Start Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{ ...inputStyle, colorScheme: mode }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ ...inputStyle, colorScheme: mode }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              style={{ ...inputStyle, colorScheme: mode }}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }}
          />
        </div>

        {/* Linked Project / Client */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Project</label>
            <input
              value={projectTag}
              onChange={(e) => setProjectTag(e.target.value)}
              placeholder="Project name"
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Client</label>
            <input
              value={clientTag}
              onChange={(e) => setClientTag(e.target.value)}
              placeholder="Client name"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Reminder & Recurrence */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Reminder (min before)</label>
            <select
              value={reminderOffset}
              onChange={(e) => setReminderOffset(Number(e.target.value))}
              style={selectStyle}
            >
              <option value={0}>None</option>
              <option value={5}>5 min</option>
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={60}>1 hour</option>
              <option value={1440}>1 day</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Recurrence</label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
              style={selectStyle}
            >
              {RECURRENCE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex', gap: 8, justifyContent: 'space-between',
          marginTop: 8, paddingTop: 14, borderTop: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {isEditing && onDelete && (
              <button onClick={onDelete} style={dangerBtn}>Delete</button>
            )}
            {isEditing && onConvertToTodo && (
              <button onClick={onConvertToTodo} style={secondaryBtn}>
                Convert to Todo
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={secondaryBtn}>Cancel</button>
            <button onClick={handleSubmit} style={primaryBtn}>
              {isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px',
  background: 'var(--bg2)', border: '1px solid var(--border)',
  borderRadius: 6, color: 'var(--text)',
  fontFamily: 'var(--font-m)', fontSize: 11,
  outline: 'none', transition: 'border-color .15s',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle, cursor: 'pointer',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)',
  letterSpacing: '.06em', textTransform: 'uppercase' as const,
  marginBottom: 4, display: 'block',
};

const primaryBtn: React.CSSProperties = {
  padding: '8px 18px', borderRadius: 6, border: 'none',
  background: 'var(--accent)', color: 'var(--bg)',
  fontFamily: 'var(--font-m)', fontSize: 11, fontWeight: 600,
  cursor: 'pointer', transition: 'opacity .15s',
};

const secondaryBtn: React.CSSProperties = {
  padding: '8px 14px', borderRadius: 6,
  border: '1px solid var(--border)', background: 'transparent',
  color: 'var(--text-mid)', fontFamily: 'var(--font-m)', fontSize: 11,
  cursor: 'pointer',
};

const dangerBtn: React.CSSProperties = {
  ...secondaryBtn, color: 'var(--danger)', borderColor: 'var(--danger)',
};
