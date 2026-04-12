// Client form component
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { clientSchema, type ClientFormData } from '../../utils/validation';
import { type Client } from '../../types/client.types';

interface ClientFormProps {
  client?: Client;
  onSubmit: (data: ClientFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const ClientForm = ({ client, onSubmit, onCancel, isLoading = false }: ClientFormProps) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: client
      ? {
          name: client.name,
          email: client.email || '',
          phone: client.phone || '',
          company: client.company || '',
          notes: client.notes || '',
        }
      : undefined,
    mode: 'onChange',
  });

  const handleFormSubmit = async (data: ClientFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Name */}
      <div>
        <label style={labelStyle}>
          {t('forms.client.name')} <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <input
          type="text"
          {...register('name')}
          placeholder={t('forms.client.name')}
          autoFocus
          style={inputStyle}
        />
        {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
      </div>

      {/* Email / Phone row */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>{t('forms.client.email')}</label>
          <input
            type="email"
            {...register('email')}
            placeholder="name@example.com"
            style={inputStyle}
          />
          {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>{t('forms.client.phone')}</label>
          <input
            type="tel"
            {...register('phone')}
            placeholder="+1 555 000 0000"
            style={inputStyle}
          />
          {errors.phone && <p style={errorStyle}>{errors.phone.message}</p>}
        </div>
      </div>

      {/* Company */}
      <div>
        <label style={labelStyle}>{t('forms.client.company')}</label>
        <input
          type="text"
          {...register('company')}
          placeholder={t('forms.client.company')}
          style={inputStyle}
        />
        {errors.company && <p style={errorStyle}>{errors.company.message}</p>}
      </div>

      {/* Notes */}
      <div>
        <label style={labelStyle}>{t('forms.client.notes')}</label>
        <textarea
          {...register('notes')}
          rows={3}
          placeholder={t('event_modal.add_details')}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }}
        />
        {errors.notes && <p style={errorStyle}>{errors.notes.message}</p>}
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
          {isSubmitting || isLoading ? t('common.saving') : client ? t('forms.client.update') : t('forms.client.create')}
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
