// Proposal form component
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { proposalSchema, type ProposalFormData } from '../../utils/validation';
import { type Proposal, ProposalStatus } from '../../types/proposal.types';
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
  const { t } = useTranslation();
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
        <label htmlFor="projectId" className="block text-sm font-medium mb-1">
          {t('forms.proposal.project')} <span className="text-red-500">*</span>
        </label>
        <select
          id="projectId"
          {...register('projectId')}
          className="w-full rounded-md focus:outline-none"
          style={fieldBoxStyle}
        >
          <option value="">{t('forms.proposal.select_project')}</option>
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
          {t('forms.proposal.title')} <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            id="title"
            type="text"
            {...register('title')}
            className="flex-1 rounded-md focus:outline-none"
            style={fieldBoxStyle}
          />
          {onAISuggest && (
            <button
              type="button"
              onClick={onAISuggest}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              {t('forms.proposal.ai_suggest')}
            </button>
          )}
        </div>
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium mb-1">
          {t('forms.proposal.amount')} <span className="text-red-500">*</span>
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          {...register('amount', { valueAsNumber: true })}
          className="w-full rounded-md focus:outline-none"
          style={fieldBoxStyle}
        />
        {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">
            {t('forms.proposal.status')}
          </label>
          <select
            id="status"
            {...register('status')}
            className="w-full rounded-md focus:outline-none"
            style={fieldBoxStyle}
          >
            <option value={ProposalStatus.DRAFT}>{t('forms.proposal.draft')}</option>
            <option value={ProposalStatus.SENT}>{t('forms.proposal.sent')}</option>
            <option value={ProposalStatus.ACCEPTED}>{t('forms.proposal.accepted')}</option>
            <option value={ProposalStatus.REJECTED}>{t('forms.proposal.rejected')}</option>
          </select>
        </div>

        <div>
          <label htmlFor="validUntil" className="block text-sm font-medium mb-1">
            {t('forms.proposal.valid_until')}
          </label>
          <input
            id="validUntil"
            type="date"
            {...register('validUntil')}
            className="w-full rounded-md focus:outline-none"
            style={fieldBoxStyle}
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-1">
          {t('forms.proposal.notes')}
        </label>
        <textarea
          id="notes"
          {...register('notes')}
          rows={4}
          className="w-full rounded-md focus:outline-none"
          style={fieldBoxStyle}
        />
        {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>}
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
            {t('common.cancel')}
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
          {isSubmitting || isLoading ? t('common.saving') : proposal ? t('forms.proposal.update') : t('forms.proposal.create')}
        </button>
      </div>
    </form>
  );
};

