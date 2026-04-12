import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal';
import type { CalendarEvent, EventType, EventPriority } from '../../hooks/useStore';
import { useTheme } from '../../hooks/useTheme';
import { useClients } from '../../hooks/useClients';
import { useProjects } from '../../hooks/useProjects';

const EVENT_TYPE_KEYS: { value: EventType; key: string }[] = [
  { value: 'event', key: 'event_modal.event' },
  { value: 'meeting', key: 'event_modal.meeting' },
  { value: 'deadline', key: 'event_modal.deadline' },
  { value: 'milestone', key: 'event_modal.milestone' },
  { value: 'follow-up', key: 'event_modal.follow_up' },
];

const PRIORITY_KEYS: { value: EventPriority; key: string }[] = [
  { value: 'low', key: 'event_modal.low' },
  { value: 'normal', key: 'event_modal.normal' },
  { value: 'high', key: 'event_modal.high' },
];

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
  onDelete?: () => void;
  initialData?: Partial<CalendarEvent>;
  defaultDate?: string;
  defaultTime?: string;
}

export default function EventModal({
  isOpen, onClose, onSave, onDelete,
  initialData, defaultDate, defaultTime,
}: EventModalProps) {
  if (!isOpen) return null;
  return (
    <EventModalInner
      key={initialData?.id || `new-${defaultDate}-${defaultTime}`}
      onClose={onClose} onSave={onSave} onDelete={onDelete}
      initialData={initialData} defaultDate={defaultDate} defaultTime={defaultTime}
    />
  );
}

function EventModalInner({
  onClose, onSave, onDelete,
  initialData, defaultDate, defaultTime,
}: Omit<EventModalProps, 'isOpen'>) {
  const { t } = useTranslation();
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

  const { clients } = useClients({ pageSize: 100 });
  const { projects } = useProjects({ pageSize: 100 });

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
      priority,
      projectTag: projectTag || undefined,
      clientTag: clientTag || undefined,
    });
    onClose();
  };

  const isEditing = !!initialData?.id;

  return (
    <Modal isOpen onClose={onClose} title={isEditing ? t('event_modal.edit_event') : t('event_modal.new_event')} width={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('event_modal.event_title_placeholder')}
          autoFocus
          style={inputStyle}
        />

        {/* Type & Priority row */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>{t('event_modal.type')}</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType)}
              style={selectStyle}
            >
              {EVENT_TYPE_KEYS.map((et) => (
                <option key={et.value} value={et.value}>{t(et.key)}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>{t('event_modal.priority')}</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as EventPriority)}
              style={selectStyle}
            >
              {PRIORITY_KEYS.map((p) => (
                <option key={p.value} value={p.value}>{t(p.key)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date/Time row */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>{t('event_modal.start_date')}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ ...inputStyle, colorScheme: mode }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>{t('event_modal.start_time')}</label>
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
            <label style={labelStyle}>{t('event_modal.end_date')}</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ ...inputStyle, colorScheme: mode }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>{t('event_modal.end_time')}</label>
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
          <label style={labelStyle}>{t('event_modal.description')}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('event_modal.add_details')}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }}
          />
        </div>

        {/* Linked Project / Client */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>{t('event_modal.project')}</label>
            <input
              value={projectTag}
              onChange={(e) => setProjectTag(e.target.value)}
              placeholder={t('event_modal.project_placeholder')}
              style={inputStyle}
              list="project-list"
            />
            <datalist id="project-list">
              {projects.map((p) => (
                <option key={p.id} value={p.title} />
              ))}
            </datalist>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>{t('event_modal.client')}</label>
            <input
              value={clientTag}
              onChange={(e) => setClientTag(e.target.value)}
              placeholder={t('event_modal.client_placeholder')}
              style={inputStyle}
              list="client-list"
            />
            <datalist id="client-list">
              {clients.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex', gap: 8, justifyContent: 'space-between',
          marginTop: 8, paddingTop: 14, borderTop: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {isEditing && onDelete && (
              <button onClick={onDelete} style={dangerBtn}>{t('common.delete')}</button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={secondaryBtn}>{t('common.cancel')}</button>
            <button onClick={handleSubmit} style={primaryBtn}>
              {isEditing ? t('common.update') : t('common.create')}
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
