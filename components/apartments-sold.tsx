'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { APARTMENTS, apartmentStats } from '@/lib/apartments';
import { APARTMENT_UNITS, unitFace } from '@/lib/apartment-units';
import { formatAmount } from '@/lib/format';
import type { AppLocale } from '@/i18n/routing';
import { Eyebrow, SectionBody } from './primitives';
import { Accent } from './accent';
import { LinkVT } from './link-vt';
import { cn } from '@/lib/cn';

// The sold flats, on the home page (client, 2026-09-18: "legge til noen av de
// solgte leilighetene på forsiden for å vise salg").
//
// ── Why this does NOT look like the rest of the site ─────────────────────
// He asked for the most modern thing on the page and explicitly allowed it to
// break from the card language. Two references drove it: a "quiet luxury"
// index that drives one full-bleed image (21st/lumina-interactive-list), and
// a hairline-ruled project index with metadata set right (21st/project-
// showcase). Both are the same Awwwards-era device — a small index steering
// one large stage — and it is the right device HERE for a reason that is not
// fashion:
//
//   The renders arrived at 2752x1536. Three of them in a row of cards would
//   show each at about 300px wide, which throws away 90% of what we were
//   given. One at a time, full width, shows the flat that actually sold.
//
// Three sold is also exactly the count this device wants. An index of three
// is scannable at a glance; the same device at twelve would be a menu.
//
// ── What it is NOT ───────────────────────────────────────────────────────
// No gradient decoration. The only gradient is the scrim under the type, and
// that is a legibility requirement over a photograph, not an effect. No
// glow, no tilt-on-hover, no parallax. The motion is: one image cross-fades
// to the next while a gold rule grows under the active unit. That is all.

type Slide = {
  id: string;
  unit: string;
  priceNok: number;
  rooms: number;
  m2: number;
  floor: number;
};

// Joined from the two sources that each own half of this: APARTMENT_UNITS has
// the image id and the measured areas, APARTMENTS has `rooms` and is the
// snapshot that decides what counts as sold. Neither is derived from the
// other, so the join happens here rather than being duplicated into one file.
const SLIDES: Slide[] = APARTMENT_UNITS.filter((u) => u.sold).map((u) => {
  const row = APARTMENTS.find((a) => a.unit === u.unit);
  return {
    id: u.id,
    unit: u.unit,
    priceNok: u.priceNok,
    rooms: row?.rooms ?? 0,
    m2: u.braM2,
    floor: u.floor,
  };
});

/* ── THE THREE UNIT GLYPHS ───────────────────────────────────────────────
   Drawn here rather than added to FigureIcon: that set is the site's
   institutional vocabulary (building, floors, people, book, globe) and
   these three are furniture-listing marks that belong to one component.
   24x24, stroke 1.5, same weight as the rest of the site's line work. */
function UnitGlyph({ name, className }: { name: 'rooms' | 'area' | 'floor'; className?: string }) {
  const paths = {
    // A bed, seen from the side: headboard, mattress, pillow, two legs.
    rooms: (
      <>
        <path d="M3 8v11" />
        <path d="M3 18h18v-4a3 3 0 0 0-3-3H9" />
        <path d="M21 19v-2" />
        <path d="M6.5 11.5h2" />
      </>
    ),
    // Corner-to-corner arrows: the floor-plan symbol for area.
    area: (
      <>
        <path d="M4 10V4h6" />
        <path d="M20 14v6h-6" />
        <path d="M4 4l7 7" />
        <path d="M20 20l-7-7" />
      </>
    ),
    // A flight of stairs: which floor the flat is on.
    floor: (
      <>
        <path d="M3 20h4v-4h4v-4h4V8h4" />
        <path d="M19 8V4" />
      </>
    ),
  } as const;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {paths[name]}
    </svg>
  );
}

const DWELL_MS = 7000;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

