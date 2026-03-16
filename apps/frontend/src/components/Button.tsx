import { type ButtonHTMLAttributes } from 'react';

/* ─────────────────────────────────────────────
   BUTTON — Shared button component
   Copied from my-app for consistent styling
───────────────────────────────────────────── */

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'circle';
  loading?: boolean;
}

export default function Button({
  children,
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled,
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    fontFamily: 'var(--font-m)',
    letterSpacing: '.06em',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    transition: 'all .2s var(--ease)',
    opacity: disabled ? 0.4 : 1,
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { fontSize: 10, padding: '6px 12px', borderRadius: 5 },
    md: { fontSize: 11, padding: '8px 16px', borderRadius: 6 },
    lg: { fontSize: 12, padding: '10px 20px', borderRadius: 6 },
    circle: {
      width: 80,
      height: 80,
      borderRadius: '50%',
      fontFamily: 'var(--font-d)',
      fontWeight: 700,
      fontSize: 10,
      letterSpacing: '.12em',
      textTransform: 'uppercase',
    },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--white)',
      color: '#080808',
      boxShadow: '0 0 0 0 rgba(255,255,255,.1)',
    },
    secondary: {
      background: 'rgba(255,255,255,.05)',
      border: '1px solid var(--border)',
      color: 'var(--text-mid)',
    },
    ghost: {
      background: 'none',
      color: 'var(--text-dim)',
    },
    danger: {
      background: 'var(--danger-bg)',
      border: '1px solid var(--danger)',
      color: 'var(--danger)',
    },
  };

  return (
    <button
      style={{
        ...baseStyle,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      disabled={disabled || loading}
      onMouseEnter={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.transform = 'scale(1.04)';
          e.currentTarget.style.boxShadow = '0 0 32px rgba(255,255,255,.12)';
        } else if (variant === 'ghost') {
          e.currentTarget.style.color = 'var(--white)';
        } else {
          e.currentTarget.style.borderColor = 'var(--border-h)';
        }
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 0 0 0 rgba(255,255,255,.1)';
        } else if (variant === 'ghost') {
          e.currentTarget.style.color = 'var(--text-dim)';
        } else if (variant === 'danger') {
          e.currentTarget.style.borderColor = 'var(--danger)';
        } else {
          e.currentTarget.style.borderColor = 'var(--border)';
        }
        onMouseLeave?.(e);
      }}
      {...props}
    >
      {loading ? <LoadingDots /> : children}
    </button>
  );
}

function LoadingDots() {
  return (
    <span style={{ display: 'flex', gap: 3 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: 'currentColor',
            animation: `fadeIn .5s ease ${i * 0.15}s infinite alternate`,
          }}
        />
      ))}
    </span>
  );
}



