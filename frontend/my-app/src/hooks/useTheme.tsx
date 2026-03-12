import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

/* ─────────────────────────────────────────────
   THEME CONTEXT — Full coordinated palette
   system with color modes and number font.
   Persists choice to localStorage.
───────────────────────────────────────────── */

// ── Types ────────────────────────────────────
export type ThemeMode = 'dark' | 'lighter-dark' | 'light';
export type PalettePreset = 'emerald' | 'ocean' | 'sand' | 'rose';
export type NumberFont = 'normal' | 'tabular' | 'condensed';

/** Full coordinated color palette */
export interface Palette {
  accent:      string;
  accentBg:    string;
  accentHover: string;
  success:     string;
  successBg:   string;
  danger:      string;
  dangerBg:    string;
  warning:     string;
  warningBg:   string;
  info:        string;
  infoBg:      string;
  chartLine:   string;
  chartGrad1:  string;
  chartGrad2:  string;
  tagClient:   string;
  tagProject:  string;
  trendUp:     string;
  trendDown:   string;
  sidebarActive:   string;
  sidebarActiveBg: string;
  sidebarActiveBorder: string;
}

interface ThemeState {
  mode: ThemeMode;
  palette: PalettePreset;
  numberFont: NumberFont;
}

interface ThemeContextType extends ThemeState {
  setMode: (m: ThemeMode) => void;
  setPalette: (p: PalettePreset) => void;
  setNumberFont: (n: NumberFont) => void;
  colors: Palette;
}

const STORAGE_KEY = 'mycel-theme';

const DEFAULT_STATE: ThemeState = {
  mode: 'dark',
  palette: 'emerald',
  numberFont: 'tabular',
};

