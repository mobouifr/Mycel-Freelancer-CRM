// Project status badge component
import { ProjectStatus } from '../../types/project.types';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

const STATUS_CONFIG: Record<ProjectStatus, { dot: string; label: string }> = {
  [ProjectStatus.ACTIVE]:    { dot: 'var(--success)', label: 'Active' },
  [ProjectStatus.COMPLETED]: { dot: 'var(--info)',    label: 'Completed' },
  [ProjectStatus.PAUSED]:    { dot: 'var(--warning)', label: 'Paused' },
  [ProjectStatus.CANCELLED]: { dot: 'var(--text-dim)', label: 'Cancelled' },
};

export const ProjectStatusBadge = ({ status }: ProjectStatusBadgeProps) => {
  const { dot, label } = STATUS_CONFIG[status] ?? STATUS_CONFIG[ProjectStatus.ACTIVE];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 8px 3px 6px',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        fontFamily: 'var(--font-m)',
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: '.04em',
        color: 'var(--text-mid)',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: dot,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
};
