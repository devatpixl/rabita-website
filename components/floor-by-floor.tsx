'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { scrollTo } from '@/lib/scroll-to';
import { FloorMarkers } from './floor-markers';

// The building floor by floor, from the architect's own labelled cutaways
// (Fasiliteter.pdf, client 2026-09-03), shown bottom to top: the lower-floor
// mosque first, then each storey in turn, ending on the finished exterior
// with the dome and minaret.
//
// The deck's own page order is top-down (exterior first), so the frames were
// reversed at export: step-1.webp is the deck's page 8.
//
// Why the cross-fade is honest here and not a cheat: every page of the deck
// draws the building at the SAME position on the same 960x540 sheet, and all
// eight frames were cut with ONE identical crop box at render time
// (pdftoppm -x/-y/-W/-H), never per-image. Nothing can shift between frames,
// so fading one into the next reads as the building growing. The previous
// attempt at this idea cropped each drawing to its own bounding box, which
// let the plates wander a few pixels between steps — that alignment is the
// entire effect, and it is now guaranteed by construction rather than by
// eyeballing.
//
// Exactly one frame is lit at a time: each drawing already contains the
// storeys below it in grey, so stacking opacities under multiply would
// compound into a muddy x-ray.

const STEPS = 8;
const KEYS = [
  'lower',
  'first',
  'second',
  'third',
  'fourth',
  'fifth',
  'sixth',
  'whole',
] as const;

