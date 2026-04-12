import type { ComponentType } from 'react';

/* ─────────────────────────────────────────────
   WIDGET REGISTRY — Maps widget IDs to their
   component, metadata, and default grid size
───────────────────────────────────────────── */

export interface WidgetMeta {
  id: string;
  label: string;
  description: string;
  icon: string;            // SVG path data for the picker icon
  defaultW: number;        // grid columns (out of 12)
  defaultH: number;        // grid rows
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface WidgetEntry extends WidgetMeta {
  component: ComponentType;
}

/* ── Icon path data (Lucide-style, 24×24 viewBox) ── */
const ICON = {
  calendar:    'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  notes:       'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  revenue:     'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  activity:    'M22 12h-4l-3 9L9 3l-3 9H2',
  heatmap:     'M3 3h4v4H3zM10 3h4v4h-4zM17 3h4v4h-4zM3 10h4v4H3zM10 10h4v4h-4zM17 10h4v4h-4zM3 17h4v4H3zM10 17h4v4h-4zM17 17h4v4h-4z',
  dataGraph:   'M3 3v18h18M7 16V9M12 16V5M17 16v-4',
  statusBar:   'M22 12H2M6 12a4 4 0 0 1 4-4h4a4 4 0 0 1 0 8h-4a4 4 0 0 1-4-4z',
  deadline:    'M12 8v4l3 3M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0',
};

/* ── Registry: lazy-imported components ── */
const REGISTRY: WidgetEntry[] = [
  {
    id: 'calendar',
    label: 'widgets.calendar.label',
    description: 'widgets.calendar.description',
    icon: ICON.calendar,
    defaultW: 6,
    defaultH: 5,
    minW: 1,
    minH: 1,
    component: lazyPlaceholder(), // will be replaced below
  },
  {
    id: 'notes',
    label: 'widgets.notes.label',
    description: 'widgets.notes.description',
    icon: ICON.notes,
    defaultW: 6,
    defaultH: 3,
    minW: 3,
    minH: 2,
    component: lazyPlaceholder(),
  },
  {
    id: 'revenue',
    label: 'widgets.revenue.label',
    description: 'widgets.revenue.description',
    icon: ICON.revenue,
    defaultW: 4,
    defaultH: 3,
    minW: 3,
    minH: 2,
    component: lazyPlaceholder(),
  },
  {
    id: 'activity',
    label: 'widgets.activity.label',
    description: 'widgets.activity.description',
    icon: ICON.activity,
    defaultW: 8,
    defaultH: 3,
    minW: 4,
    minH: 2,
    component: lazyPlaceholder(),
  },
  {
    id: 'heatmap',
    label: 'widgets.heatmap.label',
    description: 'widgets.heatmap.description',
    icon: ICON.heatmap,
    defaultW: 8,
    defaultH: 3,
    minW: 6,
    minH: 2,
    component: lazyPlaceholder(),
  },
  {
    id: 'dataGraph',
    label: 'widgets.dataGraph.label',
    description: 'widgets.dataGraph.description',
    icon: ICON.dataGraph,
    defaultW: 6,
    defaultH: 4,
    minW: 4,
    minH: 3,
    component: lazyPlaceholder(),
  },
  {
    id: 'statusBar',
    label: 'widgets.statusBar.label',
    description: 'widgets.statusBar.description',
    icon: ICON.statusBar,
    defaultW: 4,
    defaultH: 2,
    minW: 3,
    minH: 2,
    component: lazyPlaceholder(),
  },
  {
    id: 'deadline',
    label: 'widgets.deadline.label',
    description: 'widgets.deadline.description',
    icon: ICON.deadline,
    defaultW: 4,
    defaultH: 2,
    minW: 4,
    minH: 2,
    maxW: 4,
    maxH: 2,
    component: lazyPlaceholder(),
  },
];

/** Placeholder — replaced by setWidgetComponent during module init */
function lazyPlaceholder(): ComponentType {
  return function Placeholder() { return null; };
}

/** Register the real component for a widget (called from each widget file) */
export function setWidgetComponent(id: string, component: ComponentType) {
  const entry = REGISTRY.find((w) => w.id === id);
  if (entry) entry.component = component;
}

/** Get all registered widget metadata */
export function getWidgetMetas(): WidgetMeta[] {
  return REGISTRY.map(({ component: _, ...meta }) => meta);
}

/** Get a specific widget entry */
export function getWidgetEntry(id: string): WidgetEntry | undefined {
  return REGISTRY.find((w) => w.id === id);
}

/** Get all widget entries */
export function getAllWidgetEntries(): WidgetEntry[] {
  return REGISTRY;
}

export default REGISTRY;
