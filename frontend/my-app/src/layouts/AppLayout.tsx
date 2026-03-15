import { useState, useCallback } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useIsMobile } from '../hooks/useIsMobile';

/* ─────────────────────────────────────────────
   APP LAYOUT — Sidebar + Topbar + Content
───────────────────────────────────────────── */

export default function AppLayout() {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => setMobileMenuOpen((v) => !v), []);
  const closeMenu = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        background: 'var(--bg)',
        animation: 'fadeIn .4s ease both',
      }}
    >
      {/* Desktop sidebar */}
      {!isMobile && <Sidebar />}

      {/* Mobile sidebar overlay */}
      {isMobile && mobileMenuOpen && (
        <>
          <div
            onClick={closeMenu}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
              animation: 'fadeIn .2s ease both',
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: 260,
              zIndex: 1001,
              animation: 'slideInLeft .25s var(--ease) both',
              background: 'var(--sidebar-bg)',
              overflowY: 'auto',
            }}
          >
            <Sidebar onNavigate={closeMenu} />
          </div>
        </>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar isMobile={isMobile} onMenuToggle={toggleMenu} />
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isMobile ? '20px 16px' : '28px 32px',
          }}
        >
          <Outlet />

          <footer
            style={{
              marginTop: 48,
              paddingTop: 16,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
              paddingBottom: 16,
            }}
          >
            <p style={{ fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '.04em' }}>
              © Mycel. {new Date().getFullYear()}
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
              <Link to="/privacy-policy" style={{ fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)', textDecoration: 'none', letterSpacing: '.04em' }}>
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" style={{ fontFamily: 'var(--font-m)', fontSize: 10, color: 'var(--text-dim)', textDecoration: 'none', letterSpacing: '.04em' }}>
                Terms of Service
              </Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
