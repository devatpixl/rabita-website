'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { FLOOR_MARKERS, type FloorMarker } from '@/lib/floor-markers';

// The labels over a floor drawing: a gold point on the room, a hairline
// leader out to the dusk, and the name in mono at the end of it.
//
// Replaces the white boxes the architect's old deck had baked in. Those sat
// ON the building and hid what they pointed at; a point and a leader name the
// room without covering it, and they are ours to move.
//
// Desktop and tablet only (client, 2026-09-09: phones stay as they are).
// There is no room for leaders beside a drawing on a 390px screen, and the
// floor name under the plate already says what the storey is.
export function FloorMarkers({ floorKey, active }: { floorKey: string; active: boolean }) {
  const t = useTranslations('floorByFloor.rooms');
  const markers: FloorMarker[] = FLOOR_MARKERS[floorKey] ?? [];
  if (markers.length === 0) return null;

  return (
    // Mirrors the drawing's own painted box. The <Image> is object-contain
    // object-bottom, so on a pane taller than the frame's 1258/1400 the
    // picture is height-constrained and bottom-aligned — which is exactly
    // what an items-end box of the same aspect ratio reproduces. Percentages
    // then land on the building rather than on the letterbox.
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden items-end justify-center md:flex"
    >
      <div className="relative h-full" style={{ aspectRatio: '1258 / 1400' }}>
        {/* Leaders and points. viewBox in the same percentage space as the
           marker data; non-scaling-stroke keeps the hairline a hairline
           however the box is stretched. */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          {markers.map((m, i) => (
            <g
              key={m.id}
              className={cn(
                'transition-opacity duration-500 ease-out motion-reduce:transition-none',
                active ? 'opacity-100' : 'opacity-0',
              )}
              style={{ transitionDelay: active ? `${180 + i * 90}ms` : '0ms' }}
            >
              <line
                x1={m.x}
                y1={m.y}
                x2={m.lx}
                y2={m.ly}
                stroke="#C0A165"
                strokeWidth={1}
                strokeOpacity={0.55}
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={m.x}
                cy={m.y}
                r={3}
                fill="none"
                stroke="#C0A165"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
              <circle cx={m.x} cy={m.y} r={1} fill="#C0A165" vectorEffect="non-scaling-stroke" />
            </g>
          ))}
        </svg>

        {/* The names. HTML rather than SVG text, so they keep the site's own
           mono face and letter-spacing at any size. */}
        {markers.map((m, i) => (
          <span
            key={m.id}
            className={cn(
              'absolute whitespace-nowrap font-mono text-[0.625rem] uppercase leading-none tracking-[0.16em] text-paper/90 transition-opacity duration-500 ease-out motion-reduce:transition-none',
              active ? 'opacity-100' : 'opacity-0',
            )}
            style={{
              left: `${m.lx}%`,
              top: `${m.ly}%`,
              // The leader arrives on the label's inner edge, so the text
              // always runs AWAY from the building.
              transform: `translate(${m.align === 'end' ? '-100%' : '0'}, -50%)`,
              paddingInline: m.align === 'end' ? '0 0.5rem' : '0.5rem 0',
              transitionDelay: active ? `${240 + i * 90}ms` : '0ms',
            }}
          >
            {t(m.id)}
          </span>
        ))}
      </div>
    </div>
  );
}