export function ApartmentsSold({ locale }: { locale: string }) {
  const t = useTranslations('apartmentsSold');
  const loc = useLocale() as AppLocale;
  const stats = apartmentStats();
  const reduced = usePrefersReducedMotion();

  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((n: number) => setI(((n % SLIDES.length) + SLIDES.length) % SLIDES.length), []);

  // Advances on its own so all three are seen without asking anything of the
  // visitor, and stops the moment one is given — held covers hover AND focus,
  // so a keyboard user is not fighting a moving target. Off entirely under
  // prefers-reduced-motion: the index still works, it just does not move by
  // itself.
  useEffect(() => {
    if (reduced || held || SLIDES.length < 2) return;
    timer.current = setInterval(() => setI((p) => (p + 1) % SLIDES.length), DWELL_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [reduced, held]);

  if (SLIDES.length === 0) return null;
  const active = SLIDES[i];

  return (
    <section id="solgte-leiligheter" className="bg-dusk py-section-md [@media(min-width:768px)_and_(max-height:900px)]:!py-8">
      {/* ── A WIDER MEASURE, FROM xl UP ───────────────────────────────
           Client, 2026-09-20: "in desktops large screens, why so conjested?
           make it big and all for larger desktop screens".

           SectionBody is max-w-6xl — 1152px — which is a reading measure and
           the right one for every text section on this page. On a 1920
           monitor it left 408px of empty dusk on EACH side of a carousel
           whose whole job is to show a photograph large.

           So the stage widens and nothing else does: 1280 at xl, 1440 at 2xl.
           The head widens with it deliberately — the eyebrow and the CTA are
           the stage's own furniture, and holding them at 1152 while the
           pictures ran wider would read as a mistake rather than a choice.
           Everything above and below this section keeps the 1152 measure.

           GATED ON HEIGHT TOO, and that is not decoration. A MacBook Air is
           1440x900 or 1470x956 — wide enough to trip any plain `xl:`, which
           is exactly the machine the max-w-[1040px] rule above exists for. A
           width-only rule overrode it and undid that work. min-height:901
           keeps the two apart: short screens stay at 1040, tall ones widen.

           min(92vw,90rem) rather than a flat 80rem: at exactly 1280 a flat
           1280 measure left no gutter at all and the stage touched both
           edges. The vw term guarantees a margin at every width and the rem
           term stops it sprawling past 1440 on a 27" monitor.

           !max-w because lib/cn is clsx and merges nothing: without it both
           max-widths ship and the narrower one can win. */}
        <SectionBody className="[@media(min-width:768px)_and_(max-height:900px)]:max-w-[1040px] [@media(min-width:1280px)_and_(min-height:901px)]:!max-w-[min(92vw,90rem)]">
        {/* Head. The count is the argument, so it is the headline — and it is
           read from the data, never typed: sell a fourth flat and this
           sentence rewrites itself. */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow tone="gold" className="mb-4">{t('eyebrow')}</Eyebrow>
            <h2
              className="display-opsz max-w-[20ch] font-serif text-balance text-paper"
              style={{
                fontSize: 'clamp(2rem, 4.4vw, 3.5rem)',
                lineHeight: 1.12,
                fontWeight: 600,
                letterSpacing: '-0.015em',
                margin: 0,
              }}
            >
              {t.rich('heading', {
                sold: stats.sold,
                total: stats.total,
                em: (c) => <Accent surface="dusk">{c}</Accent>,
              })}
            </h2>
          </div>
          {/* Same pill as the bar's "Gi en gave" and as the one under the
             activities grid. ONE difference, and it is forced: this sits on
             DUSK, so hovering to `ink` would be a near-invisible move from one
             dark to another. It lifts to the brighter `gold` instead — the
             same idea (the button reacts) in the value the ground allows. */}
          <LinkVT
            href={`/${locale}/moskeprosjektet/leiligheter`}
            className="group/cta inline-flex min-h-11 items-center gap-2.5 rounded-full bg-gold-deep px-5 py-2.5 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-paper transition-colors duration-200 ease-out hover:bg-gold hover:text-dusk active:scale-[0.99]"
          >
            {t('cta', { n: stats.available })}
            <span
              aria-hidden
              className="inline-block transition-transform duration-200 group-hover/cta:translate-x-0.5 rtl:rotate-180 rtl:group-hover/cta:-translate-x-0.5"
            >
              →
            </span>
          </LinkVT>
        </div>

        {/* ── THE STAGE ──────────────────────────────────────────────────
           One flat at a time, as large as the container allows. Every slide
           is mounted and cross-faded on opacity rather than swapped, because
           swapping `src` shows a blank frame while the next file decodes —
           and next/image will have all three in cache after the first cycle.
           
           On a 13/14" laptop the stage goes 16:9 -> 2:1. At 16:9 the whole
           section measured 966px against ~800 of viewport; a wider, shallower
           frame is the only lever that buys real height without shrinking the
           render, and a 2:1 crop of a 16:9 interior loses ceiling and floor,
           which is the least of what these images are showing.
           
           The incoming frame settles from 1.04 to 1. It is the one piece of
           movement in the section and it is doing a job: it separates "a new
           picture" from "the same picture, redrawn". */}
        <div
          className="mt-10 grid gap-4 md:mt-12 lg:grid-cols-[6.5rem_minmax(0,1fr)_15.5rem] lg:items-stretch [@media(min-width:1280px)_and_(min-height:901px)]:gap-5 [@media(min-width:1280px)_and_(min-height:901px)]:grid-cols-[7.5rem_minmax(0,1fr)_18rem] [@media(min-width:1700px)_and_(min-height:901px)]:gap-6 [@media(min-width:1700px)_and_(min-height:901px)]:grid-cols-[8.5rem_minmax(0,1fr)_20rem] [@media(min-width:768px)_and_(max-height:900px)]:!mt-7"
          onMouseEnter={() => setHeld(true)}
          onMouseLeave={() => setHeld(false)}
          onFocusCapture={() => setHeld(true)}
          onBlurCapture={() => setHeld(false)}
        >
          {/* ── THE RAIL ────────────────────────────────────────────────
             Three thumbnails and a pair of steppers. lg and up only: at
             104px a thumbnail is already near the floor of useful, and
             below lg the column would have to shrink past it. The strip
             under the stage carries the same three on small screens, so
             nothing is lost — the rail is the desktop affordance. */}
          <div className="hidden flex-col lg:flex">
            <ul className="flex flex-col gap-2.5 [@media(min-width:1280px)_and_(min-height:901px)]:gap-3">
              {SLIDES.map((s, n) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => go(n)}
                    aria-label={s.unit}
                    aria-current={n === i ? 'true' : undefined}
                    className={cn(
                      'group/th relative block aspect-[4/3] w-full overflow-hidden rounded-xl ring-1 transition-[box-shadow,opacity] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
                      n === i
                        ? 'opacity-100 ring-gold shadow-[0_0_0_1px_rgba(192,161,101,0.45),0_8px_24px_-12px_rgba(0,0,0,0.8)]'
                        : 'opacity-55 ring-paper/12 hover:opacity-85 hover:ring-paper/25',
                    )}
                  >
                    <Image
                      src={unitFace(s.id)}
                      alt=""
                      fill
                      sizes="104px"
                      loading="eager"
                      className="object-cover"
                    />
                  </button>
                </li>
              ))}
            </ul>

            {/* Steppers. They repeat what the rail and the strip already do,
               which is the mock's call, not a discovery of mine — but they
               are the only control here that does not need you to know which
               flat you want next, so they earn the space. */}
            <div className="mt-5 flex flex-col items-center gap-2.5">
              {([['prev', -1], ['next', 1]] as const).map(([dir, step]) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => go(i + step)}
                  aria-label={dir === 'prev' ? t('eyebrow') + ' ←' : t('eyebrow') + ' →'}
                  className="grid h-9 w-9 place-items-center rounded-full ring-1 ring-paper/15 text-paper/70 transition-colors duration-200 hover:bg-paper/[0.06] hover:text-paper hover:ring-paper/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                    <path d={dir === 'prev' ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* ── THE HERO ───────────────────────────────────────────────── */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-ink sm:aspect-[16/10] lg:aspect-auto lg:min-h-[26rem] [@media(min-width:1280px)_and_(min-height:901px)]:min-h-[31rem] [@media(min-width:1700px)_and_(min-height:901px)]:min-h-[35rem] [@media(min-width:768px)_and_(max-height:900px)]:!min-h-[21rem]">
          {SLIDES.map((s, n) => (
            <Image
              key={s.id}
              src={unitFace(s.id)}
              alt=""
              fill
              priority={n === 0}
              // eager on the rest, not just the first. Every slide is mounted
              // and cross-faded on opacity, so the inactive ones are painted
              // but invisible — and a lazily-loaded image that is never in
              // view never gets requested at all. The result was a blank dark
              // plate the moment the carousel advanced past the priority
              // slide. Three interior renders is not a budget worth being
              // clever about.
              loading={n === 0 ? undefined : 'eager'}
              sizes="(min-width: 1024px) 66vw, 100vw"
              className={cn(
                'object-cover transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
                n === i ? 'scale-100 opacity-100' : 'scale-[1.04] opacity-0',
              )}
            />
          ))}

          {/* Legibility, not decoration: the type below sits on whatever the
             render happens to be doing there. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(22,36,46,0.30) 0%, rgba(22,36,46,0) 26%, rgba(22,36,46,0.10) 48%, rgba(22,36,46,0.72) 78%, rgba(22,36,46,0.92) 100%)',
            }}
          />

          {/* The stamp, same instrument as the rail's. */}
          <span className="absolute start-5 top-5 z-10 -rotate-[8deg] rounded-[2px] border border-gold/70 bg-dusk/85 px-3 py-1.5 font-mono text-[0.625rem] font-medium uppercase leading-none tracking-[0.32em] text-gold-soft shadow-[0_4px_16px_-6px_rgba(22,36,46,0.85)] backdrop-blur-[8px] rtl:rotate-[8deg] sm:px-3.5 sm:py-2 sm:text-[0.6875rem]">
            {t('stamp')}
          </span>

          {/* The facts, keyed so they re-mount and re-run their reveal when
             the slide changes. */}
          <div key={active.unit} className="absolute inset-x-0 bottom-0 z-10 p-6 text-start sm:p-8">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.28em] text-gold-soft">
              {active.unit}
            </p>
            <p className="mt-3 font-serif text-[clamp(2rem,4.6vw,3.25rem)] leading-none text-paper">
              {formatAmount(loc, active.priceNok)}{' '}
              <span className="font-sans text-[0.42em] tracking-wide text-paper/70">kr</span>
            </p>
            {/* The three facts as marked items rather than one dotted line.
               Same content the `meta` string carried; the glyphs let the eye
               take all three at once instead of reading a sentence. `meta`
               stays in the message files — the strip and the panel below
               both still want the one-line form on small screens. */}
            <ul className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
              {[
                { g: 'rooms' as const, label: t('rooms', { n: active.rooms }) },
                { g: 'area' as const, label: t('area', { m2: active.m2 }) },
                { g: 'floor' as const, label: t('floorLabel', { floor: active.floor }) },
              ].map((f) => (
                <li key={f.g} className="flex items-center gap-2 text-paper/85">
                  <UnitGlyph name={f.g} className="h-[18px] w-[18px] shrink-0 text-gold-soft/90" />
                  <span className="font-mono text-[0.6875rem] tracking-[0.12em]">{f.label}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

          {/* ── THE DETAIL PANEL ────────────────────────────────────────
             The same three facts as the overlay, set as a list rather than a
             row, plus the only link out of the stage. It is not redundant
             with the overlay: the overlay sits on a photograph and has to
             survive whatever is behind it, so it can never be more than a
             few words. This is on a flat ground and can carry a button.

             lg and up, like the rail — below that the overlay is the whole
             story and the section's CTA is a thumb-reach away. */}
          <div className="hidden flex-col rounded-2xl bg-paper/[0.04] p-6 ring-1 ring-paper/10 lg:flex [@media(min-width:1280px)_and_(min-height:901px)]:p-7 [@media(min-width:1700px)_and_(min-height:901px)]:p-8">
            {/* my-auto: with the button gone the panel had ~90px of dead
               space between the last fact and the dots, because the facts
               were pinned to the top and the dots to the foot. Centring the
               block splits that space above and below it, which reads as
               room rather than as something missing. */}
            <div className="my-auto">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.28em] text-gold-soft">
              {active.unit}
            </p>
            <p className="mt-3 font-serif text-[1.875rem] leading-none text-paper [@media(min-width:1280px)_and_(min-height:901px)]:text-[2.25rem] [@media(min-width:1700px)_and_(min-height:901px)]:text-[2.5rem]">
              {formatAmount(loc, active.priceNok)}{' '}
              <span className="font-sans text-[0.45em] tracking-wide text-paper/70">kr</span>
            </p>

            <span aria-hidden className="mt-5 block h-px w-10 bg-gold/60" />

            <ul className="mt-5 space-y-3.5 [@media(min-width:1280px)_and_(min-height:901px)]:mt-6 [@media(min-width:1280px)_and_(min-height:901px)]:space-y-4">
              {[
                { g: 'rooms' as const, label: t('rooms', { n: active.rooms }) },
                { g: 'area' as const, label: t('area', { m2: active.m2 }) },
                { g: 'floor' as const, label: t('floorLabel', { floor: active.floor }) },
              ].map((f) => (
                <li key={f.g} className="flex items-center gap-3 text-paper/85">
                  <UnitGlyph name={f.g} className="h-[18px] w-[18px] shrink-0 text-gold-soft/90" />
                  <span className="text-[0.9375rem]">{f.label}</span>
                </li>
              ))}
            </ul>
            </div>

            {/* Three dots for three flats. The mock drew five, which is the
               kind of thing a generated image does — there are three sold
               units and the count is read from the data everywhere else on
               this page, so five would be the one number here that was
               decoration. */}
            <div className="flex items-center gap-2 pt-6">
              {SLIDES.map((s, n) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(n)}
                  aria-label={s.unit}
                  aria-current={n === i ? 'true' : undefined}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
                    n === i ? 'w-6 bg-gold' : 'w-1.5 bg-paper/25 hover:bg-paper/50',
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── THE INDEX ──────────────────────────────────────────────────
           Real buttons, so this is keyboard-operable and announces state; the
           gold rule GROWS from zero under the active one rather than sliding
           between positions. A sliding bar has to measure its targets and
           re-measure on every resize and font swap; a per-item rule reads the
           same and cannot fall out of sync with the thing it underlines. */}
        <ul className="mt-6 grid grid-cols-3 gap-3 sm:gap-5 md:mt-8 [@media(min-width:768px)_and_(max-height:900px)]:!mt-5">
          {SLIDES.map((s, n) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => go(n)}
                onMouseEnter={() => { setHeld(true); go(n); }}
                onMouseLeave={() => setHeld(false)}
                onFocus={() => { setHeld(true); go(n); }}
                onBlur={() => setHeld(false)}
                aria-current={n === i ? 'true' : undefined}
                className="group/idx block w-full text-start focus-visible:outline-none"
              >
                <span aria-hidden className="relative block h-px w-full bg-paper/15">
                  <span
                    className={cn(
                      'absolute inset-y-0 start-0 bg-gold transition-[width] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
                      n === i ? 'w-full' : 'w-0 group-hover/idx:w-1/3 group-focus-visible/idx:w-1/3',
                    )}
                  />
                </span>
                <span
                  className={cn(
                    'mt-3 block font-mono text-[0.6875rem] uppercase tracking-[0.2em] transition-colors duration-300',
                    n === i ? 'text-paper' : 'text-dusk-60 group-hover/idx:text-paper/80',
                  )}
                >
                  {s.unit}
                </span>
                <span
                  className={cn(
                    'mt-1 block font-mono text-[0.625rem] tracking-[0.12em] transition-colors duration-300',
                    n === i ? 'text-gold-soft/80' : 'text-dusk-60/60',
                  )}
                >
                  {t('rooms', { n: s.rooms })}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </SectionBody>
    </section>
  );
}
