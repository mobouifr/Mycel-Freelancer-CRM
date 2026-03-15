// Edit client page
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientsService } from '../../services/data.service';
import { ClientForm } from '../../components/clients/ClientForm';
import { ClientFormData } from '../../utils/validation';
import { Client } from '../../types/client.types';
import { ApiError } from '../../types/common.types';

export const EditClientPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (data: ClientFormData) => {
    if (!id) return;
    setIsSaving(true);
    try {
      await clientsService.update(id, data);
      navigate('/clients');
    } catch (err: any) {
      alert(err.message || 'Failed to update client');
    } finally {
      setIsSaving(false);
    }
  };

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
      <h1 className="text-2xl font-bold mb-6">Edit Client</h1>
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <ClientForm
          client={client}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/clients')}
          isLoading={isSaving}
        />
      </div>
    </div>
  );
};

