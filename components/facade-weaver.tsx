'use client';

import { useEffect, useRef } from 'react';

// Facade Weaver — the star geometry draws itself line by line as the reader
// arrives (§Pass 3B). Grouped into 4 chorus layers so the reveal has a
// composed cadence, not a mechanical wipe. Kept at 5.5% opacity so it
// reads as texture, never as a border (spec §1).
//
// The pattern is procedural — a 10-fold Islamic rosette generated from a
// unit circle + trig — not a trace of the exact wordmark PNG. The mark
// still lives in the nav as raster; here we render a compatible geometry
// that CAN be stroked, animated, and re-tiled at any resolution.

const N = 10; // 10-fold symmetry
const CX = 300;
const CY = 300;
const R_OUTER = 260;
const R_MID = 190;
const R_INNER = 120;
const R_STAR = 66;

// Star tip polygon — 10-pointed decagram formed by alternating radii.
function starPath(): string {
  const pts: string[] = [];
  for (let i = 0; i < N * 2; i++) {
    const angle = (Math.PI * 2 * i) / (N * 2) - Math.PI / 2;
    const r = i % 2 === 0 ? R_OUTER : R_STAR;
    const x = CX + Math.cos(angle) * r;
    const y = CY + Math.sin(angle) * r;
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return `${pts.join(' ')} Z`;
}

// Ring of N chord segments between adjacent points on a circle at radius r,
// offset by a starting angle. This produces the interlocking "girih" feel.
function ringPaths(r: number, offset = 0): string[] {
  const paths: string[] = [];
  for (let i = 0; i < N; i++) {
    const a1 = (Math.PI * 2 * i) / N + offset - Math.PI / 2;
    const a2 = (Math.PI * 2 * (i + 2)) / N + offset - Math.PI / 2;
    const x1 = CX + Math.cos(a1) * r;
    const y1 = CY + Math.sin(a1) * r;
    const x2 = CX + Math.cos(a2) * r;
    const y2 = CY + Math.sin(a2) * r;
    paths.push(`M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`);
  }
  return paths;
}

// Decagon outline connecting the N outer points.
function decagonPath(r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < N; i++) {
    const a = (Math.PI * 2 * i) / N - Math.PI / 2;
    const x = CX + Math.cos(a) * r;
    const y = CY + Math.sin(a) * r;
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return `${pts.join(' ')} Z`;
}

// The 4 chorus layers. Each reveals in its own scroll window so the
// composition feels *drawn*, not scanned.
const LAYERS = [
  [decagonPath(R_OUTER)],
  ringPaths(R_OUTER, 0),
  [starPath(), decagonPath(R_MID)],
  [...ringPaths(R_INNER, Math.PI / N), decagonPath(R_INNER)],
];

export function FacadeWeaver({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = rootRef.current;
    if (!root) return;

    // Collect all paths + measure their length so dashoffset animation is
    // proportional to actual length (looks calmer on curved shapes even
    // though ours are polylines).
    const groups = Array.from(root.querySelectorAll<SVGGElement>('[data-layer]'));
    const paths = groups.map((g) => Array.from(g.querySelectorAll<SVGPathElement>('path')));
    const lengths = paths.map((layer) => layer.map((p) => p.getTotalLength()));

    // Prime dashoffset. Reduced-motion path just sets everything to 0.
    paths.forEach((layer, li) =>
      layer.forEach((p, pi) => {
        const len = lengths[li][pi];
        p.style.strokeDasharray = `${len}`;
        p.style.strokeDashoffset = reduced ? '0' : `${len}`;
      }),
    );
    if (reduced) return;

    // Scroll driver. Progress = window.scrollY / heroHeight, clamped 0→1.
    // Each layer occupies a chorus window of the whole reveal.
    let raf = 0;
    const heroBand = () => Math.max(1, window.innerHeight * 0.75);
    const tick = () => {
      const p = Math.min(1, Math.max(0, window.scrollY / heroBand()));
      const laid = LAYERS.length;
      groups.forEach((_, li) => {
        // Each layer reveals over 1/laid of the range, staggered.
        const start = li / laid;
        const end = (li + 1) / laid;
        const local = Math.min(1, Math.max(0, (p - start) / (end - start)));
        paths[li].forEach((path, pi) => {
          const len = lengths[li][pi];
          path.style.strokeDashoffset = `${len * (1 - local)}`;
          path.style.willChange = local > 0 && local < 1 ? 'stroke-dashoffset' : 'auto';
        });
      });
      raf = 0;
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(tick);
    };
    // Prime once at start.
    tick();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className ?? ''}`}
    >
      {/* Two full-plane tiles offset so the pattern reads as texture, not a lone medallion. */}
      <div className="absolute inset-0 flex flex-wrap items-center justify-center">
        <TilePattern />
      </div>
    </div>
  );
}

function TilePattern() {
  return (
    <svg
      viewBox="0 0 600 600"
      className="h-[80vh] w-auto opacity-[0.055] text-paper"
      preserveAspectRatio="xMidYMid meet"
    >
      {LAYERS.map((paths, li) => (
        <g
          key={li}
          data-layer={li}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {paths.map((d, pi) => (
            <path key={pi} d={d} />
          ))}
        </g>
      ))}
    </svg>
  );
}
