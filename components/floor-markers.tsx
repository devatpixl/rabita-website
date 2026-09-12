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
// Percentages in, viewBox units out. The marker data is authored as
// percentages of the drawing because that is what you can read off it with a
// grid; both overlays draw in the frame's own 1258x1400 units because that is
// the only space a meet-fit can be exact in. These two convert.
const px = (p: number) => (p * FRAME_W) / 100;
const py = (p: number) => (p * FRAME_H) / 100;

// The leader, as a curved arrow (client, Moskeprosjektet item 8: "endre
// pilene i figurene"). Straight hairlines ending in a dot became curves with
// a head, which is what the client drew on the plates in red.
//
// LEADER_BOW is the control point's offset from the chord, as a fraction of
// the chord's own length, so a short leader curves as gently as a long one
// looks. 0.11 is a bow you read as deliberate without it becoming a swoop.
// The perpendicular is always taken the same way round, so every arrow on
// every floor bows with the same handedness.
//
// The path stops short of the disc by DISC_R plus a small gap, so the head
// sits against the marker rather than under it — otherwise the disc, which
// is drawn after, would swallow the arrowhead whole.
const LEADER_BOW = 0.11;
const HEAD_L = 26;
const HEAD_W = 19;
const LEADER_W = 3.5;

function leaderPath(m: FloorMarker) {
  const x1 = px(m.lx);
  const y1 = py(m.ly);
  const x2 = px(m.x);
  const y2 = py(m.y);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  // control point: chord midpoint pushed out along the chord's normal
  const cx = (x1 + x2) / 2 + (-dy / len) * len * LEADER_BOW;
  const cy = (y1 + y2) / 2 + (dx / len) * len * LEADER_BOW;
  // back the tip off the disc, along the curve's own tangent at the end
  const tx = x2 - cx;
  const ty = y2 - cy;
  const tlen = Math.hypot(tx, ty) || 1;
  const back = DISC_R + HEAD_L * 0.25;
  const ex = x2 - (tx / tlen) * back;
  const ey = y2 - (ty / tlen) * back;
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
}

// The desktop marker, restated in viewBox units from the 3% and 1% of the
// frame it used to be, so it is the same size on screen as before.
const DISC_R = (3 * FRAME_W) / 100;
const DOT_R = (1 * FRAME_W) / 100;

