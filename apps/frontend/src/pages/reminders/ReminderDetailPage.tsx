// Reminder detail page
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { remindersService } from '../../services/data.service';
import { Reminder, ReminderStatus } from '../../types/reminder.types';
import { ApiError } from '../../types/common.types';
import { formatDateTime } from '../../utils/formatters';

export const ReminderDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReminder = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await remindersService.getById(id);
        setReminder(data);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Failed to load reminder');
      } finally {
        setLoading(false);
      }
    };
    fetchReminder();
  }, [id]);

  const handleTrigger = async () => {
    if (!id) return;
    try {
      await remindersService.trigger(id);
      alert('Reminder triggered successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to trigger reminder');
    }
  };

  const handleStatusChange = async (newStatus: ReminderStatus) => {
    if (!id) return;
    try {
      await remindersService.update(id, { status: newStatus });
      if (reminder) {
        setReminder({ ...reminder, status: newStatus });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading reminder...</div>
      </div>
    );
  }

  if (error || !reminder) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Reminder not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{reminder.title}</h1>
          <span className={`mt-2 inline-block px-2 py-1 text-xs font-semibold rounded-full ${
            reminder.status === ReminderStatus.COMPLETED
              ? 'bg-green-100 text-green-800'
              : reminder.status === ReminderStatus.DISMISSED
              ? 'bg-gray-100 text-gray-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {reminder.status}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleTrigger}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Trigger/Send
          </button>
          <button
            onClick={() => navigate('/reminders')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to List
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1 whitespace-pre-wrap">{reminder.description || '—'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Type</h3>
              <p className="mt-1">{reminder.reminderType}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Priority</h3>
              <p className="mt-1">{reminder.priority}</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
            <p className="mt-1">{formatDateTime(reminder.dueDate)}</p>
          </div>
          {reminder.clientId && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Linked Client</h3>
              <p className="mt-1">
                <button
                  onClick={() => navigate(`/clients/${reminder.clientId}`)}
                  className="text-blue-600 hover:text-blue-900 underline"
                >
                  View Client
                </button>
              </p>
            </div>
          )}
          {reminder.invoiceId && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Linked Invoice</h3>
              <p className="mt-1">
                <button
                  onClick={() => navigate(`/invoices/${reminder.invoiceId}`)}
                  className="text-blue-600 hover:text-blue-900 underline"
                >
                  View Invoice
                </button>
              </p>
            </div>
          )}
          {reminder.proposalId && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Linked Proposal</h3>
              <p className="mt-1">
                <button
                  onClick={() => navigate(`/proposals/${reminder.proposalId}`)}
                  className="text-blue-600 hover:text-blue-900 underline"
                >
                  View Proposal
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Actions</h2>
        <div className="flex gap-2 flex-wrap">
          <select
            value={reminder.status}
            onChange={(e) => handleStatusChange(e.target.value as ReminderStatus)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.values(ReminderStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

