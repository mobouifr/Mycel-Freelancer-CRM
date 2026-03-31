// Create invoice page
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useInvoices } from '../../hooks/useInvoices';
import { InvoiceForm } from '../../components/invoices/InvoiceForm';
import { type InvoiceFormData } from '../../utils/validation';

export const CreateInvoicePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createInvoice } = useInvoices();
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if coming from proposal conversion
  const proposalId = location.state?.proposalId;

  const handleSubmit = async (data: InvoiceFormData) => {
    setIsLoading(true);
    try {
      await createInvoice(data);
      navigate('/invoices');
    } catch (err: any) {
      alert(err.message || 'Failed to create invoice');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Create New Invoice</h1>
      {proposalId && (
        <div
          style={{
            marginBottom: 16,
            background: 'var(--info-bg)',
            border: '1px solid var(--info)',
            color: 'var(--info)',
            padding: '12px 16px',
            borderRadius: 8,
          }}
        >
          Creating invoice from proposal...
        </div>
      )}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, maxWidth: 768 }}>
        <InvoiceForm onSubmit={handleSubmit} onCancel={() => navigate('/invoices')} isLoading={isLoading} />
      </div>
    </div>
  );
};

