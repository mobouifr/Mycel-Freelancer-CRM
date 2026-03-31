// Invoice status badge component
import { InvoiceStatus } from '../../types/invoice.types';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

export const InvoiceStatusBadge = ({ status }: InvoiceStatusBadgeProps) => {
  const statusStyles: Record<InvoiceStatus, React.CSSProperties> = {
    [InvoiceStatus.PENDING]: {
      backgroundColor: 'var(--warning-bg)',
      color: 'var(--warning)',
      border: '1px solid var(--warning)',
    },
    [InvoiceStatus.PAID]: {
      backgroundColor: 'var(--success-bg)',
      color: 'var(--success)',
      border: '1px solid var(--success)',
    },
    [InvoiceStatus.OVERDUE]: {
      backgroundColor: 'var(--danger-bg)',
      color: 'var(--danger)',
      border: '1px solid var(--danger)',
    },
    [InvoiceStatus.CANCELLED]: {
      backgroundColor: 'var(--surface)',
      color: 'var(--text-mid)',
      border: '1px solid var(--border)',
    },
  };

  const statusLabels = {
    [InvoiceStatus.PENDING]: 'Pending',
    [InvoiceStatus.PAID]: 'Paid',
    [InvoiceStatus.OVERDUE]: 'Overdue',
    [InvoiceStatus.CANCELLED]: 'Cancelled',
  };

  return (
    <span
      style={{
        ...statusStyles[status],
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        fontFamily: 'var(--font-m)',
      }}
    >
      {statusLabels[status]}
    </span>
  );
};

