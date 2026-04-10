import RevenueChart from '../RevenueChart';
import { useTranslation } from 'react-i18next';
import { setWidgetComponent } from './WidgetRegistry';
import { useState, useEffect } from 'react';
import api from '../../services/api';

/* ─────────────────────────────────────────────
   REVENUE KPI — Big headline number, trend
   indicator, and a compact sparkline chart
───────────────────────────────────────────── */

function RevenueKPI() {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState({
    chartData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    currentRevenue: 0,
    previousRevenue: 0,
    projectsDone: 0
  });

  useEffect(() => {
    let isTerminated = false;
    api.get('/dashboard/revenue?timeframe=monthly')
      .then(res => {
        if (!isTerminated && res.data) {
          setDashboardData(res.data);
        }
      })
      .catch(console.error);
    return () => { isTerminated = true; };
  }, []);

  const MONTHLY_REVENUE = dashboardData.chartData;
  const LABELS = dashboardData.labels;
  const CURRENT_REVENUE = dashboardData.currentRevenue;
  const PREVIOUS_REVENUE = dashboardData.previousRevenue;
  
  // Prevent division by zero if there was no previous revenue
  const TREND_PCT = PREVIOUS_REVENUE === 0 
    ? (CURRENT_REVENUE > 0 ? 100 : 0) 
    : Math.round(((CURRENT_REVENUE - PREVIOUS_REVENUE) / PREVIOUS_REVENUE) * 100);

  const isUp = TREND_PCT >= 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 4 }}>
      {/* KPI Row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 0 8px' }}>
        <div>
          <p className="kpi-num" style={{
            fontFamily: 'var(--font-d)', fontWeight: 500, fontSize: 28,
            color: 'var(--text)', letterSpacing: '.04em', lineHeight: 1.3,
          }}>
            ${(CURRENT_REVENUE / 1000).toFixed(1)}k
          </p>
          <p style={{
            fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)',
            letterSpacing: '.04em', marginTop: 4,
          }}>
            {t('revenue.net_revenue')}
          </p>
        </div>

        {/* Trend badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 3,
          padding: '3px 8px', borderRadius: 4,
          background: isUp ? 'var(--success-bg)' : 'var(--danger-bg)',
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isUp ? 'var(--trend-up)' : 'var(--trend-down)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {isUp
              ? <path d="M7 17l5-5 5 5M7 7l5 5 5-5" />
              : <path d="M7 7l5 5 5-5M7 17l5-5 5 5" />
            }
          </svg>
          <span style={{
            fontFamily: 'var(--font-m)', fontSize: 10, fontWeight: 600,
            color: isUp ? 'var(--trend-up)' : 'var(--trend-down)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {isUp ? '+' : ''}{TREND_PCT}%
          </span>
        </div>
      </div>

      {/* Mini stat pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
        {[
          { label: t('revenue.avg_month'), value: `$${Math.round(MONTHLY_REVENUE.reduce((a, b) => a + Number(b), 0) / (MONTHLY_REVENUE.length || 1))}k` },
          { label: t('revenue.best_month'), value: `$${Math.max(...MONTHLY_REVENUE, 0)}k` },
          { label: t('revenue.projects_done'), value: dashboardData.projectsDone.toString() },
        ].map((s) => (
          <div key={s.label} style={{
            flex: 1,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 5,
            padding: '6px 8px',
            textAlign: 'center',
          }}>
            <p style={{
              fontFamily: 'var(--font-d)', fontWeight: 500, fontSize: 13,
              color: 'var(--text)', lineHeight: 1.4,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {s.value}
            </p>
            <p style={{
              fontFamily: 'var(--font-m)', fontSize: 8, color: 'var(--text-dim)',
              letterSpacing: '.06em',
            }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Sparkline chart */}
      <div style={{ flex: 1, minHeight: 60 }}>
        <RevenueChart data={MONTHLY_REVENUE} labels={LABELS} height={100} />
      </div>
    </div>
  );
}

setWidgetComponent('revenue', RevenueKPI);

export default RevenueKPI;
