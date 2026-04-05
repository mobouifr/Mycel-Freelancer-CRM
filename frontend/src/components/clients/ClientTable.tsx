// Client table component
import { useTranslation } from 'react-i18next';
import { type Client } from '../../types/client.types';
import { formatDate } from '../../utils/formatters';
import { useIsMobile } from '../../hooks/useIsMobile';

interface ClientTableProps {
  clients: Client[];
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
  onView?: (client: Client) => void;
}

const GRID_COLS = '2fr 2fr 2fr 1.5fr 1.5fr 1fr';
const TABLE_MIN_WIDTH = 840;

export const ClientTable = ({ clients, onEdit, onDelete, onView }: ClientTableProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

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
        {t('clients.tableEmpty')}
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

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-m)',
    fontSize: 9,
    letterSpacing: '.1em',
    textTransform: 'uppercase',
    color: 'var(--text-dim)',
    marginBottom: 4,
  };

  const renderActions = (client: Client, layout: 'row' | 'wrap') => (
    <div
      style={{
        display: 'flex',
        flexWrap: layout === 'wrap' ? 'wrap' : 'nowrap',
        gap: 10,
        justifyContent: layout === 'row' ? 'flex-end' : 'flex-start',
      }}
    >
      {onView && (
        <button
          type="button"
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
          {t('clients.actions.view')}
        </button>
      )}
      {onEdit && (
        <button
          type="button"
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
          {t('clients.actions.edit')}
        </button>
      )}
      {onDelete && (
        <button
          type="button"
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
          {t('clients.actions.delete')}
        </button>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 0' }}>
        {clients.map((client) => (
          <div
            key={client.id}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 14,
              background: 'var(--surface)',
            }}
          >
            <div style={{ marginBottom: 10 }}>
              <div style={labelStyle}>{t('clients.form.name')}</div>
              <div style={{ ...cellTextStyle, fontWeight: 500 }}>{client.name}</div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={labelStyle}>{t('clients.form.email')}</div>
              <div style={cellMutedStyle}>{client.email || '—'}</div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={labelStyle}>{t('clients.form.company')}</div>
              <div style={cellMutedStyle}>{client.company || '—'}</div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={labelStyle}>{t('clients.form.phone')}</div>
              <div style={cellMutedStyle}>{client.phone || '—'}</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={labelStyle}>{t('clients.table.created')}</div>
              <div style={cellMutedStyle}>{formatDate(client.createdAt)}</div>
            </div>
            {renderActions(client, 'wrap')}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div style={{ minWidth: TABLE_MIN_WIDTH }}>
        {/* Header row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: GRID_COLS,
            padding: '12px 24px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <span style={headerStyle}>{t('clients.form.name')}</span>
          <span style={headerStyle}>{t('clients.form.email')}</span>
          <span style={headerStyle}>{t('clients.form.company')}</span>
          <span style={headerStyle}>{t('clients.form.phone')}</span>
          <span style={headerStyle}>{t('clients.table.created')}</span>
          <span style={{ ...headerStyle, textAlign: 'right' }}>{t('clients.table.actions')}</span>
        </div>

        {/* Rows */}
        {clients.map((client, index) => (
          <div
            key={client.id}
            style={{
              display: 'grid',
              gridTemplateColumns: GRID_COLS,
              padding: '13px 24px',
              borderBottom:
                index < clients.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
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

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                width: '100%',
                minWidth: 0,
              }}
            >
              {renderActions(client, 'row')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
