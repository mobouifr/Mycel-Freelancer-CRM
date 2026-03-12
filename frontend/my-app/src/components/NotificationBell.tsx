import { useState, useRef, useEffect } from 'react';
import { useStore } from '../hooks/useStore';

/* ─────────────────────────────────────────────
   NOTIFICATION BELL — Unread count badge +
   dropdown panel with mark-as-read / dismiss
───────────────────────────────────────────── */

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const typeIcon: Record<string, React.ReactNode> = {
    reminder: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    invoice:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    client:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    system:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        style={{
          width: 36, height: 36,
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -2,
            minWidth: 16, height: 16,
            borderRadius: 8,
            background: 'var(--danger)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-m)', fontSize: 9, fontWeight: 600,
            color: '#fff', padding: '0 4px',
            lineHeight: 1,
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 44, right: 0,
          width: 320,
          maxHeight: 400,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          boxShadow: '0 12px 40px rgba(0,0,0,.5)',
          animation: 'fadeUp .15s var(--ease) both',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 100,
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <p style={{
              fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-mid)',
              letterSpacing: '.1em', textTransform: 'uppercase',
            }}>
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </p>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--accent)',
                  letterSpacing: '.04em',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Items */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)' }}>
                  No notifications
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(255,255,255,.03)',
                    display: 'flex', gap: 10,
                    background: n.isRead ? 'transparent' : 'var(--accent-bg)',
                    transition: 'background .15s',
                    cursor: 'pointer',
                  }}
                  onClick={() => { if (!n.isRead) markAsRead(n.id); }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = n.isRead ? 'transparent' : 'var(--accent-bg)'; }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', marginTop: 2 }}>
                    {typeIcon[n.type] || typeIcon.system}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                      <p style={{
                        fontFamily: 'var(--font-m)', fontSize: 11,
                        color: n.isRead ? 'var(--text-mid)' : 'var(--white)',
                        fontWeight: n.isRead ? 400 : 500,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                      }}>
                        {n.title}
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); dismissNotification(n.id); }}
                        aria-label="Dismiss"
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--text-dim)', fontSize: 10, padding: '0 2px',
                          transition: 'color .15s', marginLeft: 4,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; }}
                      >
                        ✕
                      </button>
                    </div>
                    <p style={{
                      fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)',
                      lineHeight: 1.4,
                    }}>
                      {n.message}
                    </p>
                    {!n.isRead && (
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: 'var(--accent)',
                        position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                      }} />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
