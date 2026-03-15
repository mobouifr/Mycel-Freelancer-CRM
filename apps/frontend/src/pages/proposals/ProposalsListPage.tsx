// Proposals list page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProposals } from '../../hooks/useProposals';
import { Proposal, ProposalStatus } from '../../types/proposal.types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const ProposalsListPage = () => {
  const navigate = useNavigate();
  const { proposals, loading, error, deleteProposal } = useProposals();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'ALL'>('ALL');

  const filteredProposals = proposals.filter((proposal) => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || proposal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (proposal: Proposal) => {
    if (window.confirm(`Are you sure you want to delete "${proposal.title}"?`)) {
      try {
        await deleteProposal(proposal.id);
      } catch (err) {
        alert('Failed to delete proposal');
      }
    }
  };

  const getStatusColor = (status: ProposalStatus) => {
    switch (status) {
      case ProposalStatus.DRAFT:
        return 'bg-gray-100 text-gray-800';
      case ProposalStatus.SENT:
        return 'bg-blue-100 text-blue-800';
      case ProposalStatus.ACCEPTED:
        return 'bg-green-100 text-green-800';
      case ProposalStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading proposals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Proposals</h1>
        <button
          onClick={() => navigate('/proposals/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + New Proposal
        </button>
      </div>

      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search proposals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ProposalStatus | 'ALL')}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Statuses</option>
          {Object.values(ProposalStatus).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredProposals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No proposals found.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid Until</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProposals.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{proposal.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{proposal.project?.title || '—'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(proposal.status)}`}>
                      {proposal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{formatCurrency(Number(proposal.amount))}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{formatDate(proposal.validUntil)}</div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => navigate(`/proposals/${proposal.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/proposals/${proposal.id}/edit`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(proposal)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

