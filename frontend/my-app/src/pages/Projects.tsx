import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, StatusBadge } from '../components';

/* ─────────────────────────────────────────────
   PROJECTS — List page with table
───────────────────────────────────────────── */

interface Project {
  id: string;
  title: string;
  clientName: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('projects');
      if (stored) {
        setProjects(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Title',
      width: '2fr',
      render: (row: Project) => (
        <span style={{ fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>
          {row.title}
        </span>
      ),
    },
    {
      key: 'client',
      header: 'Client',
      width: '1.5fr',
      render: (row: Project) => (
        <span style={{ fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--text-mid)' }}>
          {row.clientName || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '1fr',
      render: (row: Project) => <StatusBadge status={row.status} />,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      width: '1fr',
      render: (row: Project) => (
        <span style={{ fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--text-mid)' }}>
          {formatDate(row.dueDate)}
        </span>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      width: '1fr',
      render: (row: Project) => (
        <span style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '.04em' }}>
          {row.priority ? row.priority.charAt(0).toUpperCase() + row.priority.slice(1) : '—'}
        </span>
      ),
    },
  ];

  const handleRowClick = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <div style={{ animation: 'fadeUp .3s var(--ease) both' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-d)',
              fontWeight: 500,
              fontSize: 26,
              color: 'var(--text)',
              letterSpacing: '.06em',
              lineHeight: 1.3,
              marginBottom: 4,
            }}
          >
            Projects
          </h2>
          <p style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '.04em' }}>
            Track your project progress and deadlines
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/projects/new')}
        >
          + New Project
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-m)', fontSize: 12, color: 'var(--text-dim)' }}>
            Loading...
          </p>
        </div>
      ) : (
        <Table
          columns={columns}
          data={projects}
          onRowClick={handleRowClick}
          emptyMessage="No projects yet. Create your first project to get started."
        />
      )}
    </div>
  );
}
