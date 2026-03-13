import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

/* ─────────────────────────────────────────────
   THEME CONTEXT — Unified theme-preset system.
   Each preset controls ALL visual tokens:
   backgrounds, surfaces, text, accents, charts,
   sidebar, status colours, etc.
   Persists to localStorage.
───────────────────────────────────────────── */

// ── Public types ─────────────────────────────
export type ThemePresetId =
  | 'default-dark'
  | 'default-light'
  | 'midnight-violet'
  | 'japan-paper'
  | 'retro-terminal'
  | 'graphite'
  | 'solar-sand'
  | 'arctic-blue'
  | 'black-and-white';

export type FontScale = 0.90 | 0.95 | 1 | 1.1 | 1.2;
export type FontSizeLabel = 'XS' | 'S' | 'M' | 'L' | 'XL';
export type FontFamilyId = 'inter' | 'ibm-plex' | 'source-sans' | 'rubik' | 'merriweather';

export const FONT_SIZE_OPTIONS: { value: FontScale; label: FontSizeLabel; desc: string }[] = [
  { value: 0.90, label: 'XS', desc: 'Extra compact' },
  { value: 0.95, label: 'S',  desc: 'Compact' },
  { value: 1,    label: 'M',  desc: 'Default' },
  { value: 1.1,  label: 'L',  desc: 'Large' },
  { value: 1.2,  label: 'XL', desc: 'Extra large' },
];
export type SidebarBehavior = 'automatic' | 'manual';

/** Backward-compat re-exports (kept for consumer compatibility) */
export type ThemeMode = 'dark' | 'light';
export type PalettePreset = string;

/* ── Font family definitions — 5 curated presets with distinct vibes ── */
export const FONT_FAMILIES: { id: FontFamilyId; label: string; stack: string; desc: string; vibe: string; isSerif?: boolean }[] = [
  {
    id: 'inter',
    label: 'Inter',
    stack: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    desc: 'Clean, neutral, professional',
    vibe: 'Neutral Modern',
  },
  {
    id: 'ibm-plex',
    label: 'IBM Plex Sans',
    stack: "'IBM Plex Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    desc: 'Precise, engineering-focused, trustworthy',
    vibe: 'Technical',
  },
  {
    id: 'source-sans',
    label: 'Source Sans 3',
    stack: "'Source Sans 3', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    desc: 'Friendly, warm, great readability',
    vibe: 'Warm & Human',
  },
  {
    id: 'rubik',
    label: 'Rubik',
    stack: "'Rubik', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    desc: 'Modern, geometric, tech-forward',
    vibe: 'Futuristic',
  },
  {
    id: 'merriweather',
    label: 'Merriweather',
    stack: "'Merriweather', Georgia, 'Times New Roman', serif",
    desc: 'Authoritative, editorial, elegant',
    vibe: 'Elegant Serif',
    isSerif: true,
  },
];

export const FONT_FAMILY_MAP: Record<FontFamilyId, string> =
  Object.fromEntries(FONT_FAMILIES.map((f) => [f.id, f.stack])) as Record<FontFamilyId, string>;

// ── Token shape ──────────────────────────────
/** Every CSS custom property a theme must define */
export interface ThemeTokens {
  // Surfaces
  bg: string;
  bg2: string;
  surface: string;
  surface2: string;
  sidebarBg: string;
  // Borders
  border: string;
  borderH: string;
  // Text
  text: string;
  textDim: string;
  textMid: string;
  white: string;
  glass: string;
  // Accents
  accent: string;
  accentBg: string;
  accentHover: string;
  // Status
  success: string;
  successBg: string;
  danger: string;
  dangerBg: string;
  warning: string;
  warningBg: string;
  info: string;
  infoBg: string;
  // Chart
  chartLine: string;
  chartGrad1: string;
  chartGrad2: string;
  // Tags
  tagClient: string;
  tagProject: string;
  // Trends
  trendUp: string;
  trendDown: string;
  // Sidebar highlight
  sidebarActive: string;
  sidebarActiveBg: string;
  sidebarActiveBorder: string;
}

