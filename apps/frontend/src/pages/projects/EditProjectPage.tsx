// Edit project page
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectsService } from '../../services/data.service';
import { ProjectForm } from '../../components/projects/ProjectForm';
import { ProjectFormData } from '../../utils/validation';
import { Project } from '../../types/project.types';
import { ApiError } from '../../types/common.types';

export const EditProjectPage = () => {
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
        setError(apiError.message || 'Failed to load project');
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
      await projectsService.update(id, data as any);
      navigate('/projects');
    } catch (err: any) {
      alert(err.message || 'Failed to update project');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Project not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Project</h1>
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
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

