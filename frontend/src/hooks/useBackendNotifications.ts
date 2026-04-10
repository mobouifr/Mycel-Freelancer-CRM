import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationsService } from '../services/notifications.service';
import type { BackendNotification } from '../services/notifications.service';
import type { AppNotification } from './useStore';

/* ─────────────────────────────────────────────
   useBackendNotifications
   Fetches real notifications from the backend,
   polls every 30 s, and exposes async actions
   that sync mutations back to the API.

   Returns AppNotification[] with source:'backend'
   so NotificationBell can route actions correctly.
───────────────────────────────────────────── */

const POLL_INTERVAL = 30_000; // 30 seconds
const VALID_TYPES = new Set(['info', 'success', 'warning', 'error']);

function mapToApp(n: BackendNotification): AppNotification {
  return {
    id:         n.id,
    // Normalise backend type — 'achievement'/'badge' → 'success' for UI icon
    type:       (VALID_TYPES.has(n.type) ? n.type : 'success') as AppNotification['type'],
    // Use title if present, otherwise fall back to message so n.title is always a string
    title:      n.title || n.message,
    message:    n.message,
    isRead:     n.read,
    // targetType comes as 'project'|'client' — the extended union handles this
    targetType: (n.targetType ?? undefined) as AppNotification['targetType'],
    targetId:   n.targetId ?? undefined,
    createdAt:  n.createdAt,
    source:     'backend',
  };
}

export function useBackendNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const raw = await notificationsService.fetchAll();
      setNotifications(raw.map(mapToApp));
    } catch {
      // 401 → api interceptor redirects to /login
      // network / 5xx  → silently ignore, keep stale list
    }
  }, []);

  useEffect(() => {
    refresh();
    timerRef.current = setInterval(refresh, POLL_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [refresh]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n),
      );
    } catch { /* silent */ }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { /* silent */ }
  }, []);

  const dismiss = useCallback(async (id: string) => {
    try {
      await notificationsService.remove(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch { /* silent */ }
  }, []);

  return { notifications, refresh, markAsRead, markAllAsRead, dismiss };
}
