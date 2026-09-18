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
      <SectionBody className="[@media(min-width:768px)_and_(max-height:900px)]:max-w-[1040px]">
        {/* Head. The count is the argument, so it is the headline — and it is
           read from the data, never typed: sell a fourth flat and this
           sentence rewrites itself. */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow tone="gold" bar={false} className="mb-4">{t('eyebrow')}</Eyebrow>
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
          className="relative mt-10 aspect-[4/3] w-full overflow-hidden rounded-2xl bg-ink sm:aspect-[16/10] lg:aspect-[16/9] md:mt-12 [@media(min-width:768px)_and_(max-height:900px)]:!mt-7 [@media(min-width:768px)_and_(max-height:900px)]:!aspect-[2/1]"
          onMouseEnter={() => setHeld(true)}
          onMouseLeave={() => setHeld(false)}
          onFocusCapture={() => setHeld(true)}
          onBlurCapture={() => setHeld(false)}
        >
          {SLIDES.map((s, n) => (
            <Image
              key={s.id}
              src={unitFace(s.id)}
              alt=""
              fill
              priority={n === 0}
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
            <p className="mt-3 font-mono text-[0.6875rem] tracking-[0.12em] text-paper/70">
              {t('meta', { rooms: active.rooms, m2: active.m2, floor: active.floor })}
            </p>
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
