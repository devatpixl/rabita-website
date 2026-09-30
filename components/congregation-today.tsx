'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { CAMPAIGN } from '@/lib/campaign';
import { formatAmount } from '@/lib/format';
import type { AppLocale } from '@/i18n/routing';
import { Section } from './primitives';
import { Accent } from './accent';
import { cn } from '@/lib/cn';

// §4.07 — one-screen carousel section, five cards, full-bleed row.
//
// Vertical budget: 100svh − 80 (sticky header). Statement rides on the
// same row as the progress indicator to give the card 62svh; the text
// block below is one line of title+figure + one line of sentence.
//
// Carousel row is full-bleed (100vw) so outer cards fall off both
// edges naturally. Container uses overflow-x: clip so no horizontal
// scrollbar appears at any viewport, while overflow-y stays visible so
// the active card's numeral bleeds above the top edge.
//
// Transition: cards are absolutely positioned; each computes its own
// translate + scale in CSS via one shared 380ms cubic-bezier on
// transform + opacity. No width/height/margin animation.

// The eight services the client listed (2026-08-30): this section is
// "what Rabita is for", so it shows the services, one card each, and each
// card hands off to the service's own page.
// The order was originally set to alternate the interior renders (nikah /
// janaza / shahada / counselling) with photographs so no two look-alike
// cards sat together. All eight now carry photographs, so that rule no
// longer decides anything; the order is the client's.
const SLIDE_KEYS = [
  // Learning opens the carousel (client, 2026-09-09). It is the service the
  // most people here actually touch — 400+ pupils every weekend — where a
  // nikah is a handful of families a year, and a wedding is a narrower first
  // impression of what the mosque does than a classroom.
  'education',
  // Conversations takes second place and nikah takes its old seventh
  // (client, 2026-09-09) — a swap rather than an insert, so the run stays
  // eight slides and nothing else shifts position.
  'counselling',
  // Two swaps on 2026-09-10 (client): mediation came up from eighth in place
  // of janaza, then traded again with hajj and umra.
  'hajj-umrah',
  // `mediation` was the fourth card and is gone (client, 2026-09-10). It led
  // to /tjenester/counselling — the same page as the card two above it —
  // because the service it named was merged into "Samtaler og megling" in
  // August. Eight cards were reaching six pages.
  'shahada',
  'youth',
  'nikah',
  'janaza',
  // The six services that had no card at all. The seven above keep the
  // positions the client set; these follow in the order /tjenester lists
  // them, so the two surfaces now name the same thirteen things.
  'koran',
  'kurs',
  'norsk',
  'veivisere',
  'barn-og-familie',
  'fosterhjem',
] as const;
type SlideKey = (typeof SLIDE_KEYS)[number];
const TOTAL = SLIDE_KEYS.length;
const HALF = Math.floor(TOTAL / 2);

// ── THE DECK IS SHORTER ON A PHONE (2026-09-29) ──────────────────────────
// 52svh is right when the deck is the only thing on screen. With the caption
// moved above it the two share the viewport, and at 390x844 the pair ran past
// the fold — you could read the sentence or see the picture, not both. 44svh
// with a 420px ceiling puts the whole beat on one screen.
//
// A CSS variable rather than a JS width check: the deck's cards are absolutely
// positioned and sized from these strings in inline styles, so a media query
// in the stylesheet is the only place a breakpoint can reach them without a
// re-render. See the @media rule in app/globals.css.
const CARD_H = 'var(--cong-card-h, clamp(380px, 52svh, 660px))';
const CARD_W = `calc(${CARD_H} * 0.75)`;
const GAP_PX = 48;
const INNER_SCALE = 0.70;
const OUTER_SCALE = 0.52;
const CURVE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

