import { useNavigate } from 'react-router-dom';
import { StatCard, AreaChart, Button } from '../components';
import type { RecentActivity } from '../types';

/* ─────────────────────────────────────────────
   DASHBOARD PAGE — Overview with stats, chart,
   balance widget, and recent activity table
───────────────────────────────────────────── */

// ── Mock data (replace with API calls later) ─
const CHART_DATA = [12, 19, 8, 25, 18, 31, 24, 38, 29, 44, 35, 52];

const RECENT: RecentActivity[] = [
  { type: 'Invoice',  client: 'Arca Studio',  amount: '$3,200', status: 'Paid',    date: 'Feb 28' },
  { type: 'Proposal', client: 'Noma Labs',    amount: '$8,500', status: 'Sent',    date: 'Feb 26' },
  { type: 'Invoice',  client: 'Pixel Root',   amount: '$1,800', status: 'Overdue', date: 'Feb 20' },
  { type: 'Proposal', client: 'Drift Co.',    amount: '$5,000', status: 'Draft',   date: 'Feb 18' },
  { type: 'Invoice',  client: 'Vault Studio', amount: '$2,400', status: 'Paid',    date: 'Feb 15' },
];

const STATUS_COLOR: Record<string, string> = {
  Paid:    'rgba(72,200,100,0.75)',
  Sent:    'rgba(200,200,200,0.5)',
  Overdue: 'rgba(220,80,80,0.7)',
  Draft:   'rgba(150,150,150,0.4)',
};

export default function Dashboard() {
  const navigate = useNavigate();

  /** Generate & download CSV from recent activity data */
  const exportCSV = () => {
    const headers = ['Type', 'Client', 'Amount', 'Status', 'Date'];
    const rows = RECENT.map((r) => [r.type, r.client, r.amount, r.status, r.date]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mycel-activity-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        animation: 'fadeUp .3s var(--ease) both',
      }}
    >
      {/* ── Header row ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-d)',
              fontWeight: 700,
              fontSize: 26,
              color: 'var(--white)',
              letterSpacing: '-.01em',
              marginBottom: 4,
            }}
          >
            Overview
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-m)',
              fontSize: 11,
              color: 'var(--text-dim)',
              letterSpacing: '.04em',
            }}
          >
            March 2026 — your freelance network
          </p>
        </div>
        <Button variant="secondary" size="md" onClick={exportCSV}>
          Export CSV <span style={{ opacity: 0.5 }}>↓</span>
        </Button>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <StatCard label="Net Revenue"       value="$24.5k"  sub="12% from last month" trend="up"   href="/invoices" />
        <StatCard label="Active Clients"    value="18"       sub="3 new this month"    trend="up"   href="/clients" />
        <StatCard label="Pending Invoices"  value="$8.2k"   sub="2 overdue"            trend="down" href="/invoices" />
      </div>

      {/* ── Mid row: chart + balance ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14 }}>
        {/* Revenue chart */}
        <div
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '22px 24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-m)',
                  fontSize: 10,
                  color: 'var(--text-dim)',
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                Revenue Flow
              </p>
              <p style={{ fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)' }}>
                4× increase vs last quarter
              </p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['Max', 'Compare'].map((t, i) => (
                <button
                  key={t}
                  style={{
                    background: i === 1 ? 'rgba(72,200,100,.08)' : 'none',
                    border: `1px solid ${i === 1 ? 'rgba(72,200,100,.22)' : 'var(--border)'}`,
                    borderRadius: 5,
                    padding: '5px 10px',
                    color: i === 1 ? 'rgba(72,200,100,.8)' : 'var(--text-dim)',
                    fontFamily: 'var(--font-m)',
                    fontSize: 10,
                    letterSpacing: '.06em',
                    cursor: 'pointer',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <AreaChart data={CHART_DATA} />

          {/* X axis labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            {['Jan', 'Feb', 'Mar', 'Apr'].map((m) => (
              <span
                key={m}
                style={{
                  fontFamily: 'var(--font-m)',
                  fontSize: 9,
                  color: 'var(--text-dim)',
                  letterSpacing: '.06em',
                }}
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Balance card */}
        <div
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p
              style={{
                fontFamily: 'var(--font-m)',
                fontSize: 10,
                color: 'var(--text-dim)',
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Your Balance
            </p>
            <p
              style={{
                fontFamily: 'var(--font-m)',
                fontSize: 10,
                color: 'var(--text-dim)',
                marginBottom: 16,
              }}
            >
              total across all invoices
            </p>
            <p
              style={{
                fontFamily: 'var(--font-d)',
                fontWeight: 700,
                fontSize: 34,
                color: 'var(--white)',
                letterSpacing: '-.02em',
              }}
            >
              $101.4k
              <span
                style={{
                  fontSize: 14,
                  fontFamily: 'var(--font-m)',
                  color: 'var(--text-dim)',
                  marginLeft: 6,
                  letterSpacing: '.04em',
                }}
              >
                USD
              </span>
            </p>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,.03)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '14px 16px',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'Clients', val: '24', trend: 'down' as const, pct: '−3.8%', href: '/clients' },
                { label: 'Income',  val: '256k', trend: 'up' as const,  pct: '+37.8%', href: '/invoices' },
              ].map((d) => (
                <div
                  key={d.label}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(d.href)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(d.href);
                    }
                  }}
                  style={{ cursor: 'pointer', borderRadius: 4, padding: 4, transition: 'background .15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-m)',
                      fontSize: 9,
                      color: 'var(--text-dim)',
                      letterSpacing: '.1em',
                      textTransform: 'uppercase',
                      marginBottom: 4,
                    }}
                  >
                    {d.label}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-d)',
                      fontSize: 22,
                      fontWeight: 700,
                      color: 'var(--white)',
                      marginBottom: 2,
                    }}
                  >
                    {d.val}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-m)',
                      fontSize: 9,
                      color: d.trend === 'up' ? 'rgba(72,200,100,.75)' : 'var(--danger)',
                    }}
                  >
                    {d.pct}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent activity table ── */}
      <div
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-m)',
              fontSize: 10,
              color: 'var(--text-mid)',
              letterSpacing: '.1em',
              textTransform: 'uppercase',
            }}
          >
            Recent Activity
          </p>
          <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')}>
            View all →
          </Button>
        </div>

        {RECENT.map((r, i) => (
          <div
            key={i}
            role="button"
            tabIndex={0}
            onClick={() => navigate(r.type === 'Invoice' ? '/invoices' : '/proposals')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(r.type === 'Invoice' ? '/invoices' : '/proposals');
              }
            }}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr',
              padding: '13px 24px',
              borderBottom: i < RECENT.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              alignItems: 'center',
              transition: 'background .15s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-m)',
                fontSize: 9,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: r.type === 'Invoice' ? 'rgba(200,200,200,.5)' : 'rgba(200,200,200,.35)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: '3px 8px',
                width: 'fit-content',
              }}
            >
              {r.type}
            </span>
            <span style={{ fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--text)' }}>
              {r.client}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-d)',
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--white)',
              }}
            >
              {r.amount}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-m)',
                fontSize: 9,
                letterSpacing: '.08em',
                color: STATUS_COLOR[r.status] || 'var(--text-dim)',
              }}
            >
              ● {r.status}
            </span>
            <span style={{ fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)' }}>
              {r.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}