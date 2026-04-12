// Project form component
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { projectSchema, type ProjectFormData } from '../../utils/validation';
import { type Project, ProjectPriority, ProjectStatus } from '../../types/project.types';
import { formatDateDisplayInput } from '../../utils/formatters';
import { useClients } from '../../hooks/useClients';
import { SegmentedControl } from '../SegmentedControl';

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const ProjectForm = ({ project, onSubmit, onCancel, isLoading = false }: ProjectFormProps) => {
  const { t } = useTranslation();
  const { clients } = useClients();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
          deadline: project.deadline ? formatDateDisplayInput(project.deadline) : '',
          clientId: project.clientId,
        }
      : {
          title: '',
          description: '',
          status: ProjectStatus.ACTIVE,
          priority: ProjectPriority.MEDIUM,
          budget: 0,
          deadline: '',
          clientId: '',
        },
    mode: 'onChange',
  });

  const statusValue = watch('status') ?? ProjectStatus.ACTIVE;
  const priorityValue = watch('priority') ?? ProjectPriority.MEDIUM;

  const deadlinePickerRef = useRef<HTMLInputElement>(null);

  const handleFormSubmit = async (data: ProjectFormData) => {
    // Convert DD/MM/YYYY → YYYY-MM-DD before sending to the backend
    if (data.deadline) {
      const parts = data.deadline.split('/');
      if (parts.length === 3) {
        data = { ...data, deadline: `${parts[2]}-${parts[1]}-${parts[0]}` };
      }
    }
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

      {/* Status */}
      <div>
        <label style={labelStyle}>{t('forms.project.status')}</label>
        <SegmentedControl
          options={[
            { value: ProjectStatus.ACTIVE,    label: t('forms.project.active'),    activeColor: 'var(--accent)',   activeBg: 'var(--accent-bg)' },
            { value: ProjectStatus.COMPLETED, label: t('forms.project.completed'), activeColor: 'var(--info)',     activeBg: 'var(--info-bg)' },
            { value: ProjectStatus.PAUSED,    label: t('forms.project.paused'),    activeColor: 'var(--warning)',  activeBg: 'var(--warning-bg)' },
            { value: ProjectStatus.CANCELLED, label: t('forms.project.cancelled'), activeColor: 'var(--danger)',   activeBg: 'var(--danger-bg)' },
          ]}
          value={statusValue}
          onChange={(v) => setValue('status', v as ProjectStatus, { shouldValidate: true })}
        />
      </div>

      {/* Priority */}
      <div>
        <label style={labelStyle}>{t('forms.project.priority')}</label>
        <SegmentedControl
          options={[
            { value: ProjectPriority.LOW,    label: t('forms.project.low'),    activeColor: 'var(--success)', activeBg: 'var(--success-bg)' },
            { value: ProjectPriority.MEDIUM, label: t('forms.project.medium'), activeColor: 'var(--warning)', activeBg: 'var(--warning-bg)' },
            { value: ProjectPriority.HIGH,   label: t('forms.project.high'),   activeColor: 'var(--danger)',  activeBg: 'var(--danger-bg)' },
          ]}
          value={priorityValue}
          onChange={(v) => setValue('priority', v as ProjectPriority, { shouldValidate: true })}
        />
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
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              {...register('deadline')}
              placeholder="DD/MM/YYYY"
              style={{ ...inputStyle, paddingRight: 30 }}
            />
            {/* Calendar icon — opens the hidden native date picker */}
            <button
              type="button"
              onClick={() => {
                try { deadlinePickerRef.current?.showPicker(); }
                catch { deadlinePickerRef.current?.click(); }
              }}
              style={{
                position: 'absolute', right: 8, top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-dim)', padding: 0,
                display: 'flex', alignItems: 'center',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </button>
            {/* Hidden native date input — used only for the calendar picker UI */}
            <input
              ref={deadlinePickerRef}
              type="date"
              tabIndex={-1}
              value={(() => {
                const v = watch('deadline');
                if (!v) return '';
                const p = v.split('/');
                return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : '';
              })()}
              onChange={(e) => {
                if (e.target.value) {
                  const [yyyy, mm, dd] = e.target.value.split('-');
                  setValue('deadline', `${dd}/${mm}/${yyyy}`, { shouldValidate: true });
                } else {
                  setValue('deadline', '', { shouldValidate: true });
                }
              }}
              style={{
                position: 'absolute', opacity: 0, pointerEvents: 'none',
                width: 1, height: 1, top: 0, right: 0, border: 'none',
              }}
            />
          </div>
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
