import { useTranslation } from 'react-i18next';
import { setWidgetComponent } from './WidgetRegistry';
import { useState, useEffect } from 'react';
import api from '../../services/api';

/* ─────────────────────────────────────────────
   REVENUE KPI — Headline net revenue on the
   left, three secondary KPI cards on the right.
───────────────────────────────────────────── */

function RevenueKPI() {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState({
    chartData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    currentRevenue: 0,
    previousRevenue: 0,
    projectsDone: 0,
  });

  useEffect(() => {
    let isTerminated = false;
    api.get('/dashboard/revenue?timeframe=monthly')
      .then(res => {
        if (!isTerminated && res.data) setDashboardData(res.data);
      })
      .catch(console.error);
    return () => { isTerminated = true; };
  }, []);

  const MONTHLY_REVENUE = dashboardData.chartData;
  const CURRENT_REVENUE = dashboardData.currentRevenue;
  const PREVIOUS_REVENUE = dashboardData.previousRevenue;

  const TREND_PCT = PREVIOUS_REVENUE === 0
    ? (CURRENT_REVENUE > 0 ? 100 : 0)
    : Math.round(((CURRENT_REVENUE - PREVIOUS_REVENUE) / PREVIOUS_REVENUE) * 100);

  const isUp = TREND_PCT >= 0;

  const avgMonth = Math.round(MONTHLY_REVENUE.reduce((a, b) => a + Number(b), 0) / (MONTHLY_REVENUE.length || 1));
  const bestMonth = Math.max(...MONTHLY_REVENUE, 0);

  const secondaryKpis = [
    { label: t('revenue.avg_month'), value: `$${avgMonth}k` },
    { label: t('revenue.best_month'), value: `$${bestMonth}k` },
    { label: t('revenue.projects_done'), value: dashboardData.projectsDone.toString() },
  ];

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      gap: 14,
      alignItems: 'stretch',
    }}>
      {/* ── Left: Net Revenue headline ── */}
      <div style={{
        flex: '0 0 auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 6,
        paddingRight: 14,
        borderRight: '1px solid var(--border)',
        minWidth: 140,
      }}>
        <p style={{
          fontFamily: 'var(--font-m)', fontSize: 10, fontWeight: 500,
          color: 'var(--text-dim)', letterSpacing: '.06em',
          textTransform: 'uppercase', margin: 0,
        }}>
          {t('revenue.net_revenue')}
        </p>

        <p style={{
          fontFamily: 'var(--font-d)', fontWeight: 700, fontSize: 32,
          color: 'var(--text)', letterSpacing: '.02em',
          lineHeight: 1, margin: 0, fontVariantNumeric: 'tabular-nums',
        }}>
          ${(CURRENT_REVENUE / 1000).toFixed(1)}k
        </p>

        {/* Trend badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            padding: '2px 7px', borderRadius: 4,
            background: isUp ? 'var(--success-bg)' : 'var(--danger-bg)',
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
              stroke={isUp ? 'var(--trend-up)' : 'var(--trend-down)'}
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              {isUp
                ? <polyline points="18 15 12 9 6 15" />
                : <polyline points="6 9 12 15 18 9" />
              }
            </svg>
            <span style={{
              fontFamily: 'var(--font-m)', fontSize: 11, fontWeight: 600,
              color: isUp ? 'var(--trend-up)' : 'var(--trend-down)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {isUp ? '+' : ''}{TREND_PCT}%
            </span>
          </div>
          <span style={{
            fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)',
          }}>
            {t('revenue.vs_last_month', 'vs last month')}
          </span>
        </div>
      </div>

      {/* ── Right: secondary KPI cards ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        justifyContent: 'center',
        minWidth: 0,
      }}>
        {secondaryKpis.map((kpi) => (
          <div key={kpi.label} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 7,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            transition: 'border-color .15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-dim)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <span style={{
              fontFamily: 'var(--font-m)', fontSize: 9, fontWeight: 500,
              color: 'var(--text-dim)', letterSpacing: '.05em',
              textTransform: 'uppercase',
            }}>
              {kpi.label}
            </span>
            <span style={{
              fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 600,
              color: 'var(--text)', fontVariantNumeric: 'tabular-nums',
            }}>
              {kpi.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

setWidgetComponent('revenue', RevenueKPI);

export default RevenueKPI;
