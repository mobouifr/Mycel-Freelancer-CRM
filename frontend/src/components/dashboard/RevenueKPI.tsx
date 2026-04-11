import { useTranslation } from 'react-i18next';
import { setWidgetComponent } from './WidgetRegistry';
import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

/* ─────────────────────────────────────────────
   REVENUE KPI — Fully responsive: scales font
   sizes, padding, and layout direction based on
   measured container width × height.
───────────────────────────────────────────── */

function RevenueKPI() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(300);
  const [ch, setCh] = useState(120);

  const [dashboardData, setDashboardData] = useState({
    chartData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    currentRevenue: 0,
    previousRevenue: 0,
    projectsDone: 0,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setCw(entry.contentRect.width);
      setCh(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    api.get('/dashboard/revenue?timeframe=monthly')
      .then(res => { if (!cancelled && res.data) setDashboardData(res.data); })
      .catch(console.error);
    return () => { cancelled = true; };
  }, []);

  const MONTHLY_REVENUE  = dashboardData.chartData;
  const CURRENT_REVENUE  = dashboardData.currentRevenue;
  const PREVIOUS_REVENUE = dashboardData.previousRevenue;

  const TREND_PCT = PREVIOUS_REVENUE === 0
    ? (CURRENT_REVENUE > 0 ? 100 : 0)
    : Math.round(((CURRENT_REVENUE - PREVIOUS_REVENUE) / PREVIOUS_REVENUE) * 100);
  const isUp = TREND_PCT >= 0;

  const avgMonth  = Math.round(MONTHLY_REVENUE.reduce((a, b) => a + Number(b), 0) / (MONTHLY_REVENUE.length || 1));
  const bestMonth = Math.max(...MONTHLY_REVENUE, 0);

  const secondaryKpis = [
    { label: t('revenue.avg_month'),    value: `$${avgMonth}k` },
    { label: t('revenue.best_month'),   value: `$${bestMonth}k` },
    { label: t('revenue.projects_done'), value: dashboardData.projectsDone.toString() },
  ];

  /* ── Adaptive layout decisions ── */
  const isNarrow   = cw < 260;            // stack left/right vertically
  const isCompact  = ch < 130;            // very short — hide secondary KPIs
  const isMedium   = ch >= 130 && ch < 180;

  // Main headline font — clamp between 16 and 34
  const mainSize   = Math.max(Math.min(ch * 0.22, 34), 16);
  // Secondary card value font — clamp between 12 and 18
  const secSize    = Math.max(Math.min(ch * 0.11, 18), 12);
  // Card padding shrinks as height shrinks
  const cardPadV   = isMedium ? 5 : 8;
  const cardPadH   = 10;
  const cardGap    = isMedium ? 4 : 8;

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: isNarrow ? 'column' : 'row',
        height: '100%',
        gap: isNarrow ? 8 : 12,
        alignItems: 'stretch',
        overflow: 'hidden',
      }}
    >
      {/* ── Headline: Net Revenue ── */}
      <div style={{
        flex: '0 0 auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 4,
        paddingRight:  isNarrow ? 0 : 12,
        paddingBottom: isNarrow ? 6 : 0,
        borderRight:  isNarrow ? 'none' : '1px solid var(--border)',
        borderBottom: isNarrow ? '1px solid var(--border)' : 'none',
        minWidth: isNarrow ? 'auto' : 110,
        overflow: 'hidden',
      }}>
        <p style={{
          fontFamily: 'var(--font-m)', fontSize: 9, fontWeight: 500,
          color: 'var(--text-dim)', letterSpacing: '.06em',
          textTransform: 'uppercase', margin: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {t('revenue.net_revenue')}
        </p>

        <p style={{
          fontFamily: 'var(--font-d)', fontWeight: 700,
          fontSize: mainSize,
          color: 'var(--text)', letterSpacing: '.02em',
          lineHeight: 1, margin: 0,
          fontVariantNumeric: 'tabular-nums',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          ${(CURRENT_REVENUE / 1000).toFixed(1)}k
        </p>

        {/* Trend badge — hide when too compact */}
        {!isCompact && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'nowrap', overflow: 'hidden' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              padding: '2px 6px', borderRadius: 4, flexShrink: 0,
              background: isUp ? 'var(--success-bg)' : 'var(--danger-bg)',
            }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                stroke={isUp ? 'var(--trend-up)' : 'var(--trend-down)'}
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                {isUp
                  ? <polyline points="18 15 12 9 6 15" />
                  : <polyline points="6 9 12 15 18 9" />
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
            <span style={{
              fontFamily: 'var(--font-m)', fontSize: 8, color: 'var(--text-dim)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {t('revenue.vs_last_month', 'vs last month')}
            </span>
          </div>
        )}
      </div>

      {/* ── Secondary KPI cards — hidden when too short ── */}
      {!isCompact && (
        <div style={{
          flex: 1,
          display: 'flex',
          // When narrow (stacked layout), show cards in a row; otherwise column
          flexDirection: isNarrow ? 'row' : 'column',
          gap: cardGap,
          justifyContent: 'center',
          alignItems: 'stretch',
          minWidth: 0,
          overflow: 'hidden',
        }}>
          {secondaryKpis.map((kpi) => (
            <div
              key={kpi.label}
              style={{
                flex: 1,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: `${cardPadV}px ${cardPadH}px`,
                display: 'flex',
                flexDirection: isNarrow ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: isNarrow ? 'center' : 'space-between',
                gap: 4,
                overflow: 'hidden',
                transition: 'border-color .15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-dim)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <span style={{
                fontFamily: 'var(--font-m)', fontSize: 8, fontWeight: 500,
                color: 'var(--text-dim)', letterSpacing: '.05em',
                textTransform: 'uppercase',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                textAlign: isNarrow ? 'center' : 'left',
              }}>
                {kpi.label}
              </span>
              <span style={{
                fontFamily: 'var(--font-d)', fontSize: secSize, fontWeight: 600,
                color: 'var(--text)', fontVariantNumeric: 'tabular-nums',
                flexShrink: 0,
              }}>
                {kpi.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

setWidgetComponent('revenue', RevenueKPI);

export default RevenueKPI;
