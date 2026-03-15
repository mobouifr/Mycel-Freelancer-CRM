// Custom hook for reminders data management
import { useState, useEffect } from 'react';
import { remindersService } from '../services/data.service';
import { Reminder } from '../types/reminder.types';
import { ApiError } from '../types/common.types';

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await remindersService.getAll();
      setReminders(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const createReminder = async (data: any) => {
    try {
      const newReminder = await remindersService.create(data);
      setReminders((prev) => [newReminder, ...prev]);
      return newReminder;
    } catch (err) {
      const apiError = err as ApiError;
      throw apiError;
    }
  };

  const updateReminder = async (id: string, data: any) => {
    try {
      const updatedReminder = await remindersService.update(id, data);
      setReminders((prev) => prev.map((r) => (r.id === id ? updatedReminder : r)));
      return updatedReminder;
    } catch (err) {
      const apiError = err as ApiError;
      throw apiError;
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      await remindersService.delete(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      const apiError = err as ApiError;
      throw apiError;
    }
  };

  return {
    reminders,
    loading,
    error,
    refetch: fetchReminders,
    createReminder,
    updateReminder,
    deleteReminder,
  };
};

