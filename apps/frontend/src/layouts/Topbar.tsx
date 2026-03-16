import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';

/* ─────────────────────────────────────────────
   TOPBAR — Breadcrumb + search + user avatar
   Simplified version without full auth/theme yet
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

const SEARCH_ITEMS = [
  { label: 'Dashboard', path: '/', keywords: 'home overview stats revenue' },
  { label: 'Clients', path: '/clients', keywords: 'people contacts customers' },
  { label: 'Projects', path: '/projects', keywords: 'work tasks boards' },
  { label: 'Proposals', path: '/proposals', keywords: 'quotes offers bids' },
  { label: 'Invoices', path: '/invoices', keywords: 'billing payments money' },
  { label: 'Reminders', path: '/reminders', keywords: 'alerts notifications schedule' },
  { label: 'Settings', path: '/settings', keywords: 'profile preferences account security' },
];

export default function Topbar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  const basePath = '/' + (location.pathname.split('/')[1] || '');
  const label = ROUTE_LABELS[basePath] || 'Dashboard';

  const initials = 'U';

  const q = query.toLowerCase().trim();
  const results = q
    ? SEARCH_ITEMS.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.keywords.includes(q),
      )
    : [];

  const showResults = focused && q.length > 0 && results.length > 0;

  useEffect(() => setSelectedIdx(0), [q]);

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
        padding: '0 28px',
        flexShrink: 0,
      }}
    >
      {/* Breadcrumb */}
      <p
        style={{
          fontFamily: 'var(--font-m)',
          fontSize: 12,
          color: 'var(--text-dim)',
          letterSpacing: '.04em',
        }}
      >
        <span style={{ color: 'var(--text-mid)' }}>Dashboard</span>
        <span style={{ margin: '0 8px', opacity: 0.4 }}>/</span>
        <span style={{ color: 'var(--white)' }}>{label}</span>
      </p>

      {/* Search + Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
        <div ref={searchRef} style={{ position: 'relative' }}>
          <span
            style={{
              fontSize: 13,
              color: 'var(--text-dim)',
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
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
              width: 260,
              padding: '8px 12px 8px 28px',
              borderRadius: 999,
              border: '1px solid var(--border)',
              background: 'rgba(0,0,0,0.2)',
              color: 'var(--text)',
              fontFamily: 'var(--font-m)',
              fontSize: 12,
              outline: 'none',
            }}
          />
          {showResults && (
            <div
              style={{
                position: 'absolute',
                top: 34,
                left: 0,
                right: 0,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: 6,
                boxShadow: '0 12px 32px rgba(0,0,0,.6)',
                zIndex: 10,
              }}
            >
              {results.map((item, idx) => (
                <button
                  key={item.path}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    goTo(item.path);
                  }}
                  style={{
                    display: 'flex',
                    width: '100%',
                    textAlign: 'left',
                    padding: '6px 8px',
                    borderRadius: 6,
                    border: 'none',
                    background: idx === selectedIdx ? 'rgba(255,255,255,0.04)' : 'transparent',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-m)',
                    fontSize: 12,
                    color: 'var(--text)',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <NotificationBell />

        {/* Simple avatar */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-m)',
            fontSize: 12,
            color: 'var(--text-mid)',
          }}
        >
          {initials}
        </div>
      </div>
    </div>
  );
}


