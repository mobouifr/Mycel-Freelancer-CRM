import { useTranslation } from 'react-i18next';
import { setWidgetComponent } from './WidgetRegistry';
import { useState, useEffect } from 'react';
import api from '../../services/api';

/* ─────────────────────────────────────────────
   ACTIVITY FEED — Recent activity stream
   with timestamps and type badges
───────────────────────────────────────────── */

interface ActivityItem {
  id: string;
  type: 'client' | 'project' | 'note';
  title: string;
  detail: string;
  time: string;
}

// Mock data removed — replaced with real API data

const TYPE_ICON: Record<ActivityItem['type'], { path: string; color: string }> = {
  client:   { path: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', color: 'var(--accent)' },
  project:  { path: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z', color: 'var(--warning, #f59e0b)' },
  note:     { path: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8', color: 'var(--text-mid)' },
};

function ActivityFeed() {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    let isTerminated = false;
    api.get('/dashboard/activity')
      .then((res) => {
        if (!isTerminated && res.data) {
          setActivities(res.data);
        }
      })
      .catch(console.error);

    return () => {
      isTerminated = true;
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {activities.length === 0 && (
           <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 11, marginTop: 20 }}>
             {/* Fallback string if not in translation files */}
             {t('activity.no_activity', 'No recent activity')}
           </p>
        )}
        {activities.map((item, i) => {
          const icon = TYPE_ICON[item.type];
          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '8px 4px',
                borderBottom: i < activities.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background .12s',
                borderRadius: 4,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              {/* Timeline dot + icon */}
              <div style={{
                width: 26, height: 26, borderRadius: 6,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 1,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={icon.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={icon.path} />
                </svg>
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{
                    fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--white)',
                    lineHeight: 1.3,
                  }}>
                    {item.title}
                  </p>
                  <span style={{
                    fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)',
                    letterSpacing: '.04em', whiteSpace: 'nowrap', marginLeft: 8,
                    flexShrink: 0,
                  }}>
                    {item.time}
                  </span>
                </div>
                <p style={{
                  fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {item.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

setWidgetComponent('activity', ActivityFeed);

export default ActivityFeed;
