// Custom hook for proposals data management
import { useState, useEffect } from 'react';
import { proposalsService } from '../services/data.service';
import { Proposal } from '../types/proposal.types';
import { ApiError } from '../types/common.types';

export const useProposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await proposalsService.getAll();
      setProposals(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to fetch proposals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const createProposal = async (data: any) => {
    try {
      const newProposal = await proposalsService.create(data);
      setProposals((prev) => [newProposal, ...prev]);
      return newProposal;
    } catch (err) {
      const apiError = err as ApiError;
      throw apiError;
    }
  };

  const updateProposal = async (id: string, data: any) => {
    try {
      const updatedProposal = await proposalsService.update(id, data);
      setProposals((prev) => prev.map((p) => (p.id === id ? updatedProposal : p)));
      return updatedProposal;
    } catch (err) {
      const apiError = err as ApiError;
      throw apiError;
    }
  };

  const deleteProposal = async (id: string) => {
    try {
      await proposalsService.delete(id);
      setProposals((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      const apiError = err as ApiError;
      throw apiError;
    }
  };

  return {
    proposals,
    loading,
    error,
    refetch: fetchProposals,
    createProposal,
    updateProposal,
    deleteProposal,
  };
};

