// Client table component
import { Client } from '../../types/client.types';
import { formatDate } from '../../utils/formatters';

interface ClientTableProps {
  clients: Client[];
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
  onView?: (client: Client) => void;
}

export const ClientTable = ({ clients, onEdit, onDelete, onView }: ClientTableProps) => {
  if (clients.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '40px 24px',
          fontFamily: 'var(--font-m)',
          fontSize: 12,
          color: 'var(--text-dim)',
        }}
      >
        No clients yet. Create your first client to get started.
      </div>
    );
  }

  const headerStyle: React.CSSProperties = {
    fontFamily: 'var(--font-m)',
    fontSize: 9,
    letterSpacing: '.12em',
    textTransform: 'uppercase',
    color: 'var(--text-dim)',
  };

  const cellTextStyle: React.CSSProperties = {
    fontFamily: 'var(--font-m)',
    fontSize: 12,
    color: 'var(--text)',
  };

  const cellMutedStyle: React.CSSProperties = {
    ...cellTextStyle,
    color: 'var(--text-mid)',
  };

  return (
    <div>
      {/* Header row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 2fr 2fr 1.5fr 1.5fr 1fr',
          padding: '12px 24px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span style={headerStyle}>Name</span>
        <span style={headerStyle}>Email</span>
        <span style={headerStyle}>Company</span>
        <span style={headerStyle}>Phone</span>
        <span style={headerStyle}>Created</span>
        <span style={{ ...headerStyle, textAlign: 'right' }}>Actions</span>
      </div>

      {/* Rows */}
      {clients.map((client, index) => (
        <div
          key={client.id}
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 2fr 2fr 1.5fr 1.5fr 1fr',
            padding: '13px 24px',
            borderBottom:
              index < clients.length - 1
                ? '1px solid rgba(255,255,255,0.04)'
                : 'none',
            alignItems: 'center',
            transition: 'background .15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <span>
            <span
              style={{
                ...cellTextStyle,
                fontWeight: 500,
              }}
            >
              {client.name}
            </span>
          </span>

          <span>
            <span style={cellMutedStyle}>{client.email || '—'}</span>
          </span>

          <span>
            <span style={cellMutedStyle}>{client.company || '—'}</span>
          </span>

          <span>
            <span style={cellMutedStyle}>{client.phone || '—'}</span>
          </span>

          <span>
            <span style={cellMutedStyle}>{formatDate(client.createdAt)}</span>
          </span>

          <span>
            <div
              style={{
                display: 'inline-flex',
                gap: 10,
                justifyContent: 'flex-end',
              }}
            >
              {onView && (
                <button
                  onClick={() => onView(client)}
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
                    e.currentTarget.style.color = 'var(--text-dim)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  }}
                >
                  View
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(client)}
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
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(client)}
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
              )}
            </div>
          </span>
        </div>
      ))}
    </div>
  );
};

