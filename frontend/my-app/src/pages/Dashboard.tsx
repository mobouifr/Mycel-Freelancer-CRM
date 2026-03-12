import { useState, useCallback } from 'react';
import { useDashboardLayout, PRESET_OPTIONS } from '../hooks/useDashboardLayout';
import WidgetGrid from '../components/dashboard/WidgetGrid';
import WidgetPicker from '../components/dashboard/WidgetPicker';

// ── Register all widget components (side-effect imports) ──
import '../components/dashboard/CalendarUpcoming';
import '../components/dashboard/NotesCapture';
import '../components/dashboard/RevenueKPI';
import '../components/dashboard/InvoicesDue';
import '../components/dashboard/ActivityFeed';
import '../components/dashboard/ProjectsProgress';
import '../components/dashboard/SmartSuggestions';

/* ─────────────────────────────────────────────
   DASHBOARD PAGE — Configurable widget grid
   with picker, presets, editing mode, and
   floating Quick Create button
───────────────────────────────────────────── */

export default function Dashboard() {
  const {
    layouts,
    visible,
    preset,
    onLayoutChange,
    applyPreset,
    toggleWidget,
    clearLayout,
    undo,
    canUndo,
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
      animation: 'fadeUp .3s var(--ease) both',
      position: 'relative',
    }}>
      {/* ── Header row ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-d)',
            fontWeight: 700,
            fontSize: 26,
            color: 'var(--white)',
            letterSpacing: '-.01em',
            marginBottom: 4,
          }}>
            Dashboard
          </h2>
          <p style={{
            fontFamily: 'var(--font-m)',
            fontSize: 11,
            color: 'var(--text-dim)',
            letterSpacing: '.04em',
          }}>
            {currentPreset?.label} layout · {visible.length} widget{visible.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Undo button */}
          {canUndo && (
            <button
              onClick={undo}
              aria-label="Undo last layout change"
              title="Undo"
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
            {isEditing ? 'Done Editing' : 'Edit Layout'}
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
            Customize
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
          animation: 'fadeUp .15s var(--ease) both',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p style={{
            fontFamily: 'var(--font-m)', fontSize: 11, color: 'var(--accent)',
          }}>
            Drag widgets to rearrange · Resize from corners · Click <strong>Done Editing</strong> when finished
          </p>
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
            No widgets visible
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
            Add Widgets
          </button>
        </div>
      ) : (
        <WidgetGrid
          layouts={layouts}
          visible={visible}
          onLayoutChange={onLayoutChange}
          onRemoveWidget={handleRemoveWidget}
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
      />

      {/* ── Quick Create FAB ── */}
      <QuickCreateFAB />
    </div>
  );
}

/* ── Floating Quick Create Button ── */
function QuickCreateFAB() {
  const [open, setOpen] = useState(false);

  const actions = [
    { label: 'New Invoice',  icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2', href: '/invoices' },
    { label: 'New Client',   icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', href: '/clients' },
    { label: 'New Project',  icon: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z', href: '/projects' },
    { label: 'New Proposal', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', href: '/proposals' },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 28,
      right: 28,
      zIndex: 50,
    }}>
      {/* Action menu */}
      {open && (
        <div style={{
          position: 'absolute',
          bottom: 52,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          animation: 'fadeUp .15s var(--ease) both',
        }}>
          {actions.map((a, i) => (
            <a
              key={a.label}
              href={a.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 20px rgba(0,0,0,.3)',
                transition: 'all .15s',
                animation: 'fadeUp .15s var(--ease) both',
                animationDelay: `${i * 30}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-hover)';
                e.currentTarget.style.background = 'var(--surface-2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--surface)';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={a.icon} />
              </svg>
              <span style={{
                fontFamily: 'var(--font-m)', fontSize: 11,
                fontWeight: 500, color: 'var(--text)',
              }}>
                {a.label}
              </span>
            </a>
          ))}
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close quick create' : 'Quick create'}
        style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'var(--accent)',
          border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,0,0,.3), 0 0 0 0 var(--accent)',
          transition: 'all .2s',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,0,0,.4), 0 0 0 4px var(--accent-bg)';
          e.currentTarget.style.transform = open ? 'rotate(45deg) scale(1.05)' : 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,.3), 0 0 0 0 var(--accent)';
          e.currentTarget.style.transform = open ? 'rotate(45deg)' : 'rotate(0deg)';
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--white)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}