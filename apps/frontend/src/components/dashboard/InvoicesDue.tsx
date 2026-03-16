import { useNavigate } from 'react-router-dom';
import { setWidgetComponent } from './WidgetRegistry';

/* ─────────────────────────────────────────────
   INVOICES DUE — Unpaid / overdue invoices
   with quick actions (remind, mark paid)
───────────────────────────────────────────── */

interface DueInvoice {
  id: string;
  client: string;
  amount: string;
  dueDate: string;
  status: 'overdue' | 'due-soon' | 'pending';
  daysUntil: number;
}

// Mock data — replace with API
const INVOICES: DueInvoice[] = [
  { id: 'INV-041', client: 'Arca Studio',  amount: '$3,200', dueDate: 'Mar 05', status: 'overdue',  daysUntil: -3 },
  { id: 'INV-042', client: 'Pixel Root',   amount: '$1,800', dueDate: 'Mar 08', status: 'due-soon', daysUntil: 2 },
  { id: 'INV-043', client: 'Noma Labs',    amount: '$8,500', dueDate: 'Mar 12', status: 'pending',  daysUntil: 6 },
  { id: 'INV-044', client: 'Drift Co.',    amount: '$2,100', dueDate: 'Mar 15', status: 'pending',  daysUntil: 9 },
];

const STATUS_STYLE: Record<DueInvoice['status'], { color: string; bg: string; label: string }> = {
  overdue:   { color: 'var(--danger)',  bg: 'var(--danger-bg)',  label: 'Overdue' },
  'due-soon': { color: 'var(--warning, #f59e0b)', bg: 'rgba(245,158,11,.08)', label: 'Due Soon' },
  pending:   { color: 'var(--text-dim)', bg: 'var(--glass)',      label: 'Pending' },
};

function InvoicesDue() {
  const navigate = useNavigate();
  const totalDue = INVOICES.reduce((sum, inv) => {
    const num = Number.parseFloat(inv.amount.replace(/[$,]/g, ''));
    return sum + num;
  }, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Summary bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 0 8px',
          marginBottom: 4,
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div>
          <p
            className="kpi-num"
            style={{
              fontFamily: 'var(--font-d)',
              fontWeight: 500,
              fontSize: 20,
              color: 'var(--text)',
              letterSpacing: '.04em',
              lineHeight: 1.3,
            }}
          >
            ${(totalDue / 1000).toFixed(1)}k
          </p>
          <p
            style={{
              fontFamily: 'var(--font-m)',
              fontSize: 9,
              color: 'var(--text-dim)',
              letterSpacing: '.04em',
            }}
          >
            total outstanding
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            padding: '3px 8px',
            borderRadius: 4,
            background: 'var(--danger-bg)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-m)',
              fontSize: 9,
              fontWeight: 600,
              color: 'var(--danger)',
            }}
          >
            {INVOICES.filter((i) => i.status === 'overdue').length} overdue
          </span>
        </div>
      </div>

      {/* Invoice list */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {INVOICES.map((inv, i) => {
          const s = STATUS_STYLE[inv.status];
          return (
            <div
              key={inv.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate('/invoices')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate('/invoices');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 4px',
                borderBottom: i < INVOICES.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none',
                cursor: 'pointer',
                borderRadius: 4,
                transition: 'background .12s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = 'var(--glass)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = 'transparent';
              }}
            >
              {/* ID + Client */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: 'var(--font-m)',
                    fontSize: 11,
                    color: 'var(--white)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {inv.client}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-m)',
                    fontSize: 9,
                    color: 'var(--text-dim)',
                  }}
                >
                  {inv.id} · Due {inv.dueDate}
                </p>
              </div>

              {/* Amount */}
              <p
                style={{
                  fontFamily: 'var(--font-d)',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--text)',
                  whiteSpace: 'nowrap',
                }}
              >
                {inv.amount}
              </p>

              {/* Status badge */}
              <span
                style={{
                  fontFamily: 'var(--font-m)',
                  fontSize: 8,
                  letterSpacing: '.06em',
                  fontWeight: 500,
                  padding: '2px 7px',
                  borderRadius: 3,
                  background: s.bg,
                  color: s.color,
                  whiteSpace: 'nowrap',
                }}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 8,
          marginTop: 4,
          textAlign: 'center',
        }}
      >
        <button
          onClick={() => navigate('/invoices')}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-m)',
            fontSize: 10,
            color: 'var(--accent)',
            cursor: 'pointer',
            letterSpacing: '.04em',
          }}
        >
          View all invoices →
        </button>
      </div>
    </div>
  );
}

setWidgetComponent('invoices', InvoicesDue);

export default InvoicesDue;


