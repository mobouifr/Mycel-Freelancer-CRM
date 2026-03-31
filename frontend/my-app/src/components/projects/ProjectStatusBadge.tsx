// Project status badge component
import { ProjectStatus } from '../../types/project.types';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

export const ProjectStatusBadge = ({ status }: ProjectStatusBadgeProps) => {
  const statusStyles: Record<ProjectStatus, React.CSSProperties> = {
    [ProjectStatus.ACTIVE]: {
      backgroundColor: 'var(--success-bg)',
      color: 'var(--success)',
      border: '1px solid var(--success)',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      fontFamily: 'var(--font-m)',
    },
    [ProjectStatus.COMPLETED]: {
      backgroundColor: 'var(--info-bg)',
      color: 'var(--info)',
      border: '1px solid var(--info)',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      fontFamily: 'var(--font-m)',
    },
    [ProjectStatus.PAUSED]: {
      backgroundColor: 'var(--warning-bg)',
      color: 'var(--warning)',
      border: '1px solid var(--warning)',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      fontFamily: 'var(--font-m)',
    },
    [ProjectStatus.CANCELLED]: {
      backgroundColor: 'var(--danger-bg)',
      color: 'var(--danger)',
      border: '1px solid var(--danger)',
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

