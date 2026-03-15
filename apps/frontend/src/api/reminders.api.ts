// Reminders API endpoints
import apiClient from './client';
import { Reminder, CreateReminderDto, UpdateReminderDto } from '../types/reminder.types';
import { ApiResponse } from '../types/common.types';

export const remindersApi = {
  // Get all reminders
  getAll: async (): Promise<ApiResponse<Reminder[]>> => {
    const response = await apiClient.get<ApiResponse<Reminder[]>>('/reminders');
    return response.data;
  },

  // Get reminder by ID
  getById: async (id: string): Promise<Reminder> => {
    const response = await apiClient.get<Reminder>(`/reminders/${id}`);
    return response.data;
  },

  // Create new reminder
  create: async (data: CreateReminderDto): Promise<Reminder> => {
    const response = await apiClient.post<Reminder>('/reminders', data);
    return response.data;
  },

  // Update reminder
  update: async (id: string, data: UpdateReminderDto): Promise<Reminder> => {
    const response = await apiClient.put<Reminder>(`/reminders/${id}`, data);
    return response.data;
  },

  // Delete reminder
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/reminders/${id}`);
  },

  // Trigger/send reminder
  trigger: async (id: string): Promise<void> => {
    await apiClient.post(`/reminders/${id}/trigger`);
  },
};

