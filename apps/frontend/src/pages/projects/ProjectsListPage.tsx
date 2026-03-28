// Projects list page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { Project, ProjectPriority, ProjectStatus } from '../../types/project.types';
import { ProjectStatusBadge } from '../../components/projects/ProjectStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

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
    '#f97316', // orange
    '#3b82f6', // blue
    '#ec4899', // pink
    '#a855f7', // purple
    '#f59e0b', // amber
    '#10b981', // emerald
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const getPriorityStyle = (priority: ProjectPriority): React.CSSProperties => {
  switch (priority) {
    case ProjectPriority.HIGH:
      return {
        color: '#fca5a5',
        backgroundColor: 'rgba(239, 68, 68, 0.14)',
        border: '1px solid rgba(239, 68, 68, 0.35)',
      };
    case ProjectPriority.LOW:
      return {
        color: '#86efac',
        backgroundColor: 'rgba(34, 197, 94, 0.14)',
        border: '1px solid rgba(34, 197, 94, 0.35)',
      };
    case ProjectPriority.MEDIUM:
    default:
      return {
        color: '#fde68a',
        backgroundColor: 'rgba(245, 158, 11, 0.14)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
      };
  }
};

export const ProjectsListPage = () => {
  const navigate = useNavigate();
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
    if (window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
      try {
        await deleteProject(project.id);
      } catch (err) {
        alert('Failed to delete project');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ textAlign: 'center', padding: '32px 0' }}>Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '12px 16px',
          borderRadius: '8px',
        }}>
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '32px',
        backgroundColor: '#060606', // match app dark background
        minHeight: '100vh',
      }}
    >
      {/* Header Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
      }}>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: 'var(--text)',
            margin: 0,
          }}
        >
          Projects
        </h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
        <input
          type="text"
              placeholder="Search records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px 16px 10px 40px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '14px',
                width: '280px',
                fontFamily: 'var(--font-m)',
                backgroundColor: 'var(--surface)',
                color: 'var(--text)',
                outline: 'none',
              }}
            />
            <span style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '16px',
            }}>
              🔍
            </span>
          </div>
          <button
            onClick={() => navigate('/projects/new')}
            style={{
              padding: '10px 20px',
              backgroundColor: 'var(--accent)',
              color: 'var(--white)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'var(--font-m)',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent)';
            }}
          >
            + Add Project
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <div
        style={{
          backgroundColor: '#0e0e0e', // dark surface similar to clients table
          borderRadius: '12px',
          border: '1px solid var(--border)',
          padding: '24px',
        }}
      >
        {/* Filter Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
        }}>
          <span style={{
            fontSize: '14px',
            fontWeight: 500,
            fontFamily: 'var(--font-m)',
            color: 'var(--text)',
          }}>
            All Projects
          </span>
          <span style={{
            backgroundColor: 'rgba(255,255,255,0.06)',
            color: 'var(--text)',
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: 'var(--font-m)',
          }}>
            {filteredProjects.length}
          </span>
        </div>

        {/* Table */}
        {filteredProjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#6b7280' }}>
            <p>No projects found.</p>
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}>
            <thead>
              <tr>
                <th style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: 'var(--text-dim)',
                  fontFamily: 'var(--font-m)',
                  letterSpacing: '0.05em',
                }}>
                  PROJECT
                </th>
                <th style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: 'var(--text-dim)',
                  fontFamily: 'var(--font-m)',
                  letterSpacing: '0.05em',
                }}>
                  CLIENT
                </th>
                <th style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: 'var(--text-dim)',
                  fontFamily: 'var(--font-m)',
                  letterSpacing: '0.05em',
                }}>
                  PRIORITY
                </th>
                <th style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: 'var(--text-dim)',
                  fontFamily: 'var(--font-m)',
                  letterSpacing: '0.05em',
                }}>
                  STATUS
                </th>
                <th style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: 'var(--text-dim)',
                  fontFamily: 'var(--font-m)',
                  letterSpacing: '0.05em',
                }}>
                  BUDGET
                </th>
                <th style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: 'var(--text-dim)',
                  fontFamily: 'var(--font-m)',
                  letterSpacing: '0.05em',
                }}>
                  DEADLINE
                </th>
                <th style={{
                  textAlign: 'right',
                  padding: '12px 16px',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: 'var(--text-dim)',
                  fontFamily: 'var(--font-m)',
                  letterSpacing: '0.05em',
                }}>
                  ACTIONS
                </th>
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
                      borderTop: index > 0 ? '1px solid #e5e5e5' : 'none',
                    }}
                  >
                    <td style={{ padding: '16px' }}>
                      <div
                        style={{
                          fontWeight: 500,
                          fontSize: '13px',
                          color: 'var(--text)',
                          fontFamily: 'var(--font-m)',
                          marginBottom: '4px',
                        }}
                      >
                        {project.title}
                      </div>
                      {project.description && (
                        <div
                          style={{
                            fontSize: '11px',
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
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '4px',
                          backgroundColor: avatarColor,
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 600,
                          fontFamily: 'var(--font-m)',
                        }}>
                          {initials}
                        </div>
                        <span
                          style={{
                            fontSize: '12px',
                            color: 'var(--text)',
                            fontFamily: 'var(--font-m)',
                          }}
                        >
                          {clientName}
                        </span>
                      </div>
                  </td>
                    <td style={{ padding: '16px' }}>
                      <span
                        style={{
                          ...getPriorityStyle(priority),
                          display: 'inline-block',
                          fontSize: '10px',
                          fontWeight: 700,
                          fontFamily: 'var(--font-m)',
                          letterSpacing: '.06em',
                          borderRadius: '999px',
                          padding: '4px 10px',
                        }}
                      >
                        {priority}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                    <ProjectStatusBadge status={project.status} />
                  </td>
                    <td style={{ padding: '16px' }}>
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--text)',
                          fontFamily: 'var(--font-m)',
                        }}
                      >
                        {formatCurrency(Number(project.budget))}
                      </div>
                  </td>
                    <td style={{ padding: '16px' }}>
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--text)',
                          fontFamily: 'var(--font-m)',
                        }}
                      >
                        {formatDate(project.deadline)}
                      </div>
                  </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => navigate(`/projects/${project.id}`)}
                          style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-mid)',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-m)',
                            fontSize: 10,
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
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/projects/${project.id}/edit`)}
                          style={{
                            background: 'var(--accent-bg)',
                            border: '1px solid var(--accent-hover)',
                            color: 'var(--accent)',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-m)',
                            fontSize: 10,
                            padding: '6px 12px',
                            borderRadius: 999,
                            letterSpacing: '.06em',
                            textTransform: 'uppercase',
                            transition: 'all .15s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--accent)';
                            e.currentTarget.style.color = '#050505';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--accent-bg)';
                            e.currentTarget.style.color = 'var(--accent)';
                          }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(project)}
                          style={{
                            background: 'rgba(230, 90, 90, 0.08)',
                            border: '1px solid rgba(230, 90, 90, 0.35)',
                            color: 'var(--danger)',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-m)',
                            fontSize: 10,
                            padding: '6px 12px',
                            borderRadius: 999,
                            letterSpacing: '.06em',
                            textTransform: 'uppercase',
                            transition: 'all .15s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--danger)';
                            e.currentTarget.style.color = '#050505';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(230, 90, 90, 0.08)';
                            e.currentTarget.style.color = 'var(--danger)';
                          }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

