// Proposals API endpoints
import apiClient from './client';
import { type Proposal, type CreateProposalDto, type UpdateProposalDto, ProposalStatus } from '../types/proposal.types';
import { type ApiResponse } from '../types/common.types';

export const proposalsApi = {
  // Get all proposals
  getAll: async (): Promise<ApiResponse<Proposal[]>> => {
    const response = await apiClient.get<ApiResponse<Proposal[]>>('/proposals');
    return response.data;
  },

  // Get proposal by ID
  getById: async (id: string): Promise<Proposal> => {
    const response = await apiClient.get<Proposal>(`/proposals/${id}`);
    return response.data;
  },

  // Create new proposal
  create: async (data: CreateProposalDto): Promise<Proposal> => {
    const response = await apiClient.post<Proposal>('/proposals', data);
    return response.data;
  },

  // Update proposal
  update: async (id: string, data: UpdateProposalDto): Promise<Proposal> => {
    const response = await apiClient.put<Proposal>(`/proposals/${id}`, data);
    return response.data;
  },

  // Delete proposal
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/proposals/${id}`);
  },

  // Update proposal status
  updateStatus: async (id: string, status: ProposalStatus): Promise<Proposal> => {
    const response = await apiClient.patch<Proposal>(`/proposals/${id}/status`, { status });
    return response.data;
  },

  // Generate PDF
  generatePDF: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/proposals/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Convert to invoice
  convertToInvoice: async (id: string, dueDate?: string): Promise<any> => {
    const response = await apiClient.post(`/proposals/${id}/convert-to-invoice`, { dueDate });
    return response.data;
  },
};

