// Custom hook for invoices data management
import { useState, useEffect } from 'react';
import { invoicesService } from '../services/data.service';
import { Invoice } from '../types/invoice.types';
import { ApiError } from '../types/common.types';

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await invoicesService.getAll();
      setInvoices(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const createInvoice = async (data: any) => {
    try {
      const newInvoice = await invoicesService.create(data);
      setInvoices((prev) => [newInvoice, ...prev]);
      return newInvoice;
    } catch (err) {
      const apiError = err as ApiError;
      throw apiError;
    }
  };

  const updateInvoice = async (id: string, data: any) => {
    try {
      const updatedInvoice = await invoicesService.update(id, data);
      setInvoices((prev) => prev.map((i) => (i.id === id ? updatedInvoice : i)));
      return updatedInvoice;
    } catch (err) {
      const apiError = err as ApiError;
      throw apiError;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      await invoicesService.delete(id);
      setInvoices((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      const apiError = err as ApiError;
      throw apiError;
    }
  };

  return {
    invoices,
    loading,
    error,
    refetch: fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
  };
};

