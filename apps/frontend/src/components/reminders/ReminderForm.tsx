// Reminder form component
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reminderSchema, ReminderFormData } from '../../utils/validation';
import { Reminder, ReminderType, ReminderPriority } from '../../types/reminder.types';
import { formatDateTimeInput } from '../../utils/formatters';
import { useClients } from '../../hooks/useClients';
import { useInvoices } from '../../hooks/useInvoices';
import { useProposals } from '../../hooks/useProposals';

interface ReminderFormProps {
  reminder?: Reminder;
  onSubmit: (data: ReminderFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const ReminderForm = ({ reminder, onSubmit, onCancel, isLoading = false }: ReminderFormProps) => {
  const { clients } = useClients();
  const { invoices } = useInvoices();
  const { proposals } = useProposals();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: reminder
      ? {
          title: reminder.title,
          description: reminder.description || '',
          reminderType: reminder.reminderType,
          priority: reminder.priority,
          dueDate: formatDateTimeInput(reminder.dueDate),
          clientId: reminder.clientId || '',
          invoiceId: reminder.invoiceId || '',
          proposalId: reminder.proposalId || '',
        }
      : undefined,
    mode: 'onChange',
  });

  const handleFormSubmit = async (data: ReminderFormData) => {
    await onSubmit(data);
  };

  const fieldBoxStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.02)',
    border: '2px solid var(--border-h)',
    borderRadius: 10,
    padding: '12px 16px',
    color: 'var(--text)',
    fontSize: 13,
    fontFamily: 'var(--font-m)',
    outline: 'none',
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          className="w-full rounded-md focus:outline-none"
          style={fieldBoxStyle}
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={4}
          className="w-full rounded-md focus:outline-none"
          style={fieldBoxStyle}
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="reminderType" className="block text-sm font-medium mb-1">
            Type <span className="text-red-500">*</span>
          </label>
          <select
            id="reminderType"
            {...register('reminderType')}
            className="w-full rounded-md focus:outline-none"
            style={fieldBoxStyle}
          >
            <option value={ReminderType.TASK}>Task</option>
            <option value={ReminderType.FOLLOW_UP}>Follow Up</option>
            <option value={ReminderType.PAYMENT}>Payment</option>
            <option value={ReminderType.DEADLINE}>Deadline</option>
            <option value={ReminderType.CUSTOM}>Custom</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium mb-1">
            Priority
          </label>
          <select
            id="priority"
            {...register('priority')}
            className="w-full rounded-md focus:outline-none"
            style={fieldBoxStyle}
          >
            <option value={ReminderPriority.LOW}>Low</option>
            <option value={ReminderPriority.MEDIUM}>Medium</option>
            <option value={ReminderPriority.HIGH}>High</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
          Due Date <span className="text-red-500">*</span>
        </label>
        <input
          id="dueDate"
          type="datetime-local"
          {...register('dueDate')}
          className="w-full rounded-md focus:outline-none"
          style={fieldBoxStyle}
        />
        {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>}
      </div>

      <div>
        <label htmlFor="clientId" className="block text-sm font-medium mb-1">
          Link to Client (Optional)
        </label>
        <select
          id="clientId"
          {...register('clientId')}
          className="w-full rounded-md focus:outline-none"
          style={fieldBoxStyle}
        >
          <option value="">None</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="invoiceId" className="block text-sm font-medium mb-1">
          Link to Invoice (Optional)
        </label>
        <select
          id="invoiceId"
          {...register('invoiceId')}
          className="w-full rounded-md focus:outline-none"
          style={fieldBoxStyle}
        >
          <option value="">None</option>
          {invoices.map((invoice) => (
            <option key={invoice.id} value={invoice.id}>
              Invoice - {invoice.project?.title || 'No project'} - ${Number(invoice.amount).toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="proposalId" className="block text-sm font-medium mb-1">
          Link to Proposal (Optional)
        </label>
        <select
          id="proposalId"
          {...register('proposalId')}
          className="w-full rounded-md focus:outline-none"
          style={fieldBoxStyle}
        >
          <option value="">None</option>
          {proposals.map((proposal) => (
            <option key={proposal.id} value={proposal.id}>
              {proposal.title} - ${Number(proposal.amount).toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      <div
        className="flex gap-2 justify-end"
        style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 16,
          marginTop: 0,
        }}
      >
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting || isLoading}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border)',
              color: 'var(--text-mid)',
              cursor: 'pointer',
              fontFamily: 'var(--font-m)',
              fontSize: 10,
              padding: '6px 12px',
              borderRadius: 999,
              letterSpacing: '.06em',
              transition: 'all .15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text)';
              e.currentTarget.style.borderColor = 'var(--border-h)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-dim)';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
            }}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid || isSubmitting || isLoading}
          style={{
            background: 'var(--accent-bg)',
            border: '1px solid var(--accent-hover)',
            color: 'var(--accent)',
            cursor: !isValid || isSubmitting || isLoading ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-m)',
            fontSize: 10,
            padding: '6px 12px',
            borderRadius: 999,
            letterSpacing: '.06em',
            transition: 'all .15s',
            opacity: !isValid || isSubmitting || isLoading ? 0.65 : 1,
          }}
          onMouseEnter={(e) => {
            if (isSubmitting || isLoading || !isValid) return;
            e.currentTarget.style.background = 'var(--accent)';
            e.currentTarget.style.color = '#050505';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--accent-bg)';
            e.currentTarget.style.color = 'var(--accent)';
          }}
        >
          {isSubmitting || isLoading ? 'Saving...' : reminder ? 'Update Reminder' : 'Create Reminder'}
        </button>
      </div>
    </form>
  );
};

