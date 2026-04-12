import { useEffect } from 'react';

export function useDashboardRealtime() {
  useEffect(() => {
    let sse: EventSource | null = null;
    
    const startSSE = () => {
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
        setTimeout(startSSE, 10000); // Auto-reconnect silently after 10s if backend dies
      };
    };
    
    startSSE();
    
    return () => {
      if (sse) sse.close();
    };
  }, []);
}

