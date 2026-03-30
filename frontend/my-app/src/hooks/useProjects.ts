// Custom hook for projects data management
import { useState, useEffect } from 'react';
import { projectsService } from '../services/data.service';
import { type Project } from '../types/project.types';
import { type ApiError } from '../types/common.types';
import { useStore } from './useStore';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useStore();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectsService.getAll();
      setProjects(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = async (data: any) => {
    try {
      const newProject = await projectsService.create(data);
      setProjects((prev) => [newProject, ...prev]);
      addNotification({
        type: 'success',
        title: 'Project created',
        message: `"${newProject.title}" was created successfully.`,
      });
      return newProject;
    } catch (err) {
      const apiError = err as ApiError;
      throw apiError;
    }
  };

  const updateProject = async (id: string, data: any) => {
    try {
      const updatedProject = await projectsService.update(id, data);
      setProjects((prev) => prev.map((p) => (p.id === id ? updatedProject : p)));
      addNotification({
        type: 'info',
        title: 'Project updated',
        message: `"${updatedProject.title}" was updated.`,
      });
      return updatedProject;
    } catch (err) {
      const apiError = err as ApiError;
      throw apiError;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const deletedProject = projects.find((project) => project.id === id);
      await projectsService.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      addNotification({
        type: 'warning',
        title: 'Project deleted',
        message: deletedProject ? `"${deletedProject.title}" was removed.` : 'A project was removed.',
      });
    } catch (err) {
      const apiError = err as ApiError;
      throw apiError;
    }
  };

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
};

