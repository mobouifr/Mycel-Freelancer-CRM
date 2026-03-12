import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─────────────────────────────────────────────
   ECOSYSTEM — Full-page view of the living
   workspace organism. Shows growth stats,
   achievements, and a larger SVG scene.
───────────────────────────────────────────── */

const STORAGE_KEY = 'mycel-living-start';

function getGrowthHours(): number {
  const start = localStorage.getItem(STORAGE_KEY);
  if (!start) return 0;
  return (Date.now() - Number(start)) / (1000 * 60 * 60);
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function Ecosystem() {
  const navigate = useNavigate();
  const [hours, setHours] = useState(getGrowthHours);

  useEffect(() => {
    const interval = setInterval(() => setHours(getGrowthHours()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const growth = Math.min(hours, 200);
  const level = Math.floor(growth / 10) + 1;
  const nextLevelHours = (level) * 10;
  const progress = ((growth % 10) / 10) * 100;

  const milestones = useMemo(() => [
    { level: 1, label: 'Seedling',     icon: '🌱', unlocked: level >= 1 },
    { level: 3, label: 'Sprouting',    icon: '🌿', unlocked: level >= 3 },
    { level: 5, label: 'Blooming',     icon: '🌸', unlocked: level >= 5 },
    { level: 8, label: 'Flourishing',  icon: '🌳', unlocked: level >= 8 },
    { level: 10, label: 'Ancient',     icon: '🍄', unlocked: level >= 10 },
    { level: 15, label: 'Mythical',    icon: '✨', unlocked: level >= 15 },
  ], [level]);

  // Generate scene elements
  const treeNodes = useMemo(() => {
    const nodes: Array<{ x: number; y: number; r: number; opacity: number; delay: number }> = [];
    const count = Math.min(Math.floor(growth * 0.6) + 5, 40);
    for (let i = 0; i < count; i++) {
      const seed = i * 137.508;
      nodes.push({
        x: 20 + seededRandom(seed) * 60,
        y: 15 + seededRandom(seed + 1) * 55,
        r: 2 + seededRandom(seed + 2) * 5,
        opacity: 0.08 + seededRandom(seed + 3) * 0.2,
        delay: i * 0.05,
      });
    }
    return nodes;
  }, [growth]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      animation: 'fadeUp .3s var(--ease) both',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-d)',
            fontWeight: 700,
            fontSize: 26,
            color: 'var(--white)',
            letterSpacing: '-.01em',
            marginBottom: 4,
          }}>
            Ecosystem
          </h2>
          <p style={{
            fontFamily: 'var(--font-m)',
            fontSize: 11,
            color: 'var(--text-dim)',
            letterSpacing: '.04em',
          }}>
            Your workspace grows as you work · Level {level}
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          style={{
            padding: '7px 14px',
            borderRadius: 6,
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            fontFamily: 'var(--font-m)',
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--text-mid)',
            cursor: 'pointer',
            transition: 'all .15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-dim)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* SVG Scene */}
        <div style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
        }}>
          <svg viewBox="0 0 100 80" style={{ width: '100%', maxWidth: 500, height: 'auto' }}>
            {/* Sky gradient */}
            <defs>
              <radialGradient id="eco-glow" cx="50%" cy="60%" r="50%">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.06" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="100" height="80" fill="url(#eco-glow)" />

            {/* Ground */}
            <ellipse cx="50" cy="75" rx="45" ry="5" fill="var(--accent-bg)" opacity="0.4" />

            {/* Trunk */}
            <line
              x1="50" y1="75" x2="50" y2={Math.max(15, 75 - growth * 0.3)}
              stroke="var(--text-dim)"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Foliage circles */}
            {treeNodes.map((n, i) => (
              <circle
                key={i}
                cx={n.x} cy={n.y} r={n.r}
                fill="var(--accent)"
                opacity={n.opacity}
                style={{ animation: `fadeIn .5s var(--ease) ${n.delay}s both` }}
              />
            ))}

            {/* Central glow */}
            <circle
              cx="50" cy="40" r={12 + growth * 0.05}
              fill="var(--accent)"
              opacity="0.04"
              style={{ animation: 'pulse 4s ease-in-out infinite' }}
            />
          </svg>
        </div>

        {/* Stats & milestones sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Level card */}
          <div style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: 20,
          }}>
            <p style={{
              fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)',
              letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12,
            }}>
              Growth Stats
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <p style={{
                  fontFamily: 'var(--font-d)', fontSize: 32, fontWeight: 700,
                  color: 'var(--white)', lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {level}
                </p>
                <p style={{ fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)' }}>
                  Current Level
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontFamily: 'var(--font-d)', fontSize: 20, fontWeight: 600,
                  color: 'var(--accent)', lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {Math.floor(hours)}h
                </p>
                <p style={{ fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)' }}>
                  Total Growth
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)' }}>
                  Next level
                </span>
                <span style={{ fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)', fontVariantNumeric: 'tabular-nums' }}>
                  {Math.floor(nextLevelHours - hours)}h remaining
                </span>
              </div>
              <div style={{
                height: 4, borderRadius: 2,
                background: 'var(--surface)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: `${progress}%`,
                  background: 'var(--accent)',
                  borderRadius: 2,
                  transition: 'width 1s var(--ease)',
                }} />
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: 20,
            flex: 1,
          }}>
            <p style={{
              fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)',
              letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12,
            }}>
              Milestones
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {milestones.map((m) => (
                <div
                  key={m.level}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: m.unlocked ? 'var(--accent-bg)' : 'var(--surface)',
                    border: `1px solid ${m.unlocked ? 'var(--accent-hover)' : 'var(--border)'}`,
                    opacity: m.unlocked ? 1 : 0.4,
                    transition: 'all .3s',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{m.icon}</span>
                  <div>
                    <p style={{
                      fontFamily: 'var(--font-m)', fontSize: 11,
                      color: m.unlocked ? 'var(--white)' : 'var(--text-dim)',
                      fontWeight: 500,
                    }}>
                      {m.label}
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-m)', fontSize: 9,
                      color: 'var(--text-dim)',
                    }}>
                      Level {m.level}
                    </p>
                  </div>
                  {m.unlocked && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}>
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
