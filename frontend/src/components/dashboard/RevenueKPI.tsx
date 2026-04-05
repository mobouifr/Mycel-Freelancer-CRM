import { useTranslation } from 'react-i18next';
import RevenueChart from '../RevenueChart';
import { monthShortLabels } from '../../i18n/localeFormat';
import { setWidgetComponent } from './WidgetRegistry';

/* ─────────────────────────────────────────────
   REVENUE KPI — Big headline number, trend
   indicator, and a compact sparkline chart
───────────────────────────────────────────── */

// Mock data — replace with API when backend ready
const MONTHLY_REVENUE = [12, 19, 8, 25, 18, 31, 24, 38, 29, 44, 35, 52];
const CURRENT_REVENUE = 52_400;
const PREVIOUS_REVENUE = 44_200;
const TREND_PCT = Math.round(((CURRENT_REVENUE - PREVIOUS_REVENUE) / PREVIOUS_REVENUE) * 100);

function RevenueKPI() {
  const { t, i18n } = useTranslation();
  const labels = monthShortLabels(i18n.language);
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
            {t('revenueWidget.netRevenue')}
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
          { label: t('revenueWidget.avgMonth'), value: `$${Math.round(MONTHLY_REVENUE.reduce((a, b) => a + b, 0) / MONTHLY_REVENUE.length)}k` },
          { label: t('revenueWidget.bestMonth'), value: `$${Math.max(...MONTHLY_REVENUE)}k` },
          { label: t('revenueWidget.invoicesPaid'), value: '14' },
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
        <RevenueChart data={MONTHLY_REVENUE} labels={labels} height={100} />
      </div>
    </div>
  );
}

setWidgetComponent('revenue', RevenueKPI);

export default RevenueKPI;
