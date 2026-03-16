import { useState, useEffect, useMemo } from 'react';
import { setWidgetComponent } from './WidgetRegistry';

/* ─────────────────────────────────────────────
   LIVING WIDGET — A generative SVG plant/mushroom
   that grows over time based on real usage hours.
   Pure CSS + SVG, no external dependencies.
───────────────────────────────────────────── */

const STORAGE_KEY = 'mycel-living-start';

/** Get hours since first visit */
function getGrowthHours(): number {
  let start = localStorage.getItem(STORAGE_KEY);
  if (!start) {
    start = Date.now().toString();
    localStorage.setItem(STORAGE_KEY, start);
  }
  return (Date.now() - Number(start)) / (1000 * 60 * 60);
}

/** Deterministic pseudo-random from seed */
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

interface Branch {
  x: number;
  y: number;
  angle: number;
  length: number;
  depth: number;
  delay: number;
}

function generateBranches(growth: number): Branch[] {
  const branches: Branch[] = [];
  const maxDepth = Math.min(Math.floor(growth * 0.5) + 2, 6);
  const branchCount = Math.min(Math.floor(growth * 0.8) + 3, 18);

  for (let i = 0; i < branchCount; i++) {
    const seed = i * 137.508; // golden angle
    const depth = Math.floor(seededRandom(seed + 1) * maxDepth);
    const angle = -90 + (seededRandom(seed + 2) - 0.5) * 80;
    const length = 12 + seededRandom(seed + 3) * 25 * Math.max(0.3, 1 - depth * 0.15);

    // Parent position calculation
    const parentAngle = (-90 + (seededRandom(seed + 4) - 0.5) * 40) * (Math.PI / 180);
    const parentLen = depth > 0 ? 20 + seededRandom(seed + 5) * 30 : 0;
    const x = 50 + Math.cos(parentAngle) * parentLen * (seededRandom(seed + 6) > 0.5 ? 1 : -1) * 0.6;
    const y = 85 - depth * 12 - seededRandom(seed + 7) * 10;

    branches.push({ x, y, angle, length, depth, delay: i * 0.08 });
  }

  return branches;
}

interface Mushroom {
  x: number;
  capRadius: number;
  stemHeight: number;
  hue: number;
  delay: number;
}

function generateMushrooms(growth: number): Mushroom[] {
  const count = Math.min(Math.floor(growth * 0.3), 5);
  const mushrooms: Mushroom[] = [];

  for (let i = 0; i < count; i++) {
    const seed = (i + 100) * 42;
    mushrooms.push({
      x: 15 + seededRandom(seed) * 70,
      capRadius: 4 + seededRandom(seed + 1) * 6,
      stemHeight: 6 + seededRandom(seed + 2) * 8,
      hue: 260 + seededRandom(seed + 3) * 60,
      delay: i * 0.15 + 0.5,
    });
  }

  return mushrooms;
}

function LivingWidget() {
  const [hours, setHours] = useState(getGrowthHours);
  const growth = Math.min(hours, 100); // cap at 100h visual growth
  const level = Math.floor(growth / 10) + 1;

  useEffect(() => {
    const interval = setInterval(() => setHours(getGrowthHours()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const branches = useMemo(() => generateBranches(growth), [growth]);
  const mushrooms = useMemo(() => generateMushrooms(growth), [growth]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      {/* SVG Scene */}
      <svg
        viewBox="0 0 100 100"
        style={{ width: '100%', maxWidth: 180, height: 'auto', flexShrink: 0 }}
      >
        {/* Ground */}
        <ellipse cx="50" cy="90" rx="40" ry="4" fill="var(--accent-bg)" opacity="0.5" />

        {/* Trunk */}
        <line
          x1="50"
          y1="90"
          x2={Math.max(30, 90 - growth * 0.6)}
          y2={Math.max(30, 90 - growth * 0.6)}
          stroke="var(--text-dim)"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            animation: 'growUp 1.5s var(--ease) both',
          }}
        />

        {/* Branches */}
        {branches.map((b, i) => {
          const rad = (b.angle * Math.PI) / 180;
          const endX = b.x + Math.cos(rad) * b.length;
          const endY = b.y + Math.sin(rad) * b.length;
          return (
            <g key={i} style={{ animation: `fadeIn .4s var(--ease) ${b.delay}s both` }}>
              <line
                x1={b.x}
                y1={b.y}
                x2={endX}
                y2={endY}
                stroke="var(--text-dim)"
                strokeWidth={Math.max(0.5, 1.5 - b.depth * 0.2)}
                strokeLinecap="round"
                opacity={0.6}
              />
              {/* Leaf nodes */}
              {b.depth >= 1 && (
                <circle
                  cx={endX}
                  cy={endY}
                  r={2 + seededRandom(i * 99) * 2.5}
                  fill="var(--accent)"
                  opacity={0.15 + seededRandom(i * 77) * 0.25}
                />
              )}
            </g>
          );
        })}

        {/* Mushrooms */}
        {mushrooms.map((m, i) => (
          <g key={`m-${i}`} style={{ animation: `fadeIn .5s var(--ease) ${m.delay}s both` }}>
            {/* Stem */}
            <rect
              x={m.x - 1.5}
              y={90 - m.stemHeight}
              width={3}
              height={m.stemHeight}
              rx={1}
              fill={`hsl(${m.hue}, 30%, 40%)`}
              opacity="0.6"
            />
            {/* Cap */}
            <ellipse
              cx={m.x}
              cy={90 - m.stemHeight}
              rx={m.capRadius}
              ry={m.capRadius * 0.55}
              fill={`hsl(${m.hue}, 50%, 55%)`}
              opacity="0.7"
            />
            {/* Spots */}
            <circle
              cx={m.x - 1.5}
              cy={90 - m.stemHeight - 1}
              r={0.8}
              fill="white"
              opacity="0.3"
            />
            <circle
              cx={m.x + 2}
              cy={90 - m.stemHeight + 0.5}
              r={0.5}
              fill="white"
              opacity="0.2"
            />
          </g>
        ))}

        {/* Glow */}
        <circle
          cx="50"
          cy={Math.max(35, 85 - growth * 0.5)}
          r={8 + growth * 0.1}
          fill="var(--accent)"
          opacity="0.04"
          style={{ animation: 'pulse 3s ease-in-out infinite' }}
        />
      </svg>

      {/* Info */}
      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'var(--font-d)',
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--text)',
            letterSpacing: '.03em',
            lineHeight: 1.4,
          }}
        >
          Level {level} · {hours < 1 ? 'Just planted' : `${Math.floor(hours)}h growth`}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-m)',
            fontSize: 9,
            color: 'var(--text-dim)',
            letterSpacing: '.04em',
            marginTop: 2,
          }}
        >
          Your workspace ecosystem grows as you work
        </p>
      </div>
    </div>
  );
}

setWidgetComponent('ecosystem', LivingWidget);

export default LivingWidget;



