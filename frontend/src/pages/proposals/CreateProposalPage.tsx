// Create proposal page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProposals } from '../../hooks/useProposals';
import { ProposalForm } from '../../components/proposals/ProposalForm';
import { type ProposalFormData } from '../../utils/validation';
import apiClient from '../../api/client';

export const CreateProposalPage = () => {
  const { t } = useTranslation();
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
      alert(t('proposals.ai_suggestion_prefix') + response.data.suggestion);
    } catch (err) {
      console.error('AI suggestion failed:', err);
      alert(t('proposals.ai_unavailable'));
    }
  };

  const handleSubmit = async (data: ProposalFormData) => {
    setIsLoading(true);
    try {
      await createProposal(data);
      navigate('/proposals');
    } catch (err: any) {
      alert(err.message || t('proposals.create_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>{t('proposals.create_title')}</h1>
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

