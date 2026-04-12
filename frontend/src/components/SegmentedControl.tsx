import type { CSSProperties } from 'react';

export interface SegOption<T extends string = string> {
  value: T;
  label: string;
  activeColor?: string;
  activeBg?: string;
}

interface Props<T extends string> {
  options: SegOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Fill the container width (default true) */
  fullWidth?: boolean;
  /** Allow horizontal scrolling instead of wrapping (for status filters) */
  scrollable?: boolean;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  fullWidth = true,
  scrollable = false,
}: Props<T>) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: scrollable ? 'nowrap' : 'wrap',
        gap: 2,
        padding: 3,
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        width: fullWidth ? '100%' : 'auto',
        boxSizing: 'border-box',
        overflowX: scrollable ? 'auto' : undefined,
      }}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              flex: scrollable ? '1 1 auto' : '1 1 0',
              minWidth: scrollable ? 'max-content' : 0,
              padding: '6px 8px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-m)',
              fontSize: 10,
              fontWeight: isActive ? 600 : 400,
              letterSpacing: '.05em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s, color 0.15s, font-weight 0.1s',
              background: isActive
                ? (opt.activeBg || 'var(--accent-bg)')
                : 'transparent',
              color: isActive
                ? (opt.activeColor || 'var(--accent)')
                : 'var(--text-dim)',
              boxShadow: isActive ? 'inset 0 0 0 999px rgba(255,255,255,0.06)' : undefined,
            } as CSSProperties}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
