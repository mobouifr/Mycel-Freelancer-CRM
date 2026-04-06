import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setWidgetComponent } from './WidgetRegistry';

/* ─────────────────────────────────────────────
   SMART SUGGESTIONS — AI-style actionable
   insights for the user's workflow
───────────────────────────────────────────── */

interface Suggestion {
  id: string;
  titleKey: string;
  descriptionKey: string;
  actionKey: string;
  priority: 'high' | 'medium' | 'low';
  icon: string; // SVG path
}

// Mock suggestions — in the future these come from an AI/rules engine
const SUGGESTIONS: Suggestion[] = [
  {
    id: '1',
    titleKey: 'suggestions.follow_up_title',
    descriptionKey: 'suggestions.follow_up_desc',
    actionKey: 'suggestions.send_reminder',
    priority: 'high',
    icon: 'M22 12h-4l-3 9L9 3l-3 9H2',
  },
  {
    id: '2',
    titleKey: 'suggestions.proposal_ready_title',
    descriptionKey: 'suggestions.proposal_ready_desc',
    actionKey: 'suggestions.review_draft',
    priority: 'medium',
    icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
  },
  {
    id: '3',
    titleKey: 'suggestions.schedule_planning_title',
    descriptionKey: 'suggestions.schedule_planning_desc',
    actionKey: 'suggestions.add_event',
    priority: 'low',
    icon: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  },
  {
    id: '4',
    titleKey: 'suggestions.revenue_on_track_title',
    descriptionKey: 'suggestions.revenue_on_track_desc',
    actionKey: 'suggestions.view_stats',
    priority: 'low',
    icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  },
];

const PRIORITY_STYLE: Record<Suggestion['priority'], { dot: string; border: string }> = {
  high:   { dot: 'var(--danger)',  border: 'var(--danger-bg)' },
  medium: { dot: 'var(--warning, #f59e0b)', border: 'rgba(245,158,11,.12)' },
  low:    { dot: 'var(--text-dim)', border: 'var(--border)' },
};

function SmartSuggestions() {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const activeSuggestions = SUGGESTIONS.filter((s) => !dismissed.has(s.id));

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {activeSuggestions.length === 0 ? (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <p style={{
            fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)',
            textAlign: 'center',
          }}>
            {t('suggestions.all_caught_up')}
          </p>
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'auto' }}>
          {activeSuggestions.map((s, i) => {
            const ps = PRIORITY_STYLE[s.priority];
            return (
              <div
                key={s.id}
                style={{
                  padding: '10px 4px',
                  borderBottom: i < activeSuggestions.length - 1 ? '1px solid var(--border)' : 'none',
                  animation: 'fadeUp .2s var(--ease) both',
                  animationDelay: `${i * 50}ms`,
                }}
              >
                <div style={{ display: 'flex', gap: 8 }}>
                  {/* Priority dot + icon */}
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: 'var(--surface)',
                    border: `1px solid ${ps.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 1,
                    position: 'relative',
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-mid)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d={s.icon} />
                    </svg>
                    {/* Priority dot */}
                    <div style={{
                      position: 'absolute', top: -2, right: -2,
                      width: 6, height: 6, borderRadius: '50%',
                      background: ps.dot,
                      border: '1px solid var(--surface)',
                    }} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--white)',
                      marginBottom: 2, lineHeight: 1.3,
                    }}>
                      {t(s.titleKey)}
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)',
                      lineHeight: 1.4, marginBottom: 6,
                    }}>
                      {t(s.descriptionKey)}
                    </p>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        style={{
                          padding: '3px 10px', borderRadius: 4,
                          background: 'var(--accent-bg)',
                          border: '1px solid var(--accent-hover)',
                          fontFamily: 'var(--font-m)', fontSize: 9,
                          fontWeight: 500,
                          color: 'var(--accent)', cursor: 'pointer',
                          transition: 'all .15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--accent)';
                          e.currentTarget.style.color = 'var(--white)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--accent-bg)';
                          e.currentTarget.style.color = 'var(--accent)';
                        }}
                      >
                        {t(s.actionKey)}
                      </button>
                      <button
                        onClick={() => handleDismiss(s.id)}
                        style={{
                          padding: '3px 8px', borderRadius: 4,
                          background: 'none',
                          border: '1px solid var(--border)',
                          fontFamily: 'var(--font-m)', fontSize: 9,
                          color: 'var(--text-dim)', cursor: 'pointer',
                          transition: 'all .15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-dim)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                      >
                        {t('suggestions.dismiss')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

setWidgetComponent('suggestions', SmartSuggestions);

export default SmartSuggestions;
