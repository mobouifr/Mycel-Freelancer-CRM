// Edit client page
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientsService } from '../../services/data.service';
import { ClientForm } from '../../components/clients/ClientForm';
import { type ClientFormData } from '../../utils/validation';
import { type Client } from '../../types/client.types';
import { type ApiError } from '../../types/common.types';
import CenteredModal from '../../components/modals/CenteredModal';
import { useStore } from '../../hooks/useStore';

export const EditClientPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addNotification } = useStore();
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
      const updatedClient = await clientsService.update(id, data);
      addNotification({
        type: 'info',
        title: 'Client updated',
        message: `"${updatedClient.name}" was updated.`,
      });
      navigate('/clients');
    } catch (err: any) {
      alert(err.message || 'Failed to update client');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <CenteredModal title="Edit Client" onClose={() => navigate('/clients')}>
        <div className="text-center py-8" style={{ color: 'var(--text-mid)' }}>
          Loading client...
        </div>
      </CenteredModal>
    );
  }

  if (error || !client) {
    return (
      <CenteredModal title="Edit Client" onClose={() => navigate('/clients')}>
        <div
          style={{
            background: 'rgba(230, 90, 90, 0.08)',
            border: '1px solid rgba(230, 90, 90, 0.35)',
            color: 'var(--danger)',
            padding: '12px 16px',
            borderRadius: 10,
            fontFamily: 'var(--font-m)',
            fontSize: 12,
            letterSpacing: '.04em',
          }}
        >
          {error || 'Client not found'}
        </div>
      </CenteredModal>
    );
  }

  return (
    <CenteredModal title="Edit Client" onClose={() => navigate('/clients')}>
      <ClientForm
        client={client}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/clients')}
        isLoading={isSaving}
      />
    </CenteredModal>
  );
};

