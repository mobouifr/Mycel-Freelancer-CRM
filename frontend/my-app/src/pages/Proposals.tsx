import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, StatusBadge } from '../components';

/* ─────────────────────────────────────────────
   PROPOSALS — List page with table
───────────────────────────────────────────── */

interface Proposal {
  id: string;
  proposalNumber: string;
  clientName: string;
  total: number;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';
  createdAt: string;
}

export default function Proposals() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('proposals');
      if (stored) {
        setProposals(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load proposals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const columns = [
    {
      key: 'number',
      header: 'Number',
      width: '1.5fr',
      render: (row: Proposal) => (
        <span style={{ fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>
          {row.proposalNumber}
        </span>
      ),
    },
    {
      key: 'client',
      header: 'Client',
      width: '2fr',
      render: (row: Proposal) => (
        <span style={{ fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--text-mid)' }}>
          {row.clientName || '—'}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      width: '1.5fr',
      render: (row: Proposal) => (
        <span style={{ fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>
          {formatCurrency(row.total)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '1fr',
      render: (row: Proposal) => <StatusBadge status={row.status} />,
    },
    {
      key: 'date',
      header: 'Date',
      width: '1fr',
      render: (row: Proposal) => (
        <span style={{ fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--text-mid)' }}>
          {formatDate(row.createdAt)}
        </span>
      ),
    },
  ];

  const handleRowClick = (proposal: Proposal) => {
    navigate(`/proposals/${proposal.id}`);
  };

  return (
    <div style={{ animation: 'fadeUp .3s var(--ease) both' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2
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
            Proposals
          </h2>
          <p style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '.04em' }}>
            Create and manage client proposals
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/proposals/new')}
        >
          + New Proposal
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--text-dim)' }}>
            Loading...
          </p>
        </div>
      ) : (
        <Table
          columns={columns}
          data={proposals}
          onRowClick={handleRowClick}
          emptyMessage="No proposals yet. Create your first proposal to get started."
        />
      )}
    </div>
  );
}
