import { useState, type ReactNode } from 'react';

/* ─────────────────────────────────────────────
   WIDGET CARD — Shared frame for every widget.
   Provides header, drag handle, settings gear,
   remove button, and a content area.
───────────────────────────────────────────── */

interface WidgetCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  onRemove?: () => void;
  /** Extra action buttons in the header */
  actions?: ReactNode;
  /** Class name for the drag handle */
  dragHandleClass?: string;
  noPadding?: boolean;
  /** When true, show drag handles and resize affordances */
  isEditing?: boolean;
}

export default function WidgetCard({
  title,
  icon,
  children,
  onRemove,
  actions,
  dragHandleClass = 'widget-drag-handle',
  noPadding,
  isEditing = false,
}: WidgetCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        background: 'var(--surface-2)',
        border: isEditing ? '1.5px dashed var(--accent)' : '1px solid var(--border)',
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        transition: 'border-color .2s, box-shadow .2s',
        boxShadow: hovered ? '0 4px 24px rgba(0,0,0,.15)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div
        className={isEditing ? dragHandleClass : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px 10px',
          cursor: isEditing ? 'grab' : 'default',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Drag dots indicator — only visible in edit mode */}
          {isEditing && (
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" style={{ opacity: hovered ? 0.4 : 0.15, transition: 'opacity .15s', flexShrink: 0 }}>
              <circle cx="2" cy="2" r="1.2" fill="currentColor" />
              <circle cx="6" cy="2" r="1.2" fill="currentColor" />
              <circle cx="2" cy="7" r="1.2" fill="currentColor" />
              <circle cx="6" cy="7" r="1.2" fill="currentColor" />
              <circle cx="2" cy="12" r="1.2" fill="currentColor" />
              <circle cx="6" cy="12" r="1.2" fill="currentColor" />
            </svg>
          )}
          {icon && <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-dim)' }}>{icon}</span>}
          <p style={{
            fontFamily: 'var(--font-m)',
            fontSize: 10,
            color: 'var(--text-mid)',
            letterSpacing: '.1em',
            textTransform: 'uppercase',
          }}>
            {title}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: hovered ? 1 : 0, transition: 'opacity .15s' }}>
          {actions}
          {onRemove && (
            <button
              onClick={onRemove}
              aria-label={`Remove ${title} widget`}
              style={{
                width: 22, height: 22, borderRadius: 4,
                background: 'none', border: '1px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-dim)',
                transition: 'all .15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--danger)';
                e.currentTarget.style.color = 'var(--danger)';
                e.currentTarget.style.background = 'var(--danger-bg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-dim)';
                e.currentTarget.style.background = 'none';
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: noPadding ? 0 : '0 16px 16px',
      }}>
        {children}
      </div>

      {/* Resize grip — visible only in edit mode */}
      {isEditing && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            width: 12,
            height: 12,
            opacity: hovered ? 0.35 : 0.12,
            transition: 'opacity .15s',
            pointerEvents: 'none',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M10 2L2 10M10 6L6 10M10 10L10 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );
}
