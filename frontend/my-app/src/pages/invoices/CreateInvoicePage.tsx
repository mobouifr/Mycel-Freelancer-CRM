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
      <h1 className="text-2xl font-bold mb-6">Create New Invoice</h1>
      {proposalId && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
          Creating invoice from proposal...
        </div>
      )}
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <InvoiceForm onSubmit={handleSubmit} onCancel={() => navigate('/invoices')} isLoading={isLoading} />
      </div>
    </div>
  );
};

