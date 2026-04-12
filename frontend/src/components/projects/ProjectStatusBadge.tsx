// Project status badge component
import { ProjectStatus } from '../../types/project.types';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

const STATUS_CONFIG: Record<ProjectStatus, { color: string; bg: string; border: string; label: string }> = {
  [ProjectStatus.ACTIVE]:    { color: 'var(--accent)',  bg: 'var(--accent-bg)',  border: 'var(--accent-hover)', label: 'Active' },
  [ProjectStatus.COMPLETED]: { color: 'var(--info)',    bg: 'var(--info-bg)',    border: 'var(--info)',          label: 'Completed' },
  [ProjectStatus.PAUSED]:    { color: 'var(--warning)', bg: 'var(--warning-bg)', border: 'var(--warning)',       label: 'Paused' },
  [ProjectStatus.CANCELLED]: { color: 'var(--danger)',  bg: 'var(--danger-bg)',  border: 'var(--danger)',        label: 'Cancelled' },
};

export const ProjectStatusBadge = ({ status }: ProjectStatusBadgeProps) => {
  const { color, bg, border, label } = STATUS_CONFIG[status] ?? STATUS_CONFIG[ProjectStatus.ACTIVE];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 8px 3px 6px',
        borderRadius: 999,
        background: bg,
        border: `1px solid ${border}`,
        fontFamily: 'var(--font-m)',
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: '.04em',
        color,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
          opacity: 0.8,
        }}
      />
      {label}
    </span>
  );
};
