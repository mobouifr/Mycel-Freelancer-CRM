// Reminders list page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReminders } from '../../hooks/useReminders';
import { Reminder, ReminderStatus } from '../../types/reminder.types';
import { formatDateTime } from '../../utils/formatters';

export const RemindersListPage = () => {
  const navigate = useNavigate();
  const { reminders, loading, error, deleteReminder } = useReminders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReminderStatus | 'ALL'>('ALL');

  const filteredReminders = reminders.filter((reminder) => {
    const matchesSearch = reminder.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || reminder.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (reminder: Reminder) => {
    if (window.confirm(`Are you sure you want to delete "${reminder.title}"?`)) {
      try {
        await deleteReminder(reminder.id);
      } catch (err) {
        alert('Failed to delete reminder');
      }
    }
  };

  const getPriorityStyle = (priority: string): React.CSSProperties => {
    switch (priority) {
      case 'high':
        return {
          backgroundColor: 'rgba(230, 90, 90, 0.15)',
          color: 'var(--danger)',
          border: '1px solid rgba(230, 90, 90, 0.3)',
        };
      case 'medium':
        return {
          backgroundColor: 'rgba(240, 190, 60, 0.15)',
          color: 'var(--warning)',
          border: '1px solid rgba(240, 190, 60, 0.3)',
        };
      case 'low':
        return {
          backgroundColor: 'var(--accent-bg)',
          color: 'var(--accent)',
          border: '1px solid var(--accent-hover)',
        };
      default:
        return {
          backgroundColor: 'rgba(255,255,255,0.1)',
          color: 'var(--text-mid)',
          border: '1px solid var(--border)',
        };
    }
  };

  const getStatusStyle = (status: ReminderStatus): React.CSSProperties => {
    switch (status) {
      case ReminderStatus.COMPLETED:
        return {
          backgroundColor: 'var(--accent-bg)',
          color: 'var(--accent)',
          border: '1px solid var(--accent-hover)',
        };
      case ReminderStatus.DISMISSED:
        return {
          backgroundColor: 'rgba(255,255,255,0.1)',
          color: 'var(--text-mid)',
          border: '1px solid var(--border)',
        };
      default:
        return {
          backgroundColor: 'rgba(240, 190, 60, 0.15)',
          color: 'var(--warning)',
          border: '1px solid rgba(240, 190, 60, 0.3)',
        };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text)' }}>Loading reminders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <div
          style={{
            backgroundColor: 'rgba(230, 90, 90, 0.15)',
            border: '1px solid rgba(230, 90, 90, 0.3)',
            color: 'var(--danger)',
            padding: '12px 16px',
            borderRadius: '8px',
          }}
        >
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '32px',
        backgroundColor: '#060606',
        minHeight: '100vh',
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}
      >
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: 'var(--text)',
            margin: 0,
          }}
        >
          Reminders
        </h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search reminders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px 16px 10px 40px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '14px',
                width: '260px',
                fontFamily: 'var(--font-m)',
                backgroundColor: 'var(--surface)',
                color: 'var(--text)',
                outline: 'none',
              }}
            />
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '16px',
              }}
            >
              🔍
            </span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReminderStatus | 'ALL')}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text)',
              fontFamily: 'var(--font-m)',
              fontSize: '13px',
              outline: 'none',
            }}
          >
            <option value="ALL">All Statuses</option>
            {Object.values(ReminderStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            onClick={() => navigate('/reminders/new')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#22c55e',
              color: '#050505',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'var(--font-m)',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#16a34a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#22c55e';
            }}
          >
            + New Reminder
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <div
        style={{
          backgroundColor: '#0e0e0e',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          padding: '24px',
        }}
      >
        {/* Table */}
        {filteredReminders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-dim)' }}>
            <p>No reminders found.</p>
          </div>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--font-m)',
                    letterSpacing: '0.05em',
                  }}
                >
                  TITLE
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--font-m)',
                    letterSpacing: '0.05em',
                  }}
                >
                  TYPE
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--font-m)',
                    letterSpacing: '0.05em',
                  }}
                >
                  PRIORITY
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--font-m)',
                    letterSpacing: '0.05em',
                  }}
                >
                  DUE DATE
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--font-m)',
                    letterSpacing: '0.05em',
                  }}
                >
                  STATUS
                </th>
                <th
                  style={{
                    textAlign: 'right',
                    padding: '12px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--font-m)',
                    letterSpacing: '0.05em',
                  }}
                >
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReminders.map((reminder, index) => (
                <tr
                  key={reminder.id}
                  style={{
                    borderTop: index > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}
                >
                  <td style={{ padding: '16px' }}>
                    <div
                      style={{
                        fontWeight: 500,
                        fontSize: '13px',
                        color: 'var(--text)',
                        fontFamily: 'var(--font-m)',
                      }}
                    >
                      {reminder.title}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--text)',
                        fontFamily: 'var(--font-m)',
                      }}
                    >
                      {reminder.reminderType}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span
                      style={{
                        ...getPriorityStyle(reminder.priority),
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-m)',
                        display: 'inline-block',
                      }}
                    >
                      {reminder.priority}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--text)',
                        fontFamily: 'var(--font-m)',
                      }}
                    >
                      {formatDateTime(reminder.dueDate)}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span
                      style={{
                        ...getStatusStyle(reminder.status),
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-m)',
                        display: 'inline-block',
                      }}
                    >
                      {reminder.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => navigate(`/reminders/${reminder.id}`)}
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-mid)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-m)',
                          fontSize: 10,
                          padding: '6px 12px',
                          borderRadius: 999,
                          letterSpacing: '.06em',
                          textTransform: 'uppercase',
                          transition: 'all .15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--text)';
                          e.currentTarget.style.borderColor = 'var(--border-h)';
                          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-mid)';
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/reminders/${reminder.id}/edit`)}
                        style={{
                          background: 'var(--accent-bg)',
                          border: '1px solid var(--accent-hover)',
                          color: 'var(--accent)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-m)',
                          fontSize: 10,
                          padding: '6px 12px',
                          borderRadius: 999,
                          letterSpacing: '.06em',
                          textTransform: 'uppercase',
                          transition: 'all .15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--accent)';
                          e.currentTarget.style.color = '#050505';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--accent-bg)';
                          e.currentTarget.style.color = 'var(--accent)';
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(reminder)}
                        style={{
                          background: 'rgba(230, 90, 90, 0.08)',
                          border: '1px solid rgba(230, 90, 90, 0.35)',
                          color: 'var(--danger)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-m)',
                          fontSize: 10,
                          padding: '6px 12px',
                          borderRadius: 999,
                          letterSpacing: '.06em',
                          textTransform: 'uppercase',
                          transition: 'all .15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--danger)';
                          e.currentTarget.style.color = '#050505';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(230, 90, 90, 0.08)';
                          e.currentTarget.style.color = 'var(--danger)';
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

