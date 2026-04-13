import { useState, useEffect, useCallback, useRef } from 'react';
import { projectsService } from '../services/data.service';
import { type Project } from '../types/project.types';
import { type ApiError } from '../types/common.types';

const DEFAULT_PAGE_SIZE = 10;

export const useProjects = (options?: { pageSize?: number }) => {
  const PAGE_SIZE = options?.pageSize ?? DEFAULT_PAGE_SIZE;
  const [projects, setProjects]     = useState<Project[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy]         = useState('createdAt');
  const [sortOrder, setSortOrder]   = useState<'asc' | 'desc'>('desc');

  const pageRef        = useRef(page);
  const searchRef      = useRef(search);
  const statusRef      = useRef(statusFilter);
  const sortByRef      = useRef(sortBy);
  const sortOrderRef   = useRef(sortOrder);
  pageRef.current      = page;
  searchRef.current    = search;
  statusRef.current    = statusFilter;
  sortByRef.current    = sortBy;
  sortOrderRef.current = sortOrder;

  const doFetch = useCallback(async (p: number, s: string, st: string, sb: string, so: 'asc' | 'desc') => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectsService.getAll({
        page: p,
        limit: PAGE_SIZE,
        search: s,
        status: st !== 'ALL' ? st : undefined,
        sortBy: sb,
        sortOrder: so,
      });
      setProjects(res.data);
      setTotalPages(res.totalPages ?? 1);
      setTotal(res.count);
    } catch (err) {
      setError((err as ApiError).message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    doFetch(1, '', 'ALL', 'createdAt', 'desc');
  }, [doFetch]);

  // Debounced search — resets to page 1
  const isInitialSearch = useRef(true);
  useEffect(() => {
    if (isInitialSearch.current) { isInitialSearch.current = false; return; }
    const id = setTimeout(() => {
      setPage(1);
      doFetch(1, search, statusRef.current, sortByRef.current, sortOrderRef.current);
    }, 300);
    return () => clearTimeout(id);
  }, [search, doFetch]);

  // Status filter change — immediate, resets to page 1
  const isInitialStatus = useRef(true);
  useEffect(() => {
    if (isInitialStatus.current) { isInitialStatus.current = false; return; }
    setPage(1);
    doFetch(1, searchRef.current, statusFilter, sortByRef.current, sortOrderRef.current);
  }, [statusFilter, doFetch]);

  // Sort change — immediate, resets to page 1
  const isInitialSort = useRef(true);
  useEffect(() => {
    if (isInitialSort.current) { isInitialSort.current = false; return; }
    setPage(1);
    doFetch(1, searchRef.current, statusRef.current, sortBy, sortOrder);
  }, [sortBy, sortOrder, doFetch]);

  const goToPage = useCallback((p: number) => {
    setPage(p);
    doFetch(p, searchRef.current, statusRef.current, sortByRef.current, sortOrderRef.current);
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
    doFetch(pageRef.current, searchRef.current, statusRef.current, sortByRef.current, sortOrderRef.current);
  }, [doFetch]);

  const createProject = useCallback(async (data: any) => {
    try {
      const newProject = await projectsService.create(data);
      setPage(1);
      await doFetch(1, searchRef.current, statusRef.current, sortByRef.current, sortOrderRef.current);
      return newProject;
    } catch (err) {
      throw err as ApiError;
    }
  }, [doFetch]);

  const updateProject = useCallback(async (id: string, data: any) => {
    try {
      const updatedProject = await projectsService.update(id, data);
      await doFetch(pageRef.current, searchRef.current, statusRef.current, sortByRef.current, sortOrderRef.current);
      return updatedProject;
    } catch (err) {
      throw err as ApiError;
    }
  }, [doFetch]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      const deletedProject = projects.find(p => p.id === id);
      await projectsService.delete(id);
      
      const targetPage = projects.length === 1 && pageRef.current > 1 ? pageRef.current - 1 : pageRef.current;
      if (targetPage !== pageRef.current) setPage(targetPage);
      await doFetch(targetPage, searchRef.current, statusRef.current, sortByRef.current, sortOrderRef.current);
    } catch (err) {
      throw err as ApiError;
    }
  }, [doFetch, projects]);

  return {
    projects,
    loading,
    error,
    page,
    totalPages,
    total,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortBy,
    sortOrder,
    handleSort,
    goToPage,
    refetch,
    createProject,
    updateProject,
    deleteProject,
  };
};
