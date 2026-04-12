import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { setWidgetComponent } from './WidgetRegistry';
import api from '../../services/api';

/* ─────────────────────────────────────────────
   NEXT DEADLINE — Fixed-size compact card.
   Two columns: date left, days-left flip right.
───────────────────────────────────────────── */

interface Project {
  id: string;
  title: string;
  deadline: string | null;
  status: string;
}

function NextDeadline() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);

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

  const nearest = useMemo(() => {
    const now = Date.now();
    let best: { project: Project; date: Date; diff: number } | null = null;

    for (const p of projects) {
      if (!p.deadline || p.status === 'COMPLETED' || p.status === 'CANCELLED') continue;
      const d = new Date(p.deadline);
      const diff = d.getTime() - now;
      if (diff > 0 && (!best || diff < best.diff)) {
        best = { project: p, date: d, diff };
      }
    }
    return best;
  }, [projects]);

  const days = nearest ? Math.floor(nearest.diff / (1000 * 60 * 60 * 24)) : 0;
  const hours = nearest ? Math.floor((nearest.diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) : 0;

  const deadlineDate = nearest ? nearest.date.getDate().toString().padStart(2, '0') : '--';
  const deadlineMonth = nearest
    ? nearest.date.toLocaleString('default', { month: 'short' })
    : '---';

  const isUrgent = nearest ? days <= 3 : false;

  if (!nearest) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%',
      }}>
        <span style={{
          fontFamily: 'var(--font-m)', fontSize: 10,
          color: 'var(--text-dim)',
        }}>
          {t('deadline.no_upcoming', 'No upcoming deadlines')}
        </span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', height: '100%',
      alignItems: 'stretch', gap: 0,
    }}>
      {/* ── Left: deadline date ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', gap: 2, minWidth: 0,
      }}>
        <span style={{
          fontFamily: 'var(--font-m)', fontSize: 9, fontWeight: 500,
          color: 'var(--text-dim)', letterSpacing: '.06em',
          textTransform: 'uppercase',
        }}>
          {t('deadline.next_deadline', 'Next deadline')}
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{
            fontFamily: 'var(--font-d)', fontSize: 38, fontWeight: 700,
            color: 'var(--text)', lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {deadlineDate}
          </span>
          <span style={{
            fontFamily: 'var(--font-m)', fontSize: 14, fontWeight: 500,
            color: 'var(--text-mid)',
          }}>
            {deadlineMonth}
          </span>
        </div>
        {/* Project name */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4, marginTop: 2,
        }}>
          <div style={{
            width: 4, height: 4, borderRadius: '50%', flexShrink: 0,
            background: isUrgent ? 'var(--danger)' : 'var(--accent)',
            boxShadow: `0 0 5px ${isUrgent ? 'var(--danger)' : 'var(--accent)'}`,
          }} />
          <span style={{
            fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {nearest.project.title}
          </span>
        </div>
      </div>

      {/* ── Right: days left flip card ── */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 2, flexShrink: 0, paddingLeft: 14,
        borderLeft: '1px solid var(--border)',
      }}>
        <span style={{
          fontFamily: 'var(--font-m)', fontSize: 9, fontWeight: 500,
          color: 'var(--text-dim)', letterSpacing: '.06em',
          textTransform: 'uppercase',
        }}>
          {t('deadline.days_left', 'Days left')}
        </span>

        {/* Flip card */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 54,
          height: 58,
          borderRadius: 8,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 2px 8px rgba(0,0,0,.2), inset 0 1px 0 var(--glass)',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', left: 0, right: 0,
            top: '50%', height: 1,
            background: 'var(--border)', opacity: 0.4,
          }} />
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
            background: 'linear-gradient(180deg, var(--glass) 0%, transparent 100%)',
            borderRadius: '8px 8px 0 0', pointerEvents: 'none',
          }} />
          <span style={{
            fontFamily: 'var(--font-d)', fontSize: 26, fontWeight: 700,
            color: 'var(--text)', fontVariantNumeric: 'tabular-nums',
            lineHeight: 1, position: 'relative', zIndex: 1,
          }}>
            {days.toString().padStart(2, '0')}
          </span>
        </div>

        <span style={{
          fontFamily: 'var(--font-m)', fontSize: 9, fontWeight: 500,
          color: 'var(--text-dim)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {hours}h
        </span>
      </div>
    </div>
  );
}

setWidgetComponent('deadline', NextDeadline);

export default NextDeadline;
