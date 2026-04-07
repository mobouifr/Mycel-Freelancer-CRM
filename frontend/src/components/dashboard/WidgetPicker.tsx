import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { getWidgetMetas, type WidgetMeta } from './WidgetRegistry';
import type { PresetId } from '../../hooks/useDashboardLayout';
import { PRESET_OPTIONS } from '../../hooks/useDashboardLayout';

/* ─────────────────────────────────────────────
   WIDGET PICKER — Slide-out side panel to
   add / remove widgets and apply presets
───────────────────────────────────────────── */

interface WidgetPickerProps {
  open: boolean;
  onClose: () => void;
  visible: string[];
  onToggle: (id: string) => void;
  preset: PresetId;
  onApplyPreset: (id: PresetId) => void;
  onClearLayout: () => void;
  canUndo: boolean;
  onUndo: () => void;
  onExportLayout?: () => string;
  onImportLayout?: (json: string) => boolean;
}

export default function WidgetPicker({
  open,
  onClose,
  visible,
  onToggle,
  preset,
  onApplyPreset,
  onClearLayout,
  canUndo,
  onUndo,
  onExportLayout,
  onImportLayout,
}: WidgetPickerProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Use setTimeout to avoid closing immediately on the same click that opens
    const timer = setTimeout(() => {
      window.addEventListener('mousedown', handleClick);
    }, 100);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousedown', handleClick);
    };
  }, [open, onClose]);

  const allWidgets = getWidgetMetas();
  const filtered = allWidgets.filter((w) =>
    t(w.label).toLowerCase().includes(search.toLowerCase()) ||
    t(w.description).toLowerCase().includes(search.toLowerCase())
  );

  const portalRoot = document.getElementById('portal-root') || document.body;

  return createPortal(
    <>
      {/* Backdrop */}
      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.3)',
            zIndex: 1399,
            transition: 'opacity .2s',
          }}
        />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Widget Picker"
        tabIndex={-1}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 340,
          height: '100vh',
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          boxShadow: '-8px 0 40px rgba(0,0,0,.35)',
          zIndex: 1400,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform .25s var(--ease)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 20px 14px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-d)',
              fontSize: 16,
              fontWeight: 500,
              color: 'var(--text)',
              letterSpacing: '.04em',
              lineHeight: 1.3,
              margin: 0,
            }}>
              {t('widget_picker.title')}
            </h3>
            <p style={{
              fontFamily: 'var(--font-m)',
              fontSize: 10,
              color: 'var(--text-dim)',
              letterSpacing: '.04em',
              marginTop: 2,
            }}>
              {t('widget_picker.subtitle')}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label={t('widget_picker.close')}
            style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'none',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-dim)',
              transition: 'all .15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--text-mid)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-dim)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
          {/* Search */}
          <div style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder={t('widget_picker.search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '8px 12px',
                fontFamily: 'var(--font-m)',
                fontSize: 11,
                color: 'var(--text)',
                outline: 'none',
                transition: 'border-color .15s',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          {/* Presets */}
          <div style={{ marginBottom: 20 }}>
            <p style={{
              fontFamily: 'var(--font-m)', fontSize: 9,
              color: 'var(--text-dim)', letterSpacing: '.12em',
              textTransform: 'uppercase', marginBottom: 8,
            }}>
              {t('widget_picker.layout_presets')}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {PRESET_OPTIONS.map((p) => {
                const isActive = preset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onApplyPreset(p.id)}
                    style={{
                      padding: '10px 12px',
                      background: isActive ? 'var(--accent-bg)' : 'var(--surface-2)',
                      border: `1px solid ${isActive ? 'var(--accent-hover)' : 'var(--border)'}`,
                      borderRadius: 6,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all .15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.borderColor = 'var(--text-dim)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                  >
                    <p style={{
                      fontFamily: 'var(--font-m)', fontSize: 11, fontWeight: 500,
                      color: isActive ? 'var(--accent)' : 'var(--text)',
                      marginBottom: 2,
                    }}>
                      {p.label}
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-m)', fontSize: 9,
                      color: 'var(--text-dim)', lineHeight: 1.3,
                    }}>
                      {p.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
            <button
              onClick={onClearLayout}
              style={{
                flex: 1,
                padding: '7px 10px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 5,
                fontFamily: 'var(--font-m)',
                fontSize: 10,
                color: 'var(--text-mid)',
                cursor: 'pointer',
                transition: 'all .15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-dim)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              {t('dashboard.reset_layout')}
            </button>
            <button
              onClick={onUndo}
              disabled={!canUndo}
              style={{
                flex: 1,
                padding: '7px 10px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 5,
                fontFamily: 'var(--font-m)',
                fontSize: 10,
                color: canUndo ? 'var(--text-mid)' : 'var(--text-dim)',
                cursor: canUndo ? 'pointer' : 'not-allowed',
                opacity: canUndo ? 1 : 0.5,
                transition: 'all .15s',
              }}
            >
              {t('common.undo')}
            </button>
          </div>

          {/* Export / Import */}
          {(onExportLayout || onImportLayout) && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
              {onExportLayout && (
                <button
                  onClick={() => {
                    const json = onExportLayout();
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'dashboard-layout.json';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 5,
                    fontFamily: 'var(--font-m)',
                    fontSize: 10,
                    color: 'var(--text-mid)',
                    cursor: 'pointer',
                    transition: 'all .15s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {t('common.export')}
                </button>
              )}
              {onImportLayout && (
                <button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json,application/json';
                    input.onchange = () => {
                      const file = input.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        const ok = onImportLayout(reader.result as string);
                        if (!ok) alert('Invalid layout file.');
                      };
                      reader.readAsText(file);
                    };
                    input.click();
                  }}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 5,
                    fontFamily: 'var(--font-m)',
                    fontSize: 10,
                    color: 'var(--text-mid)',
                    cursor: 'pointer',
                    transition: 'all .15s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {t('common.import')}
                </button>
              )}
            </div>
          )}

          {/* Widget list */}
          <p style={{
            fontFamily: 'var(--font-m)', fontSize: 9,
            color: 'var(--text-dim)', letterSpacing: '.12em',
            textTransform: 'uppercase', marginBottom: 8,
          }}>
            {t('widget_picker.available_widgets')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {filtered.map((w) => (
              <WidgetToggleItem
                key={w.id}
                widget={w}
                isActive={visible.includes(w.id)}
                onToggle={() => onToggle(w.id)}
              />
            ))}
            {filtered.length === 0 && (
              <p style={{
                fontFamily: 'var(--font-m)', fontSize: 11,
                color: 'var(--text-dim)', textAlign: 'center',
                padding: '20px 0',
              }}>
                {t('widget_picker.no_matching')}
              </p>
            )}
          </div>
        </div>
      </div>
    </>,
    portalRoot,
  );
}

/* ── Individual widget toggle row ── */
function WidgetToggleItem({
  widget,
  isActive,
  onToggle,
}: {
  widget: WidgetMeta;
  isActive: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        background: isActive ? 'rgba(var(--accent-rgb, 120,200,120), .06)' : 'transparent',
        border: `1px solid ${isActive ? 'var(--accent-hover)' : 'var(--border)'}`,
        borderRadius: 6,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all .15s',
        width: '100%',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'var(--glass)';
          e.currentTarget.style.borderColor = 'var(--text-dim)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'var(--border)';
        }
      }}
    >
      {/* Icon */}
      <div style={{
        width: 30, height: 30, borderRadius: 6,
        background: isActive ? 'var(--accent-bg)' : 'var(--surface-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isActive ? 'var(--accent)' : 'var(--text-dim)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d={widget.icon} />
        </svg>
      </div>

      {/* Label + desc */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'var(--font-m)', fontSize: 11, fontWeight: 500,
          color: isActive ? 'var(--accent)' : 'var(--text)',
          marginBottom: 1,
        }}>
          {t(widget.label)}
        </p>
        <p style={{
          fontFamily: 'var(--font-m)', fontSize: 9,
          color: 'var(--text-dim)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {t(widget.description)}
        </p>
      </div>

      {/* Toggle indicator */}
      <div style={{
        width: 32, height: 18, borderRadius: 9,
        background: isActive ? 'var(--accent)' : 'var(--surface-2)',
        border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
        position: 'relative',
        transition: 'all .2s',
        flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute',
          top: 2, left: isActive ? 15 : 2,
          width: 12, height: 12, borderRadius: '50%',
          background: isActive ? 'var(--white)' : 'var(--text-dim)',
          transition: 'left .2s, background .2s',
        }} />
      </div>
    </button>
  );
}
