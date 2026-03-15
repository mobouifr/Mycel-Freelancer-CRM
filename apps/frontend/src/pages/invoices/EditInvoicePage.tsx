// Edit invoice page
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { invoicesService } from '../../services/data.service';
import { InvoiceForm } from '../../components/invoices/InvoiceForm';
import { InvoiceFormData } from '../../utils/validation';
import { Invoice } from '../../types/invoice.types';
import { ApiError } from '../../types/common.types';

export const EditInvoicePage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
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
        setError(apiError.message || 'Failed to load invoice');
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
      await invoicesService.update(id, data as any);
      navigate('/invoices');
    } catch (err: any) {
      alert(err.message || 'Failed to update invoice');
    } finally {
      setIsSaving(false);
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
      <h1 className="text-2xl font-bold mb-6">Edit Invoice</h1>
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
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

