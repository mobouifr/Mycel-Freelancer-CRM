import { useState, useEffect, useCallback, useRef } from 'react';
import { clientsService } from '../services/data.service';
import { type Client } from '../types/client.types';
import { type ApiError } from '../types/common.types';
import { useStore } from './useStore';

const DEFAULT_PAGE_SIZE = 10;

export const useClients = (options?: { pageSize?: number }) => {
  const PAGE_SIZE = options?.pageSize ?? DEFAULT_PAGE_SIZE;
  const [clients, setClients]       = useState<Client[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [search, setSearch]         = useState('');
  const { addNotification } = useStore();

  // Stable refs so callbacks always read the latest values
  const pageRef   = useRef(page);
  const searchRef = useRef(search);
  pageRef.current   = page;
  searchRef.current = search;

  const doFetch = useCallback(async (p: number, s: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await clientsService.getAll({ page: p, limit: PAGE_SIZE, search: s });
      setClients(res.data);
      setTotalPages(res.totalPages ?? 1);
      setTotal(res.count);
    } catch (err) {
      setError((err as ApiError).message || 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    doFetch(1, '');
  }, [doFetch]);

  // Debounced search — resets to page 1 when search text changes
  const isInitialSearch = useRef(true);
  useEffect(() => {
    if (isInitialSearch.current) { isInitialSearch.current = false; return; }
    const id = setTimeout(() => {
      setPage(1);
      doFetch(1, search);
    }, 300);
    return () => clearTimeout(id);
  }, [search, doFetch]);

  const goToPage = useCallback((p: number) => {
    setPage(p);
    doFetch(p, searchRef.current);
  }, [doFetch]);

  const refetch = useCallback(() => {
    doFetch(pageRef.current, searchRef.current);
  }, [doFetch]);

  const createClient = useCallback(async (data: any) => {
    try {
      const newClient = await clientsService.create(data);
      addNotification({ type: 'success', title: 'Client created', message: `"${newClient.name}" was added successfully.` });
      // New item lands on page 1 (ordered by createdAt desc)
      setPage(1);
      await doFetch(1, searchRef.current);
      return newClient;
    } catch (err) {
      throw err as ApiError;
    }
  }, [doFetch, addNotification]);

  const updateClient = useCallback(async (id: string, data: any) => {
    try {
      const updatedClient = await clientsService.update(id, data);
      addNotification({ type: 'info', title: 'Client updated', message: `"${updatedClient.name}" was updated.` });
      await doFetch(pageRef.current, searchRef.current);
      return updatedClient;
    } catch (err) {
      throw err as ApiError;
    }
  }, [doFetch, addNotification]);

  const deleteClient = useCallback(async (id: string) => {
    try {
      const deletedClient = clients.find(c => c.id === id);
      await clientsService.delete(id);
      addNotification({ type: 'warning', title: 'Client deleted', message: deletedClient ? `"${deletedClient.name}" was removed.` : 'A client was removed.' });
      // If this was the only item on the page, go back one page
      const targetPage = clients.length === 1 && pageRef.current > 1 ? pageRef.current - 1 : pageRef.current;
      if (targetPage !== pageRef.current) setPage(targetPage);
      await doFetch(targetPage, searchRef.current);
    } catch (err) {
      throw err as ApiError;
    }
  }, [doFetch, clients, addNotification]);

  return {
    clients,
    loading,
    error,
    page,
    totalPages,
    total,
    search,
    setSearch,
    goToPage,
    refetch,
    createClient,
    updateClient,
    deleteClient,
  };
};
