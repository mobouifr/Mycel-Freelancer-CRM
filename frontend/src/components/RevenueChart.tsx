import { useState, useMemo, useId } from 'react';

/* ─────────────────────────────────────────────
   REVENUE CHART — Futuristic cubic line with
   glow, gradient fill, interactive tooltip
───────────────────────────────────────────── */

interface RevenueChartProps {
  data: number[];
  labels?: string[];
  height?: number;
}

export default function RevenueChart({ data, labels, height = 200 }: RevenueChartProps) {
  const uid = useId().replace(/:/g, '');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const W = 500;
  const H = 220;
  const PAD = { top: 20, right: 10, bottom: 30, left: 10 };

  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const max = useMemo(() => Math.max(...data, 1), [data]);

  // Map data to coordinates
  const pts = useMemo(() =>
    data.map((v, i) => ({
      x: PAD.left + (i / (data.length - 1)) * chartW,
      y: PAD.top + chartH - (v / max) * chartH * 0.9,
      val: v,
    })), [data, max, chartW, chartH]);

  // Smooth cubic bezier path (Catmull-Rom → cubic Bezier)
  const cubicPath = useMemo(() => {
    if (pts.length < 2) return '';
    const tension = 0.35;
    let d = `M${pts[0].x},${pts[0].y}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  }, [pts]);

  // Closed area path
  const areaPath = useMemo(() => {
    if (!cubicPath) return '';
    return `${cubicPath} L${pts[pts.length - 1].x},${H - PAD.bottom} L${pts[0].x},${H - PAD.bottom} Z`;
  }, [cubicPath, pts]);

  // Horizontal grid lines
  const gridLines = useMemo(() => {
    const count = 4;
    return Array.from({ length: count + 1 }, (_, i) => {
      const y = PAD.top + (i / count) * chartH;
      const val = Math.round(max * (1 - i / count));
      return { y, val };
    });
  }, [max, chartH]);

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height, display: 'block' }}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          {/* Gradient fill */}
          <linearGradient id={`grad-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-line)" stopOpacity="0.22" />
            <stop offset="60%" stopColor="var(--chart-line)" stopOpacity="0.06" />
            <stop offset="100%" stopColor="var(--chart-line)" stopOpacity="0" />
          </linearGradient>

          {/* Glow filter */}
          <filter id={`glow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Line gradient */}
          <linearGradient id={`line-grad-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--chart-line)" stopOpacity="0.3" />
            <stop offset="30%" stopColor="var(--chart-line)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--chart-line)" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridLines.map((g, i) => (
          <g key={i}>
            <line
              x1={PAD.left} y1={g.y} x2={W - PAD.right} y2={g.y}
              stroke="var(--border)" strokeWidth="0.5"
              strokeDasharray={i === gridLines.length - 1 ? 'none' : '2 4'}
            />
            {i < gridLines.length - 1 && (
              <text
                x={PAD.left} y={g.y - 4}
                style={{ fontFamily: 'var(--font-m)', fontSize: 8 }}
                fill="var(--text-dim)"
              >
                ${g.val}k
              </text>
            )}
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#grad-${uid})`} />

        {/* Glow line (blurred copy) */}
        <path
          d={cubicPath}
          fill="none"
          stroke="var(--chart-line)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#glow-${uid})`}
          opacity="0.4"
        />

        {/* Main line */}
        <path
          d={cubicPath}
          fill="none"
          stroke={`url(#line-grad-${uid})`}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {pts.map((p, i) => (
          <g key={i}>
            {/* Invisible wider hit area */}
            <rect
              x={p.x - (chartW / data.length) / 2}
              y={PAD.top}
              width={chartW / data.length}
              height={chartH}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
              style={{ cursor: 'pointer' }}
            />

            {/* Vertical guide line on hover */}
            {hoverIdx === i && (
              <line
                x1={p.x} y1={PAD.top} x2={p.x} y2={H - PAD.bottom}
                stroke="var(--chart-line)" strokeWidth="0.5" strokeDasharray="3 3"
                opacity="0.3"
              />
            )}

            {/* Point dot */}
            <circle
              cx={p.x} cy={p.y}
              r={hoverIdx === i ? 4 : 2}
              fill={hoverIdx === i ? 'var(--chart-line)' : 'var(--surface-2)'}
              stroke="var(--chart-line)"
              strokeWidth={hoverIdx === i ? 2 : 1.2}
              style={{ transition: 'r .15s, fill .15s' }}
            />

            {/* Glow ring on hover */}
            {hoverIdx === i && (
              <circle
                cx={p.x} cy={p.y} r="8"
                fill="none" stroke="var(--chart-line)" strokeWidth="1"
                opacity="0.15"
              />
            )}
          </g>
        ))}

        {/* X-axis labels */}
        {labels && labels.map((lbl, i) => {
          const x = PAD.left + (i / (labels.length - 1)) * chartW;
          return (
            <text
              key={lbl}
              x={x} y={H - 8}
              textAnchor="middle"
              style={{ fontFamily: 'var(--font-m)', fontSize: 9 }}
              fill="var(--text-mid)"
            >
              {lbl}
            </text>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoverIdx !== null && pts[hoverIdx] && (
        <div
          style={{
            position: 'absolute',
            top: pts[hoverIdx].y * (height / H) - 44,
            left: pts[hoverIdx].x * (100 / W),
            transform: 'translateX(-50%)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '6px 10px',
            pointerEvents: 'none',
            boxShadow: '0 4px 16px rgba(0,0,0,.4)',
            zIndex: 10,
            whiteSpace: 'nowrap',
          }}
        >
          <p className="kpi-num" style={{
            fontFamily: 'var(--font-d)', fontSize: 14, fontWeight: 700,
            color: 'var(--white)', margin: 0, lineHeight: 1.2,
          }}>
            ${pts[hoverIdx].val}k
          </p>
          {labels && labels[hoverIdx] && (
            <p style={{
              fontFamily: 'var(--font-m)', fontSize: 8, color: 'var(--text-dim)',
              letterSpacing: '.06em', margin: 0,
            }}>
              {labels[hoverIdx]}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
