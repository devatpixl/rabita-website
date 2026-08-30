'use client';

import { useMemo, useRef } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { LANDMARKS, MAPS_URL, MOSQUE, ROUTES, routedMinutes } from '@/lib/location';
import streets from '@/lib/streets.json';
import { cn } from '@/lib/cn';

// A map you can read in a glance: the real streets around the site as a
// faint backdrop (OpenStreetMap, lib/streets.json — roads and the river,
// nothing else), the mosque at the centre, the nearest stations, and the
// REAL walking route to each (OpenStreetMap pedestrian routing,
// lib/walking-routes.json) drawn as a dashed line that walks out from the
// mosque when the block scrolls into view. Distances and minutes are the
// routed values. The whole plate is a link to Google Maps.

type StreetKind = 'major' | 'minor' | 'water';
const STREET_STYLE: Record<StreetKind, { stroke: string; opacity: number; width: number }> = {
  minor: { stroke: '#F4F1EA', opacity: 0.09, width: 1 },
  major: { stroke: '#F4F1EA', opacity: 0.16, width: 1.8 },
  water: { stroke: '#8FB3C9', opacity: 0.28, width: 2.2 },
};

const W_PX = 520;
const H_PX = 372;
const PAD = 34;
const FOOT = 52; // the link bar covers the bottom of the plate
// Where each station's label sits, chosen so no label crosses a route:
// Grønland reads leftwards, Oslo S rightwards, and Brugata sits up and to
// the right of its dot, clear of the Grønland route that continues past it.
const LABEL_POS: Record<string, { side: 'left' | 'right'; dy: number }> = {
  brugata: { side: 'right', dy: -22 },
  gronland: { side: 'left', dy: 0 },
  'oslo-s': { side: 'right', dy: 0 },
};

// Equirectangular projection around the mosque, in metres.
const K_LAT = 110_574;
const K_LON = 111_320 * Math.cos((MOSQUE.lat * Math.PI) / 180);
const toM = ([lat, lon]: [number, number]) => ({
  x: (lon - MOSQUE.lon) * K_LON,
  y: -(lat - MOSQUE.lat) * K_LAT,
});

