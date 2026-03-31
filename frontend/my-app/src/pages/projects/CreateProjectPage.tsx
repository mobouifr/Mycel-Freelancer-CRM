// Create project page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { ProjectForm } from '../../components/projects/ProjectForm';
import { type ProjectFormData } from '../../utils/validation';

export const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { createProject } = useProjects();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    try {
      await createProject(data);
      navigate('/projects');
    } catch (err: any) {
      alert(err.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Create New Project</h1>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, maxWidth: 768 }}>
        <ProjectForm onSubmit={handleSubmit} onCancel={() => navigate('/projects')} isLoading={isLoading} />
      </div>
    </div>
  );
};

