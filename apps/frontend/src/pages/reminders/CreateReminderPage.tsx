// Create reminder page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReminders } from '../../hooks/useReminders';
import { ReminderForm } from '../../components/reminders/ReminderForm';
import { ReminderFormData } from '../../utils/validation';

export const CreateReminderPage = () => {
  const navigate = useNavigate();
  const { createReminder } = useReminders();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ReminderFormData) => {
    setIsLoading(true);
    try {
      await createReminder(data);
      navigate('/reminders');
    } catch (err: any) {
      alert(err.message || 'Failed to create reminder');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Reminder</h1>
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <ReminderForm onSubmit={handleSubmit} onCancel={() => navigate('/reminders')} isLoading={isLoading} />
      </div>
    </div>
  );
};

