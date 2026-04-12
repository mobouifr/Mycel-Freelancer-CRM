import { useMemo, useCallback, useRef, useState, useEffect, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
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
  onReorderMobile: (id: string, dir: 1 | -1) => void;
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

const RESIZE_HANDLES: readonly ['nw'] = ['nw'];

/* Breakpoint for mobile layout (px). Uses window.innerWidth for
   reliable detection regardless of container min-width constraints. */
const MOBILE_BP = 768;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BP : false,
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BP - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

export default function WidgetGrid({
  layouts,
  visible,
  onLayoutChange,
  onRemoveWidget,
  onReorderMobile,
  isEditing,
}: WidgetGridProps) {
  const { t } = useTranslation();
  const { width, containerRef, mounted } = useContainerWidth({ initialWidth: 1200 });
  const isMobile = useIsMobile();

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

  /* ── Mobile: single-column stack with optional reorder ── */
  if (isMobile) {
    const btnStyle: CSSProperties = {
      width: 22, height: 22, borderRadius: 4,
      background: 'none', border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', color: 'var(--text-dim)',
      transition: 'all .15s', flexShrink: 0,
    };

    return (
      <div
        ref={containerRef}
        className="widget-grid-container"
        style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {visible.map((widgetId, idx) => {
          const entry = getWidgetEntry(widgetId);
          if (!entry) return null;
          const Widget = entry.component;
          const layout = layouts.find((l: LayoutItem) => l.i === widgetId);
          // Use explicit height so WidgetCard's height:100% resolves correctly
          const height = Math.max((layout?.h ?? 3) * ROW_HEIGHT, 180);

          return (
            <div key={widgetId} style={{ height, width: '100%' }}>
              <WidgetCard
                title={t(entry.label)}
                isEditing={isEditing}
                onRemove={isEditing ? () => onRemoveWidget(widgetId) : undefined}
                actions={isEditing ? (
                  <>
                    {idx > 0 && (
                      <button
                        style={btnStyle}
                        aria-label="Move widget up"
                        onClick={() => onReorderMobile(widgetId, -1)}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="18 15 12 9 6 15" />
                        </svg>
                      </button>
                    )}
                    {idx < visible.length - 1 && (
                      <button
                        style={btnStyle}
                        aria-label="Move widget down"
                        onClick={() => onReorderMobile(widgetId, 1)}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    )}
                  </>
                ) : undefined}
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
      </div>
    );
  }

  /* ── Desktop: drag-and-drop grid ── */
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
                  title={t(entry.label)}
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
