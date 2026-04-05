// Project status badge component — typography aligned with Clients list / priority pills
import type { CSSProperties } from 'react';
import { ProjectStatus } from '../../types/project.types';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

const baseBadge: CSSProperties = {
  display: 'inline-block',
  fontFamily: 'var(--font-m)',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '.06em',
  lineHeight: 1.2,
  textTransform: 'uppercase',
  borderRadius: 999,
  padding: '4px 10px',
};

export const ProjectStatusBadge = ({ status }: ProjectStatusBadgeProps) => {
  const statusStyles: Record<ProjectStatus, CSSProperties> = {
    [ProjectStatus.ACTIVE]: {
      ...baseBadge,
      backgroundColor: 'var(--success-bg)',
      color: 'var(--success)',
      border: '1px solid var(--success)',
    },
    [ProjectStatus.COMPLETED]: {
      ...baseBadge,
      backgroundColor: 'var(--info-bg)',
      color: 'var(--info)',
      border: '1px solid var(--info)',
    },
    [ProjectStatus.PAUSED]: {
      ...baseBadge,
      backgroundColor: 'var(--warning-bg)',
      color: 'var(--warning)',
      border: '1px solid var(--warning)',
    },
    [ProjectStatus.CANCELLED]: {
      ...baseBadge,
      backgroundColor: 'var(--danger-bg)',
      color: 'var(--danger)',
      border: '1px solid var(--danger)',
    },
  };

  const statusLabels = {
    [ProjectStatus.ACTIVE]: 'ACTIVE',
    [ProjectStatus.COMPLETED]: 'COMPLETED',
    [ProjectStatus.PAUSED]: 'PENDING',
    [ProjectStatus.CANCELLED]: 'DRAFT',
  };

  return <span style={statusStyles[status]}>{statusLabels[status]}</span>;
};
