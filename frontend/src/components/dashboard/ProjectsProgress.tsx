import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { setWidgetComponent } from './WidgetRegistry';

/* ─────────────────────────────────────────────
   PROJECTS PROGRESS — Active projects with
   progress bars and status
───────────────────────────────────────────── */

interface ProjectData {
  id: string;
  name: string;
  client: string;
  progress: number; // 0-100
  status: 'active' | 'review' | 'paused';
  dueDate: string;
}

// Mock data — replace with API
const PROJECTS: ProjectData[] = [
  { id: '1', name: 'Web Redesign',       client: 'Noma Labs',    progress: 72, status: 'active', dueDate: 'Mar 20' },
  { id: '2', name: 'Brand Identity',     client: 'Drift Co.',    progress: 95, status: 'review', dueDate: 'Mar 10' },
  { id: '3', name: 'Mobile App MVP',     client: 'Arca Studio',  progress: 38, status: 'active', dueDate: 'Apr 15' },
  { id: '4', name: 'Marketing Campaign', client: 'Pixel Root',   progress: 15, status: 'paused', dueDate: 'Apr 30' },
];

function ProjectsProgress() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const statusRow = (status: ProjectData['status']) => {
    const labels = {
      active: t('projectsWidget.statusActive'),
      review: t('projectsWidget.statusReview'),
      paused: t('projectsWidget.statusPaused'),
    } as const;
    const colors = {
      active: 'var(--success)',
      review: 'var(--info, #60a5fa)',
      paused: 'var(--text-dim)',
    } as const;
    return { color: colors[status], label: labels[status] };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {PROJECTS.map((proj, i) => {
          const s = statusRow(proj.status);
          return (
            <div
              key={proj.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate('/projects')}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate('/projects'); }}
              style={{
                padding: '10px 4px',
                borderBottom: i < PROJECTS.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer',
                borderRadius: 4,
                transition: 'background .12s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              {/* Top row: name + status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--white)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {proj.name}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)',
                  }}>
                    {t('projectsWidget.dueLine', { client: proj.client, date: proj.dueDate })}
                  </p>
                </div>
                <span style={{
                  fontFamily: 'var(--font-m)', fontSize: 8,
                  letterSpacing: '.06em', fontWeight: 500,
                  color: s.color, whiteSpace: 'nowrap', marginLeft: 8,
                }}>
                  ● {s.label}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: 'var(--surface)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${proj.progress}%`,
                    height: '100%',
                    borderRadius: 2,
                    background: proj.progress >= 90
                      ? 'var(--success)'
                      : proj.progress >= 50
                        ? 'var(--accent)'
                        : 'var(--text-mid)',
                    transition: 'width .3s var(--ease)',
                  }} />
                </div>
                <span style={{
                  fontFamily: 'var(--font-d)', fontSize: 11, fontWeight: 600,
                  color: 'var(--text-mid)', minWidth: 28, textAlign: 'right',
                }}>
                  {proj.progress}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4,
        textAlign: 'center',
      }}>
        <button
          onClick={() => navigate('/projects')}
          style={{
            background: 'none', border: 'none',
            fontFamily: 'var(--font-m)', fontSize: 10,
            color: 'var(--accent)', cursor: 'pointer',
            letterSpacing: '.04em',
          }}
        >
          {t('projectsWidget.viewAll')}
        </button>
      </div>
    </div>
  );
}

setWidgetComponent('projects', ProjectsProgress);

export default ProjectsProgress;
