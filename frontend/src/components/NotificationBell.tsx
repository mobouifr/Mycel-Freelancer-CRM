import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../hooks/useStore';
import { useBackendNotifications } from '../hooks/useBackendNotifications';
import type { AppNotification } from '../hooks/useStore';

/* ─────────────────────────────────────────────
   NOTIFICATION BELL — Unread count badge +
   dropdown panel with mark-as-read / dismiss.

   Two sources are merged here:
   • backend  — client/project/gamification events
                fetched from API, polled every 30 s
   • local    — events/notes/todos from useStore
                persisted in localStorage

   Actions are routed to the correct handler
   based on notification.source.
───────────────────────────────────────────── */

export default function NotificationBell() {
  const store = useStore();
  const backend = useBackendNotifications();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // ── Merge + sort by date descending ─────────
  const notifications = useMemo<AppNotification[]>(() => {
    const merged = [...backend.notifications, ...store.notifications];
    return merged.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ).slice(0, 50);
  }, [backend.notifications, store.notifications]);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.isRead).length,
    [notifications],
  );

  // ── Route actions to correct handler ────────
  const handleMarkAsRead = (n: AppNotification) => {
    if (n.source === 'backend') backend.markAsRead(n.id);
    else store.markAsRead(n.id);
  };

  const handleMarkAllAsRead = () => {
    backend.markAllAsRead();
    store.markAllAsRead();
  };

  const handleDismiss = (n: AppNotification) => {
    if (n.source === 'backend') backend.dismiss(n.id);
    else store.dismissNotification(n.id);
  };

  const handleDismissAll = () => {
    backend.dismissAll();
    store.dismissAllNotifications();
  };

  // ── Navigate on click ────────────────────────
  const handleClick = (n: AppNotification) => {
    if (!n.isRead) handleMarkAsRead(n);
    if (n.targetType) {
      const routes: Record<string, string> = {
        project: '/projects',
        client:  '/clients',
        event:   '/reminders',
        note:    '/reminders',
        todo:    '/reminders',
      };
      const path = routes[n.targetType];
      if (path) navigate(path);
    }
    setOpen(false);
  };

  // ── Close on outside click ───────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // ── Close on Escape ──────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // ── Icons per type / targetType ─────────────
  const typeIcon: Record<string, React.ReactNode> = {
    // local sources
    reminder: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    event:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    note:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    todo:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
    // backend targetTypes
    project:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
    client:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    // fallback
    system:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  };

  const getIcon = (n: AppNotification) =>
    typeIcon[n.targetType ?? ''] ?? typeIcon[n.type] ?? typeIcon.system;

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
            color: 'var(--bg)', padding: '0 4px',
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
              {t('notifications.title')} {unreadCount > 0 && `(${unreadCount})`}
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--accent)',
                    letterSpacing: '.04em',
                  }}
                >
                  {t('notifications.mark_all_read')}
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleDismissAll}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--danger)',
                    letterSpacing: '.04em',
                  }}
                >
                  {t('notifications.delete_all')}
                </button>
              )}
            </div>
          </div>

          {/* Items */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--text-dim)' }}>
                  {t('notifications.empty')}
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={`${n.source ?? 'local'}-${n.id}`}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', gap: 10,
                    background: n.isRead ? 'transparent' : 'var(--accent-bg)',
                    transition: 'background .15s',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  onClick={() => handleClick(n)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = n.isRead ? 'transparent' : 'var(--accent-bg)'; }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', marginTop: 2 }}>
                    {getIcon(n)}
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
                        onClick={(e) => { e.stopPropagation(); handleDismiss(n); }}
                        aria-label={t('notifications.dismiss')}
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
