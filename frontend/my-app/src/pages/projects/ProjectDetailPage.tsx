// Project detail page
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectsService } from '../../services/data.service';
import { type Project, ProjectStatus } from '../../types/project.types';
import { type ApiError } from '../../types/common.types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { ProjectStatusBadge } from '../../components/projects/ProjectStatusBadge';

export const ProjectDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
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
        setError(apiError.message || 'Failed to load project');
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
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
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
            className="inline-flex items-center rounded-full border border-emerald-400/70 bg-emerald-500/10 px-4 py-2 text-xs font-medium uppercase tracking-wide text-emerald-300 hover:bg-emerald-400 hover:text-slate-950 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center rounded-full border border-slate-300/70 bg-slate-800 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-100 hover:bg-slate-700 hover:border-slate-100 transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Client</h3>
            <p className="mt-1">{project.client?.name || '—'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1 whitespace-pre-wrap">{project.description || '—'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Budget</h3>
              <p className="mt-1">{formatCurrency(Number(project.budget))}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Deadline</h3>
              <p className="mt-1">{formatDate(project.deadline)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created</h3>
              <p className="mt-1">{formatDate(project.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
              <p className="mt-1">{formatDate(project.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mt-4">
        <h2 className="text-lg font-semibold mb-4">Actions</h2>
        <div className="flex gap-2 flex-wrap">
          <select
            value={project.status}
            onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

