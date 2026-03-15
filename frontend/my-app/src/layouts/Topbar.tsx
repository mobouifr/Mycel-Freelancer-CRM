import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { NotificationBell } from '../components';

/* ─────────────────────────────────────────────
   TOPBAR — Breadcrumb + search + user avatar
───────────────────────────────────────────── */

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Overview',
  '/clients': 'Clients',
  '/projects': 'Projects',
  '/proposals': 'Proposals',
  '/invoices': 'Invoices',
  '/reminders': 'Reminders',
  '/settings': 'Settings',
};

/* Searchable items — pages + quick actions */
const SEARCH_ITEMS = [
  { label: 'Dashboard',  path: '/',          keywords: 'home overview stats revenue' },
  { label: 'Clients',    path: '/clients',   keywords: 'people contacts customers' },
  { label: 'Projects',   path: '/projects',  keywords: 'work tasks boards' },
  { label: 'Proposals',  path: '/proposals', keywords: 'quotes offers bids' },
  { label: 'Invoices',   path: '/invoices',  keywords: 'billing payments money' },
  { label: 'Reminders',  path: '/reminders', keywords: 'alerts notifications schedule' },
  { label: 'Settings',   path: '/settings',  keywords: 'profile preferences account security' },
];

interface TopbarProps {
  isMobile?: boolean;
  onMenuToggle?: () => void;
}

export default function Topbar({ isMobile = false, onMenuToggle }: TopbarProps = {}) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, cycleQuickTheme, theme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const menuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Get current page label from route
  const basePath = '/' + (location.pathname.split('/')[1] || '');
  const label = ROUTE_LABELS[basePath] || 'Dashboard';

  const initials = user?.username
    ? user.username
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  // Filter search results
  const q = query.toLowerCase().trim();
  const results = q
    ? SEARCH_ITEMS.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.keywords.includes(q)
      )
    : [];

  const showResults = focused && q.length > 0 && results.length > 0;

  // Reset selection when results change
  useEffect(() => setSelectedIdx(0), [q]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const goTo = (path: string) => {
    navigate(path);
    setQuery('');
    setFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      goTo(results[selectedIdx].path);
    } else if (e.key === 'Escape') {
      setFocused(false);
    }
  };

  return (
    <div
      style={{
        height: 56,
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 16px' : '0 28px',
        flexShrink: 0,
      }}
    >
      {/* Left side: hamburger (mobile) + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isMobile && (
          <button
            onClick={onMenuToggle}
            aria-label="Toggle menu"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-mid)',
              display: 'flex',
              alignItems: 'center',
              padding: 4,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}
        <p
          style={{
            fontFamily: 'var(--font-m)',
            fontSize: 12,
            color: 'var(--text-dim)',
            letterSpacing: '.04em',
          }}
        >
          {!isMobile && (
            <>
              <span style={{ color: 'var(--text-mid)' }}>Dashboard</span>
              <span style={{ margin: '0 8px', opacity: 0.4 }}>/</span>
            </>
          )}
          <span style={{ color: 'var(--white)' }}>{label}</span>
        </p>
      </div>

      {/* Search + Theme Toggle + Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
        {!isMobile && <div ref={searchRef} style={{ position: 'relative' }}>
          <span
            style={{
              fontSize: 13,
              color: 'var(--text-dim)',
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          >
            ⌕
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages..."
            style={{
              background: 'var(--glass)',
              border: `1px solid ${focused ? 'var(--border-h)' : 'var(--border)'}`,
              borderRadius: 6,
              padding: '7px 14px 7px 34px',
              color: 'var(--white)',
              fontFamily: 'var(--font-m)',
              fontSize: 12,
              width: 220,
              outline: 'none',
              transition: 'border-color .2s, width .2s',
            }}
          />

          {/* Search results dropdown */}
          {showResults && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: 6,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '4px 0',
                zIndex: 200,
                animation: 'fadeUp .12s var(--ease) both',
                boxShadow: '0 8px 24px rgba(0,0,0,.5)',
              }}
            >
              {results.map((item, i) => (
                <button
                  key={item.path}
                  onClick={() => goTo(item.path)}
                  onMouseEnter={() => setSelectedIdx(i)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '9px 14px',
                    background: i === selectedIdx ? 'var(--glass)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: i === selectedIdx ? 'var(--white)' : 'var(--text-mid)',
                    fontFamily: 'var(--font-m)',
                    fontSize: 12,
                    letterSpacing: '.03em',
                    textAlign: 'left',
                    transition: 'background .1s',
                  }}
                >
                  <span style={{ opacity: 0.4, fontSize: 10 }}>→</span>
                  {item.label}
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: 9,
                      color: 'var(--text-dim)',
                      letterSpacing: '.06em',
                    }}
                  >
                    {item.path}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {focused && q.length > 0 && results.length === 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: 6,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '14px',
                zIndex: 200,
                animation: 'fadeUp .12s var(--ease) both',
                boxShadow: '0 8px 24px rgba(0,0,0,.5)',
                fontFamily: 'var(--font-m)',
                fontSize: 11,
                color: 'var(--text-dim)',
                textAlign: 'center',
                letterSpacing: '.04em',
              }}
            >
              No pages found for "{query}"
            </div>
          )}
        </div>}

        {/* Theme toggle */}
        <button
          onClick={cycleQuickTheme}
          aria-label={`Switch theme (current: ${theme})`}
          title={`Theme: ${theme}`}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--glass)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-dim)',
            transition: 'all .2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--white)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-dim)';
          }}
        >
          {mode === 'light' ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        {/* Notification bell */}
        <NotificationBell />

        {/* User avatar */}
        <div
          style={{ position: 'relative' }}
          onMouseEnter={() => {
            if (menuTimeout.current) clearTimeout(menuTimeout.current);
            setShowMenu(true);
          }}
          onMouseLeave={() => {
            menuTimeout.current = setTimeout(() => setShowMenu(false), 150);
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: showMenu ? 'var(--accent-hover)' : 'var(--glass)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontFamily: 'var(--font-m)',
              color: 'var(--white)',
              cursor: 'pointer',
              letterSpacing: '.04em',
              transition: 'background .15s',
            }}
          >
            {initials}
          </div>

          {/* Dropdown — always mounted for smooth fade */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 8,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '6px 0',
              minWidth: 160,
              zIndex: 100,
              opacity: showMenu ? 1 : 0,
              transform: showMenu ? 'translateY(0)' : 'translateY(-4px)',
              pointerEvents: showMenu ? 'auto' : 'none',
              transition: 'opacity .2s ease, transform .2s ease',
            }}
          >
              <div
                style={{
                  padding: '8px 16px',
                  borderBottom: '1px solid var(--border)',
                  marginBottom: 4,
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-m)',
                    fontSize: 11,
                    color: 'var(--white)',
                    marginBottom: 2,
                  }}
                >
                  {user?.username || 'User'}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-m)',
                    fontSize: 10,
                    color: 'var(--text-dim)',
                  }}
                >
                  {user?.email || ''}
                </p>
              </div>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                style={{
                  display: 'block',
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-m)',
                  fontSize: 11,
                  color: 'var(--danger)',
                  letterSpacing: '.04em',
                  textAlign: 'left',
                  transition: 'background .15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--glass)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                }}
              >
                Sign out
              </button>
            </div>
        </div>
      </div>
    </div>
  );
}
