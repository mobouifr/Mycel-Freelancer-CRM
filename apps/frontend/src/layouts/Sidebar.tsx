import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LogoMark from '../components/LogoMark';

/* ─────────────────────────────────────────────
   SIDEBAR — Simplified version using theme tokens
   (no auth/theme providers yet, to keep it lightweight)
───────────────────────────────────────────── */

const icons = {
  dashboard: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  clients: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  projects: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  proposals: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  invoices: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  reminders: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
};

type IconKey = keyof typeof icons;

interface NavEntry {
  icon: IconKey;
  label: string;
  path: string;
}

const NAV_ITEMS: NavEntry[] = [
  { icon: 'dashboard', label: 'Dashboard', path: '/' },
  { icon: 'clients', label: 'Clients', path: '/clients' },
  { icon: 'projects', label: 'Projects', path: '/projects' },
  { icon: 'proposals', label: 'Proposals', path: '/proposals' },
  { icon: 'invoices', label: 'Invoices', path: '/invoices' },
  { icon: 'reminders', label: 'Reminders', path: '/reminders' },
];

const COLLAPSED_W = 64;
const EXPANDED_W = 210;
const AUTO_BREAKPOINT = 900;

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [autoExpanded, setAutoExpanded] = useState(() => window.innerWidth >= AUTO_BREAKPOINT);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${AUTO_BREAKPOINT}px)`);
    const handler = (e: MediaQueryListEvent) => setAutoExpanded(e.matches);
    setAutoExpanded(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const width = autoExpanded ? EXPANDED_W : COLLAPSED_W;
  const expanded = autoExpanded;

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div
      style={{
        width,
        minWidth: width,
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0',
        gap: 2,
        flexShrink: 0,
        transition: 'width .25s var(--ease), min-width .25s var(--ease)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Logo row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: expanded ? 'flex-start' : 'center',
          padding: expanded ? '0 16px' : '0',
          marginBottom: 20,
          gap: expanded ? 12 : 0,
          minHeight: 32,
          transition: 'padding .3s var(--ease), gap .3s var(--ease)',
        }}
      >
        <div
          style={{ cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center' }}
          onClick={() => navigate('/')}
        >
          <LogoMark size={30} color="var(--text-mid)" />
        </div>
        {expanded && (
          <span
            style={{
              fontFamily: 'var(--font-d)',
              fontWeight: 700,
              fontSize: 15,
              color: 'var(--white)',
              letterSpacing: '-.02em',
              whiteSpace: 'nowrap',
            }}
            className="brand-logo"
          >
            Mycel.
          </span>
        )}
      </div>

      {/* Section label */}
      <div
        style={{
          padding: '0 20px',
          height: 18,
          display: 'flex',
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        {expanded && (
          <span
            style={{
              fontFamily: 'var(--font-m)',
              fontSize: 10,
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              color: 'var(--text-dim)',
            }}
          >
            Menu
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map((item, idx) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                border: 'none',
                outline: 'none',
                background: active ? 'var(--sidebar-active-bg)' : 'transparent',
                borderLeft: active ? '2px solid var(--sidebar-active)' : '2px solid transparent',
                color: active ? 'var(--sidebar-active)' : 'var(--text-dim)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: expanded ? '8px 20px' : '8px 0',
                cursor: 'pointer',
                fontFamily: 'var(--font-m)',
                fontSize: 12,
                textAlign: 'left',
                transition: 'background .15s, color .15s, border-color .15s, padding .15s',
              }}
            >
              <span
                style={{
                  width: 32,
                  display: 'flex',
                  justifyContent: 'center',
                  color: active ? 'var(--sidebar-active)' : 'var(--text-mid)',
                }}
              >
                {icons[item.icon]}
              </span>
              {expanded && (
                <span
                  style={{
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}