// The desktop label. LABEL_BOX_W is the measure the text is aligned inside,
// not a drawn width — the longest name here, "Konferanse- og
// selskapslokaler", runs about 410 units at this type size, so 560 holds it
// with room and nothing has to wrap. LABEL_BOX_H reserves one line and
// centres on the leader's end; a foreignObject clips to its box.
//
// LABEL_TYPE_DESKTOP is in viewBox units, so it tracks the drawing. 24 was
// set from an estimate of how big the drawing paints; measured on a real
// 1440x900 Air it paints 451 tall, a scale of 0.32, which put these names at
// 7.7px -- which is what the client could not read. With the padding
// reclaimed the same screen paints 567 tall, and 32 units lands at 13px
// there (client, 2026-09-13: bigger, "not soo much but the perfect
// amount"), 10.7px on a 1280x800 and 17.9px on a 16".
//
// LABEL_BOX_W has to grow faster than the type, because a foreignObject
// CLIPS what overflows it rather than letting it spill. The longest name,
// "Konferanse- og selskapslokaler", is 30 characters of mono at 0.16em
// tracking, so about 0.76em each: 730 units at this size, plus the gap.
// 820 covers it with room, and is free -- the box is a measure to align
// inside, not a drawn width.
const LABEL_BOX_W = 820;
const LABEL_BOX_H = 110;
const LABEL_GAP = 20;
const LABEL_TYPE_DESKTOP = 32;

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
         ONE meet-fit SVG, the same device the phone layer uses, spanning the
         whole pane: preserveAspectRatio="xMidYMax meet" IS object-contain +
         object-bottom, which is exactly how the <Image> beneath paints. So
         every coordinate here lands on the same spot of the drawing at any
         pane size.

         This replaces a box that carried the frame's aspect ratio at
         height:100% and assumed the drawing was always height-constrained.
         It usually is on a desktop, so the old box usually agreed — but
         "usually" is not a guarantee, and the client has asked for the
         drawing to be scaled up (2026-09-12), which changes the pane's
         proportions. A width-constrained pane would have shrunk the picture
         and left the box at full height, sliding every marker off its room.
         The meet-fit cannot drift, because it is the same fit.

         Coordinates are still authored as percentages; they are multiplied
         into viewBox units at the point of use. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden md:block"
      >
        <svg
          viewBox={`0 0 ${FRAME_W} ${FRAME_H}`}
          preserveAspectRatio="xMidYMax meet"
          className="absolute inset-0 h-full w-full overflow-visible"
        >
            {/* The arrowhead. markerUnits="userSpaceOnUse" so HEAD_L and
               HEAD_W are viewBox units and the head scales with the drawing
               like everything else here; the default, strokeWidth, would
               have tied its size to the line's weight instead. orient="auto"
               turns it along the curve's tangent, which is the whole reason
               this is a marker and not a polygon positioned by hand.

               refX at the tip so the tip lands exactly on the path's end.

               The id carries floorKey because this component renders once
               per floor -- eight of these are in the document at a time, and
               a shared id would have them all pointing at the first. */}
            <defs>
              <marker
                id={`leader-head-${floorKey}`}
                viewBox={`0 0 ${HEAD_L} ${HEAD_W}`}
                refX={HEAD_L}
                refY={HEAD_W / 2}
                markerWidth={HEAD_L}
                markerHeight={HEAD_W}
                markerUnits="userSpaceOnUse"
                orient="auto"
              >
                <path d={`M 0 0 L ${HEAD_L} ${HEAD_W / 2} L 0 ${HEAD_W} Z`} fill="#9B7F4A" />
              </marker>
            </defs>

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
                   on the ground instead.

                   Drawn label-end to building-end, not the other way round,
                   so markerEnd puts the head on the building. The width is
                   in viewBox units now rather than a non-scaling 1.25px: the
                   head scales with the drawing, and a head that grows on a
                   hairline that does not would come apart at the extremes. */}
                <path
                  d={leaderPath(m)}
                  fill="none"
                  stroke="#9B7F4A"
                  strokeWidth={LEADER_W}
                  strokeOpacity={0.95}
                  strokeLinecap="round"
                  markerEnd={`url(#leader-head-${floorKey})`}
                />
                {/* Gold disc, dusk centre. Filled with the gold it used
                   to be outlined in, and the middle left as the section's
                   own dusk — an exact inversion of the marker this section
                   shipped with.

                   Four rounds with the client got here, and the last two
                   are worth keeping straight so nobody reopens them:

                     dusk disc, gold ring, gold centre   (the original)
                     -> hollow, gold only                 "fjerne den svarte
                                                           sirkelen"
                     -> gold fill, dusk centre            hollow vanished on
                                                           the second floor's
                                                           busy right cluster
                     -> solid gold, no centre             "not even the dark
                                                           colour inside"
                     -> gold fill, dusk centre            "let dark remain,
                                                           solid disks look
                                                           so bad"

                   So it is back where it was one step ago, by the client's
                   own eye rather than by argument. Solid gold is the version
                   to leave alone: it reads as a blob, it covers the point it
                   is supposed to mark, and it has now been rejected on
                   sight.

                   No stroke — a gold ring around a gold fill draws nothing.

                   DISC_R and DOT_R are 3% and 1% of the frame in viewBox
                   units, so the marker keeps its proportions at any size. */}
                <circle cx={px(m.x)} cy={py(m.y)} r={DISC_R} fill="#9B7F4A" />
                <circle cx={px(m.x)} cy={py(m.y)} r={DOT_R} fill="#16242E" />
              </g>
            ))}

            {/* The names, in the SAME fit as the leaders that reach them.
               They used to be an HTML layer positioned in percentages of the
               aspect box; now that the box is gone they live here, so a label
               and its leader can never disagree about where the drawing is.

               foreignObject, not <text>, to keep the site's own mono face,
               letter-spacing and uppercasing. Inside a foreignObject, px ARE
               viewBox units, so the type is sized in them — which also means
               the labels grow with the drawing instead of staying 10px while
               it is scaled up. */}
            {markers.map((m, i) => (
              <foreignObject
                key={`${m.id}-label`}
                x={m.align === 'end' ? px(m.lx) - LABEL_BOX_W : px(m.lx)}
                y={py(m.ly) - LABEL_BOX_H / 2}
                width={LABEL_BOX_W}
                height={LABEL_BOX_H}
                className={cn(
                  'overflow-visible transition-opacity duration-500 ease-out motion-reduce:transition-none',
                  active ? 'opacity-100' : 'opacity-0',
                )}
                style={{ transitionDelay: active ? `${240 + i * 90}ms` : '0ms' }}
              >
                {/* The leader arrives on the label's inner edge, so the text
                   always runs AWAY from the building. */}
                <div
                  style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: m.align === 'end' ? 'flex-end' : 'flex-start',
                    paddingInline: m.align === 'end' ? `0 ${LABEL_GAP}px` : `${LABEL_GAP}px 0`,
                  }}
                >
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      fontFamily: 'var(--font-mono), ui-monospace, monospace',
                      fontSize: `${LABEL_TYPE_DESKTOP}px`,
                      lineHeight: 1,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: 'rgb(250 248 244 / 0.9)',
                    }}
                  >
                    {t(m.id)}
                  </span>
                </div>
              </foreignObject>
            ))}
          </svg>
      </div>
    </>
  );
}
