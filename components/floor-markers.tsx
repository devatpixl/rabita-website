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
//   PHONE — a NUMBERED point on the room, and a numbered key under the
//   drawing (FloorLegend). Measured, not guessed: at 390px the pane is 331px
//   wide and the drawing paints the full 331 of it, so the gutter a leader
//   needs is exactly zero. The longest room name ("Konferanse- og
//   selskapslokaler") is 30 characters — wider than half a phone at any size
//   a person can read. Numbers on the drawing, names in a list: the
//   convention every architectural plan already uses, and every name stays
//   whole (client, 2026-09-10: "add text properly in all floors").
//
// Below 360px the numbers and the key both go, and the drawing gets its
// room back. Measured on a 320x568 screen: the key costs 111px of a 568px
// viewport that is already spending 218 on the header, which leaves the
// drawing 99px wide — too small to find a point on, let alone read one. A
// 204px drawing with only its floor caption is the better trade there, and
// it is what that phone sees today. max-[359px] and md are disjoint
// queries, so their order in the sheet cannot matter.

// The frame the drawings were cut to, and the percentage space the marker
// data is written in. One divided by the other converts between them.
const FRAME_W = 1258;
const FRAME_H = 1400;

// Point sizes are in viewBox units, so they scale with the drawing: a bigger
// phone gets a slightly bigger point, which is what you want.
//
// The drawing's scale swings more than the screen width does, because a
// shorter phone letterboxes it: measured, the painted drawing is 331px wide
// on a 390x844 screen but only 253px on a 390x740 one. These sizes are
// picked for the middle of that range — about 19px across with a 10px
// numeral on the short phone, 25px and 13px on the tall one — and checked
// against the tightest pair of points on any floor (the children's room and
// the imam's office on the second, 36px apart at the largest scale).
const DOT_R = 48;
const DOT_TYPE = 50;

export function FloorMarkers({ floorKey, active }: { floorKey: string; active: boolean }) {
  const t = useTranslations('floorByFloor.rooms');
  const markers: FloorMarker[] = FLOOR_MARKERS[floorKey] ?? [];
  if (markers.length === 0) return null;

  return (
    <>
      {/* ── phone: numbered points ──────────────────────────────────────
         preserveAspectRatio="xMidYMax meet" IS object-contain + object-bottom:
         scale to fit, centre horizontally, sit on the floor of the box. So
         this SVG can span the whole pane and its coordinates still land on
         the building, whether the drawing is width- or height-constrained.
         The old overlay assumed height-constrained and would have put every
         point in the wrong place on a phone, where it is width-constrained. */}
      <svg
        aria-hidden
        viewBox={`0 0 ${FRAME_W} ${FRAME_H}`}
        preserveAspectRatio="xMidYMax meet"
        className="pointer-events-none absolute inset-0 h-full w-full max-[359px]:hidden md:hidden"
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
            <circle
              cx={m.x * (FRAME_W / 100)}
              cy={m.y * (FRAME_H / 100)}
              r={DOT_R}
              fill="#16242E"
              stroke="#9B7F4A"
              strokeWidth={1.25}
              vectorEffect="non-scaling-stroke"
            />
            <text
              x={m.x * (FRAME_W / 100)}
              y={m.y * (FRAME_H / 100)}
              textAnchor="middle"
              dominantBaseline="central"
              className="font-mono"
              fontSize={DOT_TYPE}
              fontWeight={600}
              fill="#C0A165"
            >
              {i + 1}
            </text>
          </g>
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

// The key to the numbered points, phone only. Sits directly under the
// drawing, above the floor caption.
//
// One column, never two: two columns on a 390px screen give each name about
// 159px, and half the rooms here are longer than that. A key that wraps or
// truncates the names is worse than no key.
//
// The numerals are derived from the marker order, exactly as the points are,
// so a point and its line can never disagree.
export function FloorLegend({ floorKey, active }: { floorKey: string; active: boolean }) {
  const t = useTranslations('floorByFloor.rooms');
  const markers: FloorMarker[] = FLOOR_MARKERS[floorKey] ?? [];
  if (markers.length === 0) return null;

  return (
    <ol
      aria-hidden={!active}
      className={cn(
        // Anchored to the BOTTOM of its reserved box, not the top. The box is
        // six rows tall for every floor, but most floors have fewer; hung
        // from the bottom, the slack falls as air under the drawing instead
        // of as a hole between the key and the floor caption, and the two
        // read as one block of text at the foot of the frame.
        'absolute inset-x-0 bottom-0 transition-opacity duration-500 ease-out motion-reduce:transition-none',
        active ? 'opacity-100' : 'opacity-0',
      )}
    >
      {markers.map((m, i) => (
        <li key={m.id} className="mt-[3px] flex items-center gap-2 first:mt-0">
          <span
            aria-hidden
            className="grid h-[14px] w-[14px] shrink-0 place-items-center rounded-full border border-gold-deep font-mono text-[0.5rem] leading-none text-gold"
          >
            {i + 1}
          </span>
          <span className="font-mono text-[0.5625rem] uppercase leading-none tracking-[0.12em] text-paper/85">
            {t(m.id)}
          </span>
        </li>
      ))}
    </ol>
  );
}
