import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/* ─────────────────────────────────────────────
   MODAL — Overlay dialog with scale-in animation
───────────────────────────────────────────── */

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: number;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  width = 480,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn .2s ease both',
      }}
    >
      <div
        style={{
          width: '90%',
          maxWidth: width,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '28px 32px',
          animation: 'scaleIn .25s var(--ease) both',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        {title && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
              paddingBottom: 16,
              borderBottom: '1px solid var(--border)',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-d)',
                fontWeight: 500,
                fontSize: 18,
                color: 'var(--text)',
                letterSpacing: '.04em',
                lineHeight: 1.3,
              }}
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-dim)',
                fontSize: 18,
                padding: 4,
                lineHeight: 1,
                transition: 'color .15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--white)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-dim)';
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Content */}
        {children}
      </div>
    </div>,
    document.body,
  );
}
