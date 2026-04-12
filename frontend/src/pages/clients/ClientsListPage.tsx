// Clients list page
import { useEffect, useRef, type CSSProperties } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useClients } from '../../hooks/useClients';
import { ClientTable } from '../../components/clients/ClientTable';
import { type Client } from '../../types/client.types';
import { useIsMobile } from '../../hooks/useIsMobile';

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, '...', total];
  if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export const ClientsListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const {
    clients, loading, error,
    page, totalPages, total,
    search, setSearch,
    sortBy, sortOrder, handleSort,
    goToPage, deleteClient, refetch,
  } = useClients();

  // Re-fetch whenever the user navigates back to this page (e.g. after creating/editing)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    refetch();
  }, [location.key]);

  const handleDelete = async (client: Client) => {
    if (window.confirm(t('clients.confirm_delete', { name: client.name }))) {
      try {
        await deleteClient(client.id);
      } catch (err) {
        alert(t('clients.delete_failed'));
      }
    }
  };

  // Show full-page spinner only on the very first load (no data yet).
  // On page turns / re-fetches the table stays visible with the previous page's data.
  if (loading && clients.length === 0) {
    return (
      <div
        style={{
          padding: 0,
          animation: 'fadeUp .3s var(--ease) both',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '40px 0',
            fontFamily: 'var(--font-m)',
            fontSize: 12,
            lineHeight: 1.4,
            color: 'var(--text-dim)',
          }}
        >
          {t('clients.loading')}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: 0,
          animation: 'fadeUp .3s var(--ease) both',
        }}
      >
        <div
          style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            borderRadius: 8,
            padding: '12px 16px',
            fontFamily: 'var(--font-m)',
            fontSize: 12,
            lineHeight: 1.4,
          }}
        >
          {t('common.error', { message: error })}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 0,
        animation: 'fadeUp .3s var(--ease) both',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontFamily: 'var(--font-d)',
            fontWeight: 500,
            fontSize: isMobile ? 22 : 26,
            color: 'var(--text)',
            letterSpacing: '.06em',
            lineHeight: 1.3,
            marginBottom: 4,
          }}
        >
          {t('clients.title')}
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-m)',
            fontSize: 11,
            fontWeight: 400,
            color: 'var(--text-dim)',
            letterSpacing: '.04em',
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          {t('clients.subtitle')}
        </p>
      </div>

      {/* Search + Add */}
      <div style={{
        display: 'flex',
        gap: 10,
        marginBottom: 20,
        width: '100%',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
      }}>
        <input
          type="text"
          id="clients-search"
          name="clients-search"
          autoComplete="off"
          placeholder={t('clients.search_placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 0,
            boxSizing: 'border-box',
            padding: '10px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--surface-2)',
            color: 'var(--text)',
            fontFamily: 'var(--font-m)',
            fontSize: 12,
            fontWeight: 400,
            lineHeight: 1.4,
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={() => navigate('/clients/new', { state: { background: location } })}
          style={{
            padding: '10px 20px',
            borderRadius: 6,
            border: '1px solid var(--accent-hover)',
            background: 'var(--accent-bg)',
            color: 'var(--accent)',
            fontFamily: 'var(--font-m)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '.06em',
            lineHeight: 1.2,
            cursor: 'pointer',
            transition: 'background .2s var(--ease), color .2s var(--ease)',
            width: isMobile ? '100%' : 'auto',
            boxSizing: 'border-box',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'var(--bg)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent-bg)'; e.currentTarget.style.color = 'var(--accent)'; }}
        >
          {t('clients.new_client')}
        </button>
      </div>

      {/* Table container */}
      <div
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <ClientTable
          clients={clients}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onView={(client) => navigate(`/clients/${client.id}`, { state: { background: location, client } })}
          onEdit={(client) => navigate(`/clients/${client.id}/edit`, { state: { background: location } })}
          onDelete={handleDelete}
        />

        {/* Pagination */}
        {totalPages > 1 && (() => {
          const btnBase: CSSProperties = {
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            minWidth: 30, height: 30, padding: '0 8px', borderRadius: 6,
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-mid)', fontFamily: 'var(--font-m)', fontSize: 11,
            cursor: 'pointer', transition: 'all .15s',
          };
          const pages = getPageNumbers(page, totalPages);
          return (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 24px', borderTop: '1px solid var(--border)',
              flexWrap: 'wrap', gap: 8,
            }}>
              <span style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.4 }}>
                {total} results · Page {page} of {totalPages}
              </span>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <button type="button" disabled={page === 1} onClick={() => goToPage(page - 1)}
                  style={{ ...btnBase, opacity: page === 1 ? 0.35 : 1, cursor: page === 1 ? 'default' : 'pointer' }}>←</button>
                {pages.map((p, i) =>
                  p === '...'
                    ? <span key={`e${i}`} style={{ ...btnBase, border: 'none', cursor: 'default', color: 'var(--text-dim)' }}>…</span>
                    : <button key={p} type="button" onClick={() => goToPage(p as number)} style={{
                        ...btnBase,
                        ...(p === page ? { background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-hover)', fontWeight: 600 } : {}),
                      }}>{p}</button>
                )}
                <button type="button" disabled={page === totalPages} onClick={() => goToPage(page + 1)}
                  style={{ ...btnBase, opacity: page === totalPages ? 0.35 : 1, cursor: page === totalPages ? 'default' : 'pointer' }}>→</button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