const PHOTOS: Record<SlideKey, { src: string; alt: string; width: number; height: number }> = {
  nikah: { src: '/photos/svc-nikah-ceremony.webp', alt: 'A nikah ceremony in the hall: the couple and the imam at a table, guests seated on the carpet', width: 1086, height: 1448 },
  janaza: { src: '/photos/svc-janaza-prayer.webp', alt: 'Janaza prayer: the congregation standing in rows, heads bowed, facing the timber qibla wall', width: 1086, height: 1448 },
  shahada: { src: '/photos/subj-shahada.webp', alt: 'A shahada taken with witnesses at Rabita', width: 1600, height: 1000 },
  counselling: {
    // A new file rather than an overwrite of subj-counselling.webp, which
    // lib/services.ts pointed at when this changed. That page has since
    // moved to this frame too, so the old one is now unused.
    src: '/photos/community/speaker-mic.webp',
    alt: 'A young speaker addressing a gathering with a microphone',
    // 3:4, matching the card. The old 8:5 was a landscape ratio in a
    // portrait slot, so next/image reserved the wrong box.
    width: 1200,
    height: 1600,
  },
  'hajj-umrah': { src: '/photos/hajj-kaaba.webp', alt: 'Pilgrims in ihram circling the Kaaba in Makkah, the clock tower behind', width: 1200, height: 1600 },
  education: {
    // Not learning-lecture.webp: impact-story.tsx still renders that frame,
    // and overwriting it would have changed a second place silently.
    src: '/photos/learning-class.webp',
    alt: 'Weekend school at Rabita: pupils holding their certificates with their teacher, the Arabic alphabet on the board behind them',
    width: 1200,
    height: 1600,
  },
  // A new file rather than an overwrite of bazaar-child.webp, which
  // lib/services.ts pointed at when this changed. /tjenester has since moved
  // its school entry to learning-class.webp, so the old one is now unused.
  youth: {
    src: '/photos/community/youth-table.webp',
    alt: 'Young people around a table at a Rabita youth session, sharing a meal',
    // 900x1200: the crop is 799px wide in the source, so a larger file would
    // be invented pixels. The card never renders above 400.
    width: 900,
    height: 1200,
  },
  // The six new cards. Five of these are LANDSCAPE sources in a 3:4 card, so
  // object-cover keeps the middle half of their width — which is fine for
  // one subject and lossy for a group. Portrait replacements are owed for
  // koran, kurs, norsk, veivisere and barn-og-familie; fosterhjem is already
  // 1200x1600 and needs nothing.
  koran: {
    src: '/photos/svc-koran-circle.webp',
    alt: 'Boys sitting in a circle on the mosque carpet, each with a Quran open in front of them',
    width: 1600,
    height: 1200,
  },
  kurs: {
    src: '/photos/subj-kurs-calligraphy.webp',
    alt: 'A calligrapher at her desk, working an Arabic line across a ruled sheet',
    width: 1170,
    height: 767,
  },
  norsk: {
    src: '/photos/svc-counsel.webp',
    alt: 'A group at Rabita in front of the mosque project banners',
    width: 1600,
    height: 1000,
  },
  // Portrait, which is what this 3:4 card wants (client, 2026-09-10): the
  // volunteers frame was 1600x1066 and lost half its width to the crop.
  //
  // NOTE it is also the fourth chapter photograph in "Dette er Rabita", one
  // section up the same page. Deliberate, and the client's pick — but the
  // two are close enough on the scroll that a portrait photograph of a
  // school visit should replace this one when there is one.
  veivisere: {
    src: '/photos/volunteer-megaphone.webp',
    alt: 'A Rabita volunteer with a megaphone, high-vis vest reading RABITA',
    width: 933,
    height: 1400,
  },
  'barn-og-familie': {
    src: '/photos/svc-barn-phone.webp',
    alt: 'A man crouching to a child\u2019s height to show him something on a phone',
    width: 1800,
    height: 1201,
  },
  fosterhjem: {
    src: '/photos/svc-fosterhjem-stand.webp',
    alt: 'The fosterhjem.no stand at an outdoor event, staffed by two women',
    width: 1200,
    height: 1600,
  },
};

// Where each card leads.
const HREFS: Record<SlideKey, string> = {
  nikah: '/tjenester/nikah',
  janaza: '/tjenester/janaza',
  shahada: '/tjenester/shahada',
  counselling: '/tjenester/counselling',
  'hajj-umrah': '/tjenester/hajj-umrah',
  // These two led to /undervisning until 2026-09-10, when the services they
  // name got pages of their own back. A card that names a service should
  // land on that service.
  education: '/tjenester/skole',
  youth: '/tjenester/ungdom',
  koran: '/tjenester/koran',
  kurs: '/tjenester/kurs',
  norsk: '/tjenester/norsk',
  veivisere: '/tjenester/veivisere',
  'barn-og-familie': '/tjenester/barn-og-familie',
  fosterhjem: '/tjenester/fosterhjem',
};

