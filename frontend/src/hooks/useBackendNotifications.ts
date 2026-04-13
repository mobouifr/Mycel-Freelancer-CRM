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

const POLL_INTERVAL  = 30_000;  // 30 s — normal polling cadence
const BACKOFF_DELAYS = [5_000, 15_000, 30_000, 60_000]; // retry ladder after disconnect
const VALID_TYPES    = new Set(['info', 'success', 'warning', 'error']);

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
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backoffIndex = useRef(0);
  const alive        = useRef(true);

  const schedule = useCallback((delay: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => poll(), delay); // eslint-disable-line @typescript-eslint/no-use-before-define
  }, []);

  const poll = useCallback(async () => {
    if (!alive.current) return;
    try {
      const raw = await notificationsService.fetchAll();
      if (!alive.current) return;
      setNotifications(raw.map(mapToApp));
      backoffIndex.current = 0;           // connection healthy — reset backoff
      schedule(POLL_INTERVAL);
    } catch (err: any) {
      if (!alive.current) return;
      const status = err?.response?.status;
      if (status === 401) return;         // api interceptor handles redirect
      // Network error or server down — use exponential backoff
      const delay = BACKOFF_DELAYS[Math.min(backoffIndex.current, BACKOFF_DELAYS.length - 1)];
      backoffIndex.current = Math.min(backoffIndex.current + 1, BACKOFF_DELAYS.length - 1);
      schedule(delay);
    }
  }, [schedule]);

  useEffect(() => {
    alive.current = true;
    poll();

    let sse: EventSource | null = null;
    
    const startSSE = () => {
      if (!alive.current) return;
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/notifications/realtime`;
      sse = new EventSource(url, { withCredentials: true });
      
      sse.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.refresh) {
            poll(); // instantly fetch new notifications
          }
        } catch(err) { /* ignore parse errors */ }
      };
      
      sse.onerror = () => {
        sse?.close();
        if (alive.current) {
          setTimeout(startSSE, 10000); // Auto-reconnect silently
        }
      };
    };
    
    startSSE();

    return () => {
      alive.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (sse) sse.close();
    };
  }, [poll]);

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

  const dismissAll = useCallback(async () => {
    try {
      await notificationsService.removeAll();
      setNotifications([]);
    } catch { /* silent */ }
  }, []);

  return { notifications, refresh: poll, markAsRead, markAllAsRead, dismiss, dismissAll };
}