// ── Full palette definitions ─────────────────
export const PALETTE_MAP: Record<PalettePreset, Palette> = {
  emerald: {
    accent:      'rgba(72, 200, 100, 0.85)',
    accentBg:    'rgba(72, 200, 100, 0.08)',
    accentHover: 'rgba(72, 200, 100, 0.20)',
    success:     'rgba(100, 220, 130, 0.85)',
    successBg:   'rgba(100, 220, 130, 0.08)',
    danger:      'rgba(230, 90, 90, 0.85)',
    dangerBg:    'rgba(230, 90, 90, 0.08)',
    warning:     'rgba(240, 190, 60, 0.85)',
    warningBg:   'rgba(240, 190, 60, 0.08)',
    info:        'rgba(80, 160, 240, 0.80)',
    infoBg:      'rgba(80, 160, 240, 0.08)',
    chartLine:   'rgba(72, 200, 100, 0.90)',
    chartGrad1:  'rgba(72, 200, 100, 0.22)',
    chartGrad2:  'rgba(72, 200, 100, 0.00)',
    tagClient:   'rgba(72, 200, 100, 0.15)',
    tagProject:  'rgba(100, 180, 220, 0.15)',
    trendUp:     'rgba(72, 200, 100, 0.80)',
    trendDown:   'rgba(230, 90, 90, 0.80)',
    sidebarActive:       'rgba(72, 200, 100, 0.90)',
    sidebarActiveBg:     'rgba(72, 200, 100, 0.08)',
    sidebarActiveBorder: 'rgba(72, 200, 100, 0.18)',
  },
  ocean: {
    accent:      'rgba(60, 145, 230, 0.88)',
    accentBg:    'rgba(60, 145, 230, 0.08)',
    accentHover: 'rgba(60, 145, 230, 0.20)',
    success:     'rgba(60, 190, 170, 0.85)',
    successBg:   'rgba(60, 190, 170, 0.08)',
    danger:      'rgba(235, 140, 60, 0.85)',
    dangerBg:    'rgba(235, 140, 60, 0.08)',
    warning:     'rgba(230, 200, 70, 0.85)',
    warningBg:   'rgba(230, 200, 70, 0.08)',
    info:        'rgba(100, 170, 240, 0.80)',
    infoBg:      'rgba(100, 170, 240, 0.08)',
    chartLine:   'rgba(60, 145, 230, 0.90)',
    chartGrad1:  'rgba(60, 145, 230, 0.22)',
    chartGrad2:  'rgba(60, 145, 230, 0.00)',
    tagClient:   'rgba(60, 145, 230, 0.15)',
    tagProject:  'rgba(60, 190, 170, 0.15)',
    trendUp:     'rgba(60, 190, 170, 0.80)',
    trendDown:   'rgba(235, 140, 60, 0.80)',
    sidebarActive:       'rgba(60, 145, 230, 0.90)',
    sidebarActiveBg:     'rgba(60, 145, 230, 0.08)',
    sidebarActiveBorder: 'rgba(60, 145, 230, 0.18)',
  },
  sand: {
    accent:      'rgba(210, 160, 60, 0.88)',
    accentBg:    'rgba(210, 160, 60, 0.08)',
    accentHover: 'rgba(210, 160, 60, 0.20)',
    success:     'rgba(130, 170, 80, 0.85)',
    successBg:   'rgba(130, 170, 80, 0.08)',
    danger:      'rgba(190, 70, 70, 0.82)',
    dangerBg:    'rgba(190, 70, 70, 0.08)',
    warning:     'rgba(220, 180, 50, 0.85)',
    warningBg:   'rgba(220, 180, 50, 0.08)',
    info:        'rgba(160, 140, 100, 0.80)',
    infoBg:      'rgba(160, 140, 100, 0.08)',
    chartLine:   'rgba(210, 160, 60, 0.90)',
    chartGrad1:  'rgba(210, 160, 60, 0.22)',
    chartGrad2:  'rgba(210, 160, 60, 0.00)',
    tagClient:   'rgba(210, 160, 60, 0.15)',
    tagProject:  'rgba(130, 170, 80, 0.15)',
    trendUp:     'rgba(130, 170, 80, 0.80)',
    trendDown:   'rgba(190, 70, 70, 0.80)',
    sidebarActive:       'rgba(210, 160, 60, 0.90)',
    sidebarActiveBg:     'rgba(210, 160, 60, 0.08)',
    sidebarActiveBorder: 'rgba(210, 160, 60, 0.18)',
  },
  rose: {
    accent:      'rgba(210, 90, 130, 0.88)',
    accentBg:    'rgba(210, 90, 130, 0.08)',
    accentHover: 'rgba(210, 90, 130, 0.20)',
    success:     'rgba(100, 190, 160, 0.85)',
    successBg:   'rgba(100, 190, 160, 0.08)',
    danger:      'rgba(220, 80, 80, 0.85)',
    dangerBg:    'rgba(220, 80, 80, 0.08)',
    warning:     'rgba(240, 180, 80, 0.85)',
    warningBg:   'rgba(240, 180, 80, 0.08)',
    info:        'rgba(140, 120, 200, 0.80)',
    infoBg:      'rgba(140, 120, 200, 0.08)',
    chartLine:   'rgba(210, 90, 130, 0.90)',
    chartGrad1:  'rgba(210, 90, 130, 0.22)',
    chartGrad2:  'rgba(210, 90, 130, 0.00)',
    tagClient:   'rgba(210, 90, 130, 0.15)',
    tagProject:  'rgba(140, 120, 200, 0.15)',
    trendUp:     'rgba(100, 190, 160, 0.80)',
    trendDown:   'rgba(220, 80, 80, 0.80)',
    sidebarActive:       'rgba(210, 90, 130, 0.90)',
    sidebarActiveBg:     'rgba(210, 90, 130, 0.08)',
    sidebarActiveBorder: 'rgba(210, 90, 130, 0.18)',
  },
};

