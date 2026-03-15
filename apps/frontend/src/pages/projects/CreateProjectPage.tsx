// Create project page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { ProjectForm } from '../../components/projects/ProjectForm';
import { ProjectFormData } from '../../utils/validation';

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
      <h1 className="text-2xl font-bold mb-6">Create New Project</h1>
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <ProjectForm onSubmit={handleSubmit} onCancel={() => navigate('/projects')} isLoading={isLoading} />
      </div>
    </div>
  );
};

