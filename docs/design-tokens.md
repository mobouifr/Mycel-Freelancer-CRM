# Design Tokens — Mycel CRM

> Single source of truth for every CSS custom property.
> All tokens are set by `useTheme.tsx` on `:root` at runtime.

## Surface & Background

| Token | Purpose |
|-------|---------|
| `--bg` | Page background |
| `--bg2` | Slightly lighter bg for layering |
| `--surface` | Card / panel background |
| `--surface-2` | Secondary surface (tab content, etc.) |
| `--sidebar-bg` | Sidebar background |

## Borders

| Token | Purpose |
|-------|---------|
| `--border` | Default thin border |
| `--border-h` | Hover / focus border |

## Text

| Token | Purpose |
|-------|---------|
| `--text` | Primary body text |
| `--text-dim` | Muted / tertiary text |
| `--text-mid` | Medium emphasis text |
| `--white` | Highest emphasis (headings, values) |
| `--glass` | Ultra-faint overlay tint |
| `--muted` | Alias for `--text-dim` |

## Accents

| Token | Purpose |
|-------|---------|
| `--accent` | Primary brand accent |
| `--accent-bg` | Faint accent background |
| `--accent-hover` | Accent on hover |
| `--accent-1` | Alias for `--accent` |
| `--accent-2` | Alias for `--info` |

## Status

| Token | Purpose |
|-------|---------|
| `--success` / `--success-bg` | Positive state |
| `--danger` / `--danger-bg` | Error / destructive state |
| `--warning` / `--warning-bg` | Caution state |
| `--info` / `--info-bg` | Informational state |

## Chart

| Token | Purpose |
|-------|---------|
| `--chart-line` | Stroke colour for chart lines |
| `--chart-grad-1` | Gradient start (top) |
| `--chart-grad-2` | Gradient end (transparent bottom) |
| `--chart-grad-start` | Alias for `--chart-grad-1` |
| `--chart-grad-end` | Alias for `--chart-grad-2` |

## Tags

| Token | Purpose |
|-------|---------|
| `--tag-client` | Client badge background |
| `--tag-project` | Project badge background |

## Trends

| Token | Purpose |
|-------|---------|
| `--trend-up` | Positive trend colour |
| `--trend-down` | Negative trend colour |

## Sidebar

| Token | Purpose |
|-------|---------|
| `--sidebar-active` | Active nav item text |
| `--sidebar-active-bg` | Active nav item background |
| `--sidebar-active-border` | Active nav item border |

## Typography

| Token | Purpose |
|-------|---------|
| `--font-d` | Display font (Syne) |
| `--font-m` | Mono font (DM Mono) |
| `--font-body` | Body font (Inter) |
| `--font-sans` | Alias for `--font-body` |
| `--font-display` | Alias for `--font-d` |

## Scale

| Token | Purpose |
|-------|---------|
| `--ui-font-scale` | Root font-size multiplier (0.95 / 1 / 1.1) |

## Z-Index

| Token | Value | Purpose |
|-------|-------|---------|
| `--z-widget` | 1 | Widget base layer |
| `--z-fab` | 50 | Floating action button |
| `--z-widget-drag` | 100 | Widget being dragged |
| `--z-panel-backdrop` | 1399 | Panel overlay backdrop |
| `--z-panel` | 1400 | Slide-in panels |

## Misc

| Token | Purpose |
|-------|---------|
| `--ease` | Default easing curve |

---

## Theme Presets

9 unified presets — each controls **all** tokens above:

| ID | Label | Family |
|----|-------|--------|
| `default-dark` | Default Dark | dark |
| `default-light` | Default Light | light |
| `midnight-violet` | Midnight Violet | dark |
| `japan-paper` | Japan Paper | light |
| `retro-terminal` | Retro Terminal | dark |
| `graphite` | Graphite | dark |
| `solar-sand` | Solar Sand | light |
| `arctic-blue` | Arctic Blue | light |
| `black-and-white` | Black & White | dark |

The `data-theme` attribute on `<html>` is set to the preset's **family** (`"dark"` | `"light"`) for CSS rules like scrollbar styling and autofill colours.

The `data-palette` attribute is set to the full preset ID for fine-grained CSS targeting if ever needed.