export interface ThemePresetMeta {
  id: ThemePresetId;
  label: string;
  desc: string;
  /** "dark" | "light" — used for data-theme attr & scrollbar/autofill rules */
  family: 'dark' | 'light';
  /** 4 swatch colours shown in the picker */
  swatches: [string, string, string, string];
  tokens: ThemeTokens;
}

// ── Preset definitions ───────────────────────
export const THEME_PRESETS: ThemePresetMeta[] = [
  /* ─── default-dark ─── */
  {
    id: 'default-dark',
    label: 'Default Dark',
    desc: 'The original dark interface with emerald accents',
    family: 'dark',
    swatches: ['#060606', '#111111', 'rgba(72,200,100,0.85)', 'rgba(230,90,90,0.85)'],
    tokens: {
      bg: '#060606', bg2: '#0c0c0c', surface: '#111111', surface2: '#0e0e0e', sidebarBg: '#080808',
      border: 'rgba(255,255,255,0.07)', borderH: 'rgba(255,255,255,0.16)',
      text: '#e2e2e2', textDim: 'rgba(200,200,200,0.38)', textMid: 'rgba(200,200,200,0.62)',
      white: '#ececec', glass: 'rgba(255,255,255,0.03)',
      accent: 'rgba(72,200,100,0.85)', accentBg: 'rgba(72,200,100,0.08)', accentHover: 'rgba(72,200,100,0.20)',
      success: 'rgba(100,220,130,0.85)', successBg: 'rgba(100,220,130,0.08)',
      danger: 'rgba(230,90,90,0.85)', dangerBg: 'rgba(230,90,90,0.08)',
      warning: 'rgba(240,190,60,0.85)', warningBg: 'rgba(240,190,60,0.08)',
      info: 'rgba(80,160,240,0.80)', infoBg: 'rgba(80,160,240,0.08)',
      chartLine: 'rgba(72,200,100,0.90)', chartGrad1: 'rgba(72,200,100,0.22)', chartGrad2: 'rgba(72,200,100,0.00)',
      tagClient: 'rgba(72,200,100,0.15)', tagProject: 'rgba(100,180,220,0.15)',
      trendUp: 'rgba(72,200,100,0.80)', trendDown: 'rgba(230,90,90,0.80)',
      sidebarActive: 'rgba(72,200,100,0.90)', sidebarActiveBg: 'rgba(72,200,100,0.08)', sidebarActiveBorder: 'rgba(72,200,100,0.18)',
    },
  },

  /* ─── default-light ─── */
  {
    id: 'default-light',
    label: 'Default Light',
    desc: 'Soft warm grays with green accents — easy on the eyes',
    family: 'light',
    swatches: ['#edeef0', '#f6f6f8', 'rgba(44,160,74,0.90)', 'rgba(200,60,60,0.85)'],
    tokens: {
      bg: '#edeef0', bg2: '#f6f6f8', surface: '#f8f8fa', surface2: '#f0f1f3', sidebarBg: '#e8e9ec',
      border: 'rgba(0,0,0,0.09)', borderH: 'rgba(0,0,0,0.18)',
      text: '#1a1a1a', textDim: 'rgba(60,60,60,0.50)', textMid: 'rgba(40,40,40,0.70)',
      white: '#111111', glass: 'rgba(0,0,0,0.03)',
      accent: 'rgba(44,160,74,0.90)', accentBg: 'rgba(44,160,74,0.08)', accentHover: 'rgba(44,160,74,0.18)',
      success: 'rgba(44,160,74,0.85)', successBg: 'rgba(44,160,74,0.08)',
      danger: 'rgba(200,60,60,0.85)', dangerBg: 'rgba(200,60,60,0.08)',
      warning: 'rgba(200,150,30,0.85)', warningBg: 'rgba(200,150,30,0.08)',
      info: 'rgba(50,120,200,0.80)', infoBg: 'rgba(50,120,200,0.08)',
      chartLine: 'rgba(44,160,74,0.90)', chartGrad1: 'rgba(44,160,74,0.18)', chartGrad2: 'rgba(44,160,74,0.00)',
      tagClient: 'rgba(44,160,74,0.12)', tagProject: 'rgba(50,120,200,0.12)',
      trendUp: 'rgba(44,160,74,0.85)', trendDown: 'rgba(200,60,60,0.85)',
      sidebarActive: 'rgba(44,160,74,0.90)', sidebarActiveBg: 'rgba(44,160,74,0.08)', sidebarActiveBorder: 'rgba(44,160,74,0.16)',
    },
  },

  /* ─── midnight-violet ─── */
  {
    id: 'midnight-violet',
    label: 'Midnight Violet',
    desc: 'Deep navy backgrounds with vivid purple accents',
    family: 'dark',
    swatches: ['#0c0a18', '#151226', 'rgba(160,100,240,0.88)', 'rgba(240,80,100,0.85)'],
    tokens: {
      bg: '#0c0a18', bg2: '#100e20', surface: '#161328', surface2: '#131024', sidebarBg: '#0a0816',
      border: 'rgba(180,160,255,0.08)', borderH: 'rgba(180,160,255,0.18)',
      text: '#e0dced', textDim: 'rgba(190,180,220,0.40)', textMid: 'rgba(190,180,220,0.65)',
      white: '#f0ecff', glass: 'rgba(160,100,240,0.03)',
      accent: 'rgba(160,100,240,0.88)', accentBg: 'rgba(160,100,240,0.10)', accentHover: 'rgba(160,100,240,0.22)',
      success: 'rgba(100,220,180,0.85)', successBg: 'rgba(100,220,180,0.08)',
      danger: 'rgba(240,80,100,0.85)', dangerBg: 'rgba(240,80,100,0.08)',
      warning: 'rgba(240,200,80,0.85)', warningBg: 'rgba(240,200,80,0.08)',
      info: 'rgba(100,160,255,0.80)', infoBg: 'rgba(100,160,255,0.08)',
      chartLine: 'rgba(160,100,240,0.90)', chartGrad1: 'rgba(160,100,240,0.22)', chartGrad2: 'rgba(160,100,240,0.00)',
      tagClient: 'rgba(160,100,240,0.15)', tagProject: 'rgba(100,160,255,0.15)',
      trendUp: 'rgba(100,220,180,0.80)', trendDown: 'rgba(240,80,100,0.80)',
      sidebarActive: 'rgba(160,100,240,0.90)', sidebarActiveBg: 'rgba(160,100,240,0.10)', sidebarActiveBorder: 'rgba(160,100,240,0.20)',
    },
  },

  /* ─── japan-paper ─── */
  {
    id: 'japan-paper',
    label: 'Japan Paper',
    desc: 'Warm cream washi with ink-black text and muted red',
    family: 'light',
    swatches: ['#f0ebe0', '#f7f3ea', 'rgba(180,60,50,0.82)', 'rgba(60,60,60,0.80)'],
    tokens: {
      bg: '#f0ebe0', bg2: '#f7f3ea', surface: '#f5f0e6', surface2: '#ede8dd', sidebarBg: '#e8e2d6',
      border: 'rgba(80,60,40,0.10)', borderH: 'rgba(80,60,40,0.20)',
      text: '#2a2420', textDim: 'rgba(80,60,40,0.45)', textMid: 'rgba(60,45,30,0.65)',
      white: '#1a1410', glass: 'rgba(80,60,40,0.03)',
      accent: 'rgba(180,60,50,0.82)', accentBg: 'rgba(180,60,50,0.08)', accentHover: 'rgba(180,60,50,0.16)',
      success: 'rgba(90,140,70,0.80)', successBg: 'rgba(90,140,70,0.08)',
      danger: 'rgba(180,60,50,0.85)', dangerBg: 'rgba(180,60,50,0.08)',
      warning: 'rgba(190,140,40,0.80)', warningBg: 'rgba(190,140,40,0.08)',
      info: 'rgba(80,120,160,0.75)', infoBg: 'rgba(80,120,160,0.08)',
      chartLine: 'rgba(180,60,50,0.85)', chartGrad1: 'rgba(180,60,50,0.16)', chartGrad2: 'rgba(180,60,50,0.00)',
      tagClient: 'rgba(180,60,50,0.12)', tagProject: 'rgba(80,120,160,0.12)',
      trendUp: 'rgba(90,140,70,0.80)', trendDown: 'rgba(180,60,50,0.80)',
      sidebarActive: 'rgba(180,60,50,0.85)', sidebarActiveBg: 'rgba(180,60,50,0.08)', sidebarActiveBorder: 'rgba(180,60,50,0.14)',
    },
  },

  /* ─── retro-terminal ─── */
  {
    id: 'retro-terminal',
    label: 'Retro Terminal',
    desc: 'Pure black CRT with phosphor green mono glow',
    family: 'dark',
    swatches: ['#000000', '#0a0a0a', 'rgba(0,255,65,0.85)', 'rgba(255,60,60,0.80)'],
    tokens: {
      bg: '#000000', bg2: '#050505', surface: '#0a0a0a', surface2: '#080808', sidebarBg: '#020202',
      border: 'rgba(0,255,65,0.08)', borderH: 'rgba(0,255,65,0.18)',
      text: 'rgba(0,255,65,0.80)', textDim: 'rgba(0,255,65,0.30)', textMid: 'rgba(0,255,65,0.55)',
      white: 'rgba(0,255,65,0.95)', glass: 'rgba(0,255,65,0.02)',
      accent: 'rgba(0,255,65,0.85)', accentBg: 'rgba(0,255,65,0.06)', accentHover: 'rgba(0,255,65,0.15)',
      success: 'rgba(0,255,65,0.80)', successBg: 'rgba(0,255,65,0.06)',
      danger: 'rgba(255,60,60,0.80)', dangerBg: 'rgba(255,60,60,0.06)',
      warning: 'rgba(255,200,0,0.80)', warningBg: 'rgba(255,200,0,0.06)',
      info: 'rgba(0,200,255,0.75)', infoBg: 'rgba(0,200,255,0.06)',
      chartLine: 'rgba(0,255,65,0.90)', chartGrad1: 'rgba(0,255,65,0.18)', chartGrad2: 'rgba(0,255,65,0.00)',
      tagClient: 'rgba(0,255,65,0.10)', tagProject: 'rgba(0,200,255,0.10)',
      trendUp: 'rgba(0,255,65,0.80)', trendDown: 'rgba(255,60,60,0.80)',
      sidebarActive: 'rgba(0,255,65,0.90)', sidebarActiveBg: 'rgba(0,255,65,0.06)', sidebarActiveBorder: 'rgba(0,255,65,0.15)',
    },
  },

  /* ─── graphite ─── */
  {
    id: 'graphite',
    label: 'Graphite',
    desc: 'Medium gray surfaces with cool steel-blue accents',
    family: 'dark',
    swatches: ['#1a1c1e', '#222426', 'rgba(100,160,220,0.88)', 'rgba(220,80,80,0.82)'],
    tokens: {
      bg: '#1a1c1e', bg2: '#1e2022', surface: '#252729', surface2: '#222426', sidebarBg: '#18191b',
      border: 'rgba(255,255,255,0.08)', borderH: 'rgba(255,255,255,0.18)',
      text: '#d8dadc', textDim: 'rgba(200,200,210,0.40)', textMid: 'rgba(200,200,210,0.65)',
      white: '#eef0f2', glass: 'rgba(255,255,255,0.03)',
      accent: 'rgba(100,160,220,0.88)', accentBg: 'rgba(100,160,220,0.08)', accentHover: 'rgba(100,160,220,0.18)',
      success: 'rgba(80,190,120,0.85)', successBg: 'rgba(80,190,120,0.08)',
      danger: 'rgba(220,80,80,0.82)', dangerBg: 'rgba(220,80,80,0.08)',
      warning: 'rgba(230,180,60,0.82)', warningBg: 'rgba(230,180,60,0.08)',
      info: 'rgba(100,160,220,0.80)', infoBg: 'rgba(100,160,220,0.08)',
      chartLine: 'rgba(100,160,220,0.90)', chartGrad1: 'rgba(100,160,220,0.20)', chartGrad2: 'rgba(100,160,220,0.00)',
      tagClient: 'rgba(100,160,220,0.14)', tagProject: 'rgba(80,190,120,0.14)',
      trendUp: 'rgba(80,190,120,0.80)', trendDown: 'rgba(220,80,80,0.80)',
      sidebarActive: 'rgba(100,160,220,0.90)', sidebarActiveBg: 'rgba(100,160,220,0.08)', sidebarActiveBorder: 'rgba(100,160,220,0.16)',
    },
  },

  /* ─── solar-sand ─── */
  {
    id: 'solar-sand',
    label: 'Solar Sand',
    desc: 'Warm sand backgrounds with terracotta & olive tones',
    family: 'light',
    swatches: ['#ece5d8', '#f4efe4', 'rgba(190,100,50,0.85)', 'rgba(180,60,60,0.82)'],
    tokens: {
      bg: '#ece5d8', bg2: '#f4efe4', surface: '#f2ece0', surface2: '#eae3d6', sidebarBg: '#e2dace',
      border: 'rgba(100,70,30,0.10)', borderH: 'rgba(100,70,30,0.20)',
      text: '#2c2418', textDim: 'rgba(100,70,30,0.45)', textMid: 'rgba(80,55,20,0.65)',
      white: '#1a1208', glass: 'rgba(100,70,30,0.03)',
      accent: 'rgba(190,100,50,0.85)', accentBg: 'rgba(190,100,50,0.08)', accentHover: 'rgba(190,100,50,0.16)',
      success: 'rgba(110,150,60,0.80)', successBg: 'rgba(110,150,60,0.08)',
      danger: 'rgba(180,60,60,0.82)', dangerBg: 'rgba(180,60,60,0.08)',
      warning: 'rgba(200,150,40,0.82)', warningBg: 'rgba(200,150,40,0.08)',
      info: 'rgba(100,130,170,0.75)', infoBg: 'rgba(100,130,170,0.08)',
      chartLine: 'rgba(190,100,50,0.88)', chartGrad1: 'rgba(190,100,50,0.18)', chartGrad2: 'rgba(190,100,50,0.00)',
      tagClient: 'rgba(190,100,50,0.12)', tagProject: 'rgba(100,130,170,0.12)',
      trendUp: 'rgba(110,150,60,0.80)', trendDown: 'rgba(180,60,60,0.80)',
      sidebarActive: 'rgba(190,100,50,0.88)', sidebarActiveBg: 'rgba(190,100,50,0.08)', sidebarActiveBorder: 'rgba(190,100,50,0.14)',
    },
  },

  /* ─── arctic-blue ─── */
  {
    id: 'arctic-blue',
    label: 'Arctic Blue',
    desc: 'Cool pale blue-gray surfaces with ice accents',
    family: 'light',
    swatches: ['#e4e9ef', '#eef2f7', 'rgba(50,130,210,0.88)', 'rgba(200,60,70,0.82)'],
    tokens: {
      bg: '#e4e9ef', bg2: '#eef2f7', surface: '#edf1f6', surface2: '#e7ebf0', sidebarBg: '#dce2e9',
      border: 'rgba(30,60,100,0.09)', borderH: 'rgba(30,60,100,0.18)',
      text: '#1a2030', textDim: 'rgba(30,60,100,0.45)', textMid: 'rgba(30,50,80,0.65)',
      white: '#0a1420', glass: 'rgba(30,60,100,0.03)',
      accent: 'rgba(50,130,210,0.88)', accentBg: 'rgba(50,130,210,0.08)', accentHover: 'rgba(50,130,210,0.16)',
      success: 'rgba(50,170,110,0.82)', successBg: 'rgba(50,170,110,0.08)',
      danger: 'rgba(200,60,70,0.82)', dangerBg: 'rgba(200,60,70,0.08)',
      warning: 'rgba(200,160,40,0.82)', warningBg: 'rgba(200,160,40,0.08)',
      info: 'rgba(60,140,220,0.80)', infoBg: 'rgba(60,140,220,0.08)',
      chartLine: 'rgba(50,130,210,0.90)', chartGrad1: 'rgba(50,130,210,0.18)', chartGrad2: 'rgba(50,130,210,0.00)',
      tagClient: 'rgba(50,130,210,0.12)', tagProject: 'rgba(50,170,110,0.12)',
      trendUp: 'rgba(50,170,110,0.82)', trendDown: 'rgba(200,60,70,0.82)',
      sidebarActive: 'rgba(50,130,210,0.90)', sidebarActiveBg: 'rgba(50,130,210,0.08)', sidebarActiveBorder: 'rgba(50,130,210,0.14)',
    },
  },

  /* ─── black-and-white ─── */
  {
    id: 'black-and-white',
    label: 'Black & White',
    desc: 'Pure monochrome — no colour, maximum focus',
    family: 'dark',
    swatches: ['#000000', '#0e0e0e', 'rgba(255,255,255,0.85)', 'rgba(255,255,255,0.45)'],
    tokens: {
      bg: '#000000', bg2: '#060606', surface: '#0e0e0e', surface2: '#0a0a0a', sidebarBg: '#040404',
      border: 'rgba(255,255,255,0.08)', borderH: 'rgba(255,255,255,0.20)',
      text: 'rgba(255,255,255,0.78)', textDim: 'rgba(255,255,255,0.30)', textMid: 'rgba(255,255,255,0.55)',
      white: 'rgba(255,255,255,0.92)', glass: 'rgba(255,255,255,0.02)',
      accent: 'rgba(255,255,255,0.85)', accentBg: 'rgba(255,255,255,0.05)', accentHover: 'rgba(255,255,255,0.12)',
      success: 'rgba(255,255,255,0.70)', successBg: 'rgba(255,255,255,0.05)',
      danger: 'rgba(255,255,255,0.60)', dangerBg: 'rgba(255,255,255,0.05)',
      warning: 'rgba(255,255,255,0.65)', warningBg: 'rgba(255,255,255,0.05)',
      info: 'rgba(255,255,255,0.60)', infoBg: 'rgba(255,255,255,0.05)',
      chartLine: 'rgba(255,255,255,0.85)', chartGrad1: 'rgba(255,255,255,0.12)', chartGrad2: 'rgba(255,255,255,0.00)',
      tagClient: 'rgba(255,255,255,0.08)', tagProject: 'rgba(255,255,255,0.08)',
      trendUp: 'rgba(255,255,255,0.70)', trendDown: 'rgba(255,255,255,0.45)',
      sidebarActive: 'rgba(255,255,255,0.90)', sidebarActiveBg: 'rgba(255,255,255,0.05)', sidebarActiveBorder: 'rgba(255,255,255,0.12)',
    },
  },
];

