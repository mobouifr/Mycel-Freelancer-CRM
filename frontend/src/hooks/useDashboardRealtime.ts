import { useEffect } from 'react';

export function useDashboardRealtime() {
  useEffect(() => {
    let sse: EventSource | null = null;
    let alive = true;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const startSSE = () => {
      if (!alive) return;
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/dashboard/realtime`;
      sse = new EventSource(url, { withCredentials: true });

      sse.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.refresh) {
            // Broadcasts event to all dashboard widgets automatically
            window.dispatchEvent(new Event('dashboardRefresh'));
          }
        } catch(err) { /* ignore parse errors */ }
      };

      sse.onerror = () => {
        sse?.close();
        if (alive) {
          retryTimer = setTimeout(startSSE, 10000); // Auto-reconnect silently after 10s if backend dies
        }
      };
    };

    startSSE();

    return () => {
      alive = false;
      if (retryTimer) clearTimeout(retryTimer);
      if (sse) sse.close();
    };
  }, []);
}

