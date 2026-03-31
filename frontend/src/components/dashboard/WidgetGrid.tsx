import { useMemo, useCallback, useRef } from 'react';
import {
  GridLayout,
  useContainerWidth,
  verticalCompactor,
  type Layout as RGLLayout,
} from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { getWidgetEntry } from './WidgetRegistry';
import WidgetCard from './WidgetCard';
import type { LayoutItem } from '../../hooks/useDashboardLayout';

/* ─────────────────────────────────────────────
   WIDGET GRID — Drag-and-drop responsive grid
   powered by react-grid-layout v2
───────────────────────────────────────────── */

interface WidgetGridProps {
  layouts: LayoutItem[];
  visible: string[];
  onLayoutChange: (layouts: LayoutItem[]) => void;
  onRemoveWidget: (id: string) => void;
  isEditing: boolean;
}

const ROW_HEIGHT = 80;
const MARGIN: readonly [number, number] = [14, 14];
const CONTAINER_PAD: readonly [number, number] = [0, 0];
const COLS = 12;

/* Stable config objects — defined outside the component so they never
   trigger useMemo / useEffect dependency changes inside GridLayout. */
const GRID_CONFIG = {
  cols: COLS,
  rowHeight: ROW_HEIGHT,
  margin: MARGIN,
  containerPadding: CONTAINER_PAD,
  maxRows: Infinity,
} as const;

const RESIZE_HANDLES: readonly ['se'] = ['se'];

export default function WidgetGrid({
  layouts,
  visible,
  onLayoutChange,
  onRemoveWidget,
  isEditing,
}: WidgetGridProps) {
  const { width, containerRef, mounted } = useContainerWidth({ initialWidth: 1200 });

  /* ── Stable layout array ──
     Only rebuild when the underlying data actually changes.
     JSON key provides deep-equal memoisation cheaply. */
  const visibleKey = visible.join(',');
  const layoutsRef = useRef(layouts);
  layoutsRef.current = layouts;

  const activeLayouts: RGLLayout = useMemo(() => {
    const vis = new Set(visible);
    return layouts.filter((l) => vis.has(l.i)).map((l) => ({ ...l }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleKey, layouts]);

  /* ── Stable drag / resize configs ──
     Only recreate when `isEditing` toggles. */
  const dragConfig = useMemo(
    () => ({
      enabled: isEditing,
      handle: '.widget-drag-handle',
      threshold: 3,
      bounded: false,
    }),
    [isEditing],
  );

  const resizeConfig = useMemo(
    () => ({
      enabled: isEditing,
      handles: RESIZE_HANDLES,
    }),
    [isEditing],
  );

  /* ── Stable onLayoutChange callback ──
     Uses a ref so the closure always reads fresh `layouts` + `visible`
     without changing its own identity. */
  const handleLayoutChange = useCallback(
    (newLayout: RGLLayout) => {
      const vis = new Set(visible);
      const hiddenLayouts = layoutsRef.current.filter((l) => !vis.has(l.i));
      const merged = [...(newLayout as LayoutItem[]), ...hiddenLayouts];
      onLayoutChange(merged);
    },
    // onLayoutChange identity is stable (useCallback in useDashboardLayout)
    // visible changes are intentionally captured
    [onLayoutChange, visible],
  );

  return (
    <div
      ref={containerRef}
      className="widget-grid-container"
      style={{ width: '100%', minHeight: 200, position: 'relative' }}
    >
      {mounted && width > 0 && (
        <GridLayout
          className="widget-grid-layout"
          layout={activeLayouts}
          width={width}
          gridConfig={GRID_CONFIG}
          dragConfig={dragConfig}
          resizeConfig={resizeConfig}
          compactor={verticalCompactor}
          autoSize
          onLayoutChange={handleLayoutChange}
        >
          {visible.map((widgetId) => {
            const entry = getWidgetEntry(widgetId);
            if (!entry) return null;
            const Widget = entry.component;

            return (
              <div
                key={widgetId}
                className="widget-grid-item"
              >
                <WidgetCard
                  title={entry.label}
                  isEditing={isEditing}
                  onRemove={isEditing ? () => onRemoveWidget(widgetId) : undefined}
                  icon={
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d={entry.icon} />
                    </svg>
                  }
                >
                  <Widget />
                </WidgetCard>
              </div>
            );
          })}
        </GridLayout>
      )}
    </div>
  );
}
