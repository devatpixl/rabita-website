'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useInView, useReducedMotion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { GIFTS } from '@/lib/gifts';
import { formatAmount } from '@/lib/format';
import type { AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/cn';
import { Accent } from './accent';
import { Reveal } from './reveal';
import { SectionBody } from './primitives';
import { openGiveSheet } from './giving-sheet';

// What your gift builds — the costed items, as a rail of plates you page
// through, on dusk to break the run of paper sections.
//
// Sized to a laptop. At the reference's proportions this section came to
// 999px, which is 209 more than a 13" Air has and meant scrolling the best
// part of a screen to reach the ask (client, 2026-09-13: "we need to scroll
// a lot to see shit fully, the cta at end"). The height came off the padding,
// the gaps and — mostly — the cards, rather than from moving the CTA out of
// the closing position, which is where the reference puts it and where it
// reads as the point of the section rather than a button in a header.
//
// Rebuilt to the client's reference (2026-09-13). Against the four-across
// grid this was:
//
//   - the head splits: the heading keeps the left, and a lede takes the
//     right behind a gold rule, so the section opens like a spread rather
//     than a column;
//   - the cards become a RAIL with one of them current. The current card
//     stands taller than its neighbours, takes a gold edge, loses the dim,
//     and is the only one showing the ask;
//   - arrows sit outside the rail and dots under it;
//   - a closing line and two ways on — choose an amount, or see every way
//     to give — because a ladder that ends in silence is a dead end.
//
// The tiers are NOT the reference's. Its six are round numbers with generic
// names; ours are four real costed units — 1 200 m2 of floor, 60 shelves,
// 120 desks, 48 facade panels — and lib/gifts.ts says plainly that inventing
// numbers on a mosque fundraising page is not acceptable. So the design is
// copied and the content is ours.

const GRADE = 'saturate(0.72) contrast(1.12) brightness(0.9)';

const SHOTS: Record<string, string> = {
  prayer: '/photos/gift-prayer.webp',
  // Client-supplied, 2026-09-13. The shot it replaces was an open Qur'an
  // lying flat on a rug; this one is on a rehal, which reads as a library
  // rather than as a prayer hall — the tier is a shelf section.
  //
  // It is 347x356, well under the 1200x900 of the other three. In a 304px
  // card that is fine at 1x and soft at 2x, so a larger original is worth
  // asking for. Kept at native size rather than upscaled: upscaling adds
  // bytes without adding detail.
  shelf: '/photos/gift-quran.webp',
  desk: '/photos/gift-school.webp',
  panel: '/photos/gift-facade.webp',
};

/** Runs a figure up once the rail is on screen, and back to nothing on the way out. */
function Amount({
  to,
  live,
  still,
  delay,
  locale,
}: {
  to: number;
  live: boolean;
  still: boolean;
  delay: number;
  locale: AppLocale;
}) {
  // Starts at the REAL figure, and only drops to zero from inside the first
  // animation frame. So if rAF never runs — a throttled tab, a dead observer,
  // hydration that failed — the price on screen is still the price. This is a
  // donation page: a counter that fails should cost the flourish, not show
  // "0 kr". The same reason components/reveal.tsx exists.
  const [shown, setShown] = useState(to);
  const ran = useRef(false);

  useEffect(() => {
    if (still || !live || ran.current) return;
    ran.current = true;
    let raf = 0;
    let start = 0;
    const run = (now: number) => {
      if (!start) {
        start = now;
        setShown(0);
      }
      const k = Math.min(1, (now - start - delay) / 900);
      if (k > 0) setShown(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [live, still, to, delay]);

  return <>{formatAmount(locale, shown)}</>;
}

export function GiftBuilds() {
  const t = useTranslations('giftLadder');
  const locale = useLocale() as AppLocale;
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const still = mounted && reduced === true;

  const root = useRef<HTMLDivElement>(null);
  const live = useInView(root, { margin: '-15% 0px' });

  const n = GIFTS.length;
  const [active, setActive] = useState(0);
  const go = useCallback((to: number) => setActive(((to % n) + n) % n), [n]);

  // Bring the current card into the rail's own view. `nearest` rather than
  // `center`, so selecting a card already fully on screen does not jolt the
  // whole rail sideways to centre it.
  const railRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const el = railRef.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'nearest', inline: 'nearest' });
  }, [active, still]);

  return (
    <section
      id="hva-din-gave-bygger"
      aria-labelledby="gift-builds-heading"
      className="bg-dusk py-12 text-paper"
    >
      <SectionBody>
        {/* The head, as a spread: heading left, lede right behind a rule. */}
        <div className="grid gap-6 lg:grid-cols-12 lg:items-start lg:gap-12">
          <div className="lg:col-span-7">
            <p className="flex items-center gap-3 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold">
              <span aria-hidden className="h-px w-7 shrink-0 bg-gold/70" />
              {t('eyebrow')}
            </p>
            <h2
              id="gift-builds-heading"
              className="mt-5 font-serif text-section text-balance text-paper"
            >
              {t.rich('heading', {
                em: (chunks) => <Accent surface="dusk">{chunks}</Accent>,
              })}
            </h2>
          </div>
          <div className="lg:col-span-5 lg:border-s lg:border-gold/30 lg:ps-8 lg:pt-3">
            <p className="max-w-[42ch] text-body text-paper/70">{t('lede')}</p>
          </div>
        </div>

        <div ref={root} className="relative mt-10">
          {/* Arrows in the page gutter, not over the cards. -inset-x-2 put
             them ON the first and last card, covering their titles. The
             section body is max-w-6xl centred, so the gutter is 64px at the
             xl breakpoint where these appear and grows from there: at -3.5rem
             an arrow ends 8px clear of the rail at 1280 and 48px clear at
             1920. Below xl there is no gutter to use and the rail swipes. */}
          <div className="pointer-events-none absolute inset-y-0 -inset-x-14 z-20 hidden items-center justify-between xl:flex">
            <RailArrow dir="prev" label={t('prev')} onClick={() => go(active - 1)} />
            <RailArrow dir="next" label={t('next')} onClick={() => go(active + 1)} />
          </div>

          {/* items-end so the cards share a baseline and the current one
             grows UPWARD out of the row rather than shunting the rest. */}
          <ul
            ref={railRef}
            className="no-scrollbar -mx-1 flex snap-x snap-mandatory items-end gap-4 overflow-x-auto px-1 pb-2 pt-5 sm:gap-5"
          >
            {GIFTS.map((g, i) => {
              const on = i === active;
              // Reveal, not a motion initial={{opacity:0}}. That pattern
              // server-renders opacity:0 into the HTML, and if the observer
              // never fires the card is simply gone — which is how the
              // services page shipped blank on 2026-08-31. Reveal starts
              // VISIBLE and only hides once it has confirmed JS is running.
              // See components/reveal.tsx.
              return (
                <Reveal
                  as="li"
                  key={g.key}
                  delay={i * 0.09}
                  className="w-[76%] shrink-0 snap-center sm:w-[19rem] lg:w-[17.5rem] xl:w-[19rem]"
                >
                  <div className="rv-up">
                    <button
                      type="button"
                      onClick={() => (on ? openGiveSheet(g.amountNok) : go(i))}
                      aria-current={on ? 'true' : undefined}
                      aria-label={`${formatAmount(locale, g.amountNok)} kr · ${t(`items.${g.key}.title`)}`}
                      className={cn(
                        'group relative block w-full overflow-hidden rounded-2xl text-start transition-[height,box-shadow,opacity] duration-500 ease-out',
                        // The current card is taller. Height, not scale: a
                        // scaled card blurs its own photograph and its text.
                        on
                          ? 'h-[23rem] opacity-100 ring-1 ring-gold/70'
                          : 'h-[20rem] opacity-70 ring-1 ring-paper/10 hover:opacity-95',
                      )}
                    >
                      <Image
                        src={SHOTS[g.key]}
                        alt={t(`alt.${g.key}`)}
                        fill
                        sizes="(min-width: 640px) 20rem, 80vw"
                        loading="eager"
                        className="object-cover transition-transform duration-[1.1s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                        style={{ filter: GRADE }}
                      />

                      {/* Deep enough to carry four lines of type at the foot.
                         The current card's is stronger: it carries a button
                         as well, and it is the one being read. */}
                      <span
                        aria-hidden
                        className="absolute inset-0 transition-opacity duration-500"
                        style={{
                          background: on
                            ? 'linear-gradient(180deg, rgba(22,36,46,0.1) 0%, rgba(22,36,46,0.55) 38%, rgba(22,36,46,0.95) 78%, rgba(22,36,46,0.98) 100%)'
                            : 'linear-gradient(180deg, rgba(22,36,46,0.25) 0%, rgba(22,36,46,0.6) 40%, rgba(22,36,46,0.93) 80%, rgba(22,36,46,0.97) 100%)',
                        }}
                      />

                      <span className="absolute inset-x-0 bottom-0 block p-4">
                        <span className="mb-3 flex items-center gap-2.5">
                          <span
                            className={cn(
                              'font-mono text-[0.6875rem] uppercase tracking-[0.16em] transition-colors',
                              on ? 'text-gold' : 'text-paper/55',
                            )}
                          >
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span
                            aria-hidden
                            className={cn(
                              'h-px w-6 transition-colors',
                              on ? 'bg-gold/70' : 'bg-paper/25',
                            )}
                          />
                        </span>

                        <span className="block font-serif text-[clamp(1.6rem,2.4vw,2.1rem)] leading-none tabular-nums text-gold">
                          <Amount to={g.amountNok} live={live} still={still} delay={i * 90} locale={locale} />{' '}
                          <span className="text-[0.55em] text-paper/70">kr</span>
                        </span>

                        <span className="mt-3 block font-serif text-card text-paper">
                          {t(`items.${g.key}.title`)}
                        </span>
                        <span className="mt-2 block text-[13.5px] leading-relaxed text-paper/65">
                          {t(`items.${g.key}.meta`)}
                        </span>

                        {/* The ask, on the current card only — the reference
                           puts it there, and it is also the honest place: on
                           every card it would be four asks and no choice. */}
                        <span
                          className={cn(
                            'mt-4 inline-flex min-h-10 items-center gap-2.5 rounded-full border px-4 text-[14px] transition-all duration-300',
                            on
                              ? 'translate-y-0 border-gold/60 bg-gold/10 text-paper opacity-100 group-hover:bg-gold group-hover:text-dusk'
                              : 'pointer-events-none translate-y-2 border-transparent opacity-0',
                          )}
                        >
                          {t('cta')}
                          <span aria-hidden className="rtl:-scale-x-100">&rarr;</span>
                        </span>
                      </span>
                    </button>
                  </div>
                </Reveal>
              );
            })}
          </ul>

          {/* Position, and the way to move without a swipe. */}
          <ol className="mt-4 flex items-center justify-center gap-2" aria-label={t('eyebrow')}>
            {GIFTS.map((g, i) => (
              <li key={g.key}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`${formatAmount(locale, g.amountNok)} kr`}
                  aria-current={i === active ? 'true' : undefined}
                  className="grid h-8 w-7 place-items-center"
                >
                  <span
                    className={cn(
                      'block h-[2px] rounded-full transition-all duration-300',
                      i === active ? 'w-6 bg-gold' : 'w-3 bg-paper/25',
                    )}
                  />
                </button>
              </li>
            ))}
          </ol>

          {/* The way on. A ladder that ends in silence is a dead end. */}
          <div className="mt-8 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:gap-5">
            <button
              type="button"
              onClick={() => openGiveSheet(GIFTS[active].amountNok)}
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-gold px-6 text-[15px] font-semibold text-dusk transition-colors hover:bg-paper"
            >
              {t('cta')}
              <span aria-hidden className="rtl:-scale-x-100">&rarr;</span>
            </button>
            <Link
              href={`/${locale}/gi-en-gave`}
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-paper/30 px-6 text-[15px] text-paper transition-colors hover:border-gold hover:text-gold"
            >
              {t('ctaAll')}
              <span aria-hidden className="rtl:-scale-x-100">&rarr;</span>
            </Link>
          </div>

          <p className="mt-6 text-center text-[13.5px] text-paper/55">{t('footnote')}</p>
        </div>
      </SectionBody>
    </section>
  );
}

function RailArrow({ dir, label, onClick }: { dir: 'prev' | 'next'; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-paper/30 bg-dusk/70 text-paper backdrop-blur-sm transition-colors hover:border-gold hover:bg-gold hover:text-dusk"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn('h-4 w-4', dir === 'prev' ? 'rtl:rotate-180' : 'rotate-180 rtl:rotate-0')} aria-hidden>
        <path d="M15 5l-7 7 7 7" />
      </svg>
    </button>
  );
}
