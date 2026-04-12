// Create client page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useClients } from '../../hooks/useClients';
import { ClientForm } from '../../components/clients/ClientForm';
import { type ClientFormData } from '../../utils/validation';
import Modal from '../../components/Modal';

export const CreateClientPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createClient } = useClients();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ClientFormData) => {
    setIsLoading(true);
    try {
      await createClient(data);
      navigate('/clients');
    } catch (err: any) {
      alert(err.message || t('clients.create_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={() => navigate('/clients')} title={t('clients.create_title')} width={520}>
      <ClientForm onSubmit={handleSubmit} onCancel={() => navigate('/clients')} isLoading={isLoading} />
    </Modal>
  );
};
