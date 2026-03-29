// Invoice status badge component
import { InvoiceStatus } from '../../types/invoice.types';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

export const InvoiceStatusBadge = ({ status }: InvoiceStatusBadgeProps) => {
  const statusColors = {
    [InvoiceStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [InvoiceStatus.PAID]: 'bg-green-100 text-green-800',
    [InvoiceStatus.OVERDUE]: 'bg-red-100 text-red-800',
    [InvoiceStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
  };

  const statusLabels = {
    [InvoiceStatus.PENDING]: 'Pending',
    [InvoiceStatus.PAID]: 'Paid',
    [InvoiceStatus.OVERDUE]: 'Overdue',
    [InvoiceStatus.CANCELLED]: 'Cancelled',
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`}>
      {statusLabels[status]}
    </span>
  );
};

