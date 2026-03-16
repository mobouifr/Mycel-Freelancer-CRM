import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';

/* ─────────────────────────────────────────────
   DASHBOARD PAGE — Overview matching my-app UI
   Static/demo data for now, focused on layout.
───────────────────────────────────────────── */

export const DashboardPage = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        animation: 'fadeUp .3s var(--ease) both',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-d)',
              fontWeight: 500,
              fontSize: 26,
              color: 'var(--text)',
              letterSpacing: '.06em',
              lineHeight: 1.3,
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
            High-level snapshot of your clients, projects, proposals and invoices
          </p>
        </div>
        <Button variant="primary" size="md">
          + New Invoice
        </Button>
      </div>

      {/* Metrics row (4 columns, no cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          columnGap: 80,
        }}
      >
        {[
          { label: 'Total Revenue', value: '$101.4K', sub: '+37.8% vs last 30 days', trend: 'up' },
          { label: 'Active Clients', value: '24', sub: '-3.8% vs last 30 days', trend: 'down' },
          { label: 'Open Invoices', value: '8', sub: '$12.4K outstanding', trend: 'up' },
          { label: 'Proposals', value: '12', sub: '4 awaiting response', trend: 'up' },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-m)',
                fontSize: 10,
                color: 'var(--text-dim)',
                letterSpacing: '.1em',
                textTransform: 'uppercase',
              }}
            >
              {card.label}
            </span>
            <span
              className="kpi-num"
              style={{
                fontFamily: 'var(--font-d)',
                fontWeight: 500,
                fontSize: 32,
                color: 'var(--text)',
                letterSpacing: '.04em',
                lineHeight: 1.3,
              }}
            >
              {card.value}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-m)',
                fontSize: 10,
                color: card.trend === 'up' ? 'var(--trend-up)' : 'var(--trend-down)',
                letterSpacing: '.04em',
              }}
            >
              {card.trend === 'up' ? '↑' : '↓'} {card.sub}
            </span>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div
        style={{
          marginTop: 16,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-m)',
            fontSize: 10,
            color: 'var(--text-dim)',
            letterSpacing: '.1em',
            textTransform: 'uppercase',
          }}
        >
          Recent Activity
        </span>

        <div
          style={{
            marginTop: 12,
            display: 'grid',
            rowGap: 6,
          }}
        >
          {[
            {
              title: 'Invoice INV-2024-005 marked as Paid - $3,200',
              status: 'paid',
            },
            {
              title: 'Proposal PROP-2024-012 sent to Arca Studio',
              status: 'sent',
            },
            {
              title: 'New client “Noma Labs” added',
              status: 'active',
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-m)',
                  fontSize: 12,
                  color: 'var(--text)',
                }}
              >
                {item.title}
              </span>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


