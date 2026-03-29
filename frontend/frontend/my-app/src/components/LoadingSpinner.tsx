/* ─────────────────────────────────────────────
   LOADING SPINNER — Animated ring
───────────────────────────────────────────── */

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({
  size = 24,
  color = 'var(--text-dim)',
  fullPage = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      style={{
        width: size,
        height: size,
        border: `1.5px solid var(--border)`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin .7s linear infinite',
      }}
    />
  );

  if (fullPage) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn .3s ease both',
        }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
}
