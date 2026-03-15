// Projects API endpoints
import apiClient from './client';
import { Project, CreateProjectDto, UpdateProjectDto } from '../types/project.types';
import { ApiResponse } from '../types/common.types';

export const projectsApi = {
  // Get all projects
  getAll: async (): Promise<ApiResponse<Project[]>> => {
    const response = await apiClient.get<ApiResponse<Project[]>>('/projects');
    return response.data;
  },

  // Get project by ID
  getById: async (id: string): Promise<Project> => {
    const response = await apiClient.get<Project>(`/projects/${id}`);
    return response.data;
  },

  // Create new project
  create: async (data: CreateProjectDto): Promise<Project> => {
    const response = await apiClient.post<Project>('/projects', data);
    return response.data;
  },

  // Update project
  update: async (id: string, data: UpdateProjectDto): Promise<Project> => {
    const response = await apiClient.put<Project>(`/projects/${id}`, data);
    return response.data;
  },

  // Delete project
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },

  // Update project status
  updateStatus: async (id: string, status: string): Promise<Project> => {
    const response = await apiClient.patch<Project>(`/projects/${id}/status`, { status });
    return response.data;
  },
};

