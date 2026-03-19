// Invoice detail page
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { invoicesService } from '../../services/data.service';
import { Invoice, InvoiceStatus } from '../../types/invoice.types';
import { ApiError } from '../../types/common.types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { InvoiceStatusBadge } from '../../components/invoices/InvoiceStatusBadge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { markInvoicePaidSchema, MarkInvoicePaidFormData } from '../../utils/validation';

export const InvoiceDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
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
    resolver: zodResolver(markInvoicePaidSchema),
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
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
            className="inline-flex items-center rounded-full border border-emerald-400/70 bg-emerald-500/20 px-4 py-2 text-xs font-medium uppercase tracking-wide text-emerald-100 hover:bg-emerald-400 hover:text-slate-950 transition-colors"
          >
            Download PDF
          </button>
          <button
            onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
            className="inline-flex items-center rounded-full border border-emerald-400/70 bg-transparent px-4 py-2 text-xs font-medium uppercase tracking-wide text-emerald-300 hover:bg-emerald-500/10 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => navigate('/invoices')}
            className="inline-flex items-center rounded-full border border-slate-300/70 bg-slate-800 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-100 hover:bg-slate-700 hover:border-slate-100 transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Project</h3>
            <p className="mt-1">{invoice.project?.title || '—'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Amount</h3>
            <p className="mt-1 text-lg font-semibold">{formatCurrency(Number(invoice.amount))}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
            <p className="mt-1">{formatDate(invoice.dueDate)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Notes</h3>
            <p className="mt-1 whitespace-pre-wrap">{invoice.notes || '—'}</p>
          </div>
          {invoice.payments && invoice.payments.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Payments</h3>
              <div className="space-y-2">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="border-l-4 border-green-500 pl-3">
                    <p className="font-medium">{formatCurrency(Number(payment.amount))}</p>
                    <p className="text-sm text-gray-500">{payment.method} - {formatDate(payment.paidAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {invoice.status !== InvoiceStatus.PAID && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Mark as Paid</h2>
          {!showMarkPaidForm ? (
            <button
              onClick={() => setShowMarkPaidForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Mark as Paid
            </button>
          ) : (
            <form onSubmit={handleSubmit(handleMarkPaid)} className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium mb-1">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...register('amount', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
              </div>
              <div>
                <label htmlFor="method" className="block text-sm font-medium mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <input
                  id="method"
                  type="text"
                  {...register('method')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.method && <p className="text-red-500 text-sm mt-1">{errors.method.message}</p>}
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  {...register('notes')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowMarkPaidForm(false);
                    reset();
                  }}
                  className="inline-flex items-center rounded-full border border-slate-300/70 bg-transparent px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full border border-emerald-400/70 bg-emerald-500/20 px-4 py-2 text-xs font-medium uppercase tracking-wide text-emerald-100 hover:bg-emerald-400 hover:text-slate-950 transition-colors"
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

