'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { FLOOR_MARKERS, type FloorMarker } from '@/lib/floor-markers';

// The labels over a floor drawing.
//
// Replaces the white boxes the architect's old deck had baked in. Those sat
// ON the building and hid what they pointed at; a point that names the room
// without covering it, and that is ours to move, does the same job better.
//
// Two treatments, because the two screens have opposite room:
//
//   TABLET AND UP — a gold point on the room, a hairline leader out to the
//   dusk, and the name in mono at the end of it. The drawing is letterboxed
//   inside a wider pane, so there is real margin either side to run leaders
//   into.
//
//   PHONE — the name itself, ON the room, the way the architect's deck had
//   it (client, 2026-09-10: "like it was before, when we had the labels on
//   the building"). Measured, not guessed: at 390px the pane is 331px wide
//   and the drawing paints the full 331 of it, so the gutter a leader needs
//   is exactly zero. There is nowhere to put a leader, but there is room on
//   the building — so the label goes there and the leader goes away.
//
// Below 360px the labels go and the drawing gets the room back: at 320px it
// paints 235px across, which puts this type under 7px. Too small to read, so
// that phone keeps the plain drawing and its floor caption, exactly what it
// has today. max-[359px] and md are disjoint queries, so their order in the
// sheet cannot matter.

// The frame the drawings were cut to, and the percentage space the marker
// data is written in. One divided by the other converts between them.
const FRAME_W = 1258;
const FRAME_H = 1400;

// The phone label, in viewBox units, so the whole chip scales with the
// drawing: a bigger phone gets bigger type, which is what you want.
//
// CHIP_W is the wrapping measure, not the drawn width — the chip shrinks to
// its text, and only the long names use the full box. 460 of 1258 is 37% of
// the frame. That number is set by the tightest pair on any floor: the
// residents' entrance and the foyer on the first, which sit at the same
// height 31% apart. On one line each they collide; wrapping the foyer is
// what separates them, and 460 is the widest measure that wraps it.
// CHIP_H reserves three lines, because a foreignObject clips to its box
// rather than overflowing it.
//
// LABEL_TYPE 34 lands at about 9px on a 390px screen and 11px on a 430px
// one. The floor with the tightest pair of rooms is the second (the
// children's room and the imam's office, 36px apart) — they clear because
// the separation there is mostly vertical and a one-line chip is 14px tall.
const CHIP_W = 460;
const CHIP_H = 200;
const LABEL_TYPE = 34;

export function FloorMarkers({ floorKey, active }: { floorKey: string; active: boolean }) {
  const t = useTranslations('floorByFloor.rooms');
  const markers: FloorMarker[] = FLOOR_MARKERS[floorKey] ?? [];
  if (markers.length === 0) return null;

  return (
    <>
      {/* ── phone: the name on the room ────────────────────────────────
         preserveAspectRatio="xMidYMax meet" IS object-contain + object-bottom:
         scale to fit, centre horizontally, sit on the floor of the box. So
         this SVG can span the whole pane and its coordinates still land on
         the building, whether the drawing is width- or height-constrained.
         An aspect-ratio box assumes height-constrained and would have put
         every label in the wrong place on a phone, where it is
         width-constrained.

         foreignObject rather than <text> so the long names wrap. SVG text
         does not, and "Konferanse- og selskapslokaler" on one line is 54%
         of the drawing's width. Everything inside is sized in px, which
         inside a foreignObject means viewBox units — Tailwind's rem-based
         utilities would resolve against the root font size instead and come
         out microscopic, so the chip is styled inline. */}
      <svg
        aria-hidden
        viewBox={`0 0 ${FRAME_W} ${FRAME_H}`}
        preserveAspectRatio="xMidYMax meet"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible max-[359px]:hidden md:hidden"
      >
        {markers.map((m, i) => (
          <foreignObject
            key={m.id}
            x={(m.mx ?? m.x) * (FRAME_W / 100) - CHIP_W / 2}
            y={(m.my ?? m.y) * (FRAME_H / 100) - CHIP_H / 2}
            width={CHIP_W}
            height={CHIP_H}
            className={cn(
              'transition-opacity duration-500 ease-out motion-reduce:transition-none',
              active ? 'opacity-100' : 'opacity-0',
            )}
            style={{ transitionDelay: active ? `${180 + i * 90}ms` : '0ms' }}
          >
            <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              {/* Dusk fill, gold hairline: the same pair the desktop point
                 uses, and for the same reason. These labels sit on pale
                 walls, roof decks and dark green prayer halls in turn, and
                 dark-on-gold is the one combination legible on all three. */}
              <span
                style={{
                  display: 'inline-block',
                  maxWidth: '100%',
                  textAlign: 'center',
                  background: '#16242E',
                  color: '#FAF8F4',
                  border: '4px solid #9B7F4A',
                  borderRadius: '999px',
                  padding: '12px 20px',
                  fontFamily: 'var(--font-mono), ui-monospace, monospace',
                  fontSize: `${LABEL_TYPE}px`,
                  lineHeight: 1.3,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {t(m.id)}
              </span>
            </div>
          </foreignObject>
        ))}
      </svg>

      {/* ── tablet and up: leaders and names ───────────────────────────
         Mirrors the drawing's own painted box. The <Image> is object-contain
         object-bottom, so on a pane taller than the frame's 1258/1400 the
         picture is height-constrained and bottom-aligned — which is exactly
         what an items-end box of the same aspect ratio reproduces. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden items-end justify-center md:flex"
      >
        <div className="relative h-full" style={{ aspectRatio: `${FRAME_W} / ${FRAME_H}` }}>
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
                {/* gold-deep, not gold (client, 2026-09-09: the line was hard
                   to follow). Most of a leader runs over the dusk ground but
                   its last stretch crosses the building's white walls, so the
                   colour has to work against both: #9B7F4A is darker than the
                   drawing and lighter than the ground, where plain gold washed
                   out on the walls and a truly dark line would have vanished
                   on the ground instead. */}
                <line
                  x1={m.x}
                  y1={m.y}
                  x2={m.lx}
                  y2={m.ly}
                  stroke="#9B7F4A"
                  strokeWidth={1.25}
                  strokeOpacity={0.95}
                  vectorEffect="non-scaling-stroke"
                />
                {/* The disc is the section's own dusk, not hollow (client,
                   2026-09-09: a gold dot is hard to find on the building).
                   Filled dark it reads instantly against pale walls and roof
                   decks, which is where most of these points land — and the
                   gold ring keeps it findable on the dark green prayer halls,
                   where a dusk dot on its own would disappear. */}
                <circle
                  cx={m.x}
                  cy={m.y}
                  r={3}
                  fill="#16242E"
                  stroke="#9B7F4A"
                  strokeWidth={1.25}
                  vectorEffect="non-scaling-stroke"
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                />
                <circle cx={m.x} cy={m.y} r={1} fill="#9B7F4A" vectorEffect="non-scaling-stroke" />
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
    </>
  );
}
