// Proposal detail page
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { proposalsService } from '../../services/data.service';
import { type Proposal, ProposalStatus } from '../../types/proposal.types';
import { type ApiError } from '../../types/common.types';
import { formatDate, formatCurrency } from '../../utils/formatters';

export const ProposalDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
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
        setError(apiError.message || 'Failed to load proposal');
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
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
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
      alert(err.message || 'Failed to generate PDF');
    }
  };

  const handleConvertToInvoice = async () => {
    if (!id) return;
    const dueDate = prompt('Enter due date (YYYY-MM-DD):');
    if (!dueDate) return;
    try {
      const invoice = await proposalsService.convertToInvoice(id, dueDate);
      navigate(`/invoices/${invoice.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to convert to invoice');
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{proposal.title}</h1>
          <span className={`mt-2 inline-block px-2 py-1 text-xs font-semibold rounded-full ${
            proposal.status === ProposalStatus.ACCEPTED
              ? 'bg-green-100 text-green-800'
              : proposal.status === ProposalStatus.REJECTED
              ? 'bg-red-100 text-red-800'
              : proposal.status === ProposalStatus.SENT
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {proposal.status}
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center rounded-full border border-emerald-400/70 bg-emerald-500/20 px-4 py-2 text-xs font-medium uppercase tracking-wide text-emerald-100 hover:bg-emerald-400 hover:text-slate-950 transition-colors"
          >
            Download PDF
          </button>
          <button
            onClick={() => navigate(`/proposals/${proposal.id}/edit`)}
            className="inline-flex items-center rounded-full border border-emerald-400/70 bg-transparent px-4 py-2 text-xs font-medium uppercase tracking-wide text-emerald-300 hover:bg-emerald-500/10 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => navigate('/proposals')}
            className="inline-flex items-center rounded-full border border-slate-300/70 bg-slate-800 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-100 hover:bg-slate-700 hover:border-slate-100 transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Project</h3>
            <p className="mt-1">{proposal.project?.title || '—'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Amount</h3>
            <p className="mt-1 text-lg font-semibold">{formatCurrency(Number(proposal.amount))}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Valid Until</h3>
            <p className="mt-1">{formatDate(proposal.validUntil)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Notes</h3>
            <p className="mt-1 whitespace-pre-wrap">{proposal.notes || '—'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Actions</h2>
        <div className="flex gap-3 flex-wrap items-center">
          <select
            value={proposal.status}
            onChange={(e) => handleStatusChange(e.target.value as ProposalStatus)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.values(ProposalStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            onClick={handleConvertToInvoice}
            className="inline-flex items-center rounded-full border border-purple-400/70 bg-purple-500/15 px-4 py-2 text-xs font-medium uppercase tracking-wide text-purple-100 hover:bg-purple-500 hover:text-slate-950 transition-colors"
          >
            Convert to Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

