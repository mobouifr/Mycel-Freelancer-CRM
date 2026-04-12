// Client detail page
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clientsService, projectsService } from '../../services/data.service';
import { type Client } from '../../types/client.types';
import { type Project } from '../../types/project.types';
import { type ApiError } from '../../types/common.types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { ProjectStatusBadge } from '../../components/projects/ProjectStatusBadge';
import Modal from '../../components/Modal';

export const ClientDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  // Use data passed via router state (from list page) — instant, no API call needed.
  // Fall back to fetching only when accessing the URL directly.
  const initialClient = (location.state as any)?.client as Client | undefined;
  const [client, setClient] = useState<Client | null>(initialClient ?? null);
  const [loading, setLoading] = useState(!initialClient);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects'>('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Fetch this client's projects when the Projects tab is opened
  useEffect(() => {
    if (activeTab !== 'projects' || !client) return;
    setProjectsLoading(true);
    projectsService.getAll()
      .then((res) => {
        const list: Project[] = res.data ?? [];
        setProjects(list.filter((p) => p.clientId === client.id));
      })
      .catch(() => setProjects([]))
      .finally(() => setProjectsLoading(false));
  }, [activeTab, client?.id]);

  useEffect(() => {
    if (initialClient) return; // Already have data — skip fetch
    if (!id) return;
    (async () => {
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
    })();
  }, [id]);

  // While fetching (direct URL access only): show a matching backdrop so the
  // Modal can pop in cleanly once data arrives — no loading state inside the card.
  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '.08em' }}>
          {t('clients.detail_loading')}
        </span>
      </div>
    );
  }

  if (error || !client) {
    return (
      <Modal isOpen onClose={() => navigate('/clients')} title="—" width={520}>
        <div style={{
          background: 'rgba(230,90,90,0.08)', border: '1px solid rgba(230,90,90,0.35)',
          color: 'var(--danger)', padding: '12px 16px', borderRadius: 6,
          fontFamily: 'var(--font-m)', fontSize: 11,
        }}>
          {error || t('clients.not_found')}
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen onClose={() => navigate('/clients')} title={client.name} width={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
          {(['overview', 'projects'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 14px',
                fontFamily: 'var(--font-m)', fontSize: 9, letterSpacing: '.06em',
                textTransform: 'uppercase', border: 'none', background: 'transparent',
                cursor: 'pointer',
                borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--accent)' : 'var(--text-dim)',
                marginBottom: -1, transition: 'all .15s',
              }}
            >
              {tab === 'overview' ? t('common.overview') : t(`nav.${tab}`)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Email / Phone row */}
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>{t('common.email')}</label>
                <div style={valueStyle}>{client.email || '—'}</div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>{t('common.phone')}</label>
                <div style={valueStyle}>{client.phone || '—'}</div>
              </div>
            </div>

            {/* Company */}
            <div>
              <label style={labelStyle}>{t('common.company')}</label>
              <div style={valueStyle}>{client.company || '—'}</div>
            </div>

            {/* Notes */}
            <div>
              <label style={labelStyle}>{t('common.notes')}</label>
              <div style={{ ...valueStyle, whiteSpace: 'pre-wrap', minHeight: 52 }}>
                {client.notes || '—'}
              </div>
            </div>

            {/* Created / Last Updated row */}
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>{t('common.created')}</label>
                <div style={valueStyle}>{formatDate(client.createdAt)}</div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>{t('common.last_updated')}</label>
                <div style={valueStyle}>{formatDate(client.updatedAt)}</div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'projects' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {projectsLoading ? (
              <div style={{ ...valueStyle, color: 'var(--text-dim)', textAlign: 'center', padding: '24px 10px' }}>
                {t('projects.loading')}
              </div>
            ) : projects.length === 0 ? (
              <div style={{ ...valueStyle, color: 'var(--text-dim)', textAlign: 'center', padding: '24px 10px' }}>
                {t('clients.no_projects')}
              </div>
            ) : projects.map((p) => (
              <div key={p.id} style={{
                ...valueStyle, display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: 10, cursor: 'pointer',
              }}
                onClick={() => navigate(`/projects/${p.id}`, { state: { project: p } })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <ProjectStatusBadge status={p.status} />
                  <span style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'var(--font-m)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.title}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                  {p.budget > 0 && (
                    <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-m)' }}>
                      {formatCurrency(p.budget)}
                    </span>
                  )}
                  {p.deadline && (
                    <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-m)' }}>
                      {formatDate(p.deadline)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{
          display: 'flex', gap: 8, justifyContent: 'flex-end',
          marginTop: 8, paddingTop: 14, borderTop: '1px solid var(--border)',
        }}>
          <button style={secondaryBtn} onClick={() => navigate('/clients')}>
            {t('common.back_to_list')}
          </button>
          <button style={primaryBtn} onClick={() => navigate(`/clients/${client.id}/edit`)}>
            {t('common.edit')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)',
  letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4, display: 'block',
};
const valueStyle: React.CSSProperties = {
  padding: '8px 10px', background: 'var(--bg2)', border: '1px solid var(--border)',
  borderRadius: 6, color: 'var(--text)', fontFamily: 'var(--font-m)', fontSize: 11,
};
const primaryBtn: React.CSSProperties = {
  padding: '8px 18px', borderRadius: 6, border: 'none', background: 'var(--accent)',
  color: 'var(--bg)', fontFamily: 'var(--font-m)', fontSize: 11, fontWeight: 600,
  cursor: 'pointer', transition: 'opacity .15s',
};
const secondaryBtn: React.CSSProperties = {
  padding: '8px 14px', borderRadius: 6, border: '1px solid var(--border)',
  background: 'transparent', color: 'var(--text-mid)', fontFamily: 'var(--font-m)',
  fontSize: 11, cursor: 'pointer',
};
