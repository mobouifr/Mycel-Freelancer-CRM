// Custom hook for clients data management
import { useState, useEffect } from 'react';
import { clientsService } from '../services/data.service';
import { type Client } from '../types/client.types';
import { type ApiError } from '../types/common.types';
import { useStore } from './useStore';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useStore();

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await clientsService.getAll();
      setClients(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const createClient = async (data: any) => {
    try {
      const newClient = await clientsService.create(data);
      setClients((prev) => [newClient, ...prev]);
      addNotification({
        type: 'success',
        title: 'Client created',
        message: `"${newClient.name}" was added successfully.`,
      });
      return newClient;
    } catch (err) {
      const apiError = err as ApiError;
      throw apiError;
    }
  };

  const updateClient = async (id: string, data: any) => {
    try {
      const updatedClient = await clientsService.update(id, data);
      setClients((prev) => prev.map((c) => (c.id === id ? updatedClient : c)));
      addNotification({
        type: 'info',
        title: 'Client updated',
        message: `"${updatedClient.name}" was updated.`,
      });
      return updatedClient;
    } catch (err) {
      const apiError = err as ApiError;
      throw apiError;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const deletedClient = clients.find((client) => client.id === id);
      await clientsService.delete(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      addNotification({
        type: 'warning',
        title: 'Client deleted',
        message: deletedClient ? `"${deletedClient.name}" was removed.` : 'A client was removed.',
      });
    } catch (err) {
      const apiError = err as ApiError;
      throw apiError;
    }
  };

  return {
    clients,
    loading,
    error,
    refetch: fetchClients,
    createClient,
    updateClient,
    deleteClient,
  };
};

