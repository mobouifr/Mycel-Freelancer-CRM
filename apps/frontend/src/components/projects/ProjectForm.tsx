// Project form component
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, ProjectFormData } from '../../utils/validation';
import { Project, ProjectStatus } from '../../types/project.types';
import { formatDateInput } from '../../utils/formatters';
import { useClients } from '../../hooks/useClients';

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const ProjectForm = ({ project, onSubmit, onCancel, isLoading = false }: ProjectFormProps) => {
  const { clients } = useClients();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          title: project.title,
          description: project.description || '',
          status: project.status,
          budget: Number(project.budget),
          deadline: project.deadline ? formatDateInput(project.deadline) : '',
          clientId: project.clientId,
        }
      : undefined,
    mode: 'onChange',
  });

  const handleFormSubmit = async (data: ProjectFormData) => {
    await onSubmit(data);
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="clientId" className="block text-sm font-medium mb-1">
          Client <span className="text-red-500">*</span>
        </label>
        <select
          id="clientId"
          {...register('clientId')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name} {client.company ? `(${client.company})` : ''}
            </option>
          ))}
        </select>
        {errors.clientId && <p className="text-red-500 text-sm mt-1">{errors.clientId.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
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
            <option value={ProjectStatus.ACTIVE}>Active</option>
            <option value={ProjectStatus.COMPLETED}>Completed</option>
            <option value={ProjectStatus.PAUSED}>Paused</option>
            <option value={ProjectStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>

        <div>
          <label htmlFor="budget" className="block text-sm font-medium mb-1">
            Budget <span className="text-red-500">*</span>
          </label>
          <input
            id="budget"
            type="number"
            step="0.01"
            min="0"
            {...register('budget', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="deadline" className="block text-sm font-medium mb-1">
          Deadline
        </label>
        <input
          id="deadline"
          type="date"
          {...register('deadline')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline.message}</p>}
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
          {isSubmitting || isLoading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
        </button>
      </div>
    </form>
  );
};

