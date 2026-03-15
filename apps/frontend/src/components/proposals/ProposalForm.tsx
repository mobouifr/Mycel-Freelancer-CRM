// Proposal form component
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { proposalSchema, ProposalFormData } from '../../utils/validation';
import { Proposal, ProposalStatus } from '../../types/proposal.types';
import { formatDateInput } from '../../utils/formatters';
import { useProjects } from '../../hooks/useProjects';

interface ProposalFormProps {
  proposal?: Proposal;
  onSubmit: (data: ProposalFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  onAISuggest?: () => void;
}

export const ProposalForm = ({
  proposal,
  onSubmit,
  onCancel,
  isLoading = false,
  onAISuggest,
}: ProposalFormProps) => {
  const { projects } = useProjects();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: proposal
      ? {
          title: proposal.title,
          amount: Number(proposal.amount),
          status: proposal.status,
          notes: proposal.notes || '',
          validUntil: proposal.validUntil ? formatDateInput(proposal.validUntil) : '',
          projectId: proposal.projectId,
        }
      : undefined,
    mode: 'onChange',
  });

  const handleFormSubmit = async (data: ProposalFormData) => {
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

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            id="title"
            type="text"
            {...register('title')}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {onAISuggest && (
            <button
              type="button"
              onClick={onAISuggest}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              AI Suggest
            </button>
          )}
        </div>
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>

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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">
            Status
          </label>
          <select
            id="status"
            {...register('status')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={ProposalStatus.DRAFT}>Draft</option>
            <option value={ProposalStatus.SENT}>Sent</option>
            <option value={ProposalStatus.ACCEPTED}>Accepted</option>
            <option value={ProposalStatus.REJECTED}>Rejected</option>
          </select>
        </div>

        <div>
          <label htmlFor="validUntil" className="block text-sm font-medium mb-1">
            Valid Until
          </label>
          <input
            id="validUntil"
            type="date"
            {...register('validUntil')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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
          {isSubmitting || isLoading ? 'Saving...' : proposal ? 'Update Proposal' : 'Create Proposal'}
        </button>
      </div>
    </form>
  );
};

