import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { gamificationService } from '../services/gamification';
import type { GamificationStats } from '../services/gamification';

/* ─────────────────────────────────────────────
   GROWTH PAGE — XP ring + stats on the left,
   collectible reward cards on the right.
───────────────────────────────────────────── */

const LEVEL_TITLES: Record<number, string> = {
  1: 'Starter', 2: 'Rising', 3: 'Steady', 4: 'Seasoned', 5: 'Expert',
};
const LEVEL_TITLE_DEFAULT = 'Master';

interface CardDef {
  type: string;
  name: string;
  hint: string;
  color: string;
  kind: 'Achievement' | 'Badge';
  art: (color: string) => React.ReactNode;
}

const ALL_CARDS: CardDef[] = [
  {
    type: 'FIRST_PROJECT', name: 'First Project',
    hint: 'Complete your first project',
    color: 'rgba(72,200,100,0.85)', kind: 'Achievement',
    art: (c) => (
      <svg viewBox="0 0 200 140" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="fp-glow" cx="50%" cy="55%" r="45%">
            <stop offset="0%" stopColor={c} stopOpacity="0.18" />
            <stop offset="100%" stopColor={c} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="200" height="140" fill="url(#fp-glow)" />
        {/* Horizon line */}
        <line x1="0" y1="110" x2="200" y2="110" stroke={c} strokeWidth="0.5" opacity="0.3" />
        {/* Mountains */}
        <polyline points="0,110 40,80 70,95 110,60 140,85 170,70 200,110" fill="none" stroke={c} strokeWidth="0.8" opacity="0.25" />
        {/* Star */}
        <polygon points="100,22 108,50 138,50 114,66 122,94 100,78 78,94 86,66 62,50 92,50" fill="none" stroke={c} strokeWidth="1.2" />
        <polygon points="100,32 106,50 128,50 110,62 116,82 100,70 84,82 90,62 72,50 94,50" fill={c} opacity="0.12" />
        {/* Sparkle lines */}
        <line x1="100" y1="10" x2="100" y2="18" stroke={c} strokeWidth="0.6" opacity="0.5" />
        <line x1="140" y1="36" x2="146" y2="36" stroke={c} strokeWidth="0.6" opacity="0.4" />
        <line x1="54" y1="36" x2="60" y2="36" stroke={c} strokeWidth="0.6" opacity="0.4" />
      </svg>
    ),
  },
  {
    type: 'LOYAL_CLIENT_3', name: 'Loyal Client',
    hint: 'Complete 3 projects for the same client',
    color: 'rgba(80,160,240,0.85)', kind: 'Achievement',
    art: (c) => (
      <svg viewBox="0 0 200 140" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="lc-glow" cx="50%" cy="50%" r="45%">
            <stop offset="0%" stopColor={c} stopOpacity="0.15" />
            <stop offset="100%" stopColor={c} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="200" height="140" fill="url(#lc-glow)" />
        {/* Triangle connections */}
        <line x1="100" y1="28" x2="55" y2="100" stroke={c} strokeWidth="0.8" opacity="0.3" />
        <line x1="100" y1="28" x2="145" y2="100" stroke={c} strokeWidth="0.8" opacity="0.3" />
        <line x1="55" y1="100" x2="145" y2="100" stroke={c} strokeWidth="0.8" opacity="0.3" />
        {/* Center fill */}
        <polygon points="100,28 55,100 145,100" fill={c} opacity="0.04" />
        {/* Nodes */}
        <circle cx="100" cy="28" r="14" fill="none" stroke={c} strokeWidth="1" />
        <circle cx="100" cy="28" r="5" fill={c} opacity="0.3" />
        <circle cx="55" cy="100" r="12" fill="none" stroke={c} strokeWidth="1" />
        <circle cx="55" cy="100" r="4" fill={c} opacity="0.3" />
        <circle cx="145" cy="100" r="12" fill="none" stroke={c} strokeWidth="1" />
        <circle cx="145" cy="100" r="4" fill={c} opacity="0.3" />
        {/* Orbiting dots */}
        <circle cx="78" cy="60" r="2" fill={c} opacity="0.4" />
        <circle cx="122" cy="60" r="2" fill={c} opacity="0.4" />
        <circle cx="100" cy="104" r="2" fill={c} opacity="0.4" />
      </svg>
    ),
  },
  {
    type: 'HIGH_ROLLER', name: 'High Roller',
    hint: 'Complete a project with budget > $10,000',
    color: 'rgba(240,190,60,0.85)', kind: 'Badge',
    art: (c) => (
      <svg viewBox="0 0 200 140" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="hr-glow" cx="50%" cy="50%" r="40%">
            <stop offset="0%" stopColor={c} stopOpacity="0.2" />
            <stop offset="100%" stopColor={c} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="200" height="140" fill="url(#hr-glow)" />
        {/* Radiating lines */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => {
          const rad = (a * Math.PI) / 180;
          return (
            <line key={a}
              x1={100 + Math.cos(rad) * 20} y1={70 + Math.sin(rad) * 20}
              x2={100 + Math.cos(rad) * 55} y2={70 + Math.sin(rad) * 55}
              stroke={c} strokeWidth="0.5" opacity="0.2"
            />
          );
        })}
        {/* Diamond */}
        <polygon points="100,24 130,70 100,116 70,70" fill={c} opacity="0.06" />
        <polygon points="100,24 130,70 100,116 70,70" fill="none" stroke={c} strokeWidth="1.2" />
        {/* Inner diamond */}
        <polygon points="100,40 118,70 100,100 82,70" fill="none" stroke={c} strokeWidth="0.6" opacity="0.5" />
        {/* Center dot */}
        <circle cx="100" cy="70" r="3" fill={c} opacity="0.5" />
      </svg>
    ),
  },
  {
    type: 'EARLY_BIRD', name: 'Early Bird',
    hint: 'Finish a project before its deadline',
    color: 'rgba(180,130,240,0.85)', kind: 'Badge',
    art: (c) => (
      <svg viewBox="0 0 200 140" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="eb-glow" cx="50%" cy="50%" r="45%">
            <stop offset="0%" stopColor={c} stopOpacity="0.15" />
            <stop offset="100%" stopColor={c} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="200" height="140" fill="url(#eb-glow)" />
        {/* Clock circle */}
        <circle cx="100" cy="70" r="40" fill="none" stroke={c} strokeWidth="0.8" opacity="0.2" />
        <circle cx="100" cy="70" r="42" fill="none" stroke={c} strokeWidth="0.3" opacity="0.1" />
        {/* Clock ticks */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => {
          const rad = (a * Math.PI) / 180;
          return (
            <line key={a}
              x1={100 + Math.cos(rad) * 36} y1={70 + Math.sin(rad) * 36}
              x2={100 + Math.cos(rad) * 40} y2={70 + Math.sin(rad) * 40}
              stroke={c} strokeWidth="1" opacity="0.3"
            />
          );
        })}
        {/* Lightning bolt */}
        <polygon
          points="108,26 92,66 104,66 88,114 118,62 106,62 120,26"
          fill={c} opacity="0.08"
        />
        <polyline
          points="108,26 92,66 104,66 88,114"
          fill="none" stroke={c} strokeWidth="1.3"
        />
        <polyline
          points="88,114 118,62 106,62 120,26"
          fill="none" stroke={c} strokeWidth="1.3" opacity="0.4"
        />
      </svg>
    ),
  },
];

