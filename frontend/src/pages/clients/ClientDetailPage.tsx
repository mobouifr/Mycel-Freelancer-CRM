// Client detail page
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clientsService } from '../../services/data.service';
import { type Client } from '../../types/client.types';
import { type ApiError } from '../../types/common.types';
import { formatDate } from '../../utils/formatters';

export const ClientDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'proposals' | 'invoices'>('overview');

  useEffect(() => {
    const fetchClient = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await clientsService.getById(id);
        setClient(data);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || t('clients.load_failed'));
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">{t('clients.detail_loading')}</div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || t('clients.not_found')}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              {client.name}
            </h1>
            {client.company && <p style={{ color: 'var(--text-dim)' }}>{client.company}</p>}
          </div>
        </div>

        {/* Body - tabs */}
        <div style={{ borderBottom: '1px solid var(--border)', padding: '0 24px' }}>
          <nav className="flex -mb-px">
            {(['overview', 'projects', 'proposals', 'invoices'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 18px',
                  fontSize: 12,
                  fontWeight: 500,
                  borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                  color: activeTab === tab ? 'var(--accent)' : 'var(--text-dim)',
                  transition: 'all .15s',
                }}
              >
                {tab === 'overview' ? t('common.overview') : t(`nav.${tab}`)}
              </button>
            ))}
          </nav>
        </div>

        {/* Body - content */}
        <div style={{ padding: 24 }}>
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)' }}>{t('common.email')}</h3>
                <p style={{ marginTop: 4, color: 'var(--text)' }}>{client.email || '—'}</p>
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)' }}>{t('common.phone')}</h3>
                <p style={{ marginTop: 4, color: 'var(--text)' }}>{client.phone || '—'}</p>
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)' }}>{t('common.company')}</h3>
                <p style={{ marginTop: 4, color: 'var(--text)' }}>{client.company || '—'}</p>
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)' }}>{t('common.notes')}</h3>
                <p style={{ marginTop: 4, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{client.notes || '—'}</p>
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)' }}>{t('common.created')}</h3>
                <p style={{ marginTop: 4, color: 'var(--text)' }}>{formatDate(client.createdAt)}</p>
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)' }}>{t('common.last_updated')}</h3>
                <p style={{ marginTop: 4, color: 'var(--text)' }}>{formatDate(client.updatedAt)}</p>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <p style={{ color: 'var(--text-dim)' }}>Projects will be displayed here once the backend endpoint is available.</p>
            </div>
          )}

          {activeTab === 'proposals' && (
            <div>
              <p style={{ color: 'var(--text-dim)' }}>Proposals will be displayed here once the backend endpoint is available.</p>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div>
              <p style={{ color: 'var(--text-dim)' }}>Invoices will be displayed here once the backend endpoint is available.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
          }}
        >
          <button
            onClick={() => navigate(`/clients/${client.id}/edit`)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 999,
              border: '1px solid var(--accent)',
              background: 'var(--accent-bg)',
              color: 'var(--accent)',
              padding: '8px 16px',
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '.06em',
            }}
          >
            {t('common.edit')}
          </button>
          <button
            onClick={() => navigate('/clients')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 999,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
              padding: '8px 16px',
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '.06em',
            }}
          >
            {t('common.back_to_list')}
          </button>
        </div>
      </div>
    </div>
  );
};