type Figure =
  | { kind: 'none' }
  | { kind: 'single'; value: string; label: string }
  | { kind: 'delta'; before: string; after: string; label: string };

function signedOff(i: number, active: number): number {
  let raw = i - active;
  if (raw > HALF) raw -= TOTAL;
  else if (raw < -HALF) raw += TOTAL;
  return raw;
}

export function CongregationToday() {
  const t = useTranslations('congregationToday');
  const locale = useLocale() as AppLocale;
  const isRtl = locale === 'ar';

  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);
  const wheelLock = useRef(false);
  const cameFromDrag = useRef(false);
  const capturing = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const goTo = useCallback(
    (i: number) => setActive(((i % TOTAL) + TOTAL) % TOTAL),
    [],
  );
  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    const el = regionRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (isRtl) next(); else prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (isRtl) prev(); else next();
      }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [isRtl, next, prev]);

  // Sideways trackpad scroll moves the rail, locked briefly so one swipe is one slide.
  useEffect(() => {
    const el = regionRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      // Claim the horizontal swipe so the browser does not treat it as back or forward.
      e.preventDefault();
      if (Math.abs(e.deltaX) < 24) return;
      if (wheelLock.current) return;
      wheelLock.current = true;
      window.setTimeout(() => { wheelLock.current = false; }, 420);
      const forward = isRtl ? e.deltaX < 0 : e.deltaX > 0;
      if (forward) next(); else prev();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isRtl, next, prev]);

  // One gesture, one slide. Pointer events cover mouse, pen and touch alike.
  //
  // Capture is NOT taken on pointerdown. Once a pointer is captured, the
  // browser dispatches the following `click` to the CAPTURING element rather
  // than to whatever is under the cursor — so every click on a side card was
  // being delivered to this container and the card's own onClick never ran.
  // The handler was there and correct; the event never reached it.
  //
  // Capture is taken on the first move past a small threshold instead. By
  // then it is a drag, which is the only case capture is for: keeping the
  // gesture alive if the pointer leaves the rail. A click never crosses the
  // threshold, so it is delivered normally.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragStartX.current = e.clientX;
    capturing.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStartX.current == null || capturing.current) return;
    if (Math.abs(e.clientX - dragStartX.current) < 8) return;
    capturing.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const endDrag = (e: React.PointerEvent) => {
    if (dragStartX.current == null) return;
    const dx = e.clientX - dragStartX.current;
    dragStartX.current = null;
    capturing.current = false;
    if (Math.abs(dx) < 45) return;
    // Swallow the click that follows, or it jumps to whichever card the pointer landed on.
    cameFromDrag.current = true;
    window.setTimeout(() => { cameFromDrag.current = false; }, 0);
    const forward = isRtl ? dx > 0 : dx < 0;
    if (forward) next(); else prev();
  };

  const activeKey = SLIDE_KEYS[active];
  const figure: Figure = useMemo(() => {
    if (activeKey === 'education') {
      return {
        kind: 'single',
        value: `${formatAmount(locale, CAMPAIGN.pupils)}+`,
        label: t('slides.education.figureLabel'),
      };
    }
    return { kind: 'none' };
  }, [activeKey, locale, t]);

  const dirSign = isRtl ? -1 : 1;
  const cardTransition = reduced
    ? 'none'
    : `transform 380ms ${CURVE}, opacity 380ms ${CURVE}`;

  // The indicator lives in two places and is displayed in exactly one: beside
  // the statement on desktop, under the carousel on a phone. Rendering it
  // twice with one of them `display:none` keeps a single tablist in the
  // accessibility tree, which two visible tablists would not.
  const dashes = SLIDE_KEYS.map((key, i) => {
    const isActive = i === active;
    return (
      <button
        key={key}
        type="button"
        role="tab"
        aria-selected={isActive}
        aria-label={t('goto', { n: i + 1 })}
        onClick={() => goTo(i)}
        className={cn(isActive ? 'bg-gold-deep' : 'bg-rule')}
        // Padding grows the touch area to 44px; the negative margin gives the space back.
        style={{
          boxSizing: 'content-box',
          height: '2px',
          width: isActive ? '44px' : '26px',
          paddingBlock: '21px',
          marginBlock: '-21px',
          paddingInline: '3px',
          marginInline: '-3px',
          backgroundClip: 'content-box',
          transitionProperty: reduced ? 'none' : 'width, background-color',
          transitionDuration: '320ms',
          transitionTimingFunction: CURVE,
        }}
      />
    );
  });

  return (
    <Section id="menigheten-i-dag" tone="paper" className="scroll-mt-20 !py-0">
      {/* Sized to its content, not to the viewport. The old
         min-height: 100svh centred the block in a full screen, and with the
         caption now a fixed height the leftover became a band of empty
         paper above the heading on every laptop. */}
      <div
        className="flex flex-col"
        style={{
          paddingTop: '64px',
          paddingBottom: '40px',
        }}
      >
        {/* Statement + indicator row — one row, container-bound.
           Statement is the section heading (h2). Serif display size
           with the address as a gold-italic accent. Row uses
           align-items: baseline; the indicator wrapper's vertical
           centre is nudged onto the statement's text baseline (see
           the transform inside). */}
        {/* ── PHONES PUT THE WORDS ABOVE THE PICTURE (client, 2026-09-29) ──
           "the image should be down and the text should be up". The DOM
           order is statement, rail, dots, caption — which on a phone means
           you meet a photograph before you are told what it is of.

           Done with `order` on the four children rather than by moving the
           markup: the rail is an absolutely-positioned deck inside a
           fixed-height relative box, and lifting it in the DOM would mean
           duplicating it. order is inert from md, so the desktop row is
           untouched. */}
        <div className="mx-auto max-w-6xl w-full px-6 max-md:order-1">
          <div className="flex items-baseline justify-between" style={{ gap: '32px' }}>
            {/* ── THE SIZE LIVES IN CLASSES, NOT THE STYLE OBJECT ────────
               Client, 2026-09-30: "the heading of our services is too small
               here ... this change only on mobile". The clamp bottoms out at
               2.25rem below 720px, so every phone got 36px — a step under the
               slide titles it introduces.

               It has to move off the inline style to be fixed per width: an
               inline fontSize cannot be overridden by a class. Base is the
               phone size and `md:` restores the original expression verbatim,
               so from 768 up nothing changes, including the 768-880 band
               where the clamp is still on its floor. */}
            <h2
              className="display-opsz font-serif text-ink text-balance text-[2.625rem] md:text-[clamp(2.25rem,5vw,4rem)]"
              style={{
                lineHeight: 1.12,
                fontWeight: 600,
                letterSpacing: '-0.015em',
                margin: 0,
              }}
            >
              {t('statement.before')}
              <Accent surface="paper">{t('statement.accent')}</Accent>
              {t('statement.after')}
            </h2>
            {/* Desktop keeps it on the statement's baseline. */}
            <div
              className="hidden shrink-0 items-center md:inline-flex"
              style={{
                columnGap: '6px',
                // With items-baseline on the parent row, a text-less
                // inline-flex reports its margin-box bottom as its
                // baseline — putting the bar CENTRE one pixel above
                // the statement's text baseline. Shift down by half a
                // bar (1px) so the centre lands exactly on baseline.
                transform: 'translateY(1px)',
              }}
              role="tablist"
              aria-label={t('carouselLabel')}
            >
              {dashes}
            </div>
          </div>
        </div>

        {/* Full-bleed carousel row — 32px below the statement row.
           Breaks out of any container to 100vw via symmetric negative
           margins. overflow-x: clip prevents horizontal scrollbars at
           any viewport; overflow-y stays visible so the active card's
           numeral bleeds above the top edge. */}
        <div
          className="relative max-md:order-3"
          style={{
            marginTop: '32px',
            width: '100vw',
            marginInlineStart: 'calc(50% - 50vw)',
            marginInlineEnd: 'calc(50% - 50vw)',
            overflowX: 'clip',
            overflowY: 'visible',
          }}
        >
          <div
            ref={regionRef}
            role="region"
            aria-roledescription="carousel"
            aria-label={t('carouselLabel')}
            tabIndex={0}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={() => { dragStartX.current = null; capturing.current = false; }}
            onDragStart={(e) => e.preventDefault()}
            className="relative select-none outline-none focus-visible:ring-1 focus-visible:ring-gold-deep/40 cursor-grab active:cursor-grabbing"
            style={{
              height: CARD_H,
              overflow: 'visible',
              touchAction: 'pan-y',
              overscrollBehaviorX: 'contain',
            }}
          >
            {SLIDE_KEYS.map((key, i) => {
              const off = signedOff(i, active);
              const abs = Math.abs(off);
              const isCenter = off === 0;
              const scale =
                abs === 0 ? 1 : abs === 1 ? INNER_SCALE : abs === 2 ? OUTER_SCALE : OUTER_SCALE;
              const opacity =
                abs === 0 ? 1 : abs === 1 ? 0.55 : abs === 2 ? 0.30 : 0;
              const photo = PHOTOS[key];
              // 0.85 = (1 + 0.70)/2 — the inner peek sits one GAP_PX
              // from the centre's edge. Outer cards then land at 2×
              // that step, which is deliberately past the viewport at
              // desktop widths so overflow-x: clip cuts them off.
              const dxCalc = `calc(${off * dirSign} * (${CARD_W} * 0.85 + ${GAP_PX}px))`;
              // Every VISIBLE side card is click-to-navigate, not just the
              // immediate neighbours. The outer pair was pointer-none as a
              // "decorative peek" on the assumption that overflow clipped
              // it — but on a wide screen it is plainly on screen at 30%
              // opacity, so a reader saw five cards that looked alike and
              // found that only two of them responded. Clicking any of them
              // now jumps to that card, left or right.
              //
              // Centre stays inert (you are already there); anything past
              // the visible pair is opacity 0 and stays pointer-none.
              // Screen readers navigate via the indicator tabs above, so
              // these cards remain aria-hidden.
              const clickable = abs === 1 || abs === 2;
              return (
                <div
                  key={key}
                  aria-hidden={!isCenter}
                  onClick={clickable ? () => { if (!cameFromDrag.current) goTo(i); } : undefined}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    transform: `translate(-50%, -50%) translateX(${dxCalc}) scale(${scale})`,
                    transformOrigin: 'center',
                    opacity,
                    transition: cardTransition,
                    overflow: 'visible',
                    zIndex: isCenter ? 3 : abs === 1 ? 2 : 1,
                    pointerEvents: abs > 2 ? 'none' : 'auto',
                    cursor: clickable ? 'pointer' : undefined,
                  }}
                >
                  {isCenter && (
                    <span
                      aria-hidden
                      className="font-serif absolute pointer-events-none whitespace-nowrap"
                      style={{
                        top: '-0.34em',
                        insetInlineStart: '-0.05em',
                        color: '#9B7F4A',
                        fontSize: 'clamp(56px, 6vw, 96px)',
                        fontWeight: 600,
                        lineHeight: 1,
                        letterSpacing: '-0.02em',
                        fontVariantNumeric: 'tabular-nums',
                        zIndex: 4,
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  )}
                  {/* The centre card's picture is the link to its service
                     (client, 2026-09-10: "when clicked on images, it
                     redirects to that page, in laptops also"). Until now the
                     centre was inert — you are already on that card — so the
                     only way through was the "Read more" line under it, and
                     a picture that large reads as clickable whether or not
                     it is.

                     Side cards keep goTo: clicking a peek should bring it to
                     the middle, not leave the page from a card you cannot
                     properly see.

                     aria-hidden + tabIndex -1, the same treatment
                     service-index gives its picture links: "Read more" is
                     already the accessible route to this page, and a second
                     tab stop to the same href is noise on a screen reader.

                     The drag guard is the one the side cards use. Without it
                     a swipe that ends over the centre card fires a click and
                     navigates mid-gesture. */}
                  {isCenter ? (
                    <Link
                      href={`/${locale}${HREFS[key]}`}
                      aria-hidden
                      tabIndex={-1}
                      onClick={(e) => {
                        if (cameFromDrag.current) e.preventDefault();
                      }}
                      className="relative block w-full h-full"
                      style={{ borderRadius: '10px', overflow: 'hidden' }}
                    >
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        priority={i === 0}
                        loading={i === 0 ? 'eager' : 'lazy'}
                        sizes="(min-width: 768px) 30vw, 90vw"
                        className="object-cover"
                      />
                    </Link>
                  ) : (
                    <div
                      className="relative w-full h-full"
                      style={{ borderRadius: '10px', overflow: 'hidden' }}
                    >
                      <Image
                        src={photo.src}
                        alt=""
                        fill
                        priority={i === 0}
                        loading={i === 0 ? 'eager' : 'lazy'}
                        sizes="(min-width: 768px) 30vw, 90vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Nothing on a phone said this rail moves. Innocents-style side
             chevrons, small and translucent so they read as affordances
             rather than chrome, sitting on the rail itself. Desktop already
             has the drag cursor, the wheel handler and the indicator on the
             statement line, so they are mobile only. */}
          <button
            type="button"
            onClick={prev}
            aria-label={t('goto', { n: (active === 0 ? SLIDE_KEYS.length : active) })}
            className="absolute start-2 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-paper/85 text-ink shadow-[0_2px_10px_-2px_rgba(26,26,24,0.35)] backdrop-blur-sm active:scale-95 md:hidden"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label={t('goto', { n: ((active + 2) > SLIDE_KEYS.length ? 1 : active + 2) })}
            className="absolute end-2 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-paper/85 text-ink shadow-[0_2px_10px_-2px_rgba(26,26,24,0.35)] backdrop-blur-sm active:scale-95 md:hidden"
          >
            <ChevronLeft className="h-4 w-4 rotate-180 rtl:rotate-0" />
          </button>
        </div>

        {/* Phone position for the indicator. Beside the statement it sat above
           the picture it describes; under the rail it reads as a caption for
           what you are looking at, and it is where the thumb already is. */}
        <div
          className="mt-5 flex items-center justify-center md:hidden max-md:order-4"
          style={{ columnGap: '6px' }}
          role="tablist"
          aria-label={t('carouselLabel')}
        >
          {dashes}
        </div>

        {/* Text block — title + figure on one baseline-aligned line,
           sentence beneath. Cross-fades on slide change. 16px above
           (down from 20) so the larger heading above fits the budget
           at 1280×800. */}
        <div
          // max-md:mb-1, was mb-6. Measured at 390 after the link went
          // sr-only: 70px stood between the last line of the sentence and the
          // top of the photograph, and only 32 of it was the rail's own space
          // for the big numeral. The rest was 14px of leftover floor and 24px
          // of this margin, both of which were sized for a line that is no
          // longer drawn.
          className="mt-4 mx-auto max-w-6xl w-full px-6 max-md:order-2 max-md:mb-1"
          aria-live="polite"
        >
          {/* Fixed height, so a one-line service and a two-line one with a
             figure occupy the same space and nothing below the carousel
             moves as the cards change. Sized for title + figure line + two
             lines of sentence + the link.
             
             On phones the link is sr-only, so the box no longer has to
             reserve room for it. It was a third of the height: 11.5rem held
             184px for about 126px of content, and that surplus is the empty
             band the client was looking at. Moved off the inline style,
             because an inline minHeight cannot be overridden by a class.

             RE-MEASURED 2026-09-30, after the figure line came off the phone
             (see TextBlock). 8.75rem/140px was sized for a block that could
             carry one, and once it cannot the floor is 54px taller than
             anything that goes in it — which is the empty band under every
             card the client then photographed.

             6.5rem is 104px. The tallest of the thirteen is now 86px in both
             Norwegian and English and 63px in Arabic, measured slide by slide
             through the dots at 390. 18px of headroom is left, so a longer
             translation can still grow without the rail below starting to
             jump — which is the whole reason this box has a floor. */}
          <div
            className="mx-auto text-center min-h-[11.5rem] max-md:min-h-[6.5rem]"
            style={{ maxWidth: '62ch' }}
          >
            {reduced ? (
              <TextBlock
                title={t(`slides.${activeKey}.title` as never)}
                sentence={t(`slides.${activeKey}.sentence` as never)}
                figure={figure}
                href={`/${locale}${HREFS[activeKey]}`}
                linkLabel={t('readMore')}
              />
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeKey}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: { duration: 0.2, ease: [0.22, 0.61, 0.36, 1] },
                  }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.16, ease: [0.4, 0, 0.2, 1] },
                  }}
                >
                  <TextBlock
                    title={t(`slides.${activeKey}.title` as never)}
                    sentence={t(`slides.${activeKey}.sentence` as never)}
                    figure={figure}
                    href={`/${locale}${HREFS[activeKey]}`}
                    linkLabel={t('readMore')}
                  />
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}

function TextBlock({
  title,
  sentence,
  figure,
  href,
  linkLabel,
}: {
  title: string;
  sentence: string;
  figure: Figure;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <h3
        className="font-serif text-ink"
        style={{
          fontSize: 'clamp(22px, 2vw, 30px)',
          fontWeight: 600,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h3>
      {/* ── THE FIGURE IS DESKTOP-ONLY NOW (client, 2026-09-30) ──────────
         Exactly one of the thirteen slides carries one — "400+ pupils every
         weekend" on Learning. On a phone the text block has a fixed floor so
         the rail below cannot jump, which means that one extra line sets the
         height for all thirteen and the other twelve swipe past with a band
         of empty paper under them. That band is what he photographed.

         One line on one card is not worth the hole on twelve, so on phones
         the figure goes and every slide is title + sentence. From md the row
         is wide, the floor is generous and it costs nothing, so it stays. */}
      {figure.kind !== 'none' && (
        <div className="max-md:hidden" style={{ marginTop: '12px' }}>
          <FigureInline figure={figure} />
        </div>
      )}
      <p
        className="text-ink-60"
        style={{
          marginTop: '14px',
          fontSize: 'clamp(14px, 1.1vw, 15px)',
          lineHeight: 1.62,
          maxWidth: '62ch',
        }}
      >
        {sentence}
      </p>
      {/* ── OFF THE SCREEN ON PHONES, BUT NOT OUT OF THE PAGE ────────────
         The client asked for "Read more" gone from the phone (2026-09-30),
         and visually it is. It cannot simply be deleted there, though: the
         centre card's photograph IS a link to the same page, but it carries
         aria-hidden and tabIndex -1 on purpose — see the note on it — so
         that a screen reader is not offered the same href twice. Hide this
         line with `hidden` and a phone has a section of thirteen services
         with no route out of it for anyone not using a pointer.

         `sr-only` takes it out of the flow, so the space closes exactly as
         `hidden` would, while keeping it in the accessibility tree. The
         photograph remains the visible affordance, and it is a real anchor,
         so tapping it still works. `focus-visible:not-sr-only` brings the
         line back the moment it is tabbed to, which is what stops this being
         the hidden-focusable trap it would otherwise be. */}
      <Link
        href={href}
        className="group mt-4 inline-flex min-h-11 items-center gap-2 text-[14px] font-semibold text-ink transition-colors hover:text-gold-deep max-md:sr-only focus-visible:not-sr-only"
      >
        <span className="border-b border-gold pb-0.5">{linkLabel}</span>
        <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">
          &rarr;
        </span>
      </Link>
    </div>
  );
}

function FigureInline({ figure }: { figure: Extract<Figure, { kind: 'single' | 'delta' }> }) {
  const numeralStyle: React.CSSProperties = {
    fontSize: 'clamp(26px, 2.2vw, 36px)',
    fontWeight: 600,
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.01em',
  };
  return (
    <span
      className="inline-flex items-baseline font-serif whitespace-nowrap"
      style={{ columnGap: '10px' }}
    >
      {figure.kind === 'single' ? (
        <span className="text-gold-deep" style={numeralStyle}>
          {figure.value}
        </span>
      ) : (
        <>
          <span style={{ ...numeralStyle, color: '#9B8B70' }}>{figure.before}</span>
          <span
            aria-hidden
            className="text-gold-deep"
            style={{ fontSize: 'clamp(13.2px, 1.1vw, 17.6px)', lineHeight: 1 }}
          >
            →
          </span>
          <span className="text-gold-deep" style={numeralStyle}>
            {figure.after}
          </span>
        </>
      )}
      <span
        className="font-mono uppercase text-ink-60"
        style={{ fontSize: '12px', lineHeight: 1.4, letterSpacing: '0.12em' }}
      >
        {figure.label}
      </span>
    </span>
  );
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}
