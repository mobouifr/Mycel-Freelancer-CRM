// Custom hook for invoices data management
import { useState, useEffect } from 'react';
import { invoicesService } from '../services/data.service';
import { type Invoice } from '../types/invoice.types';
import { type ApiError } from '../types/common.types';
import { useStore } from './useStore';

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useStore();

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
      addNotification({
        type: 'success',
        title: 'Invoice created',
        message: `Invoice for ${Number(newInvoice.amount).toFixed(2)} was created.`,
      });
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
      addNotification({
        type: 'info',
        title: 'Invoice updated',
        message: `Invoice status is now ${updatedInvoice.status}.`,
      });
      return updatedInvoice;
    } catch (err) {
      const apiError = err as ApiError;
      throw apiError;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      const deletedInvoice = invoices.find((invoice) => invoice.id === id);
      await invoicesService.delete(id);
      setInvoices((prev) => prev.filter((i) => i.id !== id));
      addNotification({
        type: 'warning',
        title: 'Invoice deleted',
        message: deletedInvoice
          ? `Invoice for ${Number(deletedInvoice.amount).toFixed(2)} was removed.`
          : 'An invoice was removed.',
      });
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

