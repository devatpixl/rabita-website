/**
 * The curve a dusk block ends on, phones only.
 *
 * Drawn as an SVG rather than a border-radius because the shape is a shallow
 * sweep across the full width — a radius would round two corners and leave a
 * straight run between them. `preserveAspectRatio="none"` lets one path serve
 * every phone width: it stretches horizontally and keeps its 48px height,
 * which is what stops the curve going slack at 430 and sharp at 360.
 *
 * `fill` is a literal colour, because an SVG fill cannot read a Tailwind
 * class. It must be the colour of whatever the block hands over TO, not the
 * colour of the block itself — the curve is the light rising into the dusk,
 * not the dusk stopping short.
 *
 * Positioning is the caller's, via `className`, because the two uses differ:
 * on /moskeprosjektet it is pulled up out of the light block that follows the
 * hero, and on /moskeprosjektet/leiligheter it sits at the foot of the hero
 * itself so the section keeps every pixel of its height.
 *
 * ── THE STRIP UNDER IT IS NOT DECORATION (2026-09-30) ────────────────────
 * The client saw a grey hairline under the curve on an iPhone that does not
 * appear in Chrome at any width. The cause is a fractional boundary: the
 * apartments hero is `86svh`, which on his viewport computes to a height
 * ending in .516, so the block's foot lands on a half device-pixel. Safari
 * antialiases the path's bottom edge across that boundary and what blends
 * through is the dusk BEHIND the curve, which reads as a grey rule the width
 * of the screen.
 *
 * A plain element does not antialias its own edges, so a few pixels of solid
 * fill underneath removes the seam without touching the shape. It is safe
 * everywhere: the path is `V48` at both ends and never dips below y=40, so
 * the bottom 3px is inside the filled area at every x and every width — the
 * strip is only ever redrawing pixels the curve had already filled.
 */
export function PlateFoot({ fill, className }: { fill: string; className?: string }) {
  return (
    <span className={className} aria-hidden>
      <svg
        viewBox="0 0 390 48"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <path d="M0 48V14C64 0 150 22 232 30C300 36 350 30 390 16V48Z" fill={fill} />
      </svg>
      <span
        className="absolute inset-x-0 bottom-0 block h-[3px]"
        style={{ backgroundColor: fill }}
      />
    </span>
  );
}
