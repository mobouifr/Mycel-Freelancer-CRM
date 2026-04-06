// Edit proposal page
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { proposalsService } from '../../services/data.service';
import { ProposalForm } from '../../components/proposals/ProposalForm';
import { type ProposalFormData } from '../../utils/validation';
import { type Proposal } from '../../types/proposal.types';
import { type ApiError } from '../../types/common.types';
import apiClient from '../../api/client';
import { useStore } from '../../hooks/useStore';

export const EditProposalPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addNotification } = useStore();
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
        setError(apiError.message || t('proposals.load_failed'));
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
      alert(t('proposals.ai_suggestion_prefix') + response.data.suggestion);
    } catch (err) {
      console.error('AI suggestion failed:', err);
      alert(t('proposals.ai_unavailable'));
    }
  };

  const handleSubmit = async (data: ProposalFormData) => {
    if (!id) return;
    setIsSaving(true);
    try {
      const updatedProposal = await proposalsService.update(id, data as any);
      addNotification({
        type: 'info',
        title: t('proposals.updated'),
        message: `"${updatedProposal.title}" was updated.`,
      });
      navigate('/proposals');
    } catch (err: any) {
      alert(err.message || t('proposals.update_failed'));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">{t('proposals.detail_loading')}</div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="p-6">
        <div
          style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            padding: '12px 16px',
            borderRadius: 8,
          }}
        >
          {error || t('proposals.not_found')}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>{t('proposals.edit_title')}</h1>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, maxWidth: 768 }}>
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

