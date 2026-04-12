import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { setWidgetComponent } from './WidgetRegistry';
import api from '../../services/api';

/* ─────────────────────────────────────────────
   PROJECT STATUS BAR — Segmented proportion
   bar showing project distribution by status.
───────────────────────────────────────────── */

interface StatusSlice {
  key: string;
  label: string;
  count: number;
  color: string;
}

function ProjectStatusBar() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<{ status: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    api.get('/projects')
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : res.data?.data;
        setProjects(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const slices: StatusSlice[] = useMemo(() => {
    const counts: Record<string, number> = { ACTIVE: 0, COMPLETED: 0, PAUSED: 0, CANCELLED: 0 };
    projects.forEach((p) => { if (p.status in counts) counts[p.status]++; });

    return [
      { key: 'ACTIVE',    label: t('statusBar.active', 'Active'),    count: counts.ACTIVE,    color: 'var(--success)' },
      { key: 'COMPLETED', label: t('statusBar.completed', 'Done'),   count: counts.COMPLETED, color: 'var(--info)' },
      { key: 'PAUSED',    label: t('statusBar.paused', 'Paused'),    count: counts.PAUSED,    color: 'var(--warning)' },
      { key: 'CANCELLED', label: t('statusBar.cancelled', 'Cancelled'), count: counts.CANCELLED, color: 'var(--text-dim)' },
    ];
  }, [projects, t]);

  const total = slices.reduce((s, sl) => s + sl.count, 0);
  const activeSlices = slices.filter((s) => s.count > 0);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', justifyContent: 'center', gap: 14,
    }}>
      {/* ── Headline ── */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{
          fontFamily: 'var(--font-d)', fontWeight: 600, fontSize: 28,
          color: 'var(--text)', letterSpacing: '.02em',
          fontVariantNumeric: 'tabular-nums', lineHeight: 1,
        }}>
          {total}
        </span>
        <span style={{
          fontFamily: 'var(--font-m)', fontSize: 11,
          color: 'var(--text-dim)', letterSpacing: '.04em',
        }}>
          {total === 1
            ? t('statusBar.total_project', 'project')
            : t('statusBar.total_projects', 'projects')}
        </span>
        {total > 0 && (
          <span style={{
            fontFamily: 'var(--font-m)', fontSize: 10, fontWeight: 600,
            color: 'var(--success)', marginLeft: 'auto',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {Math.round((slices[0].count / total) * 100)}% {t('statusBar.active_label', 'active')}
          </span>
        )}
      </div>

      {/* ── Segmented bar ── */}
      <div style={{
        width: '100%', height: 8, borderRadius: 6,
        background: 'var(--glass)',
        display: 'flex', overflow: 'hidden',
        gap: total > 0 ? 2 : 0,
      }}>
        {total > 0 && activeSlices.map((sl) => {
          const pct = (sl.count / total) * 100;
          return (
            <div
              key={sl.key}
              style={{
                width: `${pct}%`,
                minWidth: pct > 0 ? 4 : 0,
                height: '100%',
                background: sl.color,
                borderRadius: 4,
                boxShadow: `0 0 8px ${sl.color}`,
              }}
            />
          );
        })}
      </div>

      {/* ── Labels row ── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap',
        gap: '8px 16px',
      }}>
        {slices.map((sl) => (
          <div key={sl.key} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            minWidth: 0,
          }}>
            {/* Color dot */}
            <div style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: sl.color,
              boxShadow: sl.count > 0 ? `0 0 5px ${sl.color}` : 'none',
              opacity: sl.count > 0 ? 1 : 0.35,
            }} />
            {/* Label */}
            <span style={{
              fontFamily: 'var(--font-m)', fontSize: 10,
              color: sl.count > 0 ? 'var(--text-mid)' : 'var(--text-dim)',
              letterSpacing: '.03em', whiteSpace: 'nowrap',
            }}>
              {sl.label}
            </span>
            {/* Count */}
            <span style={{
              fontFamily: 'var(--font-d)', fontSize: 13, fontWeight: 600,
              color: sl.count > 0 ? 'var(--text)' : 'var(--text-dim)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {sl.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

setWidgetComponent('statusBar', ProjectStatusBar);

export default ProjectStatusBar;
