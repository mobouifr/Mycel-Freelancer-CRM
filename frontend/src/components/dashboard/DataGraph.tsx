import { useState, useRef, useEffect, useMemo, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { setWidgetComponent } from './WidgetRegistry';
import api from '../../services/api';

/* ─────────────────────────────────────────────
   DATA GRAPH — Smooth area chart with toggle
   for Projects / Clients / Both overlapping.
   Pure SVG + ResizeObserver.
───────────────────────────────────────────── */

const DEFAULT_DATA = {
  months: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
  projects: [0, 0, 0, 0, 0, 0],
  clients:  [0, 0, 0, 0, 0, 0],
};

type ViewMode = 'both' | 'projects' | 'clients';

const SERIES = {
  projects: { color: 'var(--accent)', label: 'projects' },
  clients:  { color: 'var(--info)', label: 'clients' },
} as const;

const PAD = { top: 16, right: 12, bottom: 28, left: 32 };
const TENSION = 0.35;

/** Build a smooth cubic bezier path through points, clamped to [minY, maxY] */
function buildCurve(pts: { x: number; y: number }[], minY: number, maxY: number): string {
  if (pts.length < 2) return '';
  const clampY = (y: number) => Math.min(maxY, Math.max(minY, y));
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) * TENSION;
    const cp1y = clampY(p1.y + (p2.y - p0.y) * TENSION);
    const cp2x = p2.x - (p3.x - p1.x) * TENSION;
    const cp2y = clampY(p2.y - (p3.y - p1.y) * TENSION);
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

function DataGraph() {
  const { t } = useTranslation();
  const uid = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 400, height: 220 });
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [view, setView] = useState<ViewMode>('both');
  const [data, setData] = useState(DEFAULT_DATA);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) setSize({ width: Math.max(r.width, 200), height: Math.max(r.height, 120) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Fetch data from backend
  useEffect(() => {
    let cancelled = false;

    const fetchGraph = () => {
      api.get('/dashboard/projects-clients-graph')
        .then((res: any) => {
          if (!cancelled && res.data) {
            setData(res.data);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setData(DEFAULT_DATA);
          }
        });
    };

    fetchGraph();
    window.addEventListener('dashboardRefresh', fetchGraph);
    
    return () => { 
      cancelled = true; 
      window.removeEventListener('dashboardRefresh', fetchGraph);
    };
  }, []);

  const { months, projects, clients } = data;
  const chartW = size.width - PAD.left - PAD.right;
  const chartH = size.height - PAD.top - PAD.bottom;

  const showProjects = view === 'both' || view === 'projects';
  const showClients = view === 'both' || view === 'clients';

  // Compute max from visible series
  const maxVal = useMemo(() => {
    let m = 1;
    if (showProjects) m = Math.max(m, ...projects);
    if (showClients) m = Math.max(m, ...clients);
    return m;
  }, [showProjects, showClients, projects, clients]);

  const gridMax = useMemo(() => {
    const step = maxVal <= 5 ? 1 : maxVal <= 10 ? 2 : 5;
    return Math.ceil(maxVal / step) * step;
  }, [maxVal]);

  // Map data to coordinates — guard against single-point division by zero
  const toPoints = (data: number[]) =>
    data.map((v, i) => ({
      x: PAD.left + (data.length > 1 ? i / (data.length - 1) : 0.5) * chartW,
      y: PAD.top + chartH - (v / gridMax) * chartH,
      val: v,
    }));

  const baseY = PAD.top + chartH;

  const projPts = useMemo(() => toPoints(projects), [projects, chartW, chartH, gridMax]);
  const cliPts = useMemo(() => toPoints(clients), [clients, chartW, chartH, gridMax]);

  const projCurve = useMemo(() => buildCurve(projPts, PAD.top, baseY), [projPts, baseY]);
  const cliCurve = useMemo(() => buildCurve(cliPts, PAD.top, baseY), [cliPts, baseY]);
  const projArea = projCurve ? `${projCurve} L${projPts[projPts.length - 1].x},${baseY} L${projPts[0].x},${baseY} Z` : '';
  const cliArea = cliCurve ? `${cliCurve} L${cliPts[cliPts.length - 1].x},${baseY} L${cliPts[0].x},${baseY} Z` : '';

  // Grid lines
  const gridLines = useMemo(() => {
    const count = 4;
    return Array.from({ length: count + 1 }, (_, i) => ({
      val: Math.round((gridMax / count) * (count - i)),
      y: PAD.top + (i / count) * chartH,
    }));
  }, [gridMax, chartH]);

  // Toggle pills
  const pills: { mode: ViewMode; label: string }[] = [
    { mode: 'both', label: t('dataGraph.both', 'Both') },
    { mode: 'projects', label: t('dataGraph.projects', 'Projects') },
    { mode: 'clients', label: t('dataGraph.clients', 'Clients') },
  ];

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}
    >
      {/* Header: toggle pills */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '0 0 6px', flexShrink: 0,
      }}>
        {pills.map((p) => (
          <button
            key={p.mode}
            onClick={() => setView(p.mode)}
            style={{
              padding: '3px 10px',
              borderRadius: 5,
              border: view === p.mode ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: view === p.mode ? 'var(--accent-bg)' : 'transparent',
              fontFamily: 'var(--font-m)',
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '.04em',
              color: view === p.mode ? 'var(--accent)' : 'var(--text-dim)',
              cursor: 'pointer',
              transition: 'all .15s',
            }}
          >
            {p.label}
          </button>
        ))}

        {/* Legend dots */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          {showProjects && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: SERIES.projects.color, boxShadow: `0 0 5px ${SERIES.projects.color}` }} />
              <span style={{ fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)' }}>
                {t('dataGraph.projects', 'Projects')}
              </span>
            </div>
          )}
          {showClients && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: SERIES.clients.color, boxShadow: `0 0 5px ${SERIES.clients.color}` }} />
              <span style={{ fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)' }}>
                {t('dataGraph.clients', 'Clients')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
        <svg
          viewBox={`0 0 ${size.width} ${size.height}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            {/* Projects gradient */}
            <linearGradient id={`pg-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
            {/* Clients gradient */}
            <linearGradient id={`cg-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--info)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--info)" stopOpacity="0" />
            </linearGradient>
            {/* Glow filter */}
            <filter id={`glow-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {gridLines.map((g, i) => (
            <g key={`grid-${g.y}`}>
              <line
                x1={PAD.left} y1={g.y} x2={size.width - PAD.right} y2={g.y}
                stroke="var(--border)" strokeWidth="0.5"
                strokeDasharray={i === gridLines.length - 1 ? 'none' : '2 4'}
              />
              <text
                x={PAD.left - 6} y={g.y + 3} textAnchor="end"
                style={{ fontFamily: 'var(--font-m)', fontSize: 9 }}
                fill="var(--text-dim)"
              >
                {g.val}
              </text>
            </g>
          ))}

          {/* ── Clients series (drawn first so projects overlaps on top) ── */}
          {showClients && (
            <g style={{ transition: 'opacity .3s' }}>
              <path d={cliArea} fill={`url(#cg-${uid})`} />
              <path d={cliCurve} fill="none" stroke="var(--info)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" opacity="0.4"
                filter={`url(#glow-${uid})`} />
              <path d={cliCurve} fill="none" stroke="var(--info)" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}

          {/* ── Projects series ── */}
          {showProjects && (
            <g style={{ transition: 'opacity .3s' }}>
              <path d={projArea} fill={`url(#pg-${uid})`} />
              <path d={projCurve} fill="none" stroke="var(--accent)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" opacity="0.4"
                filter={`url(#glow-${uid})`} />
              <path d={projCurve} fill="none" stroke="var(--accent)" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}

          {/* Hover hit areas + vertical guide + data points */}
          {months.map((month, i) => {
            const x = PAD.left + (months.length > 1 ? i / (months.length - 1) : 0.5) * chartW;
            const isHovered = hoverIdx === i;

            return (
              <g key={month}>
                {/* Hit area */}
                <rect
                  x={x - chartW / months.length / 2} y={PAD.top}
                  width={chartW / months.length} height={chartH}
                  fill="transparent"
                  onMouseEnter={() => setHoverIdx(i)}
                  style={{ cursor: 'pointer' }}
                />

                {/* Vertical guide */}
                {isHovered && (
                  <line
                    x1={x} y1={PAD.top} x2={x} y2={baseY}
                    stroke="var(--text-dim)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4"
                  />
                )}

                {/* Data dots + value labels */}
                {showProjects && projPts[i] && (
                  <>
                    <circle cx={x} cy={projPts[i].y}
                      r={isHovered ? 4.5 : 2.5}
                      fill={isHovered ? 'var(--accent)' : 'var(--surface-2)'}
                      stroke="var(--accent)" strokeWidth={isHovered ? 2 : 1.2}
                      style={{ transition: 'r .12s, fill .12s' }}
                    />
                    {isHovered && (
                      <text x={x} y={projPts[i].y - 9} textAnchor="middle"
                        style={{ fontFamily: 'var(--font-m)', fontSize: 10, fontWeight: 600 }}
                        fill="var(--accent)"
                      >
                        {projPts[i].val}
                      </text>
                    )}
                  </>
                )}
                {showClients && cliPts[i] && (
                  <>
                    <circle cx={x} cy={cliPts[i].y}
                      r={isHovered ? 4.5 : 2.5}
                      fill={isHovered ? 'var(--info)' : 'var(--surface-2)'}
                      stroke="var(--info)" strokeWidth={isHovered ? 2 : 1.2}
                      style={{ transition: 'r .12s, fill .12s' }}
                    />
                    {isHovered && (
                      <text x={x} y={cliPts[i].y - 9} textAnchor="middle"
                        style={{ fontFamily: 'var(--font-m)', fontSize: 10, fontWeight: 600 }}
                        fill="var(--info)"
                      >
                        {cliPts[i].val}
                      </text>
                    )}
                  </>
                )}

                {/* X-axis label */}
                <text x={x} y={size.height - 6} textAnchor="middle"
                  style={{ fontFamily: 'var(--font-m)', fontSize: 10 }}
                  fill={isHovered ? 'var(--text)' : 'var(--text-dim)'}
                >
                  {month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

setWidgetComponent('dataGraph', DataGraph);

export default DataGraph;
