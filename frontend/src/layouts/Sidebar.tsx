import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogoMark } from '../components';
import { useAuth } from '../hooks/useAuth';


/* ─────────────────────────────────────────────
   SIDEBAR — Expandable navigation panel
   Supports Automatic (breakpoint) & Manual (drag) modes
───────────────────────────────────────────── */

/* ── SVG icon components (24×24 viewBox) ── */
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
  reminders: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  growth: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V8M12 8C9 8 5 6 5 2M12 8c3 0 7-2 7-6M7 14c-3 0-5 1-5 3M17 14c3 0 5 1 5 3" />
    </svg>
  ),
  settings: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
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
  { icon: 'dashboard',  label: 'nav.dashboard',  path: '/' },
  { icon: 'clients',    label: 'nav.clients',    path: '/clients' },
  { icon: 'projects',   label: 'nav.projects',   path: '/projects' },
  { icon: 'reminders',  label: 'nav.reminders',  path: '/reminders' },
  { icon: 'growth',     label: 'nav.growth',     path: '/growth' },
];

const COLLAPSED_W = 64;
const EXPANDED_W = 210;

const AUTO_BREAKPOINT = 1200;

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useTranslation();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const go = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  /* ── Automatic mode: breakpoint-driven expand/collapse ── */
  const [autoExpanded, setAutoExpanded] = useState(() => window.innerWidth >= AUTO_BREAKPOINT);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${AUTO_BREAKPOINT}px)`);
    const handler = (e: MediaQueryListEvent) => setAutoExpanded(e.matches);
    setAutoExpanded(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  /* ── Derived width ── */
  const isMobileOverlay = !!onNavigate;
  const width = isMobileOverlay ? '100%' : (autoExpanded ? EXPANDED_W : COLLAPSED_W);
  const expanded = isMobileOverlay ? true : autoExpanded;

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
      {/* Logo + toggle row */}
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
          onClick={() => go('/')}
        >
          <LogoMark size={30} color="var(--text-mid)" />
        </div>

        {/* Brand name – only when expanded */}
        <span
          style={{
            fontFamily: 'var(--font-d)',
            fontWeight: 700,
            fontSize: 15,
            color: 'var(--white)',
            letterSpacing: '-.02em',
            whiteSpace: 'nowrap',
            opacity: expanded ? 1 : 0,
            width: expanded ? 'auto' : 0,
            transition: 'opacity .2s, width .2s',
            overflow: 'hidden',
          }}
          className="brand-logo"
        >
          Mycel.
        </span>

      </div>

      {/* ── Section label — always takes same space to prevent icon shift ── */}
      <div
        style={{
          padding: '0 20px',
          height: 18,
          marginBottom: 6,
          opacity: expanded ? 0.5 : 0,
          fontFamily: 'var(--font-m)',
          fontSize: 9,
          letterSpacing: '.14em',
          textTransform: 'uppercase',
          color: 'var(--text-dim)',
          overflow: 'hidden',
          transition: 'opacity .25s var(--ease)',
        }}
      >
        {t('nav.menu')}
      </div>

      {/* ── Nav items ── */}
      {NAV_ITEMS.map((n, idx) => {
        const active = isActive(n.path);
        const hovered = hoveredIdx === idx;

        return (
          <button
            key={n.path}
            onClick={() => go(n.path)}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{
              height: 40,
              margin: '1px 10px',
              borderRadius: 8,
              background: active
                ? 'var(--sidebar-active-bg)'
                : hovered
                  ? 'var(--glass)'
                  : 'transparent',
              border: active ? '1px solid var(--sidebar-active-border)' : '1px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: expanded ? 'flex-start' : 'center',
              gap: expanded ? 12 : 0,
              padding: expanded ? '0 14px' : '0',
              color: active
                ? 'var(--sidebar-active)'
                : hovered
                  ? 'var(--text)'
                  : 'var(--text-dim)',
              transition: 'all .18s',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Icon */}
            <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              {icons[n.icon]}
            </span>

            {/* Label */}
            <span
              style={{
                fontFamily: 'var(--font-m)',
                fontSize: 12,
                letterSpacing: '.04em',
                whiteSpace: 'nowrap',
                opacity: expanded ? 1 : 0,
                width: expanded ? 'auto' : 0,
                transform: expanded ? 'translateX(0)' : 'translateX(-6px)',
                transition: 'opacity .2s, transform .2s, width .2s',
                overflow: 'hidden',
              }}
            >
              {t(n.label)}
            </span>

            {/* Tooltip (only when collapsed) */}
            {!expanded && hovered && (
              <span
                style={{
                  position: 'absolute',
                  left: '100%',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  marginLeft: 12,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  padding: '5px 12px',
                  fontFamily: 'var(--font-m)',
                  fontSize: 11,
                  letterSpacing: '.04em',
                  color: 'var(--white)',
                  whiteSpace: 'nowrap',
                  zIndex: 999,
                  pointerEvents: 'none',
                  animation: 'fadeIn .12s ease both',
                  boxShadow: '0 4px 12px rgba(0,0,0,.4)',
                }}
              >
                {t(n.label)}
              </span>
            )}
          </button>
        );
      })}

      <div style={{ flex: 1 }} />

      {/* ── Divider ── */}
      <div
        style={{
          height: 1,
          background: 'var(--border)',
          margin: '8px 16px 10px',
        }}
      />

      {/* ── Settings ── */}
      <button
        onClick={() => go('/settings')}
        onMouseEnter={(e) => {
          if (!isActive('/settings')) {
            e.currentTarget.style.background = 'var(--glass)';
            e.currentTarget.style.color = 'var(--text)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive('/settings')) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-dim)';
          }
        }}
        style={{
          height: 40,
          margin: '1px 10px',
          borderRadius: 8,
          background: isActive('/settings')
            ? 'var(--sidebar-active-bg)'
            : 'transparent',
          border: isActive('/settings') ? '1px solid var(--sidebar-active-border)' : '1px solid transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: expanded ? 'flex-start' : 'center',
          gap: expanded ? 12 : 0,
          padding: expanded ? '0 14px' : '0',
          color: isActive('/settings') ? 'var(--sidebar-active)' : 'var(--text-dim)',
          transition: 'all .18s',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {icons.settings}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-m)',
            fontSize: 12,
            letterSpacing: '.04em',
            whiteSpace: 'nowrap',
            opacity: expanded ? 1 : 0,
            width: expanded ? 'auto' : 0,
            transform: expanded ? 'translateX(0)' : 'translateX(-6px)',
            transition: 'opacity .2s, transform .2s, width .2s',
            overflow: 'hidden',
          }}
        >
          {t('nav.settings')}
        </span>
      </button>

      {/* ── Logout ── */}
      <button
        onClick={() => { logout(); go('/login'); }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--danger-bg)';
          e.currentTarget.style.color = 'var(--danger)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-dim)';
        }}
        style={{
          height: 40,
          margin: '1px 10px 0',
          borderRadius: 8,
          background: 'transparent',
          border: '1px solid transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: expanded ? 'flex-start' : 'center',
          gap: expanded ? 12 : 0,
          padding: expanded ? '0 14px' : '0',
          color: 'var(--text-dim)',
          transition: 'all .18s',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </span>
        <span
          style={{
            fontFamily: 'var(--font-m)',
            fontSize: 12,
            letterSpacing: '.04em',
            whiteSpace: 'nowrap',
            opacity: expanded ? 1 : 0,
            width: expanded ? 'auto' : 0,
            transform: expanded ? 'translateX(0)' : 'translateX(-6px)',
            transition: 'opacity .2s, transform .2s, width .2s',
            overflow: 'hidden',
          }}
        >
          {t('nav.sign_out')}
        </span>
      </button>

    </div>
  );
}
