// Client table component
import { useTranslation } from 'react-i18next';
import { type Client } from '../../types/client.types';
import { formatDate } from '../../utils/formatters';
import { useIsMobile } from '../../hooks/useIsMobile';
import type { CSSProperties } from 'react';

interface ClientTableProps {
  clients: Client[];
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
  onView?: (client: Client) => void;
}

const CLIENT_TABLE_MIN_WIDTH = 860;

const TABLE_TH: CSSProperties = {
  textAlign: 'left',
  padding: '12px 24px',
  fontFamily: 'var(--font-m)',
  fontSize: 9,
  fontWeight: 400,
  lineHeight: 1.2,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: 'var(--text-dim)',
};

const LABEL_STYLE: CSSProperties = {
  fontFamily: 'var(--font-m)',
  fontSize: 9,
  fontWeight: 400,
  lineHeight: 1.2,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'var(--text-dim)',
  marginBottom: 4,
};

const CELL_MUTED: CSSProperties = {
  fontFamily: 'var(--font-m)',
  fontSize: 12,
  fontWeight: 400,
  lineHeight: 1.4,
  color: 'var(--text-mid)',
};

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
          lineHeight: 1.4,
          color: 'var(--text-dim)',
        }}
      >
        {t('clients.table.empty')}
      </div>
    );
  }

  const renderActions = (client: Client, mobile: boolean) => (
    <div
      style={{
        display: 'flex',
        gap: 10,
        justifyContent: mobile ? 'flex-start' : 'flex-end',
        flexWrap: 'wrap',
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
            lineHeight: 1.2,
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
          {t('common.view')}
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
            lineHeight: 1.2,
            padding: '6px 12px',
            borderRadius: 999,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            transition: 'all .15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent)';
            e.currentTarget.style.color = 'var(--bg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--accent-bg)';
            e.currentTarget.style.color = 'var(--accent)';
          }}
        >
          {t('common.edit')}
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(client)}
          style={{
            background: 'var(--danger-bg)',
            border: '1px solid rgba(230, 90, 90, 0.35)',
            color: 'var(--danger)',
            cursor: 'pointer',
            fontFamily: 'var(--font-m)',
            fontSize: 10,
            lineHeight: 1.2,
            padding: '6px 12px',
            borderRadius: 999,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            transition: 'all .15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--danger)';
            e.currentTarget.style.color = 'var(--bg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--danger-bg)';
            e.currentTarget.style.color = 'var(--danger)';
          }}
        >
          {t('common.delete')}
        </button>
      )}
    </div>
  );

  /* ── Mobile: card list ── */
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
              <div style={LABEL_STYLE}>{t('clients.table.name')}</div>
              <div style={{ fontFamily: 'var(--font-m)', fontSize: 12, fontWeight: 500, lineHeight: 1.3, color: 'var(--text)' }}>
                {client.name}
              </div>
            </div>
            {client.email && (
              <div style={{ marginBottom: 10 }}>
                <div style={LABEL_STYLE}>{t('clients.table.email')}</div>
                <div style={CELL_MUTED}>{client.email}</div>
              </div>
            )}
            {client.company && (
              <div style={{ marginBottom: 10 }}>
                <div style={LABEL_STYLE}>{t('clients.table.company')}</div>
                <div style={CELL_MUTED}>{client.company}</div>
              </div>
            )}
            {client.phone && (
              <div style={{ marginBottom: 10 }}>
                <div style={LABEL_STYLE}>{t('clients.table.phone')}</div>
                <div style={CELL_MUTED}>{client.phone}</div>
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <div style={LABEL_STYLE}>{t('clients.table.created')}</div>
              <div style={CELL_MUTED}>{formatDate(client.createdAt)}</div>
            </div>
            {renderActions(client, true)}
          </div>
        ))}
      </div>
    );
  }

  /* ── Desktop: table ── */
  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' } as CSSProperties}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: CLIENT_TABLE_MIN_WIDTH,
        }}
      >
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={TABLE_TH}>{t('clients.table.name')}</th>
            <th style={TABLE_TH}>{t('clients.table.email')}</th>
            <th style={TABLE_TH}>{t('clients.table.company')}</th>
            <th style={TABLE_TH}>{t('clients.table.phone')}</th>
            <th style={TABLE_TH}>{t('clients.table.created')}</th>
            <th style={{ ...TABLE_TH, textAlign: 'right' }}>{t('clients.table.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client, index) => (
            <tr
              key={client.id}
              style={{
                borderTop: index > 0 ? '1px solid var(--border)' : 'none',
                transition: 'background .15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <td
                style={{
                  padding: '13px 24px',
                  fontFamily: 'var(--font-m)',
                  fontSize: 12,
                  fontWeight: 500,
                  lineHeight: 1.3,
                  color: 'var(--text)',
                }}
              >
                {client.name}
              </td>
              <td style={{ padding: '13px 24px', ...CELL_MUTED }}>{client.email || '—'}</td>
              <td style={{ padding: '13px 24px', ...CELL_MUTED }}>{client.company || '—'}</td>
              <td style={{ padding: '13px 24px', ...CELL_MUTED }}>{client.phone || '—'}</td>
              <td style={{ padding: '13px 24px', ...CELL_MUTED }}>{formatDate(client.createdAt)}</td>
              <td style={{ padding: '13px 24px', textAlign: 'right' }}>
                {renderActions(client, false)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
