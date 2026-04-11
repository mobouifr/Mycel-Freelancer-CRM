import { useState, useCallback, useEffect } from 'react';
import { getWidgetMetas } from '../components/dashboard/WidgetRegistry';

/* react-grid-layout Layout item shape */
export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
}

/* ─────────────────────────────────────────────
   DASHBOARD LAYOUT HOOK — Layout persistence,
   widget visibility, presets, clear + undo
───────────────────────────────────────────── */

export type PresetId = 'default' | 'compact' | 'focus' | 'finance';

export interface DashboardState {
  preset: PresetId;
  layouts: LayoutItem[];
  visible: string[];
}

/** Bump this version when layout shape changes to invalidate stale caches */
const LAYOUT_VERSION = 10;
const STORAGE_KEY = `mycel-dashboard-layout-v${LAYOUT_VERSION}`;

/* ── Preset definitions ─────────────────────── */
const PRESETS: Record<PresetId, () => Pick<DashboardState, 'layouts' | 'visible'>> = {
  /* ── Default: everything, well-balanced ──
     revenue  + heatmap left | calendar right (tall)
     status + deadline below | dataGraph + activity bottom */
  default: () => ({
    visible: ['revenue', 'calendar', 'heatmap', 'statusBar', 'deadline', 'dataGraph', 'activity', 'notes'],
    layouts: [
      { i: 'revenue',     x: 0, y: 0, w: 8, h: 2, minW: 6, minH: 2 },
      { i: 'calendar',    x: 8, y: 0, w: 4, h: 5, minW: 4, minH: 4 },
      { i: 'heatmap',     x: 0, y: 2, w: 8, h: 2, minW: 6, minH: 2 },
      { i: 'statusBar',   x: 0, y: 4, w: 4, h: 2, minW: 3, minH: 2 },
      { i: 'deadline',    x: 4, y: 4, w: 4, h: 2, minW: 4, minH: 2, maxW: 4, maxH: 2, isResizable: false },
      { i: 'dataGraph',   x: 0, y: 6, w: 8, h: 4, minW: 4, minH: 3 },
      { i: 'activity',    x: 8, y: 5, w: 4, h: 5, minW: 3, minH: 2 },
      { i: 'notes',       x: 0, y: 10, w: 8, h: 3, minW: 3, minH: 2 },
    ],
  }),

  /* ── Compact: essentials in tight space ──
     revenue full-width | small cards row | calendar + activity */
  compact: () => ({
    visible: ['revenue', 'deadline', 'statusBar', 'calendar', 'activity', 'notes'],
    layouts: [
      { i: 'revenue',   x: 0, y: 0, w: 12, h: 2, minW: 6, minH: 2 },
      { i: 'deadline',  x: 0, y: 2, w: 4,  h: 2, minW: 4, minH: 2, maxW: 4, maxH: 2, isResizable: false },
      { i: 'statusBar', x: 4, y: 2, w: 4,  h: 2, minW: 3, minH: 2 },
      { i: 'notes',     x: 8, y: 2, w: 4,  h: 2, minW: 3, minH: 2 },
      { i: 'calendar',  x: 0, y: 4, w: 6,  h: 5, minW: 4, minH: 4 },
      { i: 'activity',  x: 6, y: 4, w: 6,  h: 4, minW: 4, minH: 2 },
    ],
  }),

  /* ── Focus: planning & tasks only ──
     calendar dominant | deadline + notes right */
  focus: () => ({
    visible: ['calendar', 'deadline', 'notes', 'activity'],
    layouts: [
      { i: 'calendar', x: 0, y: 0, w: 8, h: 5, minW: 4, minH: 4 },
      { i: 'deadline', x: 8, y: 0, w: 4, h: 2, minW: 4, minH: 2, maxW: 4, maxH: 2, isResizable: false },
      { i: 'notes',    x: 8, y: 2, w: 4, h: 3, minW: 3, minH: 2 },
      { i: 'activity', x: 0, y: 5, w: 12, h: 3, minW: 4, minH: 2 },
    ],
  }),

  /* ── Finance: revenue, charts, status ──
     revenue full | dataGraph + status/deadline | heatmap full */
  finance: () => ({
    visible: ['revenue', 'dataGraph', 'statusBar', 'deadline', 'heatmap', 'activity'],
    layouts: [
      { i: 'revenue',   x: 0, y: 0, w: 12, h: 2, minW: 6, minH: 2 },
      { i: 'dataGraph', x: 0, y: 2, w: 8,  h: 4, minW: 4, minH: 3 },
      { i: 'statusBar', x: 8, y: 2, w: 4,  h: 2, minW: 3, minH: 2 },
      { i: 'deadline',  x: 8, y: 4, w: 4,  h: 2, minW: 4, minH: 2, maxW: 4, maxH: 2, isResizable: false },
      { i: 'heatmap',   x: 0, y: 6, w: 8,  h: 2, minW: 6, minH: 2 },
      { i: 'activity',  x: 8, y: 6, w: 4,  h: 3, minW: 3, minH: 2 },
    ],
  }),
};