// ── XP helpers ──

function xpForLevel(level: number) { return 100 * level * level; }

function xpProgress(xp: number, level: number): number {
  const safeLvl = Math.max(level, 1);
  const cur = xpForLevel(safeLvl - 1);
  const nxt = xpForLevel(safeLvl);
  const range = nxt - cur;
  if (range <= 0) return 0;
  return Math.min(Math.max((xp - cur) / range, 0), 1);
}

// ── Page ──

export default function Growth() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [animReady, setAnimReady] = useState(false);

  useEffect(() => {
    gamificationService.fetchStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        requestAnimationFrame(() => setAnimReady(true));
      });
  }, []);

  const level = Math.max(stats?.level ?? 1, 1);
  const xp = stats?.xp ?? 0;
  const xpToNext = stats?.xpToNextLevel ?? 0;
  const progress = stats ? xpProgress(xp, level) : 0;
  const levelTitle = LEVEL_TITLES[level] ?? LEVEL_TITLE_DEFAULT;

  const earnedTypes = useMemo(() => {
    const set = new Set<string>();
    stats?.achievements.forEach(a => set.add(a.type));
    stats?.badges.forEach(b => set.add(b.type));
    return set;
  }, [stats]);

  const earnedMap = useMemo(() => {
    const map = new Map<string, string>();
    stats?.achievements.forEach(a => map.set(a.type, a.earnedAt));
    stats?.badges.forEach(b => map.set(b.type, b.earnedAt));
    return map;
  }, [stats]);

  const totalEarned = ALL_CARDS.filter(c => earnedTypes.has(c.type)).length;

  const RING_R = 58;
  const RING_CIRC = 2 * Math.PI * RING_R;
  const ringOffset = RING_CIRC * (1 - (animReady ? progress : 0));

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 400,
      }}>
        <p style={{
          fontFamily: 'var(--font-m)', fontSize: 11,
          color: 'var(--text-dim)', letterSpacing: '.06em',
        }}>Loading...</p>
      </div>
    );
  }

  const achEarned = ALL_CARDS.filter(c => c.kind === 'Achievement' && earnedTypes.has(c.type)).length;
  const achTotal  = ALL_CARDS.filter(c => c.kind === 'Achievement').length;
  const bdgEarned = ALL_CARDS.filter(c => c.kind === 'Badge' && earnedTypes.has(c.type)).length;
  const bdgTotal  = ALL_CARDS.filter(c => c.kind === 'Badge').length;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 24,
      animation: 'fadeUp .35s var(--ease) both',
      width: '100%',
    }}>
      {/* ═══ Header ═══ */}
      <div>
        <h2 style={{
          fontFamily: 'var(--font-d)', fontWeight: 500, fontSize: 26,
          color: 'var(--text)', letterSpacing: '.06em', lineHeight: 1.3,
          marginBottom: 4,
        }}>{t('growth.title')}</h2>
        <p style={{
          fontFamily: 'var(--font-m)', fontSize: 11,
          color: 'var(--text-dim)', letterSpacing: '.04em',
        }}>{t('growth.subtitle')}</p>
      </div>

      {/* ═══ Main grid — two columns, stacks on narrow ═══ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 20,
        alignItems: 'start',
      }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* XP Ring + Progress */}
          <div style={{
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '24px 28px',
            display: 'flex', gap: 24, alignItems: 'center',
            animation: 'fadeUp .4s var(--ease) .05s both',
          }}>
            {/* Ring */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <svg width="120" height="120" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r={RING_R} fill="none" stroke="var(--border)" strokeWidth="5" />
                <circle cx="70" cy="70" r={RING_R} fill="none" stroke="var(--accent)" strokeWidth="5"
                  strokeLinecap="round" strokeDasharray={RING_CIRC} strokeDashoffset={ringOffset}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1.2s var(--ease)' }}
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <p style={{
                  fontFamily: 'var(--font-d)', fontSize: 28, fontWeight: 500,
                  color: 'var(--text)', lineHeight: 1, fontVariantNumeric: 'tabular-nums',
                }}>{level}</p>
                <p style={{
                  fontFamily: 'var(--font-m)', fontSize: 8,
                  color: 'var(--accent)', letterSpacing: '.08em',
                  textTransform: 'uppercase', marginTop: 2,
                }}>{levelTitle}</p>
              </div>
            </div>

            {/* XP numbers + bar */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <p style={{
                  fontFamily: 'var(--font-d)', fontSize: 18, fontWeight: 500,
                  color: 'var(--text)', fontVariantNumeric: 'tabular-nums', marginBottom: 2,
                }}>
                  {xp.toLocaleString()} <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>XP</span>
                </p>
                <p style={{ fontFamily: 'var(--font-m)', fontSize: 9, color: 'var(--text-dim)', fontVariantNumeric: 'tabular-nums' }}>
                  {xpToNext.toLocaleString()} {t('growth.to_next')}
                </p>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: 'var(--surface)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${animReady ? progress * 100 : 0}%`,
                  background: 'var(--accent)', borderRadius: 3,
                  transition: 'width 1.2s var(--ease)',
                }} />
              </div>
            </div>
          </div>

          {/* Stat chips — 2x2 grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <StatChip label={t('growth.level')} value={String(level)} color="var(--text)" />
            <StatChip label={t('growth.total_xp')} value={xp.toLocaleString()} color="var(--accent)" />
            <StatChip label={t('growth.achievements')} value={`${achEarned}/${achTotal}`} color="rgba(72,200,100,0.85)" />
            <StatChip label={t('growth.badges')} value={`${bdgEarned}/${bdgTotal}`} color="rgba(240,190,60,0.85)" />
          </div>
        </div>

        {/* ── RIGHT COLUMN — Card collection ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <p style={{
              fontFamily: 'var(--font-m)', fontSize: 10,
              color: 'var(--text-dim)', letterSpacing: '.1em', textTransform: 'uppercase',
            }}>Collection</p>
            <p style={{
              fontFamily: 'var(--font-m)', fontSize: 10,
              color: 'var(--text-dim)', fontVariantNumeric: 'tabular-nums',
            }}>{totalEarned}/{ALL_CARDS.length}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {ALL_CARDS.map((card, i) => (
              <CollectibleCard
                key={card.type}
                card={card}
                earned={earnedTypes.has(card.type)}
                earnedAt={earnedMap.get(card.type)}
                index={i}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Stat Chip ── */
function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      padding: '10px 12px', background: 'var(--surface)',
      borderRadius: 8, border: '1px solid var(--border)',
    }}>
      <p style={{
        fontFamily: 'var(--font-d)', fontSize: 16, fontWeight: 500,
        color, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums', marginBottom: 2,
      }}>{value}</p>
      <p style={{
        fontFamily: 'var(--font-m)', fontSize: 8,
        color: 'var(--text-dim)', letterSpacing: '.1em', textTransform: 'uppercase',
      }}>{label}</p>
    </div>
  );
}

