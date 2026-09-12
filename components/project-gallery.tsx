'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

// The renders of the new building, as a full-bleed stage you page through.
//
// Rebuilt to the client's mockup (2026-09-13: "completely copy and replicate
// its design so this section looks very modern and interactive"). What that
// changed, against the contained plate this used to be:
//
//   - the picture goes full-bleed and edge to edge instead of sitting as a
//     rounded card on a paper band, so the section reads as a place rather
//     than as a figure on a page;
//   - the words move from a strip along the foot to a column on the LEFT,
//     over a scrim that fades out before it reaches the building — which is
//     why the renders are all composed with their subject right of centre;
//   - the title is set at hero scale rather than sub-head scale;
//   - the thumbnails come up ONTO the image, numbered, with the current one
//     ringed in gold;
//   - a pill link closes the column.
//
// Nothing in the content model changed: tag, title, caption and alt were
// already written per render, and the mockup's own headline — "Når lyset
// kommer innenfra" — IS items.facadeEvening.title, so the design was drawn
// against this copy.
//
// Cross-fade between plates; keyboard arrows, swipe on touch, and the whole
// thing degrades to a static first render under prefers-reduced-motion.

// The eight architect renders, in the client's order (2026-09-09). They
// replace the nine earlier frames, which were a mix of the same building
// shot from further away; these are the drawings the project is actually
// presented with.
const SLIDES = [
  { key: 'facadeEvening', src: '/photos/proj-facade-evening.webp', pos: '50% 50%' },
  { key: 'foyer', src: '/photos/proj-foyer.webp', pos: '50% 50%' },
  { key: 'garden', src: '/photos/proj-garden.webp', pos: '50% 50%' },
  { key: 'mainHall', src: '/photos/proj-main-hall.webp', pos: '50% 50%' },
  { key: 'minaret', src: '/photos/proj-minaret-apartments.webp', pos: '50% 50%' },
  { key: 'youthClub', src: '/photos/proj-youth-club.webp', pos: '50% 50%' },
  { key: 'meetingRoom', src: '/photos/proj-meeting-room.webp', pos: '50% 50%' },
  { key: 'roofTerrace', src: '/photos/proj-roof-terrace.webp', pos: '50% 50%' },
] as const;
export type SlideKey = (typeof SLIDES)[number]['key'];

const GRADE = 'saturate(0.8) contrast(1.08) brightness(0.95)';

// The two scrims. The first is the one that makes the layout work: a wash
// from the left edge that is all but gone by 62%, so the words sit on dusk
// and the building never does. The second lifts the foot for the thumbnail
// strip. Both in the section's own dusk, so they read as shade rather than
// as a black overlay.
const SCRIM_SIDE =
  'linear-gradient(90deg, rgba(22,36,46,0.94) 0%, rgba(22,36,46,0.86) 22%, rgba(22,36,46,0.55) 44%, rgba(22,36,46,0.12) 66%, rgba(22,36,46,0) 82%)';
const SCRIM_FOOT =
  'linear-gradient(180deg, rgba(22,36,46,0) 0%, rgba(22,36,46,0.45) 45%, rgba(22,36,46,0.88) 100%)';
// Phones get a vertical wash instead: there is no room for a column beside
// the building, so the words go under it and the shade has to come up from
// the foot rather than in from the side.
//
// It is also heavier than the desktop scrim, and heaviest at the very top
// (client, 2026-09-13: "on mobile, not clearly seen"). Two reasons the phone
// needs more shade than the maths suggests: a 16:10 render cropped into a
// portrait stage shows only its middle third, so whatever lands behind the
// words is unpredictable — on the meeting room it is a wall of pendant
// lights — and the counter sits at the very top where a foot-up gradient has
// nothing left to give. Hence the bump at 0%, easing off by 18% so the
// picture still opens bright.
const SCRIM_PHONE =
  'linear-gradient(180deg, rgba(22,36,46,0.62) 0%, rgba(22,36,46,0.48) 18%, rgba(22,36,46,0.62) 38%, rgba(22,36,46,0.94) 66%, rgba(22,36,46,0.98) 100%)';

