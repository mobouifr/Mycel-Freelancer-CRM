import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useIsMobile';

const actions = [
  { label: 'New Invoice',  icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2', path: '/invoices' },
  { label: 'New Client',   icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', path: '/clients' },
  { label: 'New Project',  icon: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z', path: '/projects' },
  { label: 'New Proposal', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', path: '/proposals' },
];

export default function QuickCreateFAB() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  /* Close on outside click or Escape */
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open]);

  const portal = document.getElementById('portal-root');
  if (!portal) return null;

  return createPortal(
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        bottom: isMobile 
          ? 'max(80px, env(safe-area-inset-bottom, 0px))'
          : 'max(100px, env(safe-area-inset-bottom, 0px))',
        right: isMobile
          ? 'max(20px, env(safe-area-inset-right, 0px))'
          : 'max(32px, env(safe-area-inset-right, 0px))',
        zIndex: 'var(--z-fab, 60)' as unknown as number,
      }}
    >
      {/* Backdrop — subtle dim when menu is open */}
      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.15)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            zIndex: -1,
            animation: 'fadeIn .12s ease both',
          }}
        />
      )}

      {/* Action menu */}
      {open && (
        <div style={{
          position: 'absolute',
          bottom: isMobile ? 52 : 72,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? 4 : 6,
        }}>
          {actions.map((a, i) => (
            <button
              key={a.label}
              onClick={() => { setOpen(false); navigate(a.path); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? 6 : 8,
                padding: isMobile ? '8px 12px' : '9px 16px',
                background: 'color-mix(in srgb, var(--surface) 80%, transparent)',
                backdropFilter: 'blur(16px) saturate(1.4)',
                WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
                border: '1px solid var(--border)',
                borderRadius: isMobile ? 8 : 10,
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 20px rgba(0,0,0,.25)',
                cursor: 'pointer',
                transition: 'all .15s',
                animation: 'fadeUp .15s var(--ease) both',
                animationDelay: `${i * 35}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-hover)';
                e.currentTarget.style.background = 'color-mix(in srgb, var(--surface-2) 90%, transparent)';
                e.currentTarget.style.transform = 'translateX(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'color-mix(in srgb, var(--surface) 80%, transparent)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <svg width={isMobile ? 12 : 14} height={isMobile ? 12 : 14} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={a.icon} />
              </svg>
              <span style={{
                fontFamily: 'var(--font-m)', fontSize: isMobile ? 11 : 12,
                fontWeight: 500, color: 'var(--text)',
                letterSpacing: '0.01em',
              }}>
                {a.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* FAB button — glassmorphism */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close quick create' : 'Quick create'}
        style={{
          width: isMobile ? 48 : 56, 
          height: isMobile ? 48 : 56, 
          borderRadius: 999,
          background: 'var(--fab-bg)',
          backdropFilter: 'blur(8px) saturate(120%)',
          WebkitBackdropFilter: 'blur(8px) saturate(120%)',
          border: '1px solid var(--fab-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 24px rgba(0,0,0,.2)',
          transition: 'all .2s var(--ease)',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,0,0,.3), 0 0 0 4px var(--accent-bg)';
          e.currentTarget.style.transform = open ? 'rotate(45deg) scale(1.08)' : 'scale(1.08)';
          e.currentTarget.style.borderColor = 'var(--accent-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,.2)';
          e.currentTarget.style.transform = open ? 'rotate(45deg)' : 'rotate(0deg)';
          e.currentTarget.style.borderColor = 'var(--fab-border)';
        }}
      >
        <svg width={isMobile ? 18 : 22} height={isMobile ? 18 : 22} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>,
    portal,
  );
}