/** Lookup map for quick access */
export const THEME_PRESET_MAP: Record<ThemePresetId, ThemePresetMeta> =
  Object.fromEntries(THEME_PRESETS.map((p) => [p.id, p])) as Record<ThemePresetId, ThemePresetMeta>;

/** Backward-compat: old code that reads PALETTE_MAP gets equivalent tokens */
export const PALETTE_MAP = {
  emerald: THEME_PRESET_MAP['default-dark'].tokens,
  ocean:   THEME_PRESET_MAP['arctic-blue'].tokens,
  sand:    THEME_PRESET_MAP['solar-sand'].tokens,
  rose:    THEME_PRESET_MAP['midnight-violet'].tokens,
} as const;

// ── Persisted state ──────────────────────────
interface ThemeState {
  theme: ThemePresetId;
  fontScale: FontScale;
  fontFamily: FontFamilyId;
  sidebarBehavior: SidebarBehavior;
  sidebarManualWidth: number;
}

const STORAGE_KEY = 'mycel-theme';

const DEFAULT_STATE: ThemeState = {
  theme: 'default-dark',
  fontScale: 1,
  fontFamily: 'inter',
  sidebarBehavior: 'automatic',
  sidebarManualWidth: 210,
};

// ── Apply CSS custom properties to :root ─────
function applyTokens(state: ThemeState) {
  const root = document.documentElement;
  const preset = THEME_PRESET_MAP[state.theme];
  if (!preset) return;
  const t = preset.tokens;

  // Surface & background
  root.style.setProperty('--bg',        t.bg);
  root.style.setProperty('--bg2',       t.bg2);
  root.style.setProperty('--surface',   t.surface);
  root.style.setProperty('--surface-2', t.surface2);
  root.style.setProperty('--sidebar-bg',t.sidebarBg);
  // Borders
  root.style.setProperty('--border',    t.border);
  root.style.setProperty('--border-h',  t.borderH);
  // Text
  root.style.setProperty('--text',      t.text);
  root.style.setProperty('--text-dim',  t.textDim);
  root.style.setProperty('--text-mid',  t.textMid);
  root.style.setProperty('--white',     t.white);
  root.style.setProperty('--glass',     t.glass);
  // Aliases
  root.style.setProperty('--muted',     t.textDim);
  root.style.setProperty('--accent-1',  t.accent);
  root.style.setProperty('--accent-2',  t.info);
  // Accents
  root.style.setProperty('--accent',        t.accent);
  root.style.setProperty('--accent-bg',     t.accentBg);
  root.style.setProperty('--accent-hover',  t.accentHover);
  // Status
  root.style.setProperty('--success',       t.success);
  root.style.setProperty('--success-bg',    t.successBg);
  root.style.setProperty('--danger',        t.danger);
  root.style.setProperty('--danger-bg',     t.dangerBg);
  root.style.setProperty('--warning',       t.warning);
  root.style.setProperty('--warning-bg',    t.warningBg);
  root.style.setProperty('--info',          t.info);
  root.style.setProperty('--info-bg',       t.infoBg);
  // Chart
  root.style.setProperty('--chart-line',       t.chartLine);
  root.style.setProperty('--chart-grad-1',     t.chartGrad1);
  root.style.setProperty('--chart-grad-2',     t.chartGrad2);
  root.style.setProperty('--chart-grad-start', t.chartGrad1);
  root.style.setProperty('--chart-grad-end',   t.chartGrad2);
  // Tags
  root.style.setProperty('--tag-client',    t.tagClient);
  root.style.setProperty('--tag-project',   t.tagProject);
  // Trends
  root.style.setProperty('--trend-up',      t.trendUp);
  root.style.setProperty('--trend-down',    t.trendDown);
  // Sidebar
  root.style.setProperty('--sidebar-active',        t.sidebarActive);
  root.style.setProperty('--sidebar-active-bg',     t.sidebarActiveBg);
  root.style.setProperty('--sidebar-active-border', t.sidebarActiveBorder);

  // Font scale
  root.style.setProperty('--ui-font-scale', String(state.fontScale));

  // Font family
  const fontStack = FONT_FAMILY_MAP[state.fontFamily] || FONT_FAMILY_MAP.inter;
  root.style.setProperty('--font-sans', fontStack);
  root.style.setProperty('--font-body', fontStack);

  // Data attributes for CSS selectors (scrollbar, autofill, etc.)
  root.dataset.theme = preset.family;           // "dark" | "light"
  root.dataset.palette = state.theme;           // full preset id
}

