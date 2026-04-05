// Invoice detail page
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { invoicesService } from '../../services/data.service';
import { type Invoice, InvoiceStatus } from '../../types/invoice.types';
import { type ApiError } from '../../types/common.types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { InvoiceStatusBadge } from '../../components/invoices/InvoiceStatusBadge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { createMarkInvoicePaidSchema, type MarkInvoicePaidFormData } from '../../utils/validation';
import { useStore } from '../../hooks/useStore';

export const InvoiceDetailPage = () => {
  const { t } = useTranslation();
  const paidSchema = useMemo(() => createMarkInvoicePaidSchema(t), [t]);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addNotification } = useStore();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMarkPaidForm, setShowMarkPaidForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MarkInvoicePaidFormData>({
    resolver: zodResolver(paidSchema),
    defaultValues: {
      amount: invoice ? Number(invoice.amount) : 0,
      method: '',
      notes: '',
    },
  });

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await invoicesService.getById(id);
        setInvoice(data);
        reset({
          amount: Number(data.amount),
          method: '',
          notes: '',
        });
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id, reset]);

  const handleDownloadPDF = async () => {
    if (!id) return;
    try {
      const blob = await invoicesService.generatePDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || 'Failed to generate PDF');
    }
  };

  const handleMarkPaid = async (data: MarkInvoicePaidFormData) => {
    if (!id) return;
    try {
      await invoicesService.markPaid(id, data);
      const updatedInvoice = await invoicesService.getById(id);
      setInvoice(updatedInvoice);
      setShowMarkPaidForm(false);
      reset();
      addNotification({
        type: 'success',
        title: 'Invoice updated',
        message: `Invoice was marked as paid (${Number(data.amount).toFixed(2)}).`,
      });
    } catch (err: any) {
      alert(err.message || 'Failed to mark invoice as paid');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading invoice...</div>
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
          {error || 'Invoice not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Invoice</h1>
          <div className="mt-2">
            <InvoiceStatusBadge status={invoice.status} />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadPDF}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 999,
              border: '1px solid var(--accent)',
              background: 'var(--accent-bg)',
              color: 'var(--accent)',
              padding: '8px 16px',
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '.06em',
            }}
          >
            Download PDF
          </button>
          <button
            onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 999,
              border: '1px solid var(--accent)',
              background: 'transparent',
              color: 'var(--accent)',
              padding: '8px 16px',
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '.06em',
            }}
          >
            Edit
          </button>
          <button
            onClick={() => navigate('/invoices')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 999,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
              padding: '8px 16px',
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '.06em',
            }}
          >
            Back to List
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, marginBottom: 16 }}>
        <div className="space-y-4">
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)' }}>Project</h3>
            <p style={{ marginTop: 4, color: 'var(--text)' }}>{invoice.project?.title || '—'}</p>
          </div>
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)' }}>Amount</h3>
            <p style={{ marginTop: 4, fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>{formatCurrency(Number(invoice.amount))}</p>
          </div>
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)' }}>Due Date</h3>
            <p style={{ marginTop: 4, color: 'var(--text)' }}>{formatDate(invoice.dueDate)}</p>
          </div>
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)' }}>Notes</h3>
            <p style={{ marginTop: 4, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{invoice.notes || '—'}</p>
          </div>
          {invoice.payments && invoice.payments.length > 0 && (
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)', marginBottom: 8 }}>Payments</h3>
              <div className="space-y-2">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} style={{ borderLeft: '4px solid var(--success)', paddingLeft: 12 }}>
                    <p style={{ fontWeight: 500, color: 'var(--text)' }}>{formatCurrency(Number(payment.amount))}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>{payment.method} - {formatDate(payment.paidAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {invoice.status !== InvoiceStatus.PAID && (
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text)' }}>Mark as Paid</h2>
          {!showMarkPaidForm ? (
            <button
              onClick={() => setShowMarkPaidForm(true)}
              style={{
                padding: '10px 14px',
                background: 'var(--accent)',
                color: 'var(--bg)',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Mark as Paid
            </button>
          ) : (
            <form onSubmit={handleSubmit(handleMarkPaid)} className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                  Amount <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...register('amount', { valueAsNumber: true })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    outline: 'none',
                  }}
                />
                {errors.amount && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.amount.message}</p>}
              </div>
              <div>
                <label htmlFor="method" className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                  Payment Method <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="method"
                  type="text"
                  {...register('method')}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    outline: 'none',
                  }}
                />
                {errors.method && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.method.message}</p>}
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                  Notes
                </label>
                <textarea
                  id="notes"
                  {...register('notes')}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    outline: 'none',
                  }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowMarkPaidForm(false);
                    reset();
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    borderRadius: 999,
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text-mid)',
                    padding: '8px 16px',
                    fontSize: 11,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '.06em',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    borderRadius: 999,
                    border: '1px solid var(--accent)',
                    background: 'var(--accent-bg)',
                    color: 'var(--accent)',
                    padding: '8px 16px',
                    fontSize: 11,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '.06em',
                  }}
                >
                  Mark as Paid
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

