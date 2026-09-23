import Image from 'next/image';
import { cn } from '@/lib/cn';

// The arcade photograph as a still ground, with the section scrolling over it.
//
// Lifted out of components/service-grid.tsx on 2026-09-16 so the subject pages
// can use it too (client: "in sub pages of services and undervisingin, also
// use this image in bg and make it still but let section move for these 2
// sections ... as it looks so basic now"). One implementation, because three
// separate details here are easy to get wrong and invisible when you do.
//
// ── THE THREE TRAPS ───────────────────────────────────────────────────────
// 1. position: sticky, NOT background-attachment: fixed. iOS Safari ignores
//    `fixed` and paints the background as `scroll`, so that version works on
//    every machine in the studio and on no phone.
//
// 2. The HOST section must be `relative isolate overflow-clip` — clip, never
//    hidden. `hidden` makes the section a scroll container, and a sticky
//    element's containing scroller is its nearest scrollable ancestor, so the
//    image would pin to a box that never scrolls and never move at all.
//    `clip` clips without creating a scroller. That is why this component
//    exports HALL_HOST rather than trusting each caller to remember.
//
// 3. next/image's `fill` needs a parent positioned relative / absolute /
//    fixed. The sticky box is none of those, so there is a `relative` wrapper
//    between them — without it Next logs 'has "fill" and parent element with
//    invalid "position"' and the layout is one release away from collapsing.

/** Put this on the <section> that hosts the backdrop. See trap 2. */
export const HALL_HOST = 'relative isolate overflow-clip';

export function HallBackdrop({
  /**
   * How much paper sits between the photograph and the content.
   *
   * 45 on the index pages, whose cards are dark plates that read over
   * anything. The subject pages are ink on paper at body size, so they take
   * more — an arcade behind a paragraph is a legibility problem, not a mood.
   */
  wash = 45,
  /** Seam heights, in Tailwind height steps. */
  topSeam = 'h-20 md:h-56',
  bottomSeam = 'h-16 md:h-44',
  /** The colour the seams fade FROM, matching the section above and below. */
  from = 'rgb(250,248,244)',
  /**
   * CSS filter on the photograph. Empty by default, which is what every
   * caller before 2026-09-23 got and what the subject pages still want.
   *
   * It exists because the file is a near-white cream wall: under a wash of
   * near-white paper it resolves to near-white and the arcade disappears
   * entirely. /aktuelt has always graded it for exactly this reason —
   * saturate(0.72) contrast(1.12) brightness(0.9) — and /om-oss now asks for
   * the same look. Without the grade, a wash above about 55 leaves nothing
   * on screen at all, which is what happened on /om-oss for one build.
   */
  grade = '',
}: {
  wash?: number;
  topSeam?: string;
  bottomSeam?: string;
  from?: string;
  grade?: string;
} = {}) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="sticky top-0 h-screen">
        <div className="relative h-full w-full">
          <Image
            src="/photos/svc-hall-bg.webp"
            alt=""
            fill
            sizes="100vw"
            priority
            // 70% on a wide screen keeps the arcade off the cards. On a phone
            // the content covers the middle, so the crop moves to the centre
            // where there is actually something to see.
            className="object-cover object-center md:object-[70%_50%]"
            style={grade ? { filter: grade } : undefined}
          />
        </div>
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(250,248,244,${wash / 100})` }}
        />
      </div>

      {/* The seams. OUTSIDE the sticky child on purpose: on it they would pin
         to the viewport and fade whatever happened to be at the top of the
         screen; here they belong to the section box and scroll with it, so
         they sit on its actual edges. They are painted after the sticky layer,
         so they land over the photograph.

         Explicit rgba rather than `to-transparent`: Tailwind's transparent is
         rgba(0,0,0,0), which interpolates through grey and dirties a warm
         ground. */}
      <div
        className={cn('absolute inset-x-0 top-0', topSeam)}
        style={{
          background: `linear-gradient(180deg, ${from} 0%, ${from.replace('rgb', 'rgba').replace(')', ',0.86)')} 28%, ${from.replace('rgb', 'rgba').replace(')', ',0)')} 100%)`,
        }}
      />
      <div
        className={cn('absolute inset-x-0 bottom-0', bottomSeam)}
        style={{
          background: `linear-gradient(0deg, ${from} 0%, ${from.replace('rgb', 'rgba').replace(')', ',0.8)')} 32%, ${from.replace('rgb', 'rgba').replace(')', ',0)')} 100%)`,
        }}
      />
    </div>
  );
}