// ── Context type ─────────────────────────────
interface ThemeContextType {
  /** Current preset id */
  theme: ThemePresetId;
  /** Current preset metadata */
  preset: ThemePresetMeta;
  fontScale: FontScale;
  fontFamily: FontFamilyId;
  sidebarBehavior: SidebarBehavior;
  sidebarManualWidth: number;
  /** Set the active theme preset */
  setTheme: (id: ThemePresetId) => void;
  setFontScale: (s: FontScale) => void;
  setFontFamily: (f: FontFamilyId) => void;
  setSidebarBehavior: (b: SidebarBehavior) => void;
  setSidebarManualWidth: (w: number) => void;
  /** Cycle quick-toggle: Default Dark ↔ Default Light (or snap to dark from custom) */
  cycleQuickTheme: () => void;
  /** Backward compat — returns preset.family */
  mode: 'dark' | 'light';
  /** Backward compat — maps old mode values to preset */
  setMode: (m: string) => void;
  /** Backward compat — alias for theme */
  palette: ThemePresetId;
  /** Backward compat — alias for setTheme */
  setPalette: (p: string) => void;
  /** Backward compat — tokens as Palette-like shape */
  colors: ThemeTokens;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const VALID_FONT_FAMILIES = new Set<string>(FONT_FAMILIES.map((f) => f.id));
const VALID_FONT_SCALES = new Set<number>(FONT_SIZE_OPTIONS.map((o) => o.value));

function loadState(): ThemeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // ── Migrate from old mode+palette format ──
      if (parsed.mode && !parsed.theme) {
        const modeMap: Record<string, ThemePresetId> = {
          dark: 'default-dark',
          'lighter-dark': 'graphite',
          light: 'default-light',
        };
        parsed.theme = modeMap[parsed.mode] || 'default-dark';
        delete parsed.mode;
        delete parsed.palette;
      }
      // Validate theme exists
      if (parsed.theme && !THEME_PRESET_MAP[parsed.theme as ThemePresetId]) {
        parsed.theme = 'default-dark';
      }
      // Migrate old font family values (e.g. 'manrope') to valid new ones
      if (parsed.fontFamily && !VALID_FONT_FAMILIES.has(parsed.fontFamily)) {
        parsed.fontFamily = 'inter';
      }
      // Migrate old font scale values to nearest valid option
      if (parsed.fontScale != null && !VALID_FONT_SCALES.has(parsed.fontScale)) {
        parsed.fontScale = 1;
      }
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch { /* noop */ }
  return DEFAULT_STATE;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ThemeState>(loadState);

