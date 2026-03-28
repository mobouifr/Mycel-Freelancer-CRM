import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

/* ─────────────────────────────────────────────
   APP LAYOUT — Sidebar + Topbar + Content
───────────────────────────────────────────── */

export default function AppLayout() {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        background: 'var(--bg)',
        animation: 'fadeIn .4s ease both',
      }}
    >
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar />
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '28px 32px',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}









