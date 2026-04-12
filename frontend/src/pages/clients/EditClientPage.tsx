// Edit client page
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clientsService } from '../../services/data.service';
import { ClientForm } from '../../components/clients/ClientForm';
import { type ClientFormData } from '../../utils/validation';
import { type Client } from '../../types/client.types';
import { type ApiError } from '../../types/common.types';
import Modal from '../../components/Modal';
import { useStore } from '../../hooks/useStore';

export const EditClientPage = () => {
  const { t } = useTranslation();
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
        setError(apiError.message || t('clients.load_failed'));
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
        title: t('clients.updated'),
        message: `"${updatedClient.name}" was updated.`,
      });
      navigate('/clients');
    } catch (err: any) {
      alert(err.message || t('clients.update_failed'));
    } finally {
      setIsSaving(false);
    }
  };

  const body = loading ? (
    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-mid)', fontFamily: 'var(--font-m)', fontSize: 12 }}>
      {t('clients.detail_loading')}
    </div>
  ) : error || !client ? (
    <div style={{
      background: 'rgba(230,90,90,0.08)',
      border: '1px solid rgba(230,90,90,0.35)',
      color: 'var(--danger)',
      padding: '12px 16px',
      borderRadius: 6,
      fontFamily: 'var(--font-m)',
      fontSize: 11,
    }}>
      {error || t('clients.not_found')}
    </div>
  ) : (
    <ClientForm
      client={client}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/clients')}
      isLoading={isSaving}
    />
  );

  return (
    <Modal isOpen onClose={() => navigate('/clients')} title={t('clients.edit_title')} width={520}>
      {body}
    </Modal>
  );
};
