import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { setWidgetComponent } from './WidgetRegistry';
import api from '../../services/api';

/* ─────────────────────────────────────────────
   ACTIVITY HEATMAP — Glowy contribution grid.
   Single SVG fills the container exactly.
   Wider widget = more weeks of history.
───────────────────────────────────────────── */

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getIntensity(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

const INTENSITY_OPACITY = [0.06, 0.22, 0.42, 0.68, 0.95];

interface DayCell {
  date: string;
  count: number;
  intensity: number;
  col: number;
  row: number;
  isFuture: boolean;
  isToday: boolean;
}

/* ── Layout constants ── */
const LABEL_COL = 20;   // px reserved for day-of-week labels
const MONTH_ROW = 14;   // px reserved for month labels above grid
const LEGEND_ROW = 22;  // px reserved for legend below grid
const MIN_CELL = 4;     // absolute minimum cell size in px
const MAX_WEEKS = 52;
const MIN_WEEKS = 10;

function ActivityHeatmap() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(0);  // container width
  const [ch, setCh] = useState(0);  // container height
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [hoveredCell, setHoveredCell] = useState<DayCell | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let cancelled = false;

    api.get<Record<string, number>>('/dashboard/activity-heatmap?days=365')
      .then((response: { data: Record<string, number> }) => {
        if (!cancelled && response.data) {
          setHeatmapData(response.data);
        }
      })
      .catch(console.error);

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Measure container precisely ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) { setCw(r.width); setCh(r.height); }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Derive all sizes from container dimensions ──
  const gridAreaW = cw - LABEL_COL;                    // px available for week columns
  const gridAreaH = ch - MONTH_ROW - LEGEND_ROW;       // px available for 7 day rows

  // Cell step driven by height (square cells), never stretched to fill width
  const stepFromH = gridAreaH > 0 ? gridAreaH / 7 : 10;

  // Weeks that fit at that step
  const rawWeeks = gridAreaW > 0 ? Math.floor(gridAreaW / stepFromH) : 20;
  const weeks = Math.max(MIN_WEEKS, Math.min(MAX_WEEKS, rawWeeks));

  // Keep cells square — only shrink if MIN_WEEKS floor would cause overflow
  const cellStep = Math.max(
    gridAreaW > 0 ? Math.min(stepFromH, gridAreaW / weeks) : stepFromH,
    MIN_CELL
  );

  const cellGap = Math.max(cellStep * 0.12, 1);
  const cellSize = cellStep - cellGap;
  const gridW = weeks * cellStep;
  const gridH = 7 * cellStep;
  const offsetX = Math.max((gridAreaW - gridW) / 2, 0); // always centered

  // Full SVG dimensions
  const svgW = cw;
  const svgH = MONTH_ROW + gridH;

  // ── Build cells & month labels based on week count ──
  const { cells, monthLabels } = useMemo(() => {
    const today = new Date();
    const dayCells: DayCell[] = [];
    const months: { label: string; col: number }[] = [];
    const seenMonths = new Set<string>();

    const todayKey = today.toISOString().slice(0, 10);
    const halfWeeks = Math.floor(weeks / 2);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - startDate.getDay() - halfWeeks * 7);

    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(cellDate.getDate() + w * 7 + d);
        const key = cellDate.toISOString().slice(0, 10);
        const isFuture = key > todayKey;
        const isToday = key === todayKey;
        const count = isFuture ? 0 : (heatmapData[key] ?? 0);
        dayCells.push({ date: key, count, intensity: isFuture ? 0 : getIntensity(count), col: w, row: d, isFuture, isToday });

        const monthKey = `${cellDate.getFullYear()}-${cellDate.getMonth()}`;
        if (!seenMonths.has(monthKey) && d === 0) {
          seenMonths.add(monthKey);
          months.push({
            label: cellDate.toLocaleString('default', { month: 'short' }),
            col: w,
          });
        }
      }
    }
    return { cells: dayCells, monthLabels: months };
  }, [heatmapData, weeks]);

  // ── Cell origin helpers ──
  const cellX = useCallback((col: number) => LABEL_COL + offsetX + col * cellStep + cellGap / 2, [offsetX, cellStep, cellGap]);
  const cellY = useCallback((row: number) => MONTH_ROW + row * cellStep + cellGap / 2, [cellStep, cellGap]);

  const handleMouseEnter = useCallback((cell: DayCell, e: React.MouseEvent) => {
    const svgEl = (e.currentTarget as SVGElement).closest('svg');
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    const svgRect = svgEl?.getBoundingClientRect();
    if (svgRect) {
      setTooltipPos({
        x: rect.left - svgRect.left + rect.width / 2,
        y: rect.top - svgRect.top - 6,
      });
    }
    setHoveredCell(cell);
  }, []);

  // Font size that scales with cells but stays readable
  const labelFontSize = Math.max(Math.min(cellStep * 0.55, 9), 6);

  // Don't render until measured
  if (cw === 0 || ch === 0) {
    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
  }

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      {/* ── Single SVG: month labels + day labels + grid ── */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <svg
          width={svgW}
          height={svgH}
          style={{ display: 'block', overflow: 'visible' }}
          onMouseLeave={() => setHoveredCell(null)}
        >
          <defs>
            <filter id="hm-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Month labels */}
          {monthLabels.map((m, i) => (
            <text
              key={i}
              x={LABEL_COL + offsetX + m.col * cellStep}
              y={MONTH_ROW - 4}
              style={{ fontFamily: 'var(--font-m)', fontSize: labelFontSize }}
              fill="var(--text-dim)"
            >
              {m.label}
            </text>
          ))}

          {/* Day-of-week labels (show M, W, F when cells are small; all when large) */}
          {DAY_LABELS.map((lbl, i) => {
            const show = cellStep >= 14 || i === 1 || i === 3 || i === 5;
            if (!show) return null;
            return (
              <text
                key={i}
                x={LABEL_COL - 4}
                y={MONTH_ROW + i * cellStep + cellStep / 2 + labelFontSize * 0.35}
                textAnchor="end"
                style={{ fontFamily: 'var(--font-m)', fontSize: labelFontSize }}
                fill="var(--text-dim)"
              >
                {lbl}
              </text>
            );
          })}

          {/* Grid cells */}
          {cells.map((cell) => {
            const x = cellX(cell.col);
            const y = cellY(cell.row);
            const op = INTENSITY_OPACITY[cell.intensity];
            const isHot = cell.intensity >= 3;
            const isHovered = hoveredCell?.date === cell.date;
            const rx = Math.max(cellSize * 0.18, 1.5);

            return (
              <g key={cell.date}>
                {/* Glow for hot cells */}
                {isHot && (
                  <rect
                    x={x} y={y} width={cellSize} height={cellSize} rx={rx}
                    fill="var(--accent)" opacity={op * 0.3}
                    filter="url(#hm-glow)"
                  />
                )}
                {/* Main cell */}
                <rect
                  x={x} y={y} width={cellSize} height={cellSize} rx={rx}
                  fill={cell.intensity === 0 ? 'var(--border)' : 'var(--accent)'}
                  fillOpacity={cell.intensity === 0 ? 0.18 : op}
                  stroke={
                    cell.isToday ? 'var(--accent)' :
                    isHovered ? 'var(--accent)' :
                    cell.intensity > 0 ? 'var(--accent)' : 'var(--border)'
                  }
                  strokeWidth={cell.isToday ? 1.5 : (isHovered ? 1.2 : (cell.intensity > 0 ? 0.6 : 0.8))}
                  strokeOpacity={cell.isToday ? 0.9 : (isHovered ? 1 : (cell.intensity > 0 ? 0.35 : 0.55))}
                  style={{ cursor: cell.isFuture ? 'default' : 'pointer', transition: 'fill-opacity .12s' }}
                  onMouseEnter={(e) => { if (!cell.isFuture) handleMouseEnter(cell, e); }}
                  onMouseLeave={() => setHoveredCell(null)}
                />
                {/* Glassy shine on max intensity */}
                {cell.intensity === 4 && cellSize > 5 && (
                  <rect
                    x={x + cellSize * 0.15} y={y + cellSize * 0.1}
                    width={cellSize * 0.35} height={cellSize * 0.18}
                    rx={cellSize * 0.09}
                    fill="white" opacity={0.1}
                    style={{ pointerEvents: 'none' }}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip (HTML, positioned over SVG) */}
        {hoveredCell && (
          <div style={{
            position: 'absolute',
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: 'translate(-50%, -100%)',
            background: 'var(--surface)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '6px 10px',
            pointerEvents: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,.35), inset 0 0 0 .5px var(--glass)',
            zIndex: 20,
            whiteSpace: 'nowrap',
            animation: 'fadeUp .1s var(--ease) both',
          }}>
            <p style={{
              fontFamily: 'var(--font-m)', fontSize: 10, fontWeight: 600,
              color: 'var(--text)', margin: 0, lineHeight: 1.4,
            }}>
              {hoveredCell.count} {hoveredCell.count === 1
                ? t('heatmap.action', 'action')
                : t('heatmap.actions', 'actions')}
            </p>
            <p style={{
              fontFamily: 'var(--font-m)', fontSize: 9,
              color: 'var(--text-dim)', margin: 0,
            }}>
              {new Date(hoveredCell.date + 'T12:00:00').toLocaleDateString('default', {
                weekday: 'short', month: 'short', day: 'numeric',
              })}
            </p>
          </div>
        )}
      </div>

      {/* ── Legend row ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 3,
        height: LEGEND_ROW,
        flexShrink: 0,
        paddingRight: 2,
      }}>
        <span style={{ fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)' }}>
          {t('heatmap.less', 'Less')}
        </span>
        {[0, 1, 2, 3, 4].map((lvl) => {
          const sz = Math.max(Math.min(cellSize, 11), 6);
          return (
            <div key={lvl} style={{
              width: sz, height: sz,
              borderRadius: Math.max(sz * 0.18, 1.5),
              background: lvl === 0 ? 'var(--glass)' : 'var(--accent)',
              opacity: INTENSITY_OPACITY[lvl],
              boxShadow: lvl >= 3 ? '0 0 4px var(--accent)' : 'none',
              outline: lvl === 0 ? '0.8px solid var(--border)' : 'none',
            }} />
          );
        })}
        <span style={{ fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)' }}>
          {t('heatmap.more', 'More')}
        </span>
      </div>
    </div>
  );
}

setWidgetComponent('heatmap', ActivityHeatmap);

export default ActivityHeatmap;
