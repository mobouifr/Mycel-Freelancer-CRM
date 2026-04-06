// Edit project page
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { projectsService } from '../../services/data.service';
import { ProjectForm } from '../../components/projects/ProjectForm';
import { type ProjectFormData } from '../../utils/validation';
import { type Project } from '../../types/project.types';
import { type ApiError } from '../../types/common.types';
import { useStore } from '../../hooks/useStore';

export const EditProjectPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addNotification } = useStore();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  const handleSubmit = async (data: ProjectFormData) => {
    if (!id) return;
    setIsSaving(true);
    try {
      const updatedProject = await projectsService.update(id, data as any);
      addNotification({
        type: 'info',
        title: t('projects.updated'),
        message: `"${updatedProject.title}" was updated.`,
      });
      navigate('/projects');
    } catch (err: any) {
      alert(err.message || t('projects.update_failed'));
    } finally {
      setIsSaving(false);
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
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>{t('projects.edit_title')}</h1>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, maxWidth: 768 }}>
        <ProjectForm
          project={project}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/projects')}
          isLoading={isSaving}
        />
      </div>
    </div>
  );
};

