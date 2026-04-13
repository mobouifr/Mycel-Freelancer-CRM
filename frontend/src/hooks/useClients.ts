import { useState, useEffect, useCallback, useRef } from 'react';
import { clientsService } from '../services/data.service';
import { type Client } from '../types/client.types';
import { type ApiError } from '../types/common.types';

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
  const [sortBy, setSortBy]         = useState('createdAt');
  const [sortOrder, setSortOrder]   = useState<'asc' | 'desc'>('desc');

  // Stable refs so callbacks always read the latest values
  const pageRef      = useRef(page);
  const searchRef    = useRef(search);
  const sortByRef    = useRef(sortBy);
  const sortOrderRef = useRef(sortOrder);
  pageRef.current      = page;
  searchRef.current    = search;
  sortByRef.current    = sortBy;
  sortOrderRef.current = sortOrder;

  const doFetch = useCallback(async (p: number, s: string, sb: string, so: 'asc' | 'desc') => {
    setLoading(true);
    setError(null);
    try {
      const res = await clientsService.getAll({ page: p, limit: PAGE_SIZE, search: s, sortBy: sb, sortOrder: so });
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
    doFetch(1, '', 'createdAt', 'desc');
  }, [doFetch]);

  // Debounced search — resets to page 1 when search text changes
  const isInitialSearch = useRef(true);
  useEffect(() => {
    if (isInitialSearch.current) { isInitialSearch.current = false; return; }
    const id = setTimeout(() => {
      setPage(1);
      doFetch(1, search, sortByRef.current, sortOrderRef.current);
    }, 300);
    return () => clearTimeout(id);
  }, [search, doFetch]);

  // Sort change — immediate, resets to page 1
  const isInitialSort = useRef(true);
  useEffect(() => {
    if (isInitialSort.current) { isInitialSort.current = false; return; }
    setPage(1);
    doFetch(1, searchRef.current, sortBy, sortOrder);
  }, [sortBy, sortOrder, doFetch]);

  const goToPage = useCallback((p: number) => {
    setPage(p);
    doFetch(p, searchRef.current, sortByRef.current, sortOrderRef.current);
  }, [doFetch]);

  /** Toggle sort: same field flips direction; new field defaults to desc */
  const handleSort = useCallback((field: string) => {
    if (field === sortByRef.current) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  }, []);

  const refetch = useCallback(() => {
    doFetch(pageRef.current, searchRef.current, sortByRef.current, sortOrderRef.current);
  }, [doFetch]);

  const createClient = useCallback(async (data: any) => {
    try {
      const newClient = await clientsService.create(data);
      // New item lands on page 1 (ordered by createdAt desc)
      setPage(1);
      await doFetch(1, searchRef.current, sortByRef.current, sortOrderRef.current);
      return newClient;
    } catch (err) {
      throw err as ApiError;
    }
  }, [doFetch]);

  const updateClient = useCallback(async (id: string, data: any) => {
    try {
      const updatedClient = await clientsService.update(id, data);
      await doFetch(pageRef.current, searchRef.current, sortByRef.current, sortOrderRef.current);
      return updatedClient;
    } catch (err) {
      throw err as ApiError;
    }
  }, [doFetch]);

  const deleteClient = useCallback(async (id: string) => {
    try {
      const deletedClient = clients.find(c => c.id === id);
      await clientsService.delete(id);
      
      // If this was the only item on the page, go back one page
      const targetPage = clients.length === 1 && pageRef.current > 1 ? pageRef.current - 1 : pageRef.current;
      if (targetPage !== pageRef.current) setPage(targetPage);
      await doFetch(targetPage, searchRef.current, sortByRef.current, sortOrderRef.current);
    } catch (err) {
      throw err as ApiError;
    }
  }, [doFetch, clients]);

  return {
    clients,
    loading,
    error,
    page,
    totalPages,
    total,
    search,
    setSearch,
    sortBy,
    sortOrder,
    handleSort,
    goToPage,
    refetch,
    createClient,
    updateClient,
    deleteClient,
  };
};
