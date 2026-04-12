import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardLayout, PRESET_OPTIONS } from '../hooks/useDashboardLayout';
import WidgetGrid from '../components/dashboard/WidgetGrid';
import WidgetPicker from '../components/dashboard/WidgetPicker';

// ── Register all widget components (side-effect imports) ──
import '../components/dashboard/CalendarUpcoming';
import '../components/dashboard/NotesCapture';
import '../components/dashboard/RevenueKPI';
import '../components/dashboard/ActivityFeed';
import '../components/dashboard/ActivityHeatmap';
import '../components/dashboard/DataGraph';
import '../components/dashboard/ProjectStatusBar';
import '../components/dashboard/NextDeadline';

/* ─────────────────────────────────────────────
   DASHBOARD PAGE — Configurable widget grid
   with picker, presets, editing mode, and
   floating Quick Create button
───────────────────────────────────────────── */

export default function Dashboard() {
  const { t } = useTranslation();
  const {
    layouts,
    visible,
    preset,
    onLayoutChange,
    applyPreset,
    toggleWidget,
    reorderVisible,
    clearLayout,
    undo,
    canUndo,
    exportLayout,
    importLayout,
  } = useDashboardLayout();

  const [isEditing, setIsEditing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleRemoveWidget = useCallback((id: string) => {
    toggleWidget(id);
  }, [toggleWidget]);

  const currentPreset = PRESET_OPTIONS.find((p) => p.id === preset);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      position: 'relative',
      animation: 'fadeUp .18s var(--ease) both',
    }}>
      {/* ── Header row ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-d)',
            fontWeight: 500,
            fontSize: 26,
            color: 'var(--text)',
            letterSpacing: '.06em',
            lineHeight: 1.3,
            marginBottom: 4,
          }}>
            {t('dashboard.title')}
          </h2>
          <p style={{
            fontFamily: 'var(--font-m)',
            fontSize: 11,
            color: 'var(--text-dim)',
            letterSpacing: '.04em',
          }}>
            {visible.length !== 1 ? t('dashboard.layout_info_plural', { preset: currentPreset?.label, count: visible.length }) : t('dashboard.layout_info', { preset: currentPreset?.label, count: visible.length })}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Undo button */}
          {canUndo && (
            <button
              onClick={undo}
              aria-label="Undo last layout change"
              title={t('common.undo')}
              style={{
                width: 32, height: 32, borderRadius: 6,
                background: 'var(--surface-2)',
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
                <path d="M3 7v6h6" />
                <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
              </svg>
            </button>
          )}

          {/* Reset Layout — only in edit mode */}
          {isEditing && (
            <button
              onClick={clearLayout}
              aria-label="Reset layout to preset default"
              title={t('dashboard.reset_layout')}
              style={{
                padding: '7px 12px',
                borderRadius: 6,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font-m)',
                fontSize: 11,
                fontWeight: 500,
                color: 'var(--text-dim)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all .15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--danger)';
                e.currentTarget.style.color = 'var(--danger)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-dim)';
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              {t('common.reset')}
            </button>
          )}

          {/* Edit toggle */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              padding: '7px 14px',
              borderRadius: 6,
              background: isEditing ? 'var(--accent)' : 'var(--surface-2)',
              border: `1px solid ${isEditing ? 'var(--accent)' : 'var(--border)'}`,
              fontFamily: 'var(--font-m)',
              fontSize: 11,
              fontWeight: 500,
              color: isEditing ? 'var(--white)' : 'var(--text-mid)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all .15s',
            }}
            onMouseEnter={(e) => {
              if (!isEditing) {
                e.currentTarget.style.borderColor = 'var(--text-dim)';
                e.currentTarget.style.color = 'var(--text)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isEditing) {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-mid)';
              }
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isEditing
                ? <><path d="M20 6L9 17l-5-5" /></>
                : <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>
              }
            </svg>
            {isEditing ? t('dashboard.done_editing') : t('dashboard.edit_layout')}
          </button>

          {/* Customize button */}
          <button
            onClick={() => setPickerOpen(true)}
            style={{
              padding: '7px 14px',
              borderRadius: 6,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              fontFamily: 'var(--font-m)',
              fontSize: 11,
              fontWeight: 500,
              color: 'var(--text-mid)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all .15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-hover)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-mid)';
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            {t('dashboard.customize')}
          </button>
        </div>
      </div>

      {/* ── Editing mode notice ── */}
      {isEditing && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          background: 'var(--accent-bg)',
          border: '1px solid var(--accent-hover)',
          borderRadius: 6,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p style={{
            fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--accent)',
          }}
            dangerouslySetInnerHTML={{ __html: t('dashboard.editing_notice') }}
          />
        </div>
      )}

      {/* ── Widget Grid ── */}
      {visible.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '60px 0', gap: 12,
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          <p style={{
            fontFamily: 'var(--font-m)', fontSize: 13, color: 'var(--text-dim)',
          }}>
            {t('dashboard.no_widgets')}
          </p>
          <button
            onClick={() => setPickerOpen(true)}
            style={{
              padding: '8px 16px', borderRadius: 6,
              background: 'var(--accent)', border: 'none',
              fontFamily: 'var(--font-m)', fontSize: 11,
              fontWeight: 500, color: 'var(--white)',
              cursor: 'pointer',
            }}
          >
            {t('dashboard.add_widgets')}
          </button>
        </div>
      ) : (
        <WidgetGrid
          layouts={layouts}
          visible={visible}
          onLayoutChange={onLayoutChange}
          onRemoveWidget={handleRemoveWidget}
          onReorderMobile={reorderVisible}
          isEditing={isEditing}
        />
      )}

      {/* ── Widget Picker Side Panel ── */}
      <WidgetPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        visible={visible}
        onToggle={toggleWidget}
        preset={preset}
        onApplyPreset={applyPreset}
        onClearLayout={clearLayout}
        canUndo={canUndo}
        onUndo={undo}
        onExportLayout={exportLayout}
        onImportLayout={importLayout}
      />
    </div>
  );
}