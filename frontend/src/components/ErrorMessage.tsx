/* ─────────────────────────────────────────────
   ERROR MESSAGE — Inline error display
───────────────────────────────────────────── */

interface ErrorMessageProps {
  message?: string | null;
  onDismiss?: () => void;
}

export default function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div
      style={{
        background: 'var(--danger-bg)',
        border: '1px solid var(--danger)',
        borderRadius: 6,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        animation: 'fadeUp .25s var(--ease) both',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: 'var(--danger)', fontSize: 14 }}>⚠</span>
        <span
          style={{
            fontFamily: 'var(--font-m)',
            fontSize: 12,
            color: 'var(--danger)',
            letterSpacing: '.02em',
          }}
        >
          {message}
        </span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--danger)',
            fontSize: 14,
            padding: 2,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