export function FloorByFloor() {
  const t = useTranslations('floorByFloor');
  const tBuilding = useTranslations('building');
  const STAGES = t.raw('stages') as string[];
  const track = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (reduced) {
      setStep(STEPS - 1);
      return;
    }
    let frame = 0;
    const read = () => {
      frame = 0;
      const el = track.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      // How far through the track we are, 0-1; the sticky pane is one
      // viewport tall, so the travel is the track minus that.
      const travel = r.height - window.innerHeight;
      const p = travel <= 0 ? 0 : Math.min(1, Math.max(0, -r.top / travel));
      // Every step gets an equal share, the last one included, so the
      // finished building is actually looked at rather than flashing past.
      setStep(Math.min(STEPS - 1, Math.floor(p * STEPS)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reduced]);

  // Straight to where the pin releases, so the next section follows at
  // once. The track is one viewport taller than the pane, so the release
  // point is its bottom minus the viewport.
  const skip = useCallback(() => {
    const el = track.current;
    if (!el) return;
    scrollTo(el.getBoundingClientRect().top + window.scrollY + el.offsetHeight - window.innerHeight + 1);
  }, []);

  // Two steps per statement, clamped so the last pair cannot overrun.
  const stage = Math.min(STAGES.length - 1, Math.floor(step / (STEPS / STAGES.length)));

  // The way out. This section pins for several viewports; a reader who has
  // seen enough should not have to scroll the whole rail to leave it. Null
  // under prefers-reduced-motion, where the pin is dropped and there is
  // nothing to skip.
  //
  // TWO shapes, because the two screens put it in different places and a
  // control sized for one crowds the other.
  //
  // PHONE — text and a caret, under the step counter (client, 2026-09-10).
  // That slot is not a preference: the left column there is the eyebrow and
  // a two-line heading with nothing to spare, while the right column is a
  // single 14px counter with the rest of the header empty beneath it.
  const skipPhone = reduced ? null : (
    <button
      type="button"
      onClick={skip}
      className="group inline-flex min-h-9 items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-paper/55 transition-colors hover:text-gold"
    >
      <span className="border-b border-paper/25 pb-px group-hover:border-gold">
        {tBuilding('skip')}
      </span>
      <span
        aria-hidden
        className="transition-transform duration-200 group-hover:translate-y-0.5 motion-reduce:transition-none"
      >
        &darr;
      </span>
    </button>
  );

  // TABLET AND UP — at the FOOT of the section, and an actual arrow (client,
  // Moskeprosjektet item 6: "flytt hopp over til nede eller legg en fin
  // pil"). Both halves of that sentence at once: it moves down, and the
  // caret becomes a gold ring with a real arrow in it that fills on hover —
  // the seal FollowUs already uses, in this section's colours.
  //
  // It goes on the floor caption's own row rather than a row of its own. The
  // caption is 20px and this is 36, so sharing costs 16px where a new row
  // would cost 52; and dropping the old top-left slot gives back 52. The
  // drawing nets 36px, which is the opposite of what moving a control
  // usually costs.
  //
  // Why the bottom is the better place anyway: this is where a reader who
  // has seen enough is already looking — at the end of the thing, not above
  // it — and the top slot sat above the eyebrow, which made the eyebrow the
  // second thing in the section rather than the first.
  //
  // Both carry building.skip, the string the old control on BuildingRises
  // used. Same words in both shapes; a second copy would only drift.
  const skipDesktop = reduced ? null : (
    <button
      type="button"
      onClick={skip}
      className="group inline-flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-paper/55 transition-colors hover:text-gold"
    >
      <span className="border-b border-transparent pb-px group-hover:border-gold">
        {tBuilding('skip')}
      </span>
      <span
        aria-hidden
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full ring-1 ring-gold/40 transition-colors duration-300 group-hover:bg-gold group-hover:ring-gold"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 text-gold transition-[transform,color] duration-300 group-hover:translate-y-0.5 group-hover:text-dusk motion-reduce:transition-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </span>
    </button>
  );

  return (
    <section
      ref={track}
      aria-labelledby="floor-by-floor-heading"
      className={cn('relative bg-dusk', reduced ? '' : 'h-[480vh] md:h-[640vh]')}
    >
      <div
        className={cn(
          'flex flex-col bg-dusk',
          reduced ? 'py-section-md' : 'sticky top-0 h-[100svh] overflow-hidden',
        )}
      >
        {/* pt-16 at every width now. It was md:pt-28, 112px, which is
           generous for a section that is PINNED -- nothing scrolls past
           this header, so the air above it is never read as breathing
           room, only as a smaller drawing. That 48px goes to the figure
           (client, 2026-09-13: "too small ... can hardly see the diagram
           and names" on a 13" Air). Phone value unchanged. */}
        <header className="shrink-0 px-6 pt-16">
          <div className="mx-auto flex max-w-6xl items-start justify-between gap-8">
            {/* min-w-0 flex-1: the heading's lines are all absolutely
               positioned now, so this column has no in-flow content to size
               from and a flex item collapses to its widest in-flow child —
               which was the eyebrow, wrapping the heading to about 120px. */}
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold">
                {t('eyebrow')}
              </p>
              {/* The heading advances with the scroll (client, Hjem.pdf
                 2026-09-09). The drawing tells the spatial story — which
                 floor — and the caption under it names that floor, so the
                 heading is free to tell the project's status story instead:
                 site cleared, permissions, contractor, opening.

                 Four statements over eight steps, so each covers two. That
                 lands "dørene åpner 2028" on the last pair, which is the
                 sixth floor and the finished building.

                 Stacked absolutely and cross-faded, the same way the floor
                 caption below does it, so the header never reflows as the
                 lines change length.

                 The reserve is measured, not assumed: the longest statement
                 ("Bygget nedenfra og opp, tomten er ryddet.") runs to three
                 lines only below 375px. From 375 up — which is every phone
                 in use — it is two, so the box is two lines and the third is
                 bought back only where it is needed. That 26px goes to the
                 drawing, which on a short phone is the thing starved for
                 room. max-[374px] and sm are disjoint queries, so their
                 order in the sheet cannot matter.

                 Only the active stage is exposed: the rest are aria-hidden,
                 so the accessible name of this h2 is always the line on
                 screen. */}
              <h2
                id="floor-by-floor-heading"
                className="relative mt-3 h-[3rem] w-full max-w-xl overflow-hidden font-serif text-[clamp(1.35rem,3vw,2.25rem)] leading-[1.1] text-paper max-[374px]:h-[4.6rem] sm:h-[5rem]"
              >
                {STAGES.map((line, i) => (
                  <span
                    key={line}
                    aria-hidden={i !== stage}
                    className={cn(
                      'absolute inset-x-0 top-0 transition-opacity duration-500 ease-out motion-reduce:transition-none',
                      i === stage ? 'opacity-100' : 'opacity-0',
                    )}
                  >
                    {line}
                  </span>
                ))}
              </h2>
            </div>
            {!reduced && (
              <div className="shrink-0 text-end">
                <p className="pt-1 font-mono text-[0.6875rem] tabular-nums tracking-[0.14em] text-paper/55">
                  <span className="text-paper">{String(step + 1).padStart(2, '0')}</span> / {String(STEPS).padStart(2, '0')}
                </p>
                {/* Nothing on the drawing says the dots open (client,
                   2026-09-13). They take a pointer cursor and nothing else, so
                   on a touch screen there is no tell at all. A line under the
                   counter, with an actual gold disc in front of it so it
                   points at the thing it is describing rather than naming it.
                   Hidden below md: the phone slot underneath already carries
                   the skip control, and two lines of mono in a 14px column is
                   a stack, not a hint. */}
                <p
                  aria-hidden
                  className="mt-2.5 hidden items-center justify-end gap-2 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-paper/45 md:flex"
                >
                  <span className="inline-block h-[7px] w-[7px] shrink-0 rounded-full bg-gold-deep" />
                  {t('tapHint')}
                </p>
                {/* Phones only — the same control the left column carries
                   from md. Only ever one of the two is displayed, so the
                   other is out of the accessibility tree too. */}
                <div className="mt-3 md:hidden">{skipPhone}</div>
              </div>
            )}
          </div>
        </header>

        {/* The drawings. All eight stacked in one frame; only opacity changes,
           so the browser never re-lays anything out mid-scroll. */}
        {/* px-2 on phones, not px-6: the drawing is a figure, and at this
           size every millimetre of it is type on the building as well as
           building. 24px of side padding either side costs 43px of drawing
           width, which is a whole point of label size. Desktop keeps its
           margin. */}
        <div className="relative mt-2 min-h-0 flex-1 px-2 pb-8 md:mt-4 md:px-6 md:pb-3">
          {/* No plate and no blend trick: the frames carry real alpha. The
             sheet was cut out of the images themselves — a flood fill from
             the borders, so only white CONNECTED to the outside went; the
             building's own white walls and the label boxes are enclosed by
             linework and survive. A 2px dilate eats the anti-aliased rim
             that would otherwise halo pale against the dark ground. */}
          {/* max-w-5xl, not 3xl. The drawing is height-constrained at every
             desktop size -- 574 tall needs only 516 across -- so widening
             this box does NOT change how big the picture is, or where any
             marker sits. It widens the letterbox either side, which is
             where the names live. At 3xl the right-hand names had a few
             pixels of clearance before the pane clipped them, and the type
             is now bigger. */}
          <div className="relative mx-auto h-full w-full max-w-5xl">
            {Array.from({ length: STEPS }).map((_, i) => (
              <Image
                key={i}
                src={`/photos/floors/step-${i + 1}.webp`}
                alt={i === STEPS - 1 ? t('altFinal') : ''}
                aria-hidden={i !== STEPS - 1}
                fill
                // The first frame is what a cold visitor sees, and the last
                // is what everyone ends on; the middle six can wait.
                priority={i === 0}
                sizes="(min-width: 768px) 48rem, 92vw"
                className={cn(
                  'object-contain object-bottom transition-opacity duration-500 ease-out motion-reduce:transition-none',
                  i === step ? 'opacity-100' : 'opacity-0',
                )}
              />
            ))}

            {/* Our own labels, over the drawing that is currently lit. */}
            {KEYS.map((k, i) => (
              <FloorMarkers key={k} floorKey={k} active={i === step} />
            ))}
          </div>
        </div>

        {/* Which floor this is, and the progress rail under it. The label is
           keyed so it cross-fades in step with the drawing above it. */}
        {!reduced && (
          <div className="shrink-0 px-6 pb-8 pt-3 md:pb-8 md:pt-4">
            <div className="mx-auto max-w-6xl">
              {/* Fixed height, because the labels stack absolutely for the
                 cross-fade — but the longest label runs two lines on a
                 phone, so the box is two lines tall until sm. */}
              {/* The floor name and, from md, the way out — one row, so the
                 control costs 16px rather than a row of its own. min-w-0 on
                 the caption because its own children are absolute: without
                 it the flex item has nothing in flow to size from. */}
              <div className="flex items-center justify-between gap-6">
                <p className="relative h-8 min-w-0 flex-1 overflow-hidden sm:h-5">
                  {KEYS.map((k, i) => (
                    <span
                      key={k}
                      aria-hidden={i !== step}
                      className={cn(
                        'absolute inset-x-0 top-0 text-center font-mono text-[0.625rem] uppercase leading-snug tracking-[0.16em] transition-opacity duration-500 sm:text-start',
                        i === step ? 'text-paper opacity-100' : 'opacity-0',
                      )}
                    >
                      {t(`floors.${k}`)}
                    </span>
                  ))}
                </p>
                {/* Only ever one of the two skip controls is displayed, so
                   the other is out of the accessibility tree too. */}
                <div className="hidden shrink-0 md:block">{skipDesktop}</div>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                {Array.from({ length: STEPS }).map((_, i) => (
                  <span
                    key={i}
                    aria-hidden
                    className={cn(
                      'h-px flex-1 transition-colors duration-500',
                      i <= step ? 'bg-gold' : 'bg-paper/20',
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
