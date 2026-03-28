// Project form component
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, ProjectFormData } from '../../utils/validation';
import { Project, ProjectPriority, ProjectStatus } from '../../types/project.types';
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
          priority: project.priority || ProjectPriority.MEDIUM,
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
        <label htmlFor="clientId" className="block text-sm font-medium mb-1">
          Client <span className="text-red-500">*</span>
        </label>
        <select
          id="clientId"
          {...register('clientId')}
          className="w-full rounded-md focus:outline-none"
          style={fieldBoxStyle}
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
          className="w-full rounded-md focus:outline-none"
          style={fieldBoxStyle}
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
            className="w-full rounded-md focus:outline-none"
            style={fieldBoxStyle}
          >
            <option value={ProjectStatus.ACTIVE}>Active</option>
            <option value={ProjectStatus.COMPLETED}>Completed</option>
            <option value={ProjectStatus.PAUSED}>Paused</option>
            <option value={ProjectStatus.CANCELLED}>Cancelled</option>
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
            <option value={ProjectPriority.HIGH}>HIGH</option>
            <option value={ProjectPriority.MEDIUM}>MEDIUM</option>
            <option value={ProjectPriority.LOW}>LOW</option>
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
            className="w-full rounded-md focus:outline-none"
            style={fieldBoxStyle}
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
          className="w-full rounded-md focus:outline-none"
          style={fieldBoxStyle}
        />
        {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline.message}</p>}
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
          {isSubmitting || isLoading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
        </button>
      </div>
    </form>
  );
};

