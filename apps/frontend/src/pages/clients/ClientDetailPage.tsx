// Client detail page
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientsService } from '../../services/data.service';
import { Client } from '../../types/client.types';
import { ApiError } from '../../types/common.types';
import { formatDate } from '../../utils/formatters';

export const ClientDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'proposals' | 'invoices'>('overview');

  useEffect(() => {
    const fetchClient = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await clientsService.getById(id);
        setClient(data);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Failed to load client');
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading client...</div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Client not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{client.name}</h1>
          {client.company && <p className="text-gray-600">{client.company}</p>}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/clients/${client.id}/edit`)}
            className="inline-flex items-center rounded-full border border-emerald-400/70 bg-emerald-500/10 px-4 py-2 text-xs font-medium uppercase tracking-wide text-emerald-300 hover:bg-emerald-400 hover:text-slate-950 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => navigate('/clients')}
            className="inline-flex items-center rounded-full border border-slate-300/70 bg-slate-800 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-100 hover:bg-slate-700 hover:border-slate-100 transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {(['overview', 'projects', 'proposals', 'invoices'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1">{client.email || '—'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="mt-1">{client.phone || '—'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Company</h3>
                <p className="mt-1">{client.company || '—'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                <p className="mt-1 whitespace-pre-wrap">{client.notes || '—'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created</h3>
                <p className="mt-1">{formatDate(client.createdAt)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                <p className="mt-1">{formatDate(client.updatedAt)}</p>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <p className="text-gray-500">Projects will be displayed here once the backend endpoint is available.</p>
            </div>
          )}

          {activeTab === 'proposals' && (
            <div>
              <p className="text-gray-500">Proposals will be displayed here once the backend endpoint is available.</p>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div>
              <p className="text-gray-500">Invoices will be displayed here once the backend endpoint is available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

