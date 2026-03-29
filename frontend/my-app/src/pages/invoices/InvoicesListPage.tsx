// Invoices list page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoices } from '../../hooks/useInvoices';
import { type Invoice, InvoiceStatus } from '../../types/invoice.types';
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
      <div style={{ padding: '24px' }}>
        <div style={{ textAlign: 'center', padding: '32px 0' }}>Loading invoices...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <div
          style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: '8px',
          }}
        >
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '32px',
        backgroundColor: '#060606',
        minHeight: '100vh',
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}
      >
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: 'var(--text)',
            margin: 0,
          }}
        >
          Invoices
        </h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Search invoices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px 16px 10px 40px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '14px',
                width: '260px',
                fontFamily: 'var(--font-m)',
                backgroundColor: 'var(--surface)',
                color: 'var(--text)',
                outline: 'none',
              }}
            />
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '16px',
              }}
            >
              🔍
            </span>
          </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'ALL')}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text)',
              fontFamily: 'var(--font-m)',
              fontSize: '13px',
              outline: 'none',
            }}
        >
          <option value="ALL">All Statuses</option>
          {Object.values(InvoiceStatus).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
          <button
            onClick={() => navigate('/invoices/new')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#22c55e',
              color: '#050505',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'var(--font-m)',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#16a34a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#22c55e';
            }}
          >
            + New Invoice
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <div
        style={{
          backgroundColor: '#0e0e0e',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          padding: '24px',
        }}
      >
        {/* Table */}
        {filteredInvoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-dim)' }}>
            <p>No invoices found.</p>
          </div>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--font-m)',
                    letterSpacing: '0.05em',
                  }}
                >
                  PROJECT
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--font-m)',
                    letterSpacing: '0.05em',
                  }}
                >
                  STATUS
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--font-m)',
                    letterSpacing: '0.05em',
                  }}
                >
                  AMOUNT
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--font-m)',
                    letterSpacing: '0.05em',
                  }}
                >
                  DUE DATE
                </th>
                <th
                  style={{
                    textAlign: 'right',
                    padding: '12px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--font-m)',
                    letterSpacing: '0.05em',
                  }}
                >
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice, index) => (
                <tr
                  key={invoice.id}
                  style={{
                    borderTop: index > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}
                >
                  <td style={{ padding: '16px' }}>
                    <div
                      style={{
                        fontWeight: 500,
                        fontSize: '13px',
                        color: 'var(--text)',
                        fontFamily: 'var(--font-m)',
                      }}
                    >
                      {invoice.project?.title || '—'}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <InvoiceStatusBadge status={invoice.status} />
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--text)',
                        fontFamily: 'var(--font-m)',
                      }}
                    >
                      {formatCurrency(Number(invoice.amount))}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--text)',
                        fontFamily: 'var(--font-m)',
                      }}
                    >
                      {formatDate(invoice.dueDate)}
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-dim)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-m)',
                          fontSize: 10,
                          padding: '6px 12px',
                          borderRadius: 999,
                          letterSpacing: '.06em',
                          textTransform: 'uppercase',
                          transition: 'all .15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--text)';
                          e.currentTarget.style.borderColor = 'var(--border-h)';
                          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-dim)';
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                        style={{
                          background: 'var(--accent-bg)',
                          border: '1px solid var(--accent-hover)',
                          color: 'var(--accent)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-m)',
                          fontSize: 10,
                          padding: '6px 12px',
                          borderRadius: 999,
                          letterSpacing: '.06em',
                          textTransform: 'uppercase',
                          transition: 'all .15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--accent)';
                          e.currentTarget.style.color = '#050505';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--accent-bg)';
                          e.currentTarget.style.color = 'var(--accent)';
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(invoice)}
                        style={{
                          background: 'rgba(230, 90, 90, 0.08)',
                          border: '1px solid rgba(230, 90, 90, 0.35)',
                          color: 'var(--danger)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-m)',
                          fontSize: 10,
                          padding: '6px 12px',
                          borderRadius: 999,
                          letterSpacing: '.06em',
                          textTransform: 'uppercase',
                          transition: 'all .15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--danger)';
                          e.currentTarget.style.color = '#050505';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(230, 90, 90, 0.08)';
                          e.currentTarget.style.color = 'var(--danger)';
                        }}
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

