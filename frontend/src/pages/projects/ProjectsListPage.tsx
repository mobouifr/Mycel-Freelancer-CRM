// Projects list page
import { useEffect, useRef, type CSSProperties } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SortIcon = ({ field, sortBy, sortOrder }: { field: string; sortBy: string; sortOrder: 'asc' | 'desc' }) => {
  if (field !== sortBy) return <span style={{ opacity: 0.3, marginLeft: 4, fontSize: 9 }}>↕</span>;
  return <span style={{ marginLeft: 4, fontSize: 9, color: 'var(--accent)' }}>{sortOrder === 'asc' ? '↑' : '↓'}</span>;
};

import { useProjects } from '../../hooks/useProjects';
import { type Project, ProjectPriority, ProjectStatus } from '../../types/project.types';
import { ProjectStatusBadge } from '../../components/projects/ProjectStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useIsMobile } from '../../hooks/useIsMobile';
import { SegmentedControl } from '../../components/SegmentedControl';

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, '...', total];
  if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

const PROJECT_TABLE_MIN_WIDTH = 1000;

/** Table header typography aligned with ClientTable */
const PROJECTS_TABLE_TH: CSSProperties = {
  textAlign: 'left',
  padding: '12px 24px',
  fontFamily: 'var(--font-m)',
  fontSize: 9,
  fontWeight: 400,
  lineHeight: 1.2,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: 'var(--text-dim)',
};


const getPriorityStyle = (priority: ProjectPriority): CSSProperties => {
  const color =
    priority === ProjectPriority.HIGH   ? 'var(--danger)'  :
    priority === ProjectPriority.LOW    ? 'var(--success)' :
                                          'var(--warning)';
  return {
    color,
    backgroundColor: 'var(--glass)',
    border: '1px solid var(--border)',
  };
};

