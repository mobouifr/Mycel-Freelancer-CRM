// Invoices API endpoints
import apiClient from './client';
import { type Invoice, type CreateInvoiceDto, type UpdateInvoiceDto, type MarkInvoicePaidDto } from '../types/invoice.types';
import { type ApiResponse } from '../types/common.types';

export const invoicesApi = {
  // Get all invoices
  getAll: async (): Promise<ApiResponse<Invoice[]>> => {
    const response = await apiClient.get<ApiResponse<Invoice[]>>('/invoices');
    return response.data;
  },

  // Get invoice by ID
  getById: async (id: string): Promise<Invoice> => {
    const response = await apiClient.get<Invoice>(`/invoices/${id}`);
    return response.data;
  },

  // Create new invoice
  create: async (data: CreateInvoiceDto): Promise<Invoice> => {
    const response = await apiClient.post<Invoice>('/invoices', data);
    return response.data;
  },

  // Update invoice
  update: async (id: string, data: UpdateInvoiceDto): Promise<Invoice> => {
    const response = await apiClient.put<Invoice>(`/invoices/${id}`, data);
    return response.data;
  },

  // Delete invoice
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/invoices/${id}`);
  },

  // Mark invoice as paid
  markPaid: async (id: string, data: MarkInvoicePaidDto): Promise<Invoice> => {
    const response = await apiClient.patch<Invoice>(`/invoices/${id}/paid`, data);
    return response.data;
  },

  // Generate PDF
  generatePDF: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/invoices/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