export function ProjectGallery({
  only,
  cta,
}: {
  only?: SlideKey[];
  /** Pill link closing the text column. Omitted where the page it would
   *  point at is the page you are already on. */
  cta?: { href: string; label: string };
} = {}) {
  const t = useTranslations('projectPage.gallery');
  const slides = only ? SLIDES.filter((s) => only.includes(s.key)) : SLIDES;
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  const n = slides.length;
  const go = useCallback((to: number) => setI(((to % n) + n) % n), [n]);
  const next = useCallback(() => go(i + 1), [go, i]);
  const prev = useCallback(() => go(i - 1), [go, i]);

  // Keyboard, while the stage has focus.
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [next, prev]);

  // Swipe.
  const x0 = useRef<number | null>(null);
  const onPointerDown = (e: React.PointerEvent) => { x0.current = e.clientX; };
  const onPointerUp = (e: React.PointerEvent) => {
    if (x0.current == null) return;
    const dx = e.clientX - x0.current;
    x0.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) next(); else prev();
  };

  const slide = slides[i];
  const k = slide.key as SlideKey;

  return (
    <section className="relative isolate overflow-hidden bg-dusk text-paper">
      <div
        ref={rootRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={t('label')}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        style={{ touchAction: 'pan-y' }}
        // Tall enough to read as a place, capped so it never becomes a
        // second hero: a full 100svh section in the middle of a page makes
        // the reader think they have arrived somewhere new.
        className="relative min-h-[40rem] w-full outline-none md:h-[88svh] md:min-h-[44rem] md:max-h-[52rem]"
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={k}
            className="absolute inset-0"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={slide.src}
              alt={t(`items.${k}.alt`)}
              fill
              priority={i === 0}
              sizes="100vw"
              className="select-none object-cover"
              style={{ filter: GRADE, objectPosition: slide.pos }}
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        <div aria-hidden className="pointer-events-none absolute inset-0 md:hidden" style={{ background: SCRIM_PHONE }} />
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block" style={{ background: SCRIM_SIDE }} />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[46%] md:block" style={{ background: SCRIM_FOOT }} />

        {/* Everything above the picture, in one column so the three bands —
           counter, words, strip — share a gutter and stay aligned. */}
        <div className="relative flex h-full min-h-[inherit] flex-col px-5 py-6 sm:px-8 md:px-12 md:py-10 lg:px-16">
          {/* The counter, top right, the way the mockup marks position. The
             section label sits with it rather than as a heading, because the
             plate's own title is the heading here. */}
          <div className="flex items-baseline justify-end gap-3 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-paper/75 sm:text-[0.625rem] sm:text-paper/55">
            <span className="hidden text-gold sm:inline">{t('label')}</span>
            <span aria-hidden className="hidden h-px w-8 bg-paper/25 sm:block" />
            <span className="tabular-nums">
              <span className="text-paper">{String(i + 1).padStart(2, '0')}</span> / {String(n).padStart(2, '0')}
            </span>
          </div>

          {/* The words.
             NOT mode="wait", which is the obvious way to write this and
             deadlocks: the exiting block never reported exit-complete, so
             the incoming one never mounted, and the headline froze on one
             render while the counter and the picture went on advancing.
             Caught because the counter sits outside this AnimatePresence —
             05 -> 06 with the title unchanged is not a state bug.

             Instead the hand-off is timed. Exit is quick and the entrance
             waits for it, which is what mode="wait" was wanted for: two
             titles at hero scale fading through each other is a smear.

             grid, not flex, with both children in the SAME cell: during the
             overlap there are briefly two blocks, and in flow the second
             would shove the first. The cell also keeps the taller of the
             two, so nothing jumps as captions change length. */}
          <div className="grid flex-1 items-end pb-8 md:items-center md:pb-0">
            <AnimatePresence initial={false}>
              <motion.div
                key={k}
                className="col-start-1 row-start-1 max-w-[34rem]"
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: reduced ? 0 : 0.34, delay: reduced ? 0 : 0.16, ease: [0.22, 1, 0.36, 1] },
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                  transition: { duration: reduced ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] },
                }}
              >
                <p className="flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-gold">
                  <span aria-hidden className="h-px w-7 shrink-0 bg-gold/70" />
                  {t(`items.${k}.tag`)}
                </p>
                <h2 className="mt-4 font-serif text-[clamp(2rem,5.2vw,3.75rem)] leading-[1.05] text-balance text-paper">
                  {t(`items.${k}.title`)}
                </h2>
                <p className="mt-5 max-w-[44ch] text-body text-paper/75">
                  {t(`items.${k}.caption`)}
                </p>
                {cta && (
                  <Link
                    href={cta.href}
                    className="group mt-7 inline-flex min-h-11 items-center gap-3 rounded-full border border-paper/30 px-5 text-[15px] text-paper transition-colors hover:border-gold hover:bg-gold hover:text-dusk"
                  >
                    {cta.label}
                    <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">
                      &rarr;
                    </span>
                  </Link>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* The strip, and the arrows that close the row. */}
          <div className="flex items-end gap-4 sm:gap-6">
            <ol
              className="no-scrollbar -mx-1 flex flex-1 gap-3 overflow-x-auto px-1 pb-1"
              aria-label={t('label')}
            >
              {slides.map((s, idx) => {
                const on = idx === i;
                return (
                  <li key={s.key} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => go(idx)}
                      aria-label={t('goto', { n: idx + 1 })}
                      aria-current={on ? 'true' : undefined}
                      className={cn(
                        // Ring INSIDE the box, not ring-offset: these sit on
                        // the photograph, and an offset ring needs a solid
                        // colour behind it to offset against.
                        'relative block h-[5.25rem] w-[8.75rem] overflow-hidden rounded-xl text-start transition-all duration-300 sm:h-20 sm:w-36',
                        on
                          ? 'ring-2 ring-gold shadow-[0_0_0_1px_rgba(22,36,46,0.5),0_10px_30px_-12px_rgba(0,0,0,0.8)]'
                          : 'opacity-75 ring-1 ring-paper/30 hover:opacity-95 hover:ring-paper/45 sm:opacity-60 sm:ring-paper/20',
                      )}
                    >
                      <Image src={s.src} alt="" fill sizes="144px" className="object-cover" style={{ objectPosition: s.pos }} />
                      <span
                        aria-hidden
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(180deg, rgba(22,36,46,0) 18%, rgba(22,36,46,0.6) 55%, rgba(22,36,46,0.95) 100%)' }}
                      />
                      <span className="absolute inset-x-0 bottom-0 flex items-baseline gap-1.5 px-2 pb-2 font-mono text-[0.625rem] uppercase tracking-[0.1em] sm:pb-1.5 sm:text-[0.5625rem] sm:tracking-[0.12em]">
                        <span className={cn('tabular-nums', on ? 'text-gold' : 'text-paper/60')}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="truncate text-paper/90">{t(`items.${s.key}.tag`)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="hidden shrink-0 items-center gap-2 pb-1 sm:flex">
              <ArrowButton dir="prev" label={t('prev')} onClick={prev} />
              <ArrowButton dir="next" label={t('next')} onClick={next} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArrowButton({ dir, label, onClick }: { dir: 'prev' | 'next'; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-11 w-11 place-items-center rounded-full border border-paper/35 bg-dusk/40 text-paper backdrop-blur-sm transition-colors hover:border-gold hover:bg-gold hover:text-dusk sm:h-12 sm:w-12"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn('h-4 w-4', dir === 'prev' ? 'rtl:rotate-180' : 'rotate-180 rtl:rotate-0')} aria-hidden>
        <path d="M15 5l-7 7 7 7" />
      </svg>
    </button>
  );
}
