import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { gamificationService } from '../services/gamification';
import type { GamificationStats } from '../services/gamification';

/* ─────────────────────────────────────────────
   GROWTH PAGE — XP, level, achievements & badges.
   A single API call on mount powers the entire page.
───────────────────────────────────────────── */

// ── Static definitions for all possible rewards ──

const LEVEL_TITLES: Record<number, string> = {
  1: 'Starter',
  2: 'Rising',
  3: 'Steady',
  4: 'Seasoned',
  5: 'Expert',
};
const LEVEL_TITLE_DEFAULT = 'Master';

interface RewardDef {
  type: string;
  name: string;
  hint: string;
  color: string;
  iconPath: string; // SVG path(s) for the reward icon
}

const ACHIEVEMENT_DEFS: RewardDef[] = [
  {
    type: 'FIRST_PROJECT',
    name: 'First Project',
    hint: 'Complete your first project',
    color: 'rgba(72,200,100,0.85)',
    iconPath: 'M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z',
  },
  {
    type: 'LOYAL_CLIENT_3',
    name: 'Loyal Client',
    hint: 'Complete 3 projects for the same client',
    color: 'rgba(80,160,240,0.85)',
    iconPath: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  },
];

const BADGE_DEFS: RewardDef[] = [
  {
    type: 'HIGH_ROLLER',
    name: 'High Roller',
    hint: 'Complete a project with budget > $10,000',
    color: 'rgba(240,190,60,0.85)',
    iconPath: 'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M16.36 16.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M16.36 7.64l1.42-1.42M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  },
  {
    type: 'EARLY_BIRD',
    name: 'Early Bird',
    hint: 'Finish a project before its deadline',
    color: 'rgba(180,130,240,0.85)',
    iconPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8Z',
  },
];

// ── XP helpers ──

function xpForLevel(level: number) {
  return 100 * level * level;
}

function xpProgress(xp: number, level: number): number {
  const safeLvl = Math.max(level, 1);
  const currentLevelXp = xpForLevel(safeLvl - 1);
  const nextLevelXp = xpForLevel(safeLvl);
  const range = nextLevelXp - currentLevelXp;
  if (range <= 0) return 0;
  return Math.min(Math.max((xp - currentLevelXp) / range, 0), 1);
}

// ── Component ──

export default function Ecosystem() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    gamificationService.fetchStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        // Trigger stagger animations after data is painted
        requestAnimationFrame(() => setMounted(true));
      });
  }, []);

  const level = Math.max(stats?.level ?? 1, 1);
  const xp = stats?.xp ?? 0;
  const xpToNext = stats?.xpToNextLevel ?? 0;
  const progress = stats ? xpProgress(xp, level) : 0;
  const levelTitle = LEVEL_TITLES[level] ?? LEVEL_TITLE_DEFAULT;

  const earnedAchievementTypes = useMemo(
    () => new Set(stats?.achievements.map(a => a.type) ?? []),
    [stats],
  );
  const earnedBadgeTypes = useMemo(
    () => new Set(stats?.badges.map(b => b.type) ?? []),
    [stats],
  );

  const achievementsEarned = ACHIEVEMENT_DEFS.filter(d => earnedAchievementTypes.has(d.type)).length;
  const badgesEarned = BADGE_DEFS.filter(d => earnedBadgeTypes.has(d.type)).length;

  // SVG ring math
  const RING_R = 58;
  const RING_CIRC = 2 * Math.PI * RING_R;
  const ringOffset = RING_CIRC * (1 - (mounted ? progress : 0));

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 400,
      }}>
        <p style={{
          fontFamily: 'var(--font-m)', fontSize: 11,
          color: 'var(--text-dim)', letterSpacing: '.06em',
        }}>
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 28,
      animation: 'fadeUp .35s var(--ease) both',
      maxWidth: 960, width: '100%',
    }}>
      {/* ═══ Header ═══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-d)', fontWeight: 500, fontSize: 26,
            color: 'var(--text)', letterSpacing: '.06em', lineHeight: 1.3,
            marginBottom: 4,
          }}>
            {t('growth.title')}
          </h2>
          <p style={{
            fontFamily: 'var(--font-m)', fontSize: 11,
            color: 'var(--text-dim)', letterSpacing: '.04em',
          }}>
            {t('growth.subtitle')}
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '7px 14px', borderRadius: 6,
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            fontFamily: 'var(--font-m)', fontSize: 11, fontWeight: 500,
            color: 'var(--text-mid)', cursor: 'pointer', transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-dim)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          {t('growth.back')}
        </button>
      </div>

      {/* ═══ Hero: Ring + Stats ═══ */}
      <div style={{
        display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24,
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '32px 36px',
        animation: 'fadeUp .4s var(--ease) .05s both',
      }}>
        {/* XP Ring */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <svg width="160" height="160" viewBox="0 0 140 140">
            {/* Track */}
            <circle
              cx="70" cy="70" r={RING_R}
              fill="none" stroke="var(--border)" strokeWidth="6"
            />
            {/* Progress arc */}
            <circle
              cx="70" cy="70" r={RING_R}
              fill="none" stroke="var(--accent)" strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={RING_CIRC}
              strokeDashoffset={ringOffset}
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: '50% 50%',
                transition: 'stroke-dashoffset 1.2s var(--ease)',
              }}
            />
            {/* Glow */}
            <circle
              cx="70" cy="70" r={RING_R - 8}
              fill="var(--accent)" opacity="0.03"
            />
          </svg>
          {/* Center text */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <p style={{
              fontFamily: 'var(--font-d)', fontSize: 36, fontWeight: 500,
              color: 'var(--text)', lineHeight: 1, letterSpacing: '.04em',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {level}
            </p>
            <p style={{
              fontFamily: 'var(--font-m)', fontSize: 9,
              color: 'var(--accent)', letterSpacing: '.1em',
              textTransform: 'uppercase', marginTop: 4,
            }}>
              {levelTitle}
            </p>
          </div>
        </div>

        {/* Stats panel */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', gap: 20,
        }}>
          {/* XP bar */}
          <div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'baseline', marginBottom: 8,
            }}>
              <p style={{
                fontFamily: 'var(--font-d)', fontSize: 22, fontWeight: 500,
                color: 'var(--text)', letterSpacing: '.04em',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {xp.toLocaleString()} <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>XP</span>
              </p>
              <p style={{
                fontFamily: 'var(--font-m)', fontSize: 10,
                color: 'var(--text-dim)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {xpToNext.toLocaleString()} {t('growth.to_next')}
              </p>
            </div>
            <div style={{
              height: 6, borderRadius: 3,
              background: 'var(--surface)', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${mounted ? progress * 100 : 0}%`,
                background: 'var(--accent)', borderRadius: 3,
                transition: 'width 1.2s var(--ease)',
              }} />
            </div>
          </div>

          {/* Stat chips */}
          <div style={{ display: 'flex', gap: 12 }}>
            <StatChip label={t('growth.level')} value={String(level)} color="var(--text)" />
            <StatChip label={t('growth.total_xp')} value={xp.toLocaleString()} color="var(--accent)" />
            <StatChip
              label={t('growth.achievements')}
              value={`${achievementsEarned}/${ACHIEVEMENT_DEFS.length}`}
              color="rgba(72,200,100,0.85)"
            />
            <StatChip
              label={t('growth.badges')}
              value={`${badgesEarned}/${BADGE_DEFS.length}`}
              color="rgba(240,190,60,0.85)"
            />
          </div>
        </div>
      </div>

      {/* ═══ Achievements ═══ */}
      <Section
        title={t('growth.achievements_title')}
        count={`${achievementsEarned}/${ACHIEVEMENT_DEFS.length}`}
        delay=".1s"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {ACHIEVEMENT_DEFS.map((def, i) => {
            const earned = stats?.achievements.find(a => a.type === def.type);
            return (
              <RewardCard
                key={def.type}
                def={def}
                earned={!!earned}
                earnedAt={earned?.earnedAt}
                index={i}
                mounted={mounted}
              />
            );
          })}
        </div>
      </Section>

      {/* ═══ Badges ═══ */}
      <Section
        title={t('growth.badges_title')}
        count={`${badgesEarned}/${BADGE_DEFS.length}`}
        delay=".15s"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {BADGE_DEFS.map((def, i) => {
            const earned = stats?.badges.find(b => b.type === def.type);
            return (
              <RewardCard
                key={def.type}
                def={def}
                earned={!!earned}
                earnedAt={earned?.earnedAt}
                index={i}
                mounted={mounted}
              />
            );
          })}
        </div>
      </Section>
    </div>
  );
}

/* ── Stat Chip ── */
function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      flex: 1, padding: '10px 12px',
      background: 'var(--surface)', borderRadius: 8,
      border: '1px solid var(--border)',
    }}>
      <p style={{
        fontFamily: 'var(--font-d)', fontSize: 16, fontWeight: 500,
        color, letterSpacing: '.04em', lineHeight: 1.2,
        fontVariantNumeric: 'tabular-nums', marginBottom: 2,
      }}>
        {value}
      </p>
      <p style={{
        fontFamily: 'var(--font-m)', fontSize: 8,
        color: 'var(--text-dim)', letterSpacing: '.1em',
        textTransform: 'uppercase',
      }}>
        {label}
      </p>
    </div>
  );
}

/* ── Section wrapper ── */
function Section({
  title, count, delay, children,
}: {
  title: string; count: string; delay: string; children: React.ReactNode;
}) {
  return (
    <div style={{ animation: `fadeUp .4s var(--ease) ${delay} both` }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'baseline', marginBottom: 12,
      }}>
        <p style={{
          fontFamily: 'var(--font-m)', fontSize: 10,
          color: 'var(--text-dim)', letterSpacing: '.1em',
          textTransform: 'uppercase',
        }}>
          {title}
        </p>
        <p style={{
          fontFamily: 'var(--font-m)', fontSize: 10,
          color: 'var(--text-dim)', letterSpacing: '.04em',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {count}
        </p>
      </div>
      {children}
    </div>
  );
}

/* ── Reward Card (achievement or badge) ── */
function RewardCard({
  def, earned, earnedAt, index, mounted,
}: {
  def: RewardDef; earned: boolean; earnedAt?: string; index: number; mounted: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const date = earnedAt
    ? new Date(earnedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '20px 22px',
        borderRadius: 10,
        border: `1px solid ${earned
          ? (hovered ? def.color : 'var(--border)')
          : 'var(--border)'}`,
        background: earned
          ? (hovered ? `${def.color.replace(/[\d.]+\)$/, '0.06)')}` : 'var(--surface-2)')
          : 'var(--surface-2)',
        display: 'flex', gap: 16, alignItems: 'flex-start',
        transition: 'all .2s var(--ease)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(12px)',
        transitionDelay: `${0.2 + index * 0.08}s`,
      }}
    >
      {/* Icon */}
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        background: earned
          ? def.color.replace(/[\d.]+\)$/, '0.12)')
          : 'var(--surface)',
        border: `1px solid ${earned
          ? def.color.replace(/[\d.]+\)$/, '0.2)')
          : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'all .2s var(--ease)',
      }}>
        {earned ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke={def.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d={def.iconPath} />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="var(--text-dim)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
            opacity="0.4"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        )}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'var(--font-m)', fontSize: 12, fontWeight: 500,
          color: earned ? 'var(--white)' : 'var(--text-dim)',
          letterSpacing: '.02em', marginBottom: 3,
        }}>
          {def.name}
        </p>
        <p style={{
          fontFamily: 'var(--font-m)', fontSize: 10,
          color: 'var(--text-dim)', lineHeight: 1.4,
          letterSpacing: '.02em',
        }}>
          {earned ? date : def.hint}
        </p>
      </div>

      {/* Earned check */}
      {earned && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke={def.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, marginTop: 2 }}
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )}
    </div>
  );
}
