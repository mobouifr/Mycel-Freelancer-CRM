// Project form component
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { projectSchema, type ProjectFormData } from '../../utils/validation';
import { type Project, ProjectPriority, ProjectStatus } from '../../types/project.types';
import { formatDateInput } from '../../utils/formatters';
import { useClients } from '../../hooks/useClients';
import { useTheme } from '../../hooks/useTheme';

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const ProjectForm = ({ project, onSubmit, onCancel, isLoading = false }: ProjectFormProps) => {
  const { t } = useTranslation();
  const { mode } = useTheme();
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

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Title */}
      <div>
        <label style={labelStyle}>
          {t('forms.project.title')} <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <input
          type="text"
          {...register('title')}
          placeholder={t('forms.project.title')}
          autoFocus
          style={inputStyle}
        />
        {errors.title && <p style={errorStyle}>{errors.title.message}</p>}
      </div>

      {/* Client */}
      <div>
        <label style={labelStyle}>
          {t('forms.project.client')} <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <select
          {...register('clientId')}
          style={selectStyle}
        >
          <option value="">{t('forms.project.select_client')}</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}{client.company ? ` (${client.company})` : ''}
            </option>
          ))}
        </select>
        {errors.clientId && <p style={errorStyle}>{errors.clientId.message}</p>}
      </div>

      {/* Status / Priority row */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>{t('forms.project.status')}</label>
          <select {...register('status')} style={selectStyle}>
            <option value={ProjectStatus.ACTIVE}>{t('forms.project.active')}</option>
            <option value={ProjectStatus.COMPLETED}>{t('forms.project.completed')}</option>
            <option value={ProjectStatus.PAUSED}>{t('forms.project.paused')}</option>
            <option value={ProjectStatus.CANCELLED}>{t('forms.project.cancelled')}</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>{t('forms.project.priority')}</label>
          <select {...register('priority')} style={selectStyle}>
            <option value={ProjectPriority.HIGH}>{t('forms.project.high')}</option>
            <option value={ProjectPriority.MEDIUM}>{t('forms.project.medium')}</option>
            <option value={ProjectPriority.LOW}>{t('forms.project.low')}</option>
          </select>
        </div>
      </div>

      {/* Budget / Deadline row */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>
            {t('forms.project.budget')} <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('budget', { valueAsNumber: true })}
            placeholder="0.00"
            style={inputStyle}
          />
          {errors.budget && <p style={errorStyle}>{errors.budget.message}</p>}
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>{t('forms.project.deadline')}</label>
          <input
            type="date"
            {...register('deadline')}
            style={{ ...inputStyle, colorScheme: mode }}
          />
          {errors.deadline && <p style={errorStyle}>{errors.deadline.message}</p>}
        </div>
      </div>

      {/* Description */}
      <div>
        <label style={labelStyle}>{t('forms.project.description')}</label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder={t('event_modal.add_details')}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }}
        />
        {errors.description && <p style={errorStyle}>{errors.description.message}</p>}
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex', gap: 8, justifyContent: 'flex-end',
        marginTop: 8, paddingTop: 14, borderTop: '1px solid var(--border)',
      }}>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={isSubmitting || isLoading} style={secondaryBtn}>
            {t('common.cancel')}
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid || isSubmitting || isLoading}
          style={{ ...primaryBtn, opacity: !isValid || isSubmitting || isLoading ? 0.55 : 1, cursor: !isValid || isSubmitting || isLoading ? 'not-allowed' : 'pointer' }}
        >
          {isSubmitting || isLoading ? t('common.saving') : project ? t('forms.project.update') : t('forms.project.create')}
        </button>
      </div>
    </form>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  color: 'var(--text)',
  fontFamily: 'var(--font-m)',
  fontSize: 11,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color .15s',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-m)',
  fontSize: 9,
  color: 'var(--text-dim)',
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  marginBottom: 4,
  display: 'block',
};

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-m)',
  fontSize: 10,
  color: 'var(--danger)',
  marginTop: 4,
};

const primaryBtn: React.CSSProperties = {
  padding: '8px 18px',
  borderRadius: 6,
  border: 'none',
  background: 'var(--accent)',
  color: 'var(--bg)',
  fontFamily: 'var(--font-m)',
  fontSize: 11,
  fontWeight: 600,
  transition: 'opacity .15s',
};

const secondaryBtn: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: 6,
  border: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--text-mid)',
  fontFamily: 'var(--font-m)',
  fontSize: 11,
  cursor: 'pointer',
};
