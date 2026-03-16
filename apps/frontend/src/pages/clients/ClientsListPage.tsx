// Clients list page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients } from '../../hooks/useClients';
import { ClientTable } from '../../components/clients/ClientTable';
import { Client } from '../../types/client.types';

export const ClientsListPage = () => {
  const navigate = useNavigate();
  const { clients, loading, error, deleteClient } = useClients();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (client: Client) => {
    if (window.confirm(`Are you sure you want to delete ${client.name}?`)) {
      try {
        await deleteClient(client.id);
      } catch (err) {
        alert('Failed to delete client');
      }
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: '28px 32px',
          animation: 'fadeUp .3s var(--ease) both',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '40px 0',
            fontFamily: 'var(--font-m)',
            fontSize: 12,
            color: 'var(--text-dim)',
          }}
        >
          Loading clients...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '28px 32px',
          animation: 'fadeUp .3s var(--ease) both',
        }}
      >
        <div
          style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            borderRadius: 8,
            padding: '12px 16px',
            fontFamily: 'var(--font-m)',
            fontSize: 12,
          }}
        >
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '28px 32px',
        animation: 'fadeUp .3s var(--ease) both',
      }}
    >
      {/* Header */}
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
            Clients
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-m)',
              fontSize: 11,
              color: 'var(--text-dim)',
              letterSpacing: '.04em',
            }}
          >
            Manage your client relationships
          </p>
        </div>
        <button
          onClick={() => navigate('/clients/new')}
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
            e.currentTarget.style.background = 'var(--accent-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--accent)';
          }}
        >
          + New Client
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search clients by name, email, or company..."
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

      {/* Table container */}
      <div
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <ClientTable
          clients={filteredClients}
          onView={(client) => navigate(`/clients/${client.id}`)}
          onEdit={(client) => navigate(`/clients/${client.id}/edit`)}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

