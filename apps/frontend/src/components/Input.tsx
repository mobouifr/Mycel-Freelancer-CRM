import { useState, type InputHTMLAttributes } from 'react';

/* ─────────────────────────────────────────────
   INPUT — Underline-style text field
   Matches auth / form aesthetic from my-app
───────────────────────────────────────────── */

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  onChange?: (value: string) => void;
}

export default function Input({
  label,
  type = 'text',
  error,
  onChange,
  style,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && (
        <label
          style={{
            fontFamily: 'var(--font-m)',
            fontSize: 10,
            letterSpacing: '.12em',
            textTransform: 'uppercase',
            color: error
              ? 'var(--danger)'
              : focused
                ? 'var(--white)'
                : 'var(--text-dim)',
            transition: 'color .2s',
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <input
          type={isPassword && showPassword ? 'text' : type}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            borderBottom: `1px solid ${
              error
                ? 'var(--danger)'
                : focused
                  ? 'rgba(255,255,255,0.45)'
                  : 'rgba(255,255,255,0.12)'
            }`,
            padding: '10px 0',
            paddingRight: isPassword ? 40 : 0,
            color: 'var(--white)',
            fontSize: 15,
            fontFamily: 'var(--font-m)',
            outline: 'none',
            transition: 'border-color .2s',
            ...style,
          }}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            style={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-dim)',
              fontFamily: 'var(--font-m)',
              fontSize: 10,
              letterSpacing: '.06em',
            }}
          >
            {showPassword ? 'HIDE' : 'SHOW'}
          </button>
        )}
      </div>
      {error && (
        <span
          style={{
            fontFamily: 'var(--font-m)',
            fontSize: 10,
            color: 'var(--danger)',
            letterSpacing: '.04em',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}



