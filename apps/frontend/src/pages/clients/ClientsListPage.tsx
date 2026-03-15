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
      <div className="p-6">
        <div className="text-center py-8">Loading clients...</div>
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
        <h1 className="text-2xl font-bold">Clients</h1>
        <button
          onClick={() => navigate('/clients/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + New Client
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search clients by name, email, or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow">
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

