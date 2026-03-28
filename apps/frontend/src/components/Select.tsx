import { useState, type SelectHTMLAttributes } from 'react';

/* ─────────────────────────────────────────────
   SELECT — Styled dropdown matching the theme
───────────────────────────────────────────── */

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  onChange?: (value: string) => void;
}

export default function Select({
  label,
  options,
  error,
  onChange,
  value,
  style,
  ...props
}: SelectProps) {
  const [focused, setFocused] = useState(false);

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
        <select
          value={value}
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
            color: 'var(--white)',
            fontSize: 15,
            fontFamily: 'var(--font-m)',
            outline: 'none',
            transition: 'border-color .2s',
            appearance: 'none',
            cursor: 'pointer',
            ...style,
          }}
          {...props}
        >
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              style={{ background: '#0c0c0c', color: 'var(--white)' }}
            >
              {opt.label}
            </option>
          ))}
        </select>
        <span
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-dim)',
            fontSize: 12,
            pointerEvents: 'none',
          }}
        >
          ⌄
        </span>
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









