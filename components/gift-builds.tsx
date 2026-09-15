'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
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

// No brightness cut since 2026-09-15 ("can barely see anything bro, why soo
// much tint on photos?"). Three layers were darkening these cards at once —
// this filter, the gradient veil over it, and opacity-70 on the whole
// inactive card compositing against a dark section ground. Multiplied out, an
// inactive card was showing its photograph at about 47% of true brightness at
// the TOP and roughly 10% further down. Saturation and contrast stay: they
// are what keeps nine different photographs looking like one set.
const GRADE = 'saturate(0.82) contrast(1.06)';

// A tier with no photograph renders a plain tinted plate instead — the card
// is a full-bleed image with type over a gradient, so a missing file would
// otherwise be an empty dark rectangle.
//
// ONE LEVEL IS STILL WAITING FOR A PICTURE: block (5 000 kr, "Byggesteinen").
// The library has nothing honest for it. The only structural image is
// fremdrift/construction.webp, which is an isometric CAD cutaway rather than
// a photograph — it would be the one drawing among eight photographs, and
// this card applies a photographic grade to whatever it is given. A real
// construction or masonry shot is the fix. Drop the file in below and
// nothing else has to change.
//
// NOT family-together.webp, whatever the filename suggests: it is a picture
// of a political demonstration — children at a rally with a placard and
// flags — and putting it on a donation level would attach a political
// statement to a fundraising tier. Checked 2026-09-15. Nor
// give-dedication.webp, which is a macaw sitting on somebody's head.
const SHOTS: Record<string, string | undefined> = {
  // One figure in sujud, alone in the hall under the chandelier. Client,
  // 2026-09-15: "doesnt maek sense the image here" — this level had
  // gift-prayer.webp, a single ornate prayer rug, and he was right twice
  // over. A rug does not say "for yourself", and a flat textile pattern was
  // the one graphic among eight photographs of people and places, which is
  // why it read as an outlier even before you asked what it meant.
  //
  // It says the thing the level is named for: one person, taking part.
  //
  // BUT ITS FIGURE IS TOO LOW, and this is the honest state of it. The man in
  // sujud sits at 74% of the frame, and this card is near-opaque below 60%
  // because that is where the type lives — measured text positions are in the
  // gradient note below. object-position cannot rescue it: the source is
  // 800x1200 against a 304x408 card, so cover trims only 48px and the best a
  // bottom position reaches is 71%, still under a 0.93 veil. What you see on
  // the card is the chandelier and the stone; the man is a smudge.
  //
  // It stays for now because a warm mosque interior beats a rug that meant
  // nothing, which is what he objected to. The real fix is one photograph.
  //
  // THE RULE THIS CARD IMPLIES, for whoever picks the next one: the subject
  // must be in the TOP THIRD. Anything below 60% is under the text panel. The
  // library was searched on 2026-09-15 — a dozen files opened, not trusted by
  // filename — and nothing in it shows a single person taking part, framed
  // high. gift-prayer.webp is unused again.
  self: '/photos/daily-prayer-sujud.webp',
  // An open Qur'an on a rug — dropped from `shelf` on 2026-09-13 for reading
  // as a prayer hall rather than a library, and exactly what "Koran" wants.
  quran: '/photos/gift-library.webp',
  // A couple at an outdoor table with dates and water — a household breaking
  // fast together, which is what this level is named for. Also closes
  // /arrangementer, so it is not exclusive to this card; different page, far
  // apart, and the alternative was no picture at all.
  family: '/photos/visit-eid.webp',
  block: undefined,
  // The street iftar under the Grønland overpass: long tables, bunting, the
  // congregation eating together. 1920x1280 and referenced nowhere else on
  // the site — it is the friends of Rabita, at Rabita's own event.
  friends: '/photos/brand-gateiftar.webp',
  // Client-supplied, 2026-09-13. The shot it replaces was a single red
  // prayer rug, which reads as one mat; this tier buys a square metre of
  // the HALL floor, and a carpeted hall running away between the columns
  // is what that actually looks like.
  prayer: '/photos/gift-prayer-floor.webp',
  // Client-supplied, 2026-09-13. The shot it replaces was an open Qur'an
  // lying flat on a rug; this one is on a rehal, which reads as a library
  // rather than as a prayer hall — the tier is a shelf section.
  //
  // It is 347x356, well under the 1200x900 of the other three. In a 304px
  // card that is fine at 1x and soft at 2x, so a larger original is worth
  // asking for. Kept at native size rather than upscaled: upscaling adds
  // bytes without adding detail.
  shelf: '/photos/gift-quran.webp',
  // Client, 2026-09-15: "instead of this photo, use this one ... its much
  // better". The shot it replaces was a packed hall of adults, which is a
  // lecture, not a school. This is a classroom with desks and children at
  // them — the thing the level actually buys. 900x1200, and its 0.75 is
  // almost exactly this card's own 0.745, so cover barely crops it.
  desk: '/photos/community/youth-table.webp',
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

  // Bring the current card into the rail's own view — and ONLY the rail's.
  //
  // This was el.scrollIntoView(), which walks up and scrolls every scrollable
  // ancestor, the document included. It ran on mount with active = 0, so
  // opening /moskeprosjektet dropped the reader straight down the page to
  // this section (client, 2026-09-13: "when i open moske project, i am taken
  // here, why not stay at top"). `block: 'nearest'` does not save you: the
  // card is nowhere near the viewport at mount, so nearest is still a scroll.
  //
  // So: the rail's own scrollLeft, which cannot move the page, and a guard
  // that skips the first run because on mount there is nothing to bring into
  // view — card 0 is already where the rail starts.
  const railRef = useRef<HTMLUListElement>(null);
  const railMounted = useRef(false);
  useEffect(() => {
    if (!railMounted.current) {
      railMounted.current = true;
      return;
    }
    const rail = railRef.current;
    const el = rail?.children[active] as HTMLElement | undefined;
    if (!rail || !el) return;
    const left = el.offsetLeft - rail.offsetLeft;
    const right = left + el.offsetWidth;
    const behavior: ScrollBehavior = still ? 'auto' : 'smooth';
    // Nudge only if the card is not already fully in the rail, and leave a
    // little air so it does not sit flush against the edge.
    if (left < rail.scrollLeft) rail.scrollTo({ left: Math.max(0, left - 16), behavior });
    else if (right > rail.scrollLeft + rail.clientWidth)
      rail.scrollTo({ left: right - rail.clientWidth + 16, behavior });
  }, [active, still]);

  return (
    <section
      id="hva-din-gave-bygger"
      aria-labelledby="gift-builds-heading"
      className="relative isolate overflow-hidden bg-dusk py-14 text-paper"
    >
      {/* The ground is a photograph, not a colour (client, 2026-09-13). It
         stays behind the section rather than scrolling with the page, and
         bg-dusk underneath is only the colour it falls back to while the
         file loads — not a panel the picture sits on. */}
      <Image
        src="/photos/gift-bg.webp"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        // eager, not lazy. This is the section's ground, not a picture in
        // it: lazily loaded it arrives after the reader does, and the
        // section flashes flat dusk first. 72KB is a fair price for the
        // thing the whole treatment rests on. Not `priority` — that
        // preloads for LCP, and this is well below the fold.
        loading="eager"
        className="-z-10 select-none object-cover object-center"
        draggable={false}
      />
      {/* One wash, in the section's own dusk so it reads as shade rather
         than as a grey sheet. Strongest at the head and the foot, where
         type sits directly on it, and lightest across the middle third —
         that is where the cards are, and they carry their own gradients,
         so the room behind them can stay legible. The photograph is
         already near-dusk in the centre and keeps its warm light at the
         edges: the mashrabiya on the left, the chandelier and the arch on
         the right. Those are the whole point of using it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, rgba(22,36,46,0.86) 0%, rgba(22,36,46,0.62) 20%, rgba(22,36,46,0.5) 52%, rgba(22,36,46,0.72) 84%, rgba(22,36,46,0.88) 100%)',
        }}
      />
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
                          ? 'h-[27rem] opacity-100 ring-1 ring-gold/70 sm:h-[29rem]'
                          : 'h-[24rem] opacity-[0.92] ring-1 ring-paper/10 hover:opacity-100 sm:h-[25.5rem]',
                      )}
                    >
                      {SHOTS[g.key] ? (
                        <Image
                          src={SHOTS[g.key] as string}
                          alt={t(`alt.${g.key}`)}
                          fill
                          sizes="(min-width: 640px) 20rem, 80vw"
                          loading="eager"
                          className={cn(
                            'object-cover transition-transform duration-[1.1s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]',
                            // Y position is INERT on every card but this one:
                            // the rest are wider than 0.745 so cover crops
                            // their width. daily-prayer-sujud is 800x1200 and
                            // shows 89% of its frame, so bottom is the 11%
                            // that lifts its figure as high as it can go.
                            g.key === 'self' ? 'object-bottom' : 'object-center',
                          )}
                          style={{ filter: GRADE }}
                        />
                      ) : (
                        <span
                          aria-hidden
                          className="absolute inset-0"
                          style={{
                            background:
                              'linear-gradient(155deg, #1f3440 0%, #16242e 55%, #101c24 100%)',
                          }}
                        />
                      )}

                      {/* LIGHTER AT THE FOOT since 2026-09-15 ("the person is
                         behind the text", "maybe lighten the tint at bottom
                         also so clearly shows the image"). It tops out at 0.78
                         now instead of 0.97.
                         
                         He also asked to move the images down so the bottom
                         shows, and that turned out to be the same complaint
                         rather than a second one: on SEVEN of the eight cards
                         nothing is cropped off the bottom at all. Those photos
                         are wider than the card's 0.745, so cover crops their
                         WIDTH and the full height is already on screen —
                         object-position Y is inert on them. The bottom of each
                         picture was never missing, it was under this veil.
                         
                         Contrast moves to the type instead. A blanket dark
                         enough for 13.5px text is dark enough to hide a
                         photograph; a shadow on the glyphs buys the same
                         legibility over the few hundred pixels that need it
                         and leaves the rest of the frame alone. Text positions
                         measured: eyebrow 43%, amount 50%, title 61%, meta
                         70%. Re-measure if the block grows a line. */}
                      <span
                        aria-hidden
                        className="absolute inset-0 transition-opacity duration-500"
                        style={{
                          background: on
                            ? 'linear-gradient(180deg, rgba(22,36,46,0) 0%, rgba(22,36,46,0) 34%, rgba(22,36,46,0.30) 48%, rgba(22,36,46,0.58) 64%, rgba(22,36,46,0.74) 84%, rgba(22,36,46,0.78) 100%)'
                            : 'linear-gradient(180deg, rgba(22,36,46,0.04) 0%, rgba(22,36,46,0.06) 34%, rgba(22,36,46,0.34) 48%, rgba(22,36,46,0.62) 64%, rgba(22,36,46,0.76) 84%, rgba(22,36,46,0.80) 100%)',
                        }}
                      />

                      <span
                        className="absolute inset-x-0 bottom-0 block p-5"
                        // Local contrast, so the veil above does not have to
                        // be a blanket. Two shadows: a tight one that pins the
                        // glyph edges and a wide soft one that darkens the few
                        // pixels around them. Costs nothing on a dark photo
                        // and rescues the type on a bright one.
                        style={{ textShadow: '0 1px 2px rgba(22,36,46,0.95), 0 2px 12px rgba(22,36,46,0.8)' }}
                      >
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
                        <span className="mt-2 block text-[13.5px] leading-relaxed text-paper/80">
                          {t(`items.${g.key}.meta`)}
                        </span>

                        {/* The ask, on the current card only — the reference
                           puts it there, and it is also the honest place: on
                           every card it would be four asks and no choice. */}
                        <span
                          className={cn(
                            'mt-5 inline-flex min-h-10 items-center gap-2.5 rounded-full border px-4 text-[14px] transition-all duration-300',
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

          {/* No dots and no closing CTA row here (client, 2026-09-13:
             "just remove these and keep page like before"). The rail is
             paged by its arrows, by clicking a card, and by swipe; the ask
             is the button on the current card, which is where the reference
             put it too. The section ends on the tax line it always ended on.

             giftLadder.ctaAll stays in the message files, unreferenced — it
             cost three translations and the second CTA may well come back
             somewhere on the giving pages. */}
          {/* No tax line here (client, 2026-09-13). The fact is not lost:
             trust.taxDeductible carries it in the trust strip, and
             whereMoneyGoes and wmgPage both state it in full with the cap
             and the reporting. giftLadder.footnote stays in the message
             files -- components/gift-ladder.tsx still renders it. */}
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
