/* ─────────────────────────────────────────────
   AREA CHART — Mini SVG chart for dashboard
───────────────────────────────────────────── */

interface AreaChartProps {
  data: number[];
  label?: string;
  height?: number;
}

export default function AreaChart({ data, label, height = 56 }: AreaChartProps) {
  if (!data || data.length < 2) return null;

  const W = 100;
  const H = 60;
  const max = Math.max(...data) || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - (v / max) * H * 0.85,
  }));
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = `${path} L${W},${H} L0,${H} Z`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <span
          style={{
            fontFamily: 'var(--font-m)',
            fontSize: 9,
            color: 'var(--text-dim)',
            letterSpacing: '.1em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height }}>
        <defs>
          <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-grad-start, var(--chart-grad-1))" />
            <stop offset="100%" stopColor="var(--chart-grad-end, var(--chart-grad-2))" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#area-grad)" />
        <path
          d={path}
          fill="none"
          stroke="var(--chart-line)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={pts[pts.length - 1].x}
          cy={pts[pts.length - 1].y}
          r="2"
          fill="var(--accent)"
        />
      </svg>
    </div>
  );
}
