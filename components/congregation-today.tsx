'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
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

const SLIDE_KEYS = ['daily', 'school', 'friday', 'iftar', 'visits', 'services'] as const;
type SlideKey = (typeof SLIDE_KEYS)[number];
const TOTAL = SLIDE_KEYS.length;
const HALF = Math.floor(TOTAL / 2);

const CARD_H = 'clamp(380px, 52svh, 660px)';
const CARD_W = `calc(${CARD_H} * 0.75)`;
const GAP_PX = 48;
const INNER_SCALE = 0.70;
const OUTER_SCALE = 0.52;
const CURVE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

const PHOTOS: Record<SlideKey, { src: string; alt: string; width: number; height: number }> = {
  daily: {
    src: '/photos/daily-prayer-sujud.webp',
    alt: 'A worshipper in sujud on the red prayer carpet, string-lights and a chandelier above, an old wall clock on the stone wall',
    width: 800,
    height: 1200,
  },
  school: {
    src: '/photos/learning-lecture.webp',
    alt: 'Weekend-school session at Rabita, teachers at the front, pupils following the lesson',
    width: 1200,
    height: 1600,
  },
  friday: {
    src: '/photos/prayer-mat-underpass.webp',
    alt: 'Rabita Friday prayer at capacity, worshippers bowing on prayer mats, imam leading at the front',
    width: 799,
    height: 1066,
  },
  iftar: {
    src: '/photos/hero-iftar.webp',
    alt: 'Street iftar in Grønland, Oslo, long shared tables, neighbours breaking fast together',
    width: 2560,
    height: 1707,
  },
  visits: {
    src: '/photos/cong-hall.webp',
    alt: 'A visiting group seated in the Rabita hall for a talk and conversation',
    width: 1600,
    height: 1069,
  },
  services: {
    src: '/photos/family-together.webp',
    alt: 'A family gathered at Rabita, three generations in the paper-lit hall after a service',
    width: 933,
    height: 1400,
  },
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
      if (Math.abs(e.deltaX) < 24 || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      if (wheelLock.current) return;
      wheelLock.current = true;
      window.setTimeout(() => { wheelLock.current = false; }, 420);
      const forward = isRtl ? e.deltaX < 0 : e.deltaX > 0;
      if (forward) next(); else prev();
    };
    el.addEventListener('wheel', onWheel, { passive: true });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isRtl, next, prev]);

  // One gesture, one slide. Pointer events cover mouse, pen and touch alike.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragStartX.current = e.clientX;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const endDrag = (e: React.PointerEvent) => {
    if (dragStartX.current == null) return;
    const dx = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(dx) < 45) return;
    // Swallow the click that follows, or it jumps to whichever card the pointer landed on.
    cameFromDrag.current = true;
    window.setTimeout(() => { cameFromDrag.current = false; }, 0);
    const forward = isRtl ? dx > 0 : dx < 0;
    if (forward) next(); else prev();
  };

  const activeKey = SLIDE_KEYS[active];
  const figure: Figure = useMemo(() => {
    switch (activeKey) {
      case 'daily':
        return {
          kind: 'single',
          value: formatAmount(locale, 5),
          label: t('slides.daily.figureLabel'),
        };
      case 'school':
        return {
          kind: 'single',
          value: formatAmount(locale, CAMPAIGN.pupils),
          label: t('slides.school.figureLabel'),
        };
      case 'friday':
        return {
          kind: 'delta',
          before: formatAmount(locale, CAMPAIGN.womensPrayerCapacityBefore),
          after: formatAmount(locale, CAMPAIGN.womensPrayerCapacityAfter),
          label: t('slides.friday.figureLabel'),
        };
      case 'visits':
        return {
          kind: 'single',
          value: formatAmount(locale, CAMPAIGN.studentVisitorsPerYear),
          label: t('slides.visits.figureLabel'),
        };
      case 'iftar':
      case 'services':
      default:
        return { kind: 'none' };
    }
  }, [activeKey, locale, t]);

  const dirSign = isRtl ? -1 : 1;
  const cardTransition = reduced
    ? 'none'
    : `transform 380ms ${CURVE}, opacity 380ms ${CURVE}`;

  return (
    <Section id="menigheten-i-dag" tone="paper" className="scroll-mt-20 !py-0">
      <div
        className="flex flex-col justify-center"
        style={{
          minHeight: 'calc(100svh - 80px)',
          // 32px each (down from 40) — the new statement-above-carousel
          // stacking adds ~12px vs the prior below-carousel layout, and
          // 1280×800 doesn't fit at 40/40. Padding is the least
          // load-bearing spec dimension to trim.
          paddingTop: '96px',
          paddingBottom: '24px',
        }}
      >
        {/* Statement + indicator row — one row, container-bound.
           Statement is the section heading (h2). Serif display size
           with the address as a gold-italic accent. Row uses
           align-items: baseline; the indicator wrapper's vertical
           centre is nudged onto the statement's text baseline (see
           the transform inside). */}
        <div className="mx-auto max-w-6xl w-full px-6">
          <div className="flex items-baseline justify-between" style={{ gap: '32px' }}>
            <h2
              className="font-serif text-ink text-balance"
              style={{
                fontSize: 'clamp(28px, 3vw, 44px)',
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
            <div
              className="shrink-0 inline-flex items-center"
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
              {SLIDE_KEYS.map((key, i) => {
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
              })}
            </div>
          </div>
        </div>

        {/* Full-bleed carousel row — 32px below the statement row.
           Breaks out of any container to 100vw via symmetric negative
           margins. overflow-x: clip prevents horizontal scrollbars at
           any viewport; overflow-y stays visible so the active card's
           numeral bleeds above the top edge. */}
        <div
          className="relative"
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
            onPointerUp={endDrag}
            onPointerCancel={() => { dragStartX.current = null; }}
            onDragStart={(e) => e.preventDefault()}
            className="relative select-none outline-none focus-visible:ring-1 focus-visible:ring-gold-deep/40 cursor-grab active:cursor-grabbing"
            style={{
              height: CARD_H,
              overflow: 'visible',
              touchAction: 'pan-y',
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
              // Inner side cards are click-to-navigate: clicking the
              // card on either side jumps to it, matching mouse users'
              // intuition. Centre is inert; outer are pointer-none
              // (decorative peek). Screen readers still navigate via
              // the indicator tabs above — these cards stay aria-hidden.
              const clickable = abs === 1;
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
                    pointerEvents: abs > 1 ? 'none' : 'auto',
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
                  <div
                    className="relative w-full h-full"
                    style={{ borderRadius: '10px', overflow: 'hidden' }}
                  >
                    <Image
                      src={photo.src}
                      alt={isCenter ? photo.alt : ''}
                      fill
                      priority={i === 0}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      sizes="(min-width: 768px) 30vw, 90vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Text block — title + figure on one baseline-aligned line,
           sentence beneath. Cross-fades on slide change. 16px above
           (down from 20) so the larger heading above fits the budget
           at 1280×800. */}
        <div
          className="mx-auto max-w-6xl w-full px-6"
          style={{ marginTop: '16px' }}
          aria-live="polite"
        >
          <div className="mx-auto text-center" style={{ maxWidth: '62ch' }}>
            {reduced ? (
              <TextBlock
                title={t(`slides.${activeKey}.title` as never)}
                sentence={t(`slides.${activeKey}.sentence` as never)}
                figure={figure}
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
}: {
  title: string;
  sentence: string;
  figure: Figure;
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
      {figure.kind !== 'none' && (
        <div style={{ marginTop: '12px' }}>
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
