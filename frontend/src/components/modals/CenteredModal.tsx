import { useEffect } from 'react';

interface CenteredModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function CenteredModal({ title, onClose, children }: CenteredModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      role="presentation"
      onMouseDown={(e) => {
        // Close only when clicking the backdrop itself.
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue('--z-modal')) || 1500,
        background: 'rgba(0,0,0,.45)',
        backdropFilter: 'blur(10px) saturate(1.1)',
        WebkitBackdropFilter: 'blur(10px) saturate(1.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '28px 24px',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          width: 'min(760px, 100%)',
          background: 'var(--bg2)',
          borderRadius: 16,
          // Thick outer edge + strong offset shadow (Image 1 style)
          border: '3px solid var(--bg)',
          boxShadow: '8px 8px 0 rgba(0,0,0,.75), 0 26px 70px rgba(0,0,0,.55)',
          overflow: 'hidden',
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '18px 20px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-d)',
              fontSize: 16,
              fontWeight: 500,
              color: 'var(--text)',
              letterSpacing: '.04em',
              margin: 0,
            }}
          >
            {title}
          </h2>

          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-dim)',
              transition: 'all .15s var(--ease)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--text-mid)';
              e.currentTarget.style.color = 'var(--text)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-dim)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
            }}
          >
            <span style={{ fontFamily: 'var(--font-m)', fontSize: 14, lineHeight: 1 }}>×</span>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 20px' }}>{children}</div>
      </div>
    </div>
  );
}

