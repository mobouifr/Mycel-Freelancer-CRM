// Invoice form component
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { invoiceSchema, InvoiceFormData } from '../../utils/validation';
import { Invoice, InvoiceStatus } from '../../types/invoice.types';
import { formatDateInput } from '../../utils/formatters';
import { useProjects } from '../../hooks/useProjects';

interface InvoiceFormProps {
  invoice?: Invoice;
  onSubmit: (data: InvoiceFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const InvoiceForm = ({ invoice, onSubmit, onCancel, isLoading = false }: InvoiceFormProps) => {
  const { projects } = useProjects();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: invoice
      ? {
          amount: Number(invoice.amount),
          status: invoice.status,
          dueDate: invoice.dueDate ? formatDateInput(invoice.dueDate) : '',
          notes: invoice.notes || '',
          projectId: invoice.projectId,
        }
      : undefined,
    mode: 'onChange',
  });

  const handleFormSubmit = async (data: InvoiceFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="projectId" className="block text-sm font-medium mb-1">
          Project <span className="text-red-500">*</span>
        </label>
        <select
          id="projectId"
          {...register('projectId')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title} - {project.client?.name || 'No client'}
            </option>
          ))}
        </select>
        {errors.projectId && <p className="text-red-500 text-sm mt-1">{errors.projectId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-1">
            Amount <span className="text-red-500">*</span>
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            {...register('amount', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">
            Status
          </label>
          <select
            id="status"
            {...register('status')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={InvoiceStatus.PENDING}>Pending</option>
            <option value={InvoiceStatus.PAID}>Paid</option>
            <option value={InvoiceStatus.OVERDUE}>Overdue</option>
            <option value={InvoiceStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
          Due Date
        </label>
        <input
          id="dueDate"
          type="date"
          {...register('dueDate')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          {...register('notes')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>}
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isSubmitting || isLoading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid || isSubmitting || isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || isLoading ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
        </button>
      </div>
    </form>
  );
};

