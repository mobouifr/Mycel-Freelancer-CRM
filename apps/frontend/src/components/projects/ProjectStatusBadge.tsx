// Project status badge component
import { ProjectStatus } from '../../types/project.types';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

export const ProjectStatusBadge = ({ status }: ProjectStatusBadgeProps) => {
  const statusStyles: Record<ProjectStatus, React.CSSProperties> = {
    [ProjectStatus.ACTIVE]: {
      backgroundColor: '#d1fae5', // light green
      color: '#065f46',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      fontFamily: 'var(--font-m)',
    },
    [ProjectStatus.COMPLETED]: {
      backgroundColor: '#dbeafe', // light blue
      color: '#1e40af',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      fontFamily: 'var(--font-m)',
    },
    [ProjectStatus.PAUSED]: {
      backgroundColor: '#fef3c7', // yellow
      color: '#92400e',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      fontFamily: 'var(--font-m)',
    },
    [ProjectStatus.CANCELLED]: {
      backgroundColor: '#ffffff', // white
      color: '#000000',
      border: '1px solid #000000',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      fontFamily: 'var(--font-m)',
    },
  };

  const statusLabels = {
    [ProjectStatus.ACTIVE]: 'ACTIVE',
    [ProjectStatus.COMPLETED]: 'COMPLETED',
    [ProjectStatus.PAUSED]: 'PENDING',
    [ProjectStatus.CANCELLED]: 'DRAFT',
  };

  return (
    <span style={statusStyles[status]}>
      {statusLabels[status]}
    </span>
  );
};

