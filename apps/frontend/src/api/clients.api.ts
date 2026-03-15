// Clients API endpoints
import apiClient from './client';
import { Client, CreateClientDto, UpdateClientDto } from '../types/client.types';
import { ApiResponse } from '../types/common.types';

export const clientsApi = {
  // Get all clients
  getAll: async (): Promise<ApiResponse<Client[]>> => {
    const response = await apiClient.get<ApiResponse<Client[]>>('/clients');
    return response.data;
  },

  // Get client by ID
  getById: async (id: string): Promise<Client> => {
    const response = await apiClient.get<Client>(`/clients/${id}`);
    return response.data;
  },

  // Create new client
  create: async (data: CreateClientDto): Promise<Client> => {
    const response = await apiClient.post<Client>('/clients', data);
    return response.data;
  },

  // Update client
  update: async (id: string, data: UpdateClientDto): Promise<Client> => {
    const response = await apiClient.put<Client>(`/clients/${id}`, data);
    return response.data;
  },

  // Delete client
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/clients/${id}`);
  },

  // Get client's projects
  getProjects: async (id: string) => {
    const response = await apiClient.get(`/clients/${id}/projects`);
    return response.data;
  },

  // Get client's proposals
  getProposals: async (id: string) => {
    const response = await apiClient.get(`/clients/${id}/proposals`);
    return response.data;
  },

  // Get client's invoices
  getInvoices: async (id: string) => {
    const response = await apiClient.get(`/clients/${id}/invoices`);
    return response.data;
  },
};