export const PRESET_OPTIONS: { id: PresetId; label: string; desc: string }[] = [
  { id: 'default', label: 'Default',  desc: 'All widgets in a balanced overview' },
  { id: 'compact', label: 'Compact',  desc: 'Essentials in a tight layout' },
  { id: 'focus',   label: 'Focus',    desc: 'Calendar, deadline, notes, and activity' },
  { id: 'finance', label: 'Finance',  desc: 'Revenue, charts, and project status' },
];

/* ── Load / save ─────────────────────────────── */
function loadState(): DashboardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DashboardState;
      if (parsed.layouts && parsed.visible) return parsed;
    }
  } catch { /* noop */ }
  return { preset: 'default', ...PRESETS.default() };
}

function saveState(state: DashboardState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* ── Hook ────────────────────────────────────── */
export function useDashboardLayout() {
  const [state, setState] = useState<DashboardState>(loadState);
  const [undoStack, setUndoStack] = useState<DashboardState[]>([]);

  // Persist on every change (debounced to avoid excessive writes during drag)
  useEffect(() => {
    const timer = setTimeout(() => saveState(state), 300);
    return () => clearTimeout(timer);
  }, [state]);

  /** Update grid layout after drag/resize.
   *  Skip the update if the layout items haven't actually changed,
   *  which prevents infinite render loops with RGL's compaction cycle. */
  const onLayoutChange = useCallback((incoming: LayoutItem[]) => {
    setState((s) => {
      // Quick shallow check: same length and every item unchanged?
      if (
        s.layouts.length === incoming.length &&
        incoming.every((item, idx) => {
          const prev = s.layouts[idx];
          return (
            prev &&
            prev.i === item.i &&
            prev.x === item.x &&
            prev.y === item.y &&
            prev.w === item.w &&
            prev.h === item.h
          );
        })
      ) {
        return s; // no change — return same reference to bail out
      }
      return { ...s, layouts: incoming };
    });
  }, []);

  /** Apply a preset */
  const applyPreset = useCallback((preset: PresetId) => {
    setState((prev) => {
      setUndoStack((u) => [...u.slice(-4), prev]);
      return { preset, ...PRESETS[preset]() };
    });
  }, []);

  /** Reorder a widget in the visible list — used by the mobile edit mode */
  const reorderVisible = useCallback((id: string, dir: 1 | -1) => {
    setState((prev) => {
      const idx = prev.visible.indexOf(id);
      const swapIdx = idx + dir;
      if (idx === -1 || swapIdx < 0 || swapIdx >= prev.visible.length) return prev;
      setUndoStack((u) => [...u.slice(-4), prev]);
      const newVisible = [...prev.visible];
      [newVisible[idx], newVisible[swapIdx]] = [newVisible[swapIdx], newVisible[idx]];
      return { ...prev, visible: newVisible };
    });
  }, []);

  /** Toggle a widget's visibility */
  const toggleWidget = useCallback((id: string) => {
    setState((prev) => {
      setUndoStack((u) => [...u.slice(-4), prev]);
      const isVisible = prev.visible.includes(id);
      if (isVisible) {
        return {
          ...prev,
          visible: prev.visible.filter((v) => v !== id),
          layouts: prev.layouts.filter((l) => l.i !== id),
        };
      }
      // Add widget — find its metadata for default size
      const meta = getWidgetMetas().find((m) => m.id === id);
      const newLayout: LayoutItem = {
        i: id,
        x: 0,
        y: Infinity, // will be placed at bottom
        w: meta?.defaultW ?? 4,
        h: meta?.defaultH ?? 3,
        minW: meta?.minW,
        minH: meta?.minH,
      };
      return {
        ...prev,
        visible: [...prev.visible, id],
        layouts: [...prev.layouts, newLayout],
      };
    });
  }, []);

  /** Clear layout (reset to current preset) with undo support */
  const clearLayout = useCallback(() => {
    setState((prev) => {
      setUndoStack((u) => [...u.slice(-4), prev]);
      return { preset: prev.preset, ...PRESETS[prev.preset]() };
    });
  }, []);

  /** Undo last layout change */
  const undo = useCallback(() => {
    setUndoStack((stack) => {
      if (stack.length === 0) return stack;
      const prev = stack[stack.length - 1];
      setState(prev);
      return stack.slice(0, -1);
    });
  }, []);

  /** Export current layout as JSON string */
  const exportLayout = useCallback(() => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  /** Import layout from JSON string. Returns true on success. */
  const importLayout = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      // Basic validation
      if (!parsed || !parsed.layouts || !Array.isArray(parsed.visible)) {
        return false;
      }
      setState((prev) => {
        setUndoStack((u) => [...u.slice(-4), prev]);
        return {
          preset: parsed.preset ?? prev.preset,
          layouts: parsed.layouts,
          visible: parsed.visible,
        };
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    ...state,
    onLayoutChange,
    applyPreset,
    toggleWidget,
    reorderVisible,
    clearLayout,
    undo,
    canUndo: undoStack.length > 0,
    exportLayout,
    importLayout,
  };
}
