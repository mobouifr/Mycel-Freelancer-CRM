// Invoices list page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoices } from '../../hooks/useInvoices';
import { Invoice, InvoiceStatus } from '../../types/invoice.types';
import { InvoiceStatusBadge } from '../../components/invoices/InvoiceStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const InvoicesListPage = () => {
  const navigate = useNavigate();
  const { invoices, loading, error, deleteInvoice } = useInvoices();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'ALL'>('ALL');

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = invoice.project?.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (invoice: Invoice) => {
    if (window.confirm(`Are you sure you want to delete this invoice?`)) {
      try {
        await deleteInvoice(invoice.id);
      } catch (err) {
        alert('Failed to delete invoice');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading invoices...</div>
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
        <h1 className="text-2xl font-bold">Invoices</h1>
        <button
          onClick={() => navigate('/invoices/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + New Invoice
        </button>
      </div>

      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search invoices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'ALL')}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Statuses</option>
          {Object.values(InvoiceStatus).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No invoices found.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{invoice.project?.title || '—'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <InvoiceStatusBadge status={invoice.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{formatCurrency(Number(invoice.amount))}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{formatDate(invoice.dueDate)}</div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(invoice)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

