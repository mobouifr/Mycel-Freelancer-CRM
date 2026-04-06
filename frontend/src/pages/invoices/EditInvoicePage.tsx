// Edit invoice page
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { invoicesService } from '../../services/data.service';
import { InvoiceForm } from '../../components/invoices/InvoiceForm';
import { type InvoiceFormData } from '../../utils/validation';
import { type Invoice } from '../../types/invoice.types';
import { type ApiError } from '../../types/common.types';
import { useStore } from '../../hooks/useStore';

export const EditInvoicePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addNotification } = useStore();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await invoicesService.getById(id);
        setInvoice(data);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || t('invoices.load_failed'));
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const handleSubmit = async (data: InvoiceFormData) => {
    if (!id) return;
    setIsSaving(true);
    try {
      const updatedInvoice = await invoicesService.update(id, data as any);
      addNotification({
        type: 'info',
        title: t('invoices.updated'),
        message: `Invoice status is now ${updatedInvoice.status}.`,
      });
      navigate('/invoices');
    } catch (err: any) {
      alert(err.message || t('invoices.update_failed'));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">{t('invoices.detail_loading')}</div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-6">
        <div
          style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            padding: '12px 16px',
            borderRadius: 8,
          }}
        >
          {error || t('invoices.not_found')}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>{t('invoices.edit_title')}</h1>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, maxWidth: 768 }}>
        <InvoiceForm
          invoice={invoice}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/invoices')}
          isLoading={isSaving}
        />
      </div>
    </div>
  );
};