/* ── Collectible Card ── */
function CollectibleCard({
  card, earned, earnedAt, index,
}: {
  card: CardDef; earned: boolean; earnedAt?: string; index: number;
}) {
  const [hovered, setHovered] = useState(false);

  const date = earnedAt
    ? new Date(earnedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : null;

  const dim = !earned;
  const borderColor = hovered && earned ? card.color : 'var(--border)';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 10,
        border: `1.5px solid ${borderColor}`,
        background: 'var(--surface-2)',
        overflow: 'hidden',
        animation: `fadeUp .4s var(--ease) ${0.08 + index * 0.06}s both`,
        opacity: dim ? 0.45 : 1,
        cursor: 'default',
        position: 'relative',
      }}
    >
      {/* ── Art window ── */}
      <div style={{
        height: 120,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {card.art(earned ? card.color : 'var(--text-dim)')}
        {/* Lock overlay for unearned */}
        {dim && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.3)',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="var(--text-dim)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
              opacity="0.6"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        )}
      </div>

      {/* ── Card body ── */}
      <div style={{ padding: '12px 14px' }}>
        {/* Name row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 4,
        }}>
          <p style={{
            fontFamily: 'var(--font-d)', fontSize: 11, fontWeight: 500,
            color: earned ? 'var(--white)' : 'var(--text-dim)',
            letterSpacing: '.02em',
          }}>{card.name}</p>
          {earned && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke={card.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
        </div>

        {/* Type line */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderTop: '1px solid var(--border)',
          paddingTop: 6, marginTop: 2,
        }}>
          <p style={{
            fontFamily: 'var(--font-m)', fontSize: 8,
            color: earned ? card.color : 'var(--text-dim)',
            letterSpacing: '.08em', textTransform: 'uppercase',
          }}>{card.kind}</p>
          {earned && date && (
            <p style={{
              fontFamily: 'var(--font-m)', fontSize: 8,
              color: 'var(--text-dim)',
            }}>{date}</p>
          )}
        </div>

        {/* Description */}
        <p style={{
          fontFamily: 'var(--font-m)', fontSize: 9,
          color: 'var(--text-dim)', lineHeight: 1.4,
          marginTop: 6,
        }}>{card.hint}</p>
      </div>
    </div>
  );
}
