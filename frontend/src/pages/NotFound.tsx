import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { LogoMark } from '../components';

export default function NotFound() {
  const navigate = useNavigate();
  const { mode: themeMode, cycleQuickTheme, theme } = useTheme();
  const textRef = useRef<HTMLParagraphElement>(null);
  const handleRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startAnimation();
  }, []);

  const startAnimation = () => {
    // Typewriter effect
    const text = "404, page not found.";
    let currentText = "";
    let charIndex = 0;
    
    // Start with cursor at the beginning
    if (handleRef.current) {
      handleRef.current.style.animation = 'blink 0.4s infinite alternate';
    }
    
    const typeInterval = setInterval(() => {
      if (charIndex < text.length) {
        currentText += text[charIndex];
        if (textRef.current) {
          textRef.current.textContent = currentText;
        }
        // Update cursor position to follow the text
        if (textRef.current && handleRef.current) {
          const textWidth = textRef.current.offsetWidth;
          handleRef.current.style.transform = `translateX(${textWidth}px)`;
        }
        charIndex++;
      } else {
        clearInterval(typeInterval);
        // Keep cursor blinking at the end
        if (handleRef.current) {
          handleRef.current.style.animation = 'blink 0.4s infinite alternate';
        }
      }
    }, 50);

    return () => clearInterval(typeInterval);
  };



  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div style={{
      height: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, var(--bg) 0%, var(--bg2) 100%)', position: 'relative',
    }}>
      {/* Header with logo and theme switcher */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <LogoMark size={32} />
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 18, color: 'var(--text)', letterSpacing: '.01em',
          }}>Mycel.</span>
        </div>

        {/* Theme switcher */}
        <button
          onClick={cycleQuickTheme}
          aria-label={`Switch theme (current: ${theme})`}
          title={`Theme: ${theme}`}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text)',
            transition: 'all .2s',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--white)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text)';
          }}
        >
          {themeMode === 'light' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>

      {/* 404 Content */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        padding: '20px 32px',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 40,
        }}>
          <div className="copy-container" ref={containerRef} style={{ position: 'relative', textAlign: 'center' }}>
            <p 
              ref={textRef}
              style={{
                fontFamily: 'var(--font-m)',
                fontSize: 'clamp(16px, 4vw, 32px)', // Smaller text
                color: 'var(--text)',
                letterSpacing: '0.2px',
                margin: 0,
                display: 'inline-block',
                fontWeight: 200, // Thinner text
                textTransform: 'uppercase', // Uppercase text
              }}
            >
              404, page not found.
            </p>
            <span 
              className="handle" 
              ref={handleRef}
              style={{
                background: 'var(--accent)',
                width: 'clamp(1px, 0.3vw, 2px)', // Smaller width
                height: 'clamp(16px, 4vw, 32px)', // Smaller height
                top: 0,
                left: 0,
                marginTop: '2px',
                position: 'absolute',
                transform: 'translateX(0)',
              }}
            />
          </div>

          {/* Go Home Button */}
          <button
            onClick={handleGoHome}
            style={{
              padding: '12px 24px',
              borderRadius: 8,
              background: 'transparent', // No background color
              border: '1px solid var(--text)', // White border frame
              color: 'var(--text)', // White text
              fontFamily: 'var(--font-m)', fontSize: 12, fontWeight: 600,
              letterSpacing: '.08em', cursor: 'pointer',
              transition: 'all .15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.color = 'var(--accent)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--text)';
              e.currentTarget.style.color = 'var(--text)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            GO HOME
          </button>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
