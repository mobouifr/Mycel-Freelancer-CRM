import { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────
   MYCELIUM CANVAS — Fractal fungal network
   Ultra-fine monochrome threads background
───────────────────────────────────────────── */

interface MyceliumCanvasProps {
  style?: React.CSSProperties;
}

// Hyphal tip class for the simulation
class Tip {
  x: number;
  y: number;
  angle: number;
  gen: number;
  w: number;
  age: number;
  life: number;
  speed: number;
  dead: boolean;
  branched: boolean;
  branchAt: number;
  turn: number;
  alpha: number;

  constructor(x: number, y: number, angle: number, gen = 0, w = 0.5) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.gen = gen;
    this.w = w;
    this.age = 0;
    this.life = 200 + Math.random() * 300;
    this.speed = 0.28 + Math.random() * 0.38;
    this.dead = false;
    this.branched = false;
    this.branchAt = 80 + Math.random() * 120;
    this.turn = (Math.random() - 0.5) * 0.05;
    this.alpha = Math.max(0.06, 0.22 - gen * 0.032);
  }

  step(ctx: CanvasRenderingContext2D, pool: Tip[], W: number, H: number) {
    if (this.dead) return;
    this.age++;

    const levy =
      Math.random() < 0.04
        ? (Math.random() - 0.5) * 0.7
        : (Math.random() - 0.5) * 0.06;
    this.angle += this.turn + levy;

    const nx = this.x + Math.cos(this.angle) * this.speed;
    const ny = this.y + Math.sin(this.angle) * this.speed;

    const fade = Math.min(1, this.age / 30) * (1 - this.age / this.life);
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(nx, ny);
    ctx.strokeStyle = `rgba(210,210,210,${this.alpha * fade})`;
    ctx.lineWidth = this.w * (1 - this.gen * 0.12);
    ctx.lineCap = 'round';
    ctx.stroke();

    this.x = nx;
    this.y = ny;

    if (
      !this.branched &&
      this.age >= this.branchAt &&
      this.gen < 7 &&
      pool.length < 380
    ) {
      const spread = 0.22 + Math.random() * 0.35;
      pool.push(new Tip(nx, ny, this.angle - spread, this.gen + 1, this.w * 0.68));
      pool.push(new Tip(nx, ny, this.angle + spread, this.gen + 1, this.w * 0.68));
      this.branched = true;
    }

    if (this.age >= this.life || nx < -30 || nx > W + 30 || ny < -30 || ny > H + 30) {
      this.dead = true;
    }
  }
}

export default function MyceliumCanvas({ style = {} }: MyceliumCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let pool: Tip[] = [];

    const spawnColony = (cx: number, cy: number) => {
      const rays = 10 + Math.floor(Math.random() * 8);
      for (let i = 0; i < rays; i++) {
        const angle = (i / rays) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
        pool.push(new Tip(cx, cy, angle, 0, 0.6));
      }
    };

    const spawn = () => {
      pool = [];
      spawnColony(W * 0.38, H * 0.52);
      setTimeout(() => spawnColony(W * 0.62, H * 0.38), 3000);
    };
    spawn();

    let frame = 0;

    const tick = () => {
      frame++;

      if (frame % 80 === 0) {
        ctx.fillStyle = 'rgba(6,6,6,0.015)';
        ctx.fillRect(0, 0, W, H);
      }

      pool.forEach((t) => t.step(ctx, pool, W, H));
      pool = pool.filter((t) => !t.dead);

      if (pool.length < 12) spawn();

      rafRef.current = requestAnimationFrame(tick);
    };

    ctx.fillStyle = '#060606';
    ctx.fillRect(0, 0, W, H);
    tick();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        ...style,
      }}
    />
  );
}
