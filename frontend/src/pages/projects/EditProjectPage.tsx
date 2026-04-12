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
import Modal from '../../components/Modal';

export const EditProjectPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
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
      navigate('/projects');
    } catch (err: any) {
      alert(err.message || t('projects.update_failed'));
    } finally {
      setIsSaving(false);
    }
  };

  const body = loading ? (
    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-mid)', fontFamily: 'var(--font-m)', fontSize: 12 }}>
      {t('projects.detail_loading')}
    </div>
  ) : error || !project ? (
    <div style={{
      background: 'rgba(230,90,90,0.08)',
      border: '1px solid rgba(230,90,90,0.35)',
      color: 'var(--danger)',
      padding: '12px 16px',
      borderRadius: 6,
      fontFamily: 'var(--font-m)',
      fontSize: 11,
    }}>
      {error || t('projects.not_found')}
    </div>
  ) : (
    <ProjectForm
      project={project}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/projects')}
      isLoading={isSaving}
    />
  );

  return (
    <Modal isOpen onClose={() => navigate('/projects')} title={t('projects.edit_title')} width={560}>
      {body}
    </Modal>
  );
};