export function FindUs({ className }: { className?: string }) {
  const t = useTranslations('footer.findUs');
  const ref = useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();
  const on = inView || reduced;

  // Fit every route point (and the mosque) into the plate, keeping the
  // metric aspect so the rings stay circles.
  const { paths, streetPaths, scale, origin } = useMemo(() => {
    const all = LANDMARKS.flatMap((l) => ROUTES[l.key].points.map(toM)).concat([{ x: 0, y: 0 }]);
    const minX = Math.min(...all.map((p) => p.x));
    const maxX = Math.max(...all.map((p) => p.x));
    const minY = Math.min(...all.map((p) => p.y));
    const maxY = Math.max(...all.map((p) => p.y));
    const W = W_PX - PAD * 2;
    const H = H_PX - PAD * 2 - FOOT;
    const s = Math.min(W / (maxX - minX), H / (maxY - minY));
    const ox = PAD + (W - (maxX - minX) * s) / 2 - minX * s;
    const oy = PAD + (H - (maxY - minY) * s) / 2 - minY * s;
    const px = (p: { x: number; y: number }) => ({ x: ox + p.x * s, y: oy + p.y * s });
    const paths = LANDMARKS.map((l) => {
      const pts = ROUTES[l.key].points.map(toM).map(px);
      const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
      const end = pts[pts.length - 1];
      return { key: l.key, d, end, min: routedMinutes(l.key), metres: ROUTES[l.key].metres };
    });
    // Streets are stored in metres from the door, so they share the projection.
    const streetPaths = (streets.ways as { k: StreetKind; p: [number, number][] }[]).map((w) => ({
      k: w.k,
      d: w.p.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${(ox + x * s).toFixed(1)} ${(oy + y * s).toFixed(1)}`).join(' '),
    }));
    return { paths, streetPaths, scale: s, origin: px({ x: 0, y: 0 }) };
  }, []);

  return (
    <a
      ref={ref}
      href={MAPS_URL}
      target="_blank"
      rel="noreferrer"
      aria-label={t('openMaps')}
      className={cn(
        'group relative block overflow-hidden rounded-3xl border border-paper/10 bg-paper/[0.03] transition-colors hover:border-gold/50',
        className,
      )}
    >
      <svg viewBox={`0 0 ${W_PX} ${H_PX}`} className="block h-auto w-full" role="img" aria-hidden>
        <defs>
          <radialGradient id="findus-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C9A96A" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#C9A96A" stopOpacity="0" />
          </radialGradient>
          {/* One mask per route: a solid stroke of the same geometry whose
             dash offset runs from 1 to 0, revealing the dashed line beneath
             as if it were being walked. */}
          {paths.map((p, i) => (
            <mask key={p.key} id={`findus-reveal-${p.key}`} maskUnits="userSpaceOnUse">
              <path
                d={p.d}
                fill="none"
                stroke="#fff"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={on ? 0 : 1}
                style={{
                  transition: reduced ? 'none' : `stroke-dashoffset 1500ms cubic-bezier(0.4,0,0.2,1) ${200 + i * 260}ms`,
                }}
              />
            </mask>
          ))}
        </defs>

        {/* The city, faintly: real streets and the Akerselva. Drawn first so
           everything else sits on it; fades at the edges via the glow. */}
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {streetPaths.map((w, i) => (
            <path key={i} d={w.d} stroke={STREET_STYLE[w.k].stroke} strokeOpacity={STREET_STYLE[w.k].opacity} strokeWidth={STREET_STYLE[w.k].width} />
          ))}
        </g>
        <circle cx={origin.x} cy={origin.y} r={W_PX * 0.5} fill="url(#findus-glow)" />
        {/* True distance rings, 250 m and 500 m from the door. */}
        {[250, 500].map((d) => (
          <g key={d}>
            <circle cx={origin.x} cy={origin.y} r={d * scale} fill="none" stroke="#F4F1EA" strokeOpacity="0.13" strokeDasharray="2 5" />
            <text
              x={origin.x + d * scale * 0.7071 + 3}
              y={origin.y - d * scale * 0.7071 - 3}
              fill="#F4F1EA"
              fillOpacity="0.35"
              fontSize="9"
              fontFamily="var(--font-mono)"
            >
              {d} m
            </text>
          </g>
        ))}

        {/* Routes: dashed gold, revealed along their length. */}
        {paths.map((p, i) => {
          const pos = LABEL_POS[p.key] ?? { side: 'right', dy: 0 };
          const labelRight = pos.side === 'right';
          const ly = p.end.y + pos.dy;
          return (
            <g key={p.key}>
              <path
                d={p.d}
                fill="none"
                stroke="#C9A96A"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="7 6"
                mask={`url(#findus-reveal-${p.key})`}
              />
              <g
                style={{
                  opacity: on ? 1 : 0,
                  transition: reduced ? 'none' : `opacity 400ms ease-out ${1500 + i * 260}ms`,
                }}
              >
                <circle cx={p.end.x} cy={p.end.y} r="5" fill="#16242E" stroke="#F4F1EA" strokeWidth="1.5" />
                <text
                  x={labelRight ? p.end.x + 11 : p.end.x - 11}
                  y={ly - 3}
                  textAnchor={labelRight ? 'start' : 'end'}
                  fill="#F4F1EA"
                  fontSize="12.5"
                  fontFamily="var(--font-sans)"
                  fontWeight="600"
                >
                  {t(`landmarks.${p.key}`)}
                </text>
                <text
                  x={labelRight ? p.end.x + 11 : p.end.x - 11}
                  y={ly + 12}
                  textAnchor={labelRight ? 'start' : 'end'}
                  fill="#C9A96A"
                  fontSize="10.5"
                  fontFamily="var(--font-mono)"
                  letterSpacing="0.08em"
                >
                  {t('walk', { min: p.min })} · {p.metres} m
                </text>
              </g>
            </g>
          );
        })}

        {/* The mosque: a gold diamond on a soft pulse ring. */}
        <circle
          cx={origin.x}
          cy={origin.y}
          r="16"
          fill="#C9A96A"
          fillOpacity="0.18"
          className={cn(on && !reduced && 'animate-ping')}
          style={{ transformOrigin: `${origin.x}px ${origin.y}px`, animationDuration: '2.6s', animationIterationCount: 2 }}
        />
        <rect x={origin.x - 7} y={origin.y - 7} width="14" height="14" fill="#C9A96A" transform={`rotate(45 ${origin.x} ${origin.y})`} />
        <text x={origin.x} y={origin.y - 22} textAnchor="middle" fill="#F4F1EA" fontSize="12.5" fontFamily="var(--font-serif)" fontStyle="italic">
          Rabita · Calmeyers gate 8
        </text>
      </svg>

      <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 whitespace-nowrap border-t border-paper/10 bg-dusk/70 px-4 py-3 text-[13px] text-paper/80 backdrop-blur-sm">
        <span className="truncate font-mono text-[0.625rem] uppercase tracking-[0.14em] text-paper/50">{t('estimate')}</span>
        <span className="inline-flex shrink-0 items-center gap-2 font-semibold text-paper transition-colors group-hover:text-gold">
          {t('openMaps')}
          <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180">&rarr;</span>
        </span>
      </span>
    </a>
  );
}
