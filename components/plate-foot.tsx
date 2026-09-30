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
 */
export function PlateFoot({ fill, className }: { fill: string; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 390 48"
      preserveAspectRatio="none"
      className={className}
    >
      <path d="M0 48V14C64 0 150 22 232 30C300 36 350 30 390 16V48Z" fill={fill} />
    </svg>
  );
}