// ── Mode color maps ──────────────────────────
const MODE_MAP: Record<ThemeMode, Record<string, string>> = {
  dark: {
    '--bg':        '#060606',
    '--bg2':       '#0c0c0c',
    '--surface':   '#111111',
    '--surface-2': '#0e0e0e',
    '--sidebar-bg':'#080808',
    '--border':    'rgba(255,255,255,0.07)',
    '--border-h':  'rgba(255,255,255,0.16)',
    '--text':      '#e2e2e2',
    '--text-dim':  'rgba(200,200,200,0.38)',
    '--text-mid':  'rgba(200,200,200,0.62)',
    '--white':     '#ececec',
    '--glass':     'rgba(255,255,255,0.03)',
  },
  'lighter-dark': {
    '--bg':        '#0f1114',
    '--bg2':       '#151719',
    '--surface':   '#1a1d21',
    '--surface-2': '#171a1d',
    '--sidebar-bg':'#12151a',
    '--border':    'rgba(255,255,255,0.09)',
    '--border-h':  'rgba(255,255,255,0.20)',
    '--text':      '#e8eaed',
    '--text-dim':  'rgba(200,200,200,0.45)',
    '--text-mid':  'rgba(200,200,200,0.68)',
    '--white':     '#f0f0f0',
    '--glass':     'rgba(255,255,255,0.04)',
  },
  light: {
    '--bg':        '#f4f5f7',
    '--bg2':       '#ffffff',
    '--surface':   '#ffffff',
    '--surface-2': '#f8f9fa',
    '--sidebar-bg':'#f0f1f3',
    '--border':    'rgba(0,0,0,0.08)',
    '--border-h':  'rgba(0,0,0,0.16)',
    '--text':      '#1a1a1a',
    '--text-dim':  'rgba(60,60,60,0.45)',
    '--text-mid':  'rgba(60,60,60,0.68)',
    '--white':     '#111111',
    '--glass':     'rgba(0,0,0,0.03)',
  },
};

// ── Apply tokens to :root ────────────────────
function applyTokens(state: ThemeState) {
  const root = document.documentElement;

  // Mode colors
  const modeVars = MODE_MAP[state.mode];
  for (const [key, val] of Object.entries(modeVars)) {
    root.style.setProperty(key, val);
  }

  // Full palette
  const p = PALETTE_MAP[state.palette];
  root.style.setProperty('--accent',        p.accent);
  root.style.setProperty('--accent-bg',     p.accentBg);
  root.style.setProperty('--accent-hover',  p.accentHover);
  root.style.setProperty('--success',       p.success);
  root.style.setProperty('--success-bg',    p.successBg);
  root.style.setProperty('--danger',        p.danger);
  root.style.setProperty('--danger-bg',     p.dangerBg);
  root.style.setProperty('--warning',       p.warning);
  root.style.setProperty('--warning-bg',    p.warningBg);
  root.style.setProperty('--info',          p.info);
  root.style.setProperty('--info-bg',       p.infoBg);
  root.style.setProperty('--chart-line',    p.chartLine);
  root.style.setProperty('--chart-grad-1',  p.chartGrad1);
  root.style.setProperty('--chart-grad-2',  p.chartGrad2);
  root.style.setProperty('--tag-client',    p.tagClient);
  root.style.setProperty('--tag-project',   p.tagProject);
  root.style.setProperty('--trend-up',      p.trendUp);
  root.style.setProperty('--trend-down',    p.trendDown);
  root.style.setProperty('--sidebar-active',        p.sidebarActive);
  root.style.setProperty('--sidebar-active-bg',     p.sidebarActiveBg);
  root.style.setProperty('--sidebar-active-border', p.sidebarActiveBorder);

  // Data attribute for conditional CSS
  root.dataset.theme = state.mode;
  root.dataset.palette = state.palette;
}

// ── Context ──────────────────────────────────
const ThemeContext = createContext<ThemeContextType | null>(null);

function loadState(): ThemeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate old 'accent' key to 'palette'
      if (parsed.accent && !parsed.palette) {
        const migration: Record<string, PalettePreset> = {
          green: 'emerald', blue: 'ocean', purple: 'rose', orange: 'sand',
        };
        parsed.palette = migration[parsed.accent] || 'emerald';
        delete parsed.accent;
      }
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch { /* noop */ }
  return DEFAULT_STATE;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ThemeState>(loadState);

  // Apply on mount + every change
  useEffect(() => {
    applyTokens(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setMode = useCallback((mode: ThemeMode) => {
    setState((s) => ({ ...s, mode }));
  }, []);

  const setPalette = useCallback((palette: PalettePreset) => {
    setState((s) => ({ ...s, palette }));
  }, []);

  const setNumberFont = useCallback((numberFont: NumberFont) => {
    setState((s) => ({ ...s, numberFont }));
  }, []);

  const colors = PALETTE_MAP[state.palette];

  return (
    <ThemeContext.Provider value={{ ...state, setMode, setPalette, setNumberFont, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
