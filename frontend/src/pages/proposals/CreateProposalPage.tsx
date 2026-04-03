// Create proposal page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProposals } from '../../hooks/useProposals';
import { ProposalForm } from '../../components/proposals/ProposalForm';
import { type ProposalFormData } from '../../utils/validation';
import apiClient from '../../api/client';

export const CreateProposalPage = () => {
  const navigate = useNavigate();
  const { createProposal } = useProposals();
  const [isLoading, setIsLoading] = useState(false);

  const handleAISuggest = async () => {
    try {
      // TODO: Implement AI suggestion API call
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
    setIsLoading(true);
    try {
      await createProposal(data);
      navigate('/proposals');
    } catch (err: any) {
      alert(err.message || 'Failed to create proposal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Create New Proposal</h1>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, maxWidth: 768 }}>
        <ProposalForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/proposals')}
          isLoading={isLoading}
          onAISuggest={handleAISuggest}
        />
      </div>
    </div>
  );
};

