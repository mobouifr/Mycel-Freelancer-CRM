// Proposal detail page
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { proposalsService } from '../../services/data.service';
import { type Proposal, ProposalStatus } from '../../types/proposal.types';
import { type ApiError } from '../../types/common.types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { useStore } from '../../hooks/useStore';

export const ProposalDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addNotification } = useStore();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
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

  const handleStatusChange = async (newStatus: ProposalStatus) => {
    if (!id) return;
    try {
      await proposalsService.updateStatus(id, newStatus);
      if (proposal) {
        setProposal({ ...proposal, status: newStatus });
        addNotification({
          type: 'info',
          title: t('proposals.updated'),
          message: `"${proposal.title}" status changed to ${newStatus}.`,
        });
      }
    } catch (err: any) {
      alert(err.message || t('proposals.update_failed'));
    }
  };

  const handleDownloadPDF = async () => {
    if (!id) return;
    try {
      const blob = await proposalsService.generatePDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proposal-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || t('proposals.pdf_failed'));
    }
  };

  const handleConvertToInvoice = async () => {
    if (!id) return;
    const dueDate = prompt(t('proposals.enter_due_date'));
    if (!dueDate) return;
    try {
      const invoice = await proposalsService.convertToInvoice(id, dueDate);
      addNotification({
        type: 'success',
        title: t('proposals.invoice_created'),
        message: proposal
          ? `Proposal "${proposal.title}" was converted to an invoice.`
          : 'A proposal was converted to an invoice.',
      });
      navigate(`/invoices/${invoice.id}`);
    } catch (err: any) {
      alert(err.message || t('proposals.convert_failed'));
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{proposal.title}</h1>
          <span
            style={{
              marginTop: 8,
              display: 'inline-block',
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 999,
              background:
                proposal.status === ProposalStatus.ACCEPTED
                  ? 'var(--success-bg)'
                  : proposal.status === ProposalStatus.REJECTED
                    ? 'var(--danger-bg)'
                    : proposal.status === ProposalStatus.SENT
                      ? 'var(--info-bg)'
                      : 'var(--surface)',
              color:
                proposal.status === ProposalStatus.ACCEPTED
                  ? 'var(--success)'
                  : proposal.status === ProposalStatus.REJECTED
                    ? 'var(--danger)'
                    : proposal.status === ProposalStatus.SENT
                      ? 'var(--info)'
                      : 'var(--text-mid)',
              border:
                proposal.status === ProposalStatus.ACCEPTED
                  ? '1px solid var(--success)'
                  : proposal.status === ProposalStatus.REJECTED
                    ? '1px solid var(--danger)'
                    : proposal.status === ProposalStatus.SENT
                      ? '1px solid var(--info)'
                      : '1px solid var(--border)',
            }}
          >
            {proposal.status}
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadPDF}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 999,
              border: '1px solid var(--accent)',
              background: 'var(--accent-bg)',
              color: 'var(--accent)',
              padding: '8px 16px',
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '.06em',
            }}
          >
            {t('common.download_pdf')}
          </button>
          <button
            onClick={() => navigate(`/proposals/${proposal.id}/edit`)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 999,
              border: '1px solid var(--accent)',
              background: 'transparent',
              color: 'var(--accent)',
              padding: '8px 16px',
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '.06em',
            }}
          >
            {t('common.edit')}
          </button>
          <button
            onClick={() => navigate('/proposals')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 999,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
              padding: '8px 16px',
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '.06em',
            }}
          >
            {t('common.back_to_list')}
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, marginBottom: 16 }}>
        <div className="space-y-4">
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)' }}>{t('common.project')}</h3>
            <p style={{ marginTop: 4, color: 'var(--text)' }}>{proposal.project?.title || '—'}</p>
          </div>
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)' }}>{t('common.amount')}</h3>
            <p style={{ marginTop: 4, fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>{formatCurrency(Number(proposal.amount))}</p>
          </div>
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)' }}>{t('common.valid_until')}</h3>
            <p style={{ marginTop: 4, color: 'var(--text)' }}>{formatDate(proposal.validUntil)}</p>
          </div>
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)' }}>{t('common.notes')}</h3>
            <p style={{ marginTop: 4, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{proposal.notes || '—'}</p>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text)' }}>{t('common.actions')}</h2>
        <div className="flex gap-3 flex-wrap items-center">
          <select
            value={proposal.status}
            onChange={(e) => handleStatusChange(e.target.value as ProposalStatus)}
            style={{
              padding: '10px 14px',
              border: '1px solid var(--border)',
              borderRadius: 8,
              background: 'var(--surface)',
              color: 'var(--text)',
              outline: 'none',
            }}
          >
            {Object.values(ProposalStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            onClick={handleConvertToInvoice}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 999,
              border: '1px solid var(--info)',
              background: 'var(--info-bg)',
              color: 'var(--info)',
              padding: '8px 16px',
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '.06em',
            }}
          >
            {t('common.convert_to_invoice')}
          </button>
        </div>
      </div>
    </div>
  );
};