  useEffect(() => {
    applyTokens(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setTheme = useCallback((theme: ThemePresetId) => {
    setState((s) => ({ ...s, theme }));
  }, []);

  const setFontScale = useCallback((fontScale: FontScale) => {
    setState((s) => ({ ...s, fontScale }));
  }, []);

  const setFontFamily = useCallback((fontFamily: FontFamilyId) => {
    setState((s) => ({ ...s, fontFamily }));
  }, []);

  const setSidebarBehavior = useCallback((sidebarBehavior: SidebarBehavior) => {
    setState((s) => ({ ...s, sidebarBehavior }));
  }, []);

  const setSidebarManualWidth = useCallback((sidebarManualWidth: number) => {
    setState((s) => ({ ...s, sidebarManualWidth }));
  }, []);

  /** Quick-toggle: dark ↔ light, snap custom → dark first */
  const cycleQuickTheme = useCallback(() => {
    setState((s) => {
      if (s.theme === 'default-dark') return { ...s, theme: 'default-light' };
      if (s.theme === 'default-light') return { ...s, theme: 'default-dark' };
      return { ...s, theme: 'default-dark' };
    });
  }, []);

  const preset = THEME_PRESET_MAP[state.theme] ?? THEME_PRESET_MAP['default-dark'];

  const ctx: ThemeContextType = {
    theme: state.theme,
    preset,
    fontScale: state.fontScale,
    fontFamily: state.fontFamily,
    sidebarBehavior: state.sidebarBehavior,
    sidebarManualWidth: state.sidebarManualWidth,
    setTheme,
    setFontScale,
    setFontFamily,
    setSidebarBehavior,
    setSidebarManualWidth,
    cycleQuickTheme,
    // Backward compat
    mode: preset.family,
    setMode: (m: string) => {
      if (m === 'light' || m === 'lighter-dark') setTheme('default-light');
      else setTheme('default-dark');
    },
    palette: state.theme,
    setPalette: (p: string) => {
      if (THEME_PRESET_MAP[p as ThemePresetId]) setTheme(p as ThemePresetId);
    },
    colors: preset.tokens,
  };

  return (
    <ThemeContext.Provider value={ctx}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
