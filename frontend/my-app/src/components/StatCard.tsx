/* ─────────────────────────────────────────────
   STAT CARD — Dashboard metric card
───────────────────────────────────────────── */

import { useNavigate } from 'react-router-dom';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down';
  accent?: boolean;
  /** Route to navigate to when clicking the card or arrow */
  href?: string;
}

export default function StatCard({ label, value, sub, trend, accent, href }: StatCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (href) navigate(href);
  };

  return (
    <div
      role={href ? 'button' : undefined}
      tabIndex={href ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (href && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color .2s, transform .15s var(--ease)',
        cursor: href ? 'pointer' : 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-h)';
        if (href) e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        if (href) e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span
          style={{
            fontFamily: 'var(--font-m)',
            fontSize: 10,
            color: 'var(--text-dim)',
            letterSpacing: '.1em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            color: 'var(--text-dim)',
            cursor: 'pointer',
            transition: 'border-color .15s, color .15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-dim)';
          }}
        >
          ↗
        </div>
      </div>

      <span
        className="kpi-num"
        style={{
          fontFamily: 'var(--font-d)',
          fontWeight: 700,
          fontSize: accent ? 36 : 30,
          color: 'var(--white)',
          letterSpacing: '-.02em',
        }}
      >
        {value}
      </span>

      {sub && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: 10,
              fontFamily: 'var(--font-m)',
              color: trend === 'up' ? 'var(--trend-up)' : trend === 'down' ? 'var(--trend-down)' : 'var(--text-dim)',
              letterSpacing: '.04em',
            }}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'} {sub}
          </span>
        </div>
      )}

      {/* Decorative diagonal thread */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '60%',
          height: '60%',
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <svg width="100%" height="100%" style={{ position: 'absolute', bottom: 0, right: 0 }}>
          <line x1="100%" y1="0" x2="0" y2="100%" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1="100%" y1="20%" x2="20%" y2="100%" stroke="rgba(255,255,255,0.025)" strokeWidth=".7" />
        </svg>
      </div>
    </div>
  );
}
