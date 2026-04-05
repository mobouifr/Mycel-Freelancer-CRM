// Proposals list page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProposals } from '../../hooks/useProposals';
import { type Proposal, ProposalStatus } from '../../types/proposal.types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const ProposalsListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { proposals, loading, error, deleteProposal } = useProposals();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'ALL'>('ALL');

  const filteredProposals = proposals.filter((proposal) => {
    const matchesSearch =
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.project?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || proposal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (proposal: Proposal) => {
    if (window.confirm(t('proposals.deleteConfirm', { title: proposal.title }))) {
      try {
        await deleteProposal(proposal.id);
      } catch (err) {
        alert(t('proposals.deleteFailed'));
      }
    }
  };

  const getStatusStyle = (status: ProposalStatus): React.CSSProperties => {
    switch (status) {
      case ProposalStatus.DRAFT:
        return {
          backgroundColor: 'rgba(255,255,255,0.1)',
          color: 'var(--text-mid)',
          border: '1px solid var(--border)',
        };
      case ProposalStatus.SENT:
        return {
          backgroundColor: 'rgba(80, 160, 240, 0.15)',
          color: 'var(--info)',
          border: '1px solid rgba(80, 160, 240, 0.3)',
        };
      case ProposalStatus.ACCEPTED:
        return {
          backgroundColor: 'var(--accent-bg)',
          color: 'var(--accent)',
          border: '1px solid var(--accent-hover)',
        };
      case ProposalStatus.REJECTED:
        return {
          backgroundColor: 'rgba(230, 90, 90, 0.15)',
          color: 'var(--danger)',
          border: '1px solid rgba(230, 90, 90, 0.3)',
        };
      default:
        return {
          backgroundColor: 'rgba(255,255,255,0.1)',
          color: 'var(--text-mid)',
          border: '1px solid var(--border)',
        };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text)' }}>{t('proposals.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <div
          style={{
            backgroundColor: 'rgba(230, 90, 90, 0.15)',
            border: '1px solid rgba(230, 90, 90, 0.3)',
            color: 'var(--danger)',
            padding: '12px 16px',
            borderRadius: '8px',
          }}
        >
          {t('common.errorPrefix')}: {error}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '32px',
        backgroundColor: 'var(--bg)',
        minHeight: '100vh',
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-d)',
              fontWeight: 500,
              fontSize: 26,
              color: 'var(--text)',
              letterSpacing: '.06em',
              lineHeight: 1.3,
              marginBottom: 4,
            }}
          >
            {t('proposals.listTitle')}
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-m)',
              fontSize: 11,
              color: 'var(--text-dim)',
              letterSpacing: '.04em',
            }}
          >
            {t('proposals.listSubtitle')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProposalStatus | 'ALL')}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text)',
              fontFamily: 'var(--font-m)',
              fontSize: '13px',
              outline: 'none',
            }}
          >
            <option value="ALL">All Statuses</option>
            {Object.values(ProposalStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            onClick={() => navigate('/proposals/new')}
            style={{
              padding: '10px 20px',
              borderRadius: 6,
              border: 'none',
              background: 'var(--accent)',
              color: 'var(--white)',
              fontFamily: 'var(--font-m)',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '.06em',
              cursor: 'pointer',
              transition: 'background .2s var(--ease), transform .1s var(--ease)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent)';
            }}
          >
            {t('proposals.newProposal')}
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder={t('proposals.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: 420,
            padding: '10px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--surface-2)',
            color: 'var(--text)',
            fontFamily: 'var(--font-m)',
            fontSize: 12,
            outline: 'none',
          }}
        />
      </div>

      {/* Main Content Container */}
      <div
        style={{
          backgroundColor: 'var(--surface-2)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          padding: '24px',
        }}
      >
        {/* Table */}
        {filteredProposals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-dim)' }}>
            <p>No proposals found.</p>
          </div>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--font-m)',
                    letterSpacing: '0.05em',
                  }}
                >
                  TITLE
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--font-m)',
                    letterSpacing: '0.05em',
                  }}
                >
                  PROJECT
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--font-m)',
                    letterSpacing: '0.05em',
                  }}
                >
                  STATUS
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--font-m)',
                    letterSpacing: '0.05em',
                  }}
                >
                  AMOUNT
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--font-m)',
                    letterSpacing: '0.05em',
                  }}
                >
                  VALID UNTIL
                </th>
                <th
                  style={{
                    textAlign: 'right',
                    padding: '12px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--font-m)',
                    letterSpacing: '0.05em',
                  }}
                >
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProposals.map((proposal, index) => (
                <tr
                  key={proposal.id}
                  style={{
                    borderTop: index > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}
                >
                  <td style={{ padding: '16px' }}>
                    <div
                      style={{
                        fontWeight: 500,
                        fontSize: '13px',
                        color: 'var(--text)',
                        fontFamily: 'var(--font-m)',
                      }}
                    >
                      {proposal.title}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--text)',
                        fontFamily: 'var(--font-m)',
                      }}
                    >
                      {proposal.project?.title || '—'}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span
                      style={{
                        ...getStatusStyle(proposal.status),
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-m)',
                        display: 'inline-block',
                      }}
                    >
                      {proposal.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--text)',
                        fontFamily: 'var(--font-m)',
                      }}
                    >
                      {formatCurrency(Number(proposal.amount))}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--text)',
                        fontFamily: 'var(--font-m)',
                      }}
                    >
                      {formatDate(proposal.validUntil)}
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => navigate(`/proposals/${proposal.id}`)}
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-mid)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-m)',
                          fontSize: 10,
                          padding: '6px 12px',
                          borderRadius: 999,
                          letterSpacing: '.06em',
                          textTransform: 'uppercase',
                          transition: 'all .15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--text)';
                          e.currentTarget.style.borderColor = 'var(--border-h)';
                          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-mid)';
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/proposals/${proposal.id}/edit`)}
                        style={{
                          background: 'var(--accent-bg)',
                          border: '1px solid var(--accent-hover)',
                          color: 'var(--accent)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-m)',
                          fontSize: 10,
                          padding: '6px 12px',
                          borderRadius: 999,
                          letterSpacing: '.06em',
                          textTransform: 'uppercase',
                          transition: 'all .15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--accent)';
                          e.currentTarget.style.color = 'var(--bg)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--accent-bg)';
                          e.currentTarget.style.color = 'var(--accent)';
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(proposal)}
                        style={{
                          background: 'var(--danger-bg)',
                          border: '1px solid var(--danger)',
                          color: 'var(--danger)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-m)',
                          fontSize: 10,
                          padding: '6px 12px',
                          borderRadius: 999,
                          letterSpacing: '.06em',
                          textTransform: 'uppercase',
                          transition: 'all .15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--danger)';
                          e.currentTarget.style.color = 'var(--bg)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--danger-bg)';
                          e.currentTarget.style.color = 'var(--danger)';
                        }}
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