export const ProjectsListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const {
    projects, loading, error,
    page, totalPages, total,
    search, setSearch,
    statusFilter, setStatusFilter,
    sortBy, sortOrder, handleSort,
    goToPage, deleteProject, refetch,
  } = useProjects();

  // Re-fetch whenever the user navigates back to this page (e.g. after creating/editing)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    refetch();
  }, [location.key]);

  const handleDelete = async (project: Project) => {
    if (window.confirm(t('projects.confirm_delete', { name: project.title }))) {
      try {
        await deleteProject(project.id);
      } catch (err) {
        alert(t('projects.delete_failed'));
      }
    }
  };

  const renderProjectActions = (project: Project, mobile: boolean) => (
    <div
      style={{
        display: 'flex',
        gap: 10,
        justifyContent: mobile ? 'flex-start' : 'flex-end',
        flexWrap: 'wrap',
      }}
    >
      <button
        type="button"
        onClick={() => navigate(`/projects/${project.id}`, { state: { background: location, project } })}
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border)',
          color: 'var(--text-mid)',
          cursor: 'pointer',
          fontFamily: 'var(--font-m)',
          fontSize: 10,
          lineHeight: 1.2,
          padding: '6px 12px',
          borderRadius: 999,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          transition: 'all .15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text)';
          e.currentTarget.style.borderColor = 'var(--border-h)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-mid)';
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
        }}
      >
        {t('common.view')}
      </button>
      <button
        type="button"
        onClick={() => navigate(`/projects/${project.id}/edit`, { state: { background: location } })}
        style={{
          background: 'var(--accent-bg)',
          border: '1px solid var(--accent-hover)',
          color: 'var(--accent)',
          cursor: 'pointer',
          fontFamily: 'var(--font-m)',
          fontSize: 10,
          lineHeight: 1.2,
          padding: '6px 12px',
          borderRadius: 999,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          transition: 'all .15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--accent)';
          e.currentTarget.style.color = 'var(--bg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--accent-bg)';
          e.currentTarget.style.color = 'var(--accent)';
        }}
      >
        {t('common.edit')}
      </button>
      <button
        type="button"
        onClick={() => handleDelete(project)}
        style={{
          background: 'var(--danger-bg)',
          border: '1px solid var(--danger)',
          color: 'var(--danger)',
          cursor: 'pointer',
          fontFamily: 'var(--font-m)',
          fontSize: 10,
          lineHeight: 1.2,
          padding: '6px 12px',
          borderRadius: 999,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          transition: 'all .15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--danger)';
          e.currentTarget.style.color = 'var(--bg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--danger-bg)';
          e.currentTarget.style.color = 'var(--danger)';
        }}
      >
        {t('common.delete')}
      </button>
    </div>
  );

  const projectLabelStyle: CSSProperties = {
    fontFamily: 'var(--font-m)',
    fontSize: 9,
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: '.1em',
    textTransform: 'uppercase',
    color: 'var(--text-dim)',
    marginBottom: 4,
  };

  // Show full-page spinner only on the very first load (no data yet).
  // On page turns / re-fetches the table stays visible with the previous page's data.
  if (loading && projects.length === 0) {
    return (
      <div style={{ padding: 0, animation: 'fadeUp .3s var(--ease) both' }}>
        <div
          style={{
            textAlign: 'center',
            padding: '40px 0',
            fontFamily: 'var(--font-m)',
            fontSize: 12,
            lineHeight: 1.4,
            color: 'var(--text-dim)',
          }}
        >
          {t('projects.loading')}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 0, animation: 'fadeUp .3s var(--ease) both' }}>
        <div
          style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            borderRadius: 8,
            padding: '12px 16px',
            fontFamily: 'var(--font-m)',
            fontSize: 12,
            lineHeight: 1.4,
          }}
        >
          {t('common.error', { message: error })}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 0,
        animation: 'fadeUp .3s var(--ease) both',
        backgroundColor: 'var(--bg)',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Header Section */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontFamily: 'var(--font-d)',
            fontWeight: 500,
            fontSize: isMobile ? 22 : 26,
            color: 'var(--text)',
            letterSpacing: '.06em',
            lineHeight: 1.3,
            marginBottom: 4,
          }}
        >
          {t('projects.title')}
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-m)',
            fontSize: 11,
            fontWeight: 400,
            color: 'var(--text-dim)',
            letterSpacing: '.04em',
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          {t('projects.subtitle')}
        </p>
      </div>

      {/* Search + Filter + Add */}
      <div style={{
        display: 'flex',
        gap: 10,
        marginBottom: 20,
        width: '100%',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
      }}>
        <input
          type="text"
          id="projects-search"
          name="projects-search"
          autoComplete="off"
          placeholder={t('projects.search_placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 0,
            boxSizing: 'border-box',
            padding: '10px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--surface-2)',
            color: 'var(--text)',
            fontFamily: 'var(--font-m)',
            fontSize: 12,
            fontWeight: 400,
            lineHeight: 1.4,
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={() => navigate('/projects/new', { state: { background: location } })}
          style={{
            padding: '10px 20px',
            borderRadius: 6,
            border: '1px solid var(--accent-hover)',
            background: 'var(--accent-bg)',
            color: 'var(--accent)',
            fontFamily: 'var(--font-m)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '.06em',
            lineHeight: 1.2,
            cursor: 'pointer',
            transition: 'background .2s var(--ease), color .2s var(--ease)',
            width: isMobile ? '100%' : 'auto',
            boxSizing: 'border-box',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'var(--bg)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent-bg)'; e.currentTarget.style.color = 'var(--accent)'; }}
        >
          {t('projects.new_project')}
        </button>
      </div>

      {/* Status filter */}
      <div style={{ marginBottom: 20 }}>
        <SegmentedControl
          options={[
            { value: 'ALL',                     label: t('common.all_statuses'),       activeColor: 'var(--text)',    activeBg: 'var(--surface-2)' },
            { value: ProjectStatus.ACTIVE,      label: t('forms.project.active'),      activeColor: 'var(--accent)',  activeBg: 'var(--accent-bg)' },
            { value: ProjectStatus.COMPLETED,   label: t('forms.project.completed'),   activeColor: 'var(--info)',    activeBg: 'var(--info-bg)' },
            { value: ProjectStatus.PAUSED,      label: t('forms.project.paused'),      activeColor: 'var(--warning)', activeBg: 'var(--warning-bg)' },
            { value: ProjectStatus.CANCELLED,   label: t('forms.project.cancelled'),   activeColor: 'var(--danger)',  activeBg: 'var(--danger-bg)' },
          ]}
          value={statusFilter}
          onChange={(v) => setStatusFilter(v)}
          scrollable
        />
      </div>

      {/* Main Content Container — matches Clients list table wrapper */}
      <div
        style={{
          background: 'var(--surface-2)',
          borderRadius: 8,
          border: '1px solid var(--border)',
          boxSizing: 'border-box',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Table / mobile cards */}
        {projects.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 24px',
              fontFamily: 'var(--font-m)',
              fontSize: 12,
              lineHeight: 1.4,
              color: 'var(--text-dim)',
            }}
          >
            <p style={{ margin: 0 }}>{t('common.no_results', { item: t('nav.projects').toLowerCase() })}</p>
          </div>
        ) : isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 0' }}>
            {projects.map((project) => {
              const clientName = project.client?.name || '—';
              const priority = project.priority || ProjectPriority.MEDIUM;
              return (
                <div
                  key={project.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: 14,
                    background: 'var(--surface)',
                  }}
                >
                  <div style={{ marginBottom: 10 }}>
                    <div style={projectLabelStyle}>{t('projects.table.project')}</div>
                    <div
                      style={{
                        fontWeight: 500,
                        fontSize: 12,
                        lineHeight: 1.3,
                        color: 'var(--text)',
                        fontFamily: 'var(--font-m)',
                      }}
                    >
                      {project.title}
                    </div>
                    {project.description && (
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 400,
                          lineHeight: 1.4,
                          color: 'var(--text-mid)',
                          fontFamily: 'var(--font-m)',
                          marginTop: 6,
                          wordBreak: 'break-word',
                        }}
                      >
                        {project.description}
                      </div>
                    )}
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={projectLabelStyle}>{t('projects.table.client')}</div>
                    <span style={{ fontSize: 12, fontWeight: 400, lineHeight: 1.4, color: 'var(--text)', fontFamily: 'var(--font-m)', wordBreak: 'break-word' }}>
                      {clientName}
                    </span>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={projectLabelStyle}>{t('projects.table.priority')}</div>
                    <span
                      style={{
                        ...getPriorityStyle(priority),
                        display: 'inline-block',
                        fontSize: 10,
                        fontWeight: 700,
                        fontFamily: 'var(--font-m)',
                        letterSpacing: '.06em',
                        lineHeight: 1.2,
                        borderRadius: 999,
                        padding: '4px 10px',
                      }}
                    >
                      {priority}
                    </span>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={projectLabelStyle}>{t('projects.table.status')}</div>
                    <ProjectStatusBadge status={project.status} />
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={projectLabelStyle}>{t('projects.table.budget')}</div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 400,
                        lineHeight: 1.4,
                        color: 'var(--text)',
                        fontFamily: 'var(--font-m)',
                      }}
                    >
                      {formatCurrency(Number(project.budget))}
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={projectLabelStyle}>{t('projects.table.deadline')}</div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 400,
                        lineHeight: 1.4,
                        color: 'var(--text)',
                        fontFamily: 'var(--font-m)',
                      }}
                    >
                      {formatDate(project.deadline)}
                    </div>
                  </div>
                  {renderProjectActions(project, true)}
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: PROJECT_TABLE_MIN_WIDTH,
              }}
            >
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th
                  style={{ ...PROJECTS_TABLE_TH, cursor: 'pointer', userSelect: 'none', color: sortBy === 'title' ? 'var(--text-mid)' : 'var(--text-dim)' }}
                  onClick={() => handleSort('title')}
                >
                  {t('projects.table.project')}<SortIcon field="title" sortBy={sortBy} sortOrder={sortOrder} />
                </th>
                <th style={PROJECTS_TABLE_TH}>{t('projects.table.client')}</th>
                <th style={PROJECTS_TABLE_TH}>{t('projects.table.priority')}</th>
                <th style={PROJECTS_TABLE_TH}>{t('projects.table.status')}</th>
                <th
                  style={{ ...PROJECTS_TABLE_TH, cursor: 'pointer', userSelect: 'none', color: sortBy === 'budget' ? 'var(--text-mid)' : 'var(--text-dim)' }}
                  onClick={() => handleSort('budget')}
                >
                  {t('projects.table.budget')}<SortIcon field="budget" sortBy={sortBy} sortOrder={sortOrder} />
                </th>
                <th
                  style={{ ...PROJECTS_TABLE_TH, cursor: 'pointer', userSelect: 'none', color: sortBy === 'deadline' ? 'var(--text-mid)' : 'var(--text-dim)' }}
                  onClick={() => handleSort('deadline')}
                >
                  {t('projects.table.deadline')}<SortIcon field="deadline" sortBy={sortBy} sortOrder={sortOrder} />
                </th>
                <th style={{ ...PROJECTS_TABLE_TH, textAlign: 'right' }}>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, index) => {
                const clientName = project.client?.name || '—';
                const priority = project.priority || ProjectPriority.MEDIUM;
                
                return (
                  <tr
                    key={project.id}
                    style={{
                      borderTop: index > 0 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <td style={{ padding: '13px 24px' }}>
                      <div
                        style={{
                          fontWeight: 500,
                          fontSize: 12,
                          lineHeight: 1.3,
                          color: 'var(--text)',
                          fontFamily: 'var(--font-m)',
                          marginBottom: 4,
                        }}
                      >
                        {project.title}
                      </div>
                      {project.description && (
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 400,
                            lineHeight: 1.4,
                            color: 'var(--text-mid)',
                            fontFamily: 'var(--font-m)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '300px',
                          }}
                        >
                          {project.description}
                        </div>
                      )}
                  </td>
                    <td style={{ padding: '13px 24px' }}>
                      <span style={{ fontSize: 12, fontWeight: 400, lineHeight: 1.4, color: 'var(--text)', fontFamily: 'var(--font-m)' }}>
                        {clientName}
                      </span>
                  </td>
                    <td style={{ padding: '13px 24px' }}>
                      <span
                        style={{
                          ...getPriorityStyle(priority),
                          display: 'inline-block',
                          fontSize: 10,
                          fontWeight: 700,
                          fontFamily: 'var(--font-m)',
                          letterSpacing: '.06em',
                          lineHeight: 1.2,
                          borderRadius: 999,
                          padding: '4px 10px',
                        }}
                      >
                        {priority}
                      </span>
                    </td>
                    <td style={{ padding: '13px 24px' }}>
                    <ProjectStatusBadge status={project.status} />
                  </td>
                    <td style={{ padding: '13px 24px' }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 400,
                          lineHeight: 1.4,
                          color: 'var(--text)',
                          fontFamily: 'var(--font-m)',
                        }}
                      >
                        {formatCurrency(Number(project.budget))}
                      </div>
                  </td>
                    <td style={{ padding: '13px 24px' }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 400,
                          lineHeight: 1.4,
                          color: 'var(--text)',
                          fontFamily: 'var(--font-m)',
                        }}
                      >
                        {formatDate(project.deadline)}
                      </div>
                  </td>
                    <td style={{ padding: '13px 24px', textAlign: 'right' }}>
                      {renderProjectActions(project, false)}
                    </td>
                </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (() => {
          const btnBase: CSSProperties = {
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            minWidth: 30, height: 30, padding: '0 8px', borderRadius: 6,
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-mid)', fontFamily: 'var(--font-m)', fontSize: 11,
            cursor: 'pointer', transition: 'all .15s',
          };
          const pages = getPageNumbers(page, totalPages);
          return (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 24px', borderTop: '1px solid var(--border)',
              flexWrap: 'wrap', gap: 8,
            }}>
              <span style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.4 }}>
                {total} results · Page {page} of {totalPages}
              </span>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <button type="button" disabled={page === 1} onClick={() => goToPage(page - 1)}
                  style={{ ...btnBase, opacity: page === 1 ? 0.35 : 1, cursor: page === 1 ? 'default' : 'pointer' }}>←</button>
                {pages.map((p, i) =>
                  p === '...'
                    ? <span key={`e${i}`} style={{ ...btnBase, border: 'none', cursor: 'default', color: 'var(--text-dim)' }}>…</span>
                    : <button key={p} type="button" onClick={() => goToPage(p as number)} style={{
                        ...btnBase,
                        ...(p === page ? { background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-hover)', fontWeight: 600 } : {}),
                      }}>{p}</button>
                )}
                <button type="button" disabled={page === totalPages} onClick={() => goToPage(page + 1)}
                  style={{ ...btnBase, opacity: page === totalPages ? 0.35 : 1, cursor: page === totalPages ? 'default' : 'pointer' }}>→</button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

