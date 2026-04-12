// Projects list page
import { useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useProjects } from '../../hooks/useProjects';
import { type Project, ProjectPriority, ProjectStatus } from '../../types/project.types';
import { ProjectStatusBadge } from '../../components/projects/ProjectStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useIsMobile } from '../../hooks/useIsMobile';

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

// Helper function to get client initials
const getClientInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Helper function to get avatar color based on client name
const getAvatarColor = (name: string): string => {
  const colors = [
    'var(--accent)',
    'var(--info)',
    'var(--warning)',
    'var(--danger)',
    'var(--sidebar-active)',
    'var(--success)',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const getPriorityStyle = (priority: ProjectPriority): CSSProperties => {
  switch (priority) {
    case ProjectPriority.HIGH:
      return {
        color: 'var(--danger)',
        backgroundColor: 'var(--danger-bg)',
        border: '1px solid var(--danger)',
      };
    case ProjectPriority.LOW:
      return {
        color: 'var(--success)',
        backgroundColor: 'var(--success-bg)',
        border: '1px solid var(--success)',
      };
    case ProjectPriority.MEDIUM:
    default:
      return {
        color: 'var(--warning)',
        backgroundColor: 'var(--warning-bg)',
        border: '1px solid var(--warning)',
      };
  }
};

export const ProjectsListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { projects, loading, error, deleteProject } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL');

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        onClick={() => navigate(`/projects/${project.id}`, { state: { project } })}
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
        onClick={() => navigate(`/projects/${project.id}/edit`)}
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

  if (loading) {
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
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 16 : 12,
          marginBottom: 24,
          width: '100%',
        }}
      >
        <div style={{ minWidth: 0 }}>
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
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
            width: isMobile ? '100%' : 'auto',
            flexDirection: isMobile ? 'column' : 'row',
          }}
        >
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'ALL')}
            style={{
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
              width: isMobile ? '100%' : 'auto',
              minWidth: isMobile ? undefined : 160,
              boxSizing: 'border-box',
            }}
          >
            <option value="ALL">{t('common.all_statuses')}</option>
            {Object.values(ProjectStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => navigate('/projects/new')}
            style={{
              padding: '10px 20px',
              borderRadius: 6,
              border: 'none',
              background: 'var(--accent)',
              color: 'var(--white)',
              fontFamily: 'var(--font-m)',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '.06em',
              lineHeight: 1.2,
              cursor: 'pointer',
              transition: 'background .2s var(--ease), transform .1s var(--ease)',
              width: isMobile ? '100%' : 'auto',
              alignSelf: isMobile ? 'stretch' : 'auto',
              boxSizing: 'border-box',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--accent)';
            }}
          >
            {t('projects.new_project')}
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20, width: '100%' }}>
        <input
          type="text"
          placeholder={t('projects.search_placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: isMobile ? 'none' : 420,
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
        {filteredProjects.length === 0 ? (
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
            {filteredProjects.map((project) => {
              const clientName = project.client?.name || '—';
              const initials = getClientInitials(clientName);
              const avatarColor = getAvatarColor(clientName);
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 4,
                          backgroundColor: avatarColor,
                          color: 'var(--bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          fontWeight: 600,
                          lineHeight: 1.2,
                          fontFamily: 'var(--font-m)',
                          flexShrink: 0,
                        }}
                      >
                        {initials}
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 400,
                          lineHeight: 1.4,
                          color: 'var(--text)',
                          fontFamily: 'var(--font-m)',
                          wordBreak: 'break-word',
                        }}
                      >
                        {clientName}
                      </span>
                    </div>
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
                <th style={PROJECTS_TABLE_TH}>{t('projects.table.project')}</th>
                <th style={PROJECTS_TABLE_TH}>{t('projects.table.client')}</th>
                <th style={PROJECTS_TABLE_TH}>{t('projects.table.priority')}</th>
                <th style={PROJECTS_TABLE_TH}>{t('projects.table.status')}</th>
                <th style={PROJECTS_TABLE_TH}>{t('projects.table.budget')}</th>
                <th style={PROJECTS_TABLE_TH}>{t('projects.table.deadline')}</th>
                <th style={{ ...PROJECTS_TABLE_TH, textAlign: 'right' }}>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project, index) => {
                const clientName = project.client?.name || '—';
                const initials = getClientInitials(clientName);
                const avatarColor = getAvatarColor(clientName);
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '4px',
                          backgroundColor: avatarColor,
                          color: 'var(--bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          fontWeight: 600,
                          lineHeight: 1.2,
                          fontFamily: 'var(--font-m)',
                        }}>
                          {initials}
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 400,
                            lineHeight: 1.4,
                            color: 'var(--text)',
                            fontFamily: 'var(--font-m)',
                          }}
                        >
                          {clientName}
                        </span>
                      </div>
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
      </div>
    </div>
  );
};

