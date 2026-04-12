// Clients API endpoints
import apiClient from './client';
import { type Client, type CreateClientDto, type UpdateClientDto } from '../types/client.types';
import { type PaginatedResponse } from '../types/common.types';

export const clientsApi = {
  // Get paginated clients
  getAll: async (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }): Promise<PaginatedResponse<Client>> => {
    const response = await apiClient.get<PaginatedResponse<Client>>('/clients', { params });
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
    return response.data.data;
  },

};

