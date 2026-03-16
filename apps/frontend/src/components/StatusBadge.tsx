/* ─────────────────────────────────────────────
   STATUS BADGE — Colored dot + text status indicator
   Matches dashboard design pattern
───────────────────────────────────────────── */

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
}

const statusConfig: Record<string, { color: string; label: string }> = {
  // Invoice statuses
  paid: { color: 'var(--success)', label: 'Paid' },
  unpaid: { color: 'var(--warning)', label: 'Unpaid' },
  overdue: { color: 'var(--danger)', label: 'Overdue' },
  draft: { color: 'var(--info)', label: 'Draft' },
  sent: { color: 'var(--accent)', label: 'Sent' },
  viewed: { color: 'var(--info)', label: 'Viewed' },

  // Proposal statuses
  accepted: { color: 'var(--success)', label: 'Accepted' },
  rejected: { color: 'var(--danger)', label: 'Rejected' },

  // Project statuses
  planned: { color: 'var(--info)', label: 'Planned' },
  in_progress: { color: 'var(--accent)', label: 'In Progress' },
  'in-progress': { color: 'var(--accent)', label: 'In Progress' },

  // Client statuses
  active: { color: 'var(--success)', label: 'Active' },
  inactive: { color: 'var(--text-dim)', label: 'Inactive' },
  archived: { color: 'var(--text-dim)', label: 'Archived' },

  // Reminder statuses
  pending: { color: 'var(--warning)', label: 'Pending' },
  dismissed: { color: 'var(--text-dim)', label: 'Dismissed' },

  // Common statuses
  completed: { color: 'var(--success)', label: 'Completed' },
  cancelled: { color: 'var(--text-dim)', label: 'Cancelled' },
};

export default function StatusBadge({ status, variant }: StatusBadgeProps) {
  const statusKey = status.toLowerCase().replace(/\s+/g, '_');
  const normalizedKey = statusKey === 'in-progress' ? 'in_progress' : statusKey;

  const config = statusConfig[normalizedKey] || statusConfig[statusKey] || {
    color:
      variant === 'success'
        ? 'var(--success)'
        : variant === 'danger'
          ? 'var(--danger)'
          : variant === 'warning'
            ? 'var(--warning)'
            : variant === 'info'
              ? 'var(--info)'
              : 'var(--text-dim)',
    label: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' '),
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: config.color,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: 'var(--font-m)',
          fontSize: 11,
          color: 'var(--text-mid)',
          letterSpacing: '.02em',
        }}
      >
        {config.label}
      </span>
    </div>
  );
}



