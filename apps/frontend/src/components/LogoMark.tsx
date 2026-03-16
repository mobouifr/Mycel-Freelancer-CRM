/* ─────────────────────────────────────────────
   LOGO MARK — SVG spore/asterisk icon
   Copied from my-app to reuse in the sidebar
───────────────────────────────────────────── */

interface LogoMarkProps {
  size?: number;
  color?: string;
}

export default function LogoMark({
  size = 32,
  color = 'rgba(255,255,255,0.85)',
}: LogoMarkProps) {
  const rays = 8;
  const lines = Array.from({ length: rays }, (_, i) => {
    const a = (i / rays) * Math.PI * 2;
    const r1 = size * 0.12;
    const r2 = size * 0.45;
    return {
      x1: size / 2 + r1 * Math.cos(a),
      y1: size / 2 + r1 * Math.sin(a),
      x2: size / 2 + r2 * Math.cos(a),
      y2: size / 2 + r2 * Math.sin(a),
    };
  });

  const diags = Array.from({ length: 4 }, (_, i) => {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 8;
    const r1 = size * 0.12;
    const r2 = size * 0.3;
    return {
      x1: size / 2 + r1 * Math.cos(a),
      y1: size / 2 + r1 * Math.sin(a),
      x2: size / 2 + r2 * Math.cos(a),
      y2: size / 2 + r2 * Math.sin(a),
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {lines.map((l, i) => (
        <line
          key={`r-${i}`}
          {...l}
          stroke={color}
          strokeWidth="0.9"
          strokeLinecap="round"
        />
      ))}
      {diags.map((l, i) => (
        <line
          key={`d-${i}`}
          {...l}
          stroke={color}
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeOpacity="0.45"
        />
      ))}
      <circle cx={size / 2} cy={size / 2} r="2.2" fill={color} />
    </svg>
  );
}



