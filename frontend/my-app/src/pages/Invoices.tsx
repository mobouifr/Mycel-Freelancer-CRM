import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, StatusBadge } from '../components';

/* ─────────────────────────────────────────────
   INVOICES — List page with table
───────────────────────────────────────────── */

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  total: number;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  dueDate?: string;
}

export default function Invoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('invoices');
      if (stored) {
        setInvoices(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
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
      render: (row: Invoice) => (
        <span style={{ fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>
          {row.invoiceNumber}
        </span>
      ),
    },
    {
      key: 'client',
      header: 'Client',
      width: '2fr',
      render: (row: Invoice) => (
        <span style={{ fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--text-mid)' }}>
          {row.clientName || '—'}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      width: '1.5fr',
      render: (row: Invoice) => (
        <span style={{ fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>
          {formatCurrency(row.total)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '1fr',
      render: (row: Invoice) => <StatusBadge status={row.status} />,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      width: '1fr',
      render: (row: Invoice) => (
        <span style={{ fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--text-mid)' }}>
          {formatDate(row.dueDate)}
        </span>
      ),
    },
  ];

  const handleRowClick = (invoice: Invoice) => {
    navigate(`/invoices/${invoice.id}`);
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
            Invoices
          </h2>
          <p style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '.04em' }}>
            Track payments and manage billing
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/invoices/new')}
        >
          + New Invoice
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
          data={invoices}
          onRowClick={handleRowClick}
          emptyMessage="No invoices yet. Create your first invoice to get started."
        />
      )}
    </div>
  );
}
