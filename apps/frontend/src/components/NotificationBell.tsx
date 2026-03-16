import { useState, useRef, useEffect } from 'react';

/* ─────────────────────────────────────────────
   NOTIFICATION BELL — Temporary stub
   (You can later wire this to real notifications)
───────────────────────────────────────────── */

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '1px solid var(--border)',
          background: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'border-color .15s, background .15s',
          position: 'relative',
          color: 'var(--text-dim)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.background = 'var(--glass)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.background = 'none';
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 44,
            right: 0,
            width: 260,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            boxShadow: '0 12px 32px rgba(0,0,0,.6)',
            padding: '12px 14px',
            fontFamily: 'var(--font-m)',
            fontSize: 11,
            color: 'var(--text-dim)',
            animation: 'fadeUp .15s var(--ease) both',
            zIndex: 100,
          }}
        >
          No notifications yet.
        </div>
      )}
    </div>
  );
}


