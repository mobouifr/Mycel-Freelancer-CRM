import { useState, useCallback, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from '../components/Footer';
import ChatbotAI from '../components/ChatbotAI';
import { useIsMobile } from '../hooks/useIsMobile';

/* ─────────────────────────────────────────────
   APP LAYOUT — Sidebar + Topbar + Content
───────────────────────────────────────────── */

export default function AppLayout() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const updateFabRef = useRef<(() => void) | null>(null);

  const toggleMenu = useCallback(() => setMobileMenuOpen((v) => !v), []);
  const closeMenu = useCallback(() => setMobileMenuOpen(false), []);

  // Keep the FAB above the footer — update --fab-bottom CSS variable on scroll
  useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;
    const footerEl = mainEl.querySelector('footer');
    if (!footerEl) return;

    const FAB_DEFAULT = 32;
    const FAB_GAP = 12;

    const update = () => {
      const footerTop = footerEl.getBoundingClientRect().top;
      const vh = window.innerHeight;
      if (footerTop < vh) {
        const bottom = vh - footerTop + FAB_GAP;
        document.documentElement.style.setProperty('--fab-bottom', `${Math.max(FAB_DEFAULT, bottom)}px`);
      } else {
        document.documentElement.style.setProperty('--fab-bottom', `${FAB_DEFAULT}px`);
      }
    };

    updateFabRef.current = update;
    mainEl.addEventListener('scroll', update, { passive: true });
    update();
    return () => {
      mainEl.removeEventListener('scroll', update);
      document.documentElement.style.removeProperty('--fab-bottom');
    };
  }, []);

  // Re-check FAB position on every route change — short pages never trigger scroll
  useEffect(() => {
    requestAnimationFrame(() => updateFabRef.current?.());
  }, [location.pathname]);

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
          ref={mainRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isMobile ? '20px 16px' : '28px 32px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ flex: 1 }}>
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
      <ChatbotAI />
    </div>
  );
}
