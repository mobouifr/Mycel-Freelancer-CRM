// Create client page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients } from '../../hooks/useClients';
import { ClientForm } from '../../components/clients/ClientForm';
import { ClientFormData } from '../../utils/validation';

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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Client</h1>
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <ClientForm onSubmit={handleSubmit} onCancel={() => navigate('/clients')} isLoading={isLoading} />
      </div>
    </div>
  );
};

