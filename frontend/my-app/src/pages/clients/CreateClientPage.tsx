// Create client page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients } from '../../hooks/useClients';
import { ClientForm } from '../../components/clients/ClientForm';
import { type ClientFormData } from '../../utils/validation';
import CenteredModal from '../../components/modals/CenteredModal';

export const CreateClientPage = () => {
  const navigate = useNavigate();
  const { createClient } = useClients();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ClientFormData) => {
    setIsLoading(true);
    try {
      await createClient(data);
      navigate('/clients');
    } catch (err: any) {
      alert(err.message || 'Failed to create client');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CenteredModal title="Create New Client" onClose={() => navigate('/clients')}>
      <ClientForm onSubmit={handleSubmit} onCancel={() => navigate('/clients')} isLoading={isLoading} />
    </CenteredModal>
  );
};

