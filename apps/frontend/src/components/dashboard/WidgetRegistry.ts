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
  invoices:    'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2',
  activity:    'M22 12h-4l-3 9L9 3l-3 9H2',
  projects:    'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
  suggestions: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 12 18.469c-.84 0-1.633.37-2.173 1.025l-.392.506',
  ecosystem:   'M12 22V8M12 8C9 8 5 6 5 2M12 8c3 0 7-2 7-6M7 14c-3 0-5 1-5 3M17 14c3 0 5 1 5 3',
} as const;

/* ── Registry: lazy-imported components ── */
const REGISTRY: WidgetEntry[] = [
  {
    id: 'calendar',
    label: 'Calendar + Upcoming',
    description: 'Month view with event dots and upcoming events list',
    icon: ICON.calendar,
    defaultW: 6,
    defaultH: 5,
    minW: 4,
    minH: 4,
    component: lazyPlaceholder(), // will be replaced below
  },
  {
    id: 'notes',
    label: 'Notes Quick-Capture',
    description: 'Composer and 3 most recent notes',
    icon: ICON.notes,
    defaultW: 6,
    defaultH: 3,
    minW: 3,
    minH: 2,
    component: lazyPlaceholder(),
  },
  {
    id: 'revenue',
    label: 'Revenue KPI',
    description: 'Big KPI number with mini sparkline chart',
    icon: ICON.revenue,
    defaultW: 4,
    defaultH: 3,
    minW: 3,
    minH: 2,
    component: lazyPlaceholder(),
  },
  {
    id: 'invoices',
    label: 'Invoices Due',
    description: 'Unpaid invoices with quick reminder actions',
    icon: ICON.invoices,
    defaultW: 4,
    defaultH: 3,
    minW: 3,
    minH: 2,
    component: lazyPlaceholder(),
  },
  {
    id: 'activity',
    label: 'Activity Feed',
    description: 'Recent activity stream with timestamps',
    icon: ICON.activity,
    defaultW: 8,
    defaultH: 3,
    minW: 4,
    minH: 2,
    component: lazyPlaceholder(),
  },
  {
    id: 'projects',
    label: 'Projects Progress',
    description: 'Active projects with progress bars',
    icon: ICON.projects,
    defaultW: 4,
    defaultH: 3,
    minW: 3,
    minH: 2,
    component: lazyPlaceholder(),
  },
  {
    id: 'suggestions',
    label: 'Smart Suggestions',
    description: 'AI-powered actionable insights for your workflow',
    icon: ICON.suggestions,
    defaultW: 4,
    defaultH: 3,
    minW: 3,
    minH: 2,
    component: lazyPlaceholder(),
  },
  {
    id: 'ecosystem',
    label: 'Living Ecosystem',
    description: 'A generative plant that grows with your usage',
    icon: ICON.ecosystem,
    defaultW: 3,
    defaultH: 3,
    minW: 2,
    minH: 2,
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
  return REGISTRY.map(({ component: _component, ...meta }) => meta);
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



