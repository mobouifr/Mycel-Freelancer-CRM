// Project detail page
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { projectsService } from '../../services/data.service';
import { type Project, ProjectStatus } from '../../types/project.types';
import { type ApiError } from '../../types/common.types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { ProjectStatusBadge } from '../../components/projects/ProjectStatusBadge';
import { useStore } from '../../hooks/useStore';
import Modal from '../../components/Modal';

export const ProjectDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  // Use data passed via router state (from list page) — instant, no API call needed.
  // Fall back to fetching only when accessing the URL directly.
  const initialProject = (location.state as any)?.project as Project | undefined;
  const [project, setProject] = useState<Project | null>(initialProject ?? null);
  const [loading, setLoading] = useState(!initialProject);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProject) return; // Already have data — skip fetch
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await projectsService.getById(id);
        setProject(data);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || t('projects.load_failed'));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!id || !project) return;
    try {
      await projectsService.updateStatus(id, newStatus);
      setProject({ ...project, status: newStatus });
    } catch (err: any) {
      alert(err.message || t('projects.update_failed'));
    }
  };

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
          {t('projects.detail_loading')}
        </span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <Modal isOpen onClose={() => navigate('/projects')} title="—" width={560}>
        <div style={{
          background: 'rgba(230,90,90,0.08)', border: '1px solid rgba(230,90,90,0.35)',
          color: 'var(--danger)', padding: '12px 16px', borderRadius: 6,
          fontFamily: 'var(--font-m)', fontSize: 11,
        }}>
          {error || t('projects.not_found')}
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen onClose={() => navigate('/projects')} title={project.title} width={560}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Status badge */}
        <div>
          <ProjectStatusBadge status={project.status} />
        </div>

        {/* Client */}
        <div>
          <label style={labelStyle}>{t('event_modal.client')}</label>
          <div style={valueStyle}>{project.client?.name || '—'}</div>
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>{t('common.description')}</label>
          <div style={{ ...valueStyle, whiteSpace: 'pre-wrap', minHeight: 36 }}>
            {project.description || '—'}
          </div>
        </div>

        {/* Status / Priority row */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>{t('forms.project.status')}</label>
            <select
              value={project.status}
              onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
              style={selectStyle}
            >
              {Object.values(ProjectStatus).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>{t('forms.project.priority')}</label>
            <div style={valueStyle}>{project.priority || '—'}</div>
          </div>
        </div>

        {/* Budget / Deadline row */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>{t('common.budget')}</label>
            <div style={valueStyle}>{formatCurrency(Number(project.budget))}</div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>{t('common.deadline')}</label>
            <div style={valueStyle}>{formatDate(project.deadline)}</div>
          </div>
        </div>

        {/* Created / Last Updated row */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>{t('common.created')}</label>
            <div style={valueStyle}>{formatDate(project.createdAt)}</div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>{t('common.last_updated')}</label>
            <div style={valueStyle}>{formatDate(project.updatedAt)}</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex', gap: 8, justifyContent: 'flex-end',
          marginTop: 8, paddingTop: 14, borderTop: '1px solid var(--border)',
        }}>
          <button style={secondaryBtn} onClick={() => navigate('/projects')}>
            {t('common.back_to_list')}
          </button>
          <button style={primaryBtn} onClick={() => navigate(`/projects/${project.id}/edit`)}>
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
  wordBreak: 'break-word', overflowWrap: 'break-word', minWidth: 0,
};
const selectStyle: React.CSSProperties = {
  ...valueStyle, width: '100%', cursor: 'pointer', outline: 'none', boxSizing: 'border-box',
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
