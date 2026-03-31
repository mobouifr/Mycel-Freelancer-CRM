// Custom hook for proposals data management
import { useState, useEffect } from 'react';
import { proposalsService } from '../services/data.service';
import { type Proposal } from '../types/proposal.types';
import { type ApiError } from '../types/common.types';
import { useStore } from './useStore';

export const useProposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useStore();

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
      addNotification({
        type: 'success',
        title: 'Proposal created',
        message: `"${newProposal.title}" was created successfully.`,
      });
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
      addNotification({
        type: 'info',
        title: 'Proposal updated',
        message: `"${updatedProposal.title}" was updated.`,
      });
      return updatedProposal;
    } catch (err) {
      const apiError = err as ApiError;
      throw apiError;
    }
  };

  const deleteProposal = async (id: string) => {
    try {
      const deletedProposal = proposals.find((proposal) => proposal.id === id);
      await proposalsService.delete(id);
      setProposals((prev) => prev.filter((p) => p.id !== id));
      addNotification({
        type: 'warning',
        title: 'Proposal deleted',
        message: deletedProposal ? `"${deletedProposal.title}" was removed.` : 'A proposal was removed.',
      });
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

