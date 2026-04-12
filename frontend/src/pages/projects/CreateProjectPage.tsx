// Create project page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProjects } from '../../hooks/useProjects';
import { ProjectForm } from '../../components/projects/ProjectForm';
import { type ProjectFormData } from '../../utils/validation';
import Modal from '../../components/Modal';

export const CreateProjectPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createProject } = useProjects();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    try {
      await createProject(data);
      navigate('/projects');
    } catch (err: any) {
      alert(err.message || t('projects.create_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={() => navigate('/projects')} title={t('projects.create_title')} width={560}>
      <ProjectForm onSubmit={handleSubmit} onCancel={() => navigate('/projects')} isLoading={isLoading} />
    </Modal>
  );
};
