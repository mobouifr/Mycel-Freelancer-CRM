// Project detail page
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { projectsService } from '../../services/data.service';
import { type Project, ProjectStatus } from '../../types/project.types';
import { type ApiError } from '../../types/common.types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { ProjectStatusBadge } from '../../components/projects/ProjectStatusBadge';
import { useStore } from '../../hooks/useStore';

export const ProjectDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addNotification } = useStore();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
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
    };
    fetchProject();
  }, [id]);

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!id) return;
    try {
      await projectsService.updateStatus(id, newStatus);
      if (project) {
        setProject({ ...project, status: newStatus });
        addNotification({
          type: 'info',
          title: t('projects.updated'),
          message: `"${project.title}" status changed to ${newStatus}.`,
        });
      }
    } catch (err: any) {
      alert(err.message || t('projects.update_failed'));
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">{t('projects.detail_loading')}</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <div
          style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            padding: '12px 16px',
            borderRadius: 8,
          }}
        >
          {error || t('projects.not_found')}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <div className="mt-2">
            <ProjectStatusBadge status={project.status} />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/projects/${project.id}/edit`)}
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
            onClick={() => navigate('/projects')}
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

      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 24 }}>
        <div className="space-y-4">
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)' }}>{t('event_modal.client')}</h3>
            <p style={{ marginTop: 4, color: 'var(--text)' }}>{project.client?.name || '—'}</p>
          </div>
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)' }}>{t('common.description')}</h3>
            <p style={{ marginTop: 4, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{project.description || '—'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)' }}>{t('common.budget')}</h3>
              <p style={{ marginTop: 4, color: 'var(--text)' }}>{formatCurrency(Number(project.budget))}</p>
            </div>
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)' }}>{t('common.deadline')}</h3>
              <p style={{ marginTop: 4, color: 'var(--text)' }}>{formatDate(project.deadline)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)' }}>{t('common.created')}</h3>
              <p style={{ marginTop: 4, color: 'var(--text)' }}>{formatDate(project.createdAt)}</p>
            </div>
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)' }}>{t('common.last_updated')}</h3>
              <p style={{ marginTop: 4, color: 'var(--text)' }}>{formatDate(project.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, marginTop: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text)' }}>{t('common.actions')}</h2>
        <div className="flex gap-2 flex-wrap">
          <select
            value={project.status}
            onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
            style={{
              padding: '10px 14px',
              border: '1px solid var(--border)',
              borderRadius: 8,
              background: 'var(--surface)',
              color: 'var(--text)',
              outline: 'none',
            }}
          >
            {Object.values(ProjectStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

