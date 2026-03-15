// Project status badge component
import { ProjectStatus } from '../../types/project.types';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

export const ProjectStatusBadge = ({ status }: ProjectStatusBadgeProps) => {
  const statusColors = {
    [ProjectStatus.ACTIVE]: 'bg-green-100 text-green-800',
    [ProjectStatus.COMPLETED]: 'bg-blue-100 text-blue-800',
    [ProjectStatus.PAUSED]: 'bg-yellow-100 text-yellow-800',
    [ProjectStatus.CANCELLED]: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    [ProjectStatus.ACTIVE]: 'Active',
    [ProjectStatus.COMPLETED]: 'Completed',
    [ProjectStatus.PAUSED]: 'Paused',
    [ProjectStatus.CANCELLED]: 'Cancelled',
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`}>
      {statusLabels[status]}
    </span>
  );
};

