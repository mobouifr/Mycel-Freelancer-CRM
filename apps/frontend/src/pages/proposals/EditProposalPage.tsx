// Edit proposal page
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { proposalsService } from '../../services/data.service';
import { ProposalForm } from '../../components/proposals/ProposalForm';
import { ProposalFormData } from '../../utils/validation';
import { Proposal } from '../../types/proposal.types';
import { ApiError } from '../../types/common.types';
import apiClient from '../../api/client';

export const EditProposalPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProposal = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await proposalsService.getById(id);
        setProposal(data);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Failed to load proposal');
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, [id]);

  const handleAISuggest = async () => {
    try {
      const response = await apiClient.post('/ai/suggest', {
        context: 'proposal',
        prompt: 'Generate a proposal title',
      });
      alert('AI suggestion: ' + response.data.suggestion);
    } catch (err) {
      console.error('AI suggestion failed:', err);
      alert('AI suggestion is not available');
    }
  };

  const handleSubmit = async (data: ProposalFormData) => {
    if (!id) return;
    setIsSaving(true);
    try {
      await proposalsService.update(id, data as any);
      navigate('/proposals');
    } catch (err: any) {
      alert(err.message || 'Failed to update proposal');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading proposal...</div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Proposal not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Proposal</h1>
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <ProposalForm
          proposal={proposal}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/proposals')}
          isLoading={isSaving}
          onAISuggest={handleAISuggest}
        />
      </div>
    </div>
  );
};

