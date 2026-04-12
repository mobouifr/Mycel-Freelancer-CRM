import { useState, useEffect, useCallback, useRef } from 'react';
import { projectsService } from '../services/data.service';
import { type Project } from '../types/project.types';
import { type ApiError } from '../types/common.types';
import { useStore } from './useStore';

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

  const pageRef         = useRef(page);
  const searchRef       = useRef(search);
  const statusRef       = useRef(statusFilter);
  pageRef.current       = page;
  searchRef.current     = search;
  statusRef.current     = statusFilter;

  const doFetch = useCallback(async (p: number, s: string, st: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectsService.getAll({
        page: p,
        limit: PAGE_SIZE,
        search: s,
        status: st !== 'ALL' ? st : undefined,
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
    doFetch(1, '', 'ALL');
  }, [doFetch]);

  // Debounced search — resets to page 1
  const isInitialSearch = useRef(true);
  useEffect(() => {
    if (isInitialSearch.current) { isInitialSearch.current = false; return; }
    const id = setTimeout(() => {
      setPage(1);
      doFetch(1, search, statusRef.current);
    }, 300);
    return () => clearTimeout(id);
  }, [search, doFetch]);

  // Status filter change — immediate, resets to page 1
  const isInitialStatus = useRef(true);
  useEffect(() => {
    if (isInitialStatus.current) { isInitialStatus.current = false; return; }
    setPage(1);
    doFetch(1, searchRef.current, statusFilter);
  }, [statusFilter, doFetch]);

  const goToPage = useCallback((p: number) => {
    setPage(p);
    doFetch(p, searchRef.current, statusRef.current);
  }, [doFetch]);

  const refetch = useCallback(() => {
    doFetch(pageRef.current, searchRef.current, statusRef.current);
  }, [doFetch]);

  const createProject = useCallback(async (data: any) => {
    try {
      const newProject = await projectsService.create(data);
      setPage(1);
      await doFetch(1, searchRef.current, statusRef.current);
      return newProject;
    } catch (err) {
      throw err as ApiError;
    }
  }, [doFetch]);

  const updateProject = useCallback(async (id: string, data: any) => {
    try {
      const updatedProject = await projectsService.update(id, data);
      
      await doFetch(pageRef.current, searchRef.current, statusRef.current);
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
      await doFetch(targetPage, searchRef.current, statusRef.current);
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
    goToPage,
    refetch,
    createProject,
    updateProject,
    deleteProject,
  };
};
