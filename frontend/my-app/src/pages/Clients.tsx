import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, StatusBadge } from '../components';

/* ─────────────────────────────────────────────
   CLIENTS — List page with table
───────────────────────────────────────────── */

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'active' | 'inactive' | 'archived';
  phone?: string;
}

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load clients from localStorage or API
    try {
      const stored = localStorage.getItem('clients');
      if (stored) {
        setClients(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const columns = [
    {
      key: 'name',
      header: 'Name',
      width: '2fr',
      render: (row: Client) => (
        <span style={{ fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>
          {row.name}
        </span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      width: '2fr',
      render: (row: Client) => (
        <span style={{ fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--text-mid)' }}>
          {row.email || '—'}
        </span>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      width: '2fr',
      render: (row: Client) => (
        <span style={{ fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--text-mid)' }}>
          {row.company || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '1fr',
      render: (row: Client) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: '',
      width: '80px',
      render: (row: Client) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/clients/${row.id}/edit`);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              fontFamily: 'var(--font-m)',
              fontSize: 10,
              padding: '4px 8px',
              transition: 'color .15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; }}
          >
            Edit
          </button>
        </div>
      ),
    },
  ];

  const handleRowClick = (client: Client) => {
    navigate(`/clients/${client.id}`);
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
            Clients
          </h2>
          <p style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '.04em' }}>
            Manage your client relationships
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/clients/new')}
        >
          + New Client
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
          data={clients}
          onRowClick={handleRowClick}
          emptyMessage="No clients yet. Create your first client to get started."
        />
      )}
    </div>
  );
}
