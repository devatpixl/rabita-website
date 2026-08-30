'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { useTranslations } from 'next-intl';
import {
  BUILDING_BOTTOM,
  BUILDING_RIGHT,
  BUILDING_TOP,
  BUILDING_VIEWBOX,
  BUILDING_W,
  BUILDING_X,
  FLOORS,
  FLOOR_HEIGHT,
  GROUND_Y,
  LABEL_X,
  STEP_COUNT,
  TICK_END,
  TICK_START,
  activeFloorFromStep,
  floorBottom,
  floorMid,
  floorTop,
  type FloorKey,
} from '@/lib/building';
import { SectionBody } from './primitives';
import { Accent } from './accent';
import { cn } from '@/lib/cn';

// §4.04 — architectural cross-section with an opening state.
//
// Eight scroll steps drive the composition. Step 0 shows the cleared
// site: ghost outline of the finished building, two neighbouring blocks,
// a solid ground line, plot boundary dashes, `07 ETASJER SKAL OPP`
// leader tick and a mono `↓ SCROLL` hint. Steps 1..7 build the floors
// bottom-to-top, per-floor cross-faded against the ghost so there is
// never a double line.
//
// Neighbours + ground line + plot boundary persist through the entire
// scroll; the intro-only elements fade out on step 1.

const INK = '#1A1A18';
const RULE = '#8A8880';
const GOLD = '#C0A165';
const INK_60 = '#5B6157';
const MUTE = '#B8AE9A';
const GOLD_DEEP = '#9B7F4A';

// Neighbour block geometry.
const LEFT_NB_X = 0;
const LEFT_NB_W = 32;
const LEFT_NB_TOP = 256;
const RIGHT_NB_X = 790;
const RIGHT_NB_W = 36;
const RIGHT_NB_TOP = 200;

// Native smooth scroll, with a guarantee: if the page has not arrived
// within 700ms (smooth scrolling is throttled in background tabs and off
// in some settings) it jumps instantly. Reduced-motion jumps straight
// away. Either way the reader always ends up where they asked to go.
function scrollTo(target: number) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const top = Math.max(0, Math.round(target));
  if (reduced) {
    window.scrollTo({ top, behavior: 'instant' as ScrollBehavior });
    return;
  }
  window.scrollTo({ top, behavior: 'smooth' });
  window.setTimeout(() => {
    if (Math.abs(window.scrollY - top) > 40) {
      window.scrollTo({ top, behavior: 'instant' as ScrollBehavior });
    }
  }, 700);
}

export function BuildingRises() {
  const t = useTranslations('building');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (reduced) return;
    const idx = Math.min(STEP_COUNT - 1, Math.max(0, Math.floor(v * STEP_COUNT)));
    setStep((prev) => (prev === idx ? prev : idx));
  });

  // Jump to a step, or past the whole sequence. The pinned range runs from
  // the section's top to (bottom − viewport); scrollYProgress maps 0..1
  // across it, and step s occupies [s/N, (s+1)/N). Landing mid-step keeps
  // the floor stable rather than sitting on a boundary.
  const scrollToProgress = useCallback((progress: number) => {
    const el = containerRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    scrollTo(top + Math.max(0, Math.min(1, progress)) * range);
  }, []);
  const jumpToStep = useCallback((s: number) => scrollToProgress((s + 0.5) / STEP_COUNT), [scrollToProgress]);
  const skip = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    // Straight to where the pin releases, so the next section follows at once.
    scrollTo(el.getBoundingClientRect().top + window.scrollY + el.offsetHeight - window.innerHeight + 1);
  }, []);

  // In reduced-motion, skip the pin, show the finished drawing.
  const effectiveStep = reduced ? STEP_COUNT - 1 : step;
  const activeFloor = activeFloorFromStep(effectiveStep); // -1 during intro
  const showRoof = activeFloor === FLOORS.length - 1;
  // Where the real walls stop growing (top of the highest landed floor).
  // In intro, real walls have zero length (wallTopY === BUILDING_BOTTOM).
  const wallTopY = activeFloor < 0 ? BUILDING_BOTTOM : floorTop(activeFloor);

  return (
    <section
      ref={containerRef}
      id="etasje-for-etasje"
      aria-labelledby="building-rises-heading"
      className={cn(
        'relative bg-paper-2',
        // Outer track: 8 steps → 560vh desktop, 320vh mobile. Was 800/380;
        // shortened 2026-08-30 so reading it through is ~30% less scrolling,
        // with a Skip link and a floor index for those who want out.
        reduced ? '' : 'h-[320vh] md:h-[560vh]',
      )}
    >
      <div
        className={cn(
          'flex flex-col overflow-hidden',
          reduced ? 'min-h-screen py-16' : 'sticky top-20 h-[calc(100svh-5rem)]',
        )}
      >
        <header className="shrink-0 px-6 pt-2 md:pt-4">
          <div className="mx-auto max-w-6xl">
            <h2
              id="building-rises-heading"
              className="max-w-2xl font-serif text-[1.25rem] leading-[1.1] text-ink md:text-section"
            >
              {t.rich('heading', {
                em: (chunks) => <Accent surface="paper">{chunks}</Accent>,
              })}
            </h2>
          </div>
        </header>

        <div className="mt-2 min-h-0 flex-1 px-6 pb-3 md:mt-3 md:pb-4">
          <div className="mx-auto max-w-6xl h-full">
            <div className="grid h-full gap-3 md:grid-cols-12 md:items-stretch md:gap-6">
              {/* On a phone the text block has a FIXED height, so the drawing
                 under it never moves as chapters of different length come
                 and go. */}
              <div className="flex h-[12rem] shrink-0 overflow-hidden md:h-[14.75rem] md:items-center md:col-span-4 lg:col-span-3 md:h-auto">
                <LeftPanel step={effectiveStep} activeFloor={activeFloor} onJump={jumpToStep} onSkip={skip} pinned={!reduced} />
              </div>
              {/* Below md the drawing shares the row with an HTML floor
                 register. The SVG's own label column cannot come to a phone:
                 it lives past x=400 in the viewBox, and scaling the whole
                 thing down far enough to include it puts the label type at
                 ~7px. So the drawing keeps 42% and the register is set in
                 real HTML at a readable size beside it — the same two-column
                 idea as the desktop, which is what the client asked for.
                 The right-edge mask is md+ only now: on a phone it would fade
                 out the register that has just been put there. */}
              <div
                className="flex h-full min-h-0 items-center justify-center gap-3 md:col-span-8 md:gap-0 md:[mask-image:none] lg:col-span-9"
              >
                <div className="h-full min-h-0 w-[60%] shrink-0 md:w-full">
                  <BuildingSVG
                    step={effectiveStep}
                    activeFloor={activeFloor}
                    wallTopY={wallTopY}
                    showRoof={showRoof}
                    labelT={t}
                  />
                </div>
                <FloorRegister activeFloor={activeFloor} labelT={t} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Screen-reader fallback */}
      <ol className="sr-only">
        <li>{t('intro.headlineLine1')} {t('intro.headlineLine2')}. {t('intro.body')}</li>
        {[...FLOORS].reverse().map((f) => (
          <li key={f.key}>
            {f.levelLabel}: {t(`floors.${f.key}.name`)}, {t(`floors.${f.key}.fact`)}
          </li>
        ))}
      </ol>
    </section>
  );
}

// -----------------------------------------------------------------------------
// LEFT PANEL — intro (step 0) or per-floor content (step 1..7)
// -----------------------------------------------------------------------------

function LeftPanel({
  step,
  activeFloor,
  onJump,
  onSkip,
  pinned,
}: {
  step: number;
  activeFloor: number;
  onJump: (step: number) => void;
  onSkip: () => void;
  pinned: boolean;
}) {
  const t = useTranslations('building');
  const total = FLOORS.length;
  const isIntro = activeFloor < 0;
  const floor = isIntro ? null : FLOORS[activeFloor];

  const counterActive = step.toString().padStart(2, '0');
  const counterTotal = total.toString().padStart(2, '0');

  return (
    <div className="relative w-full md:min-h-[280px]">
      <AnimatePresence mode="wait">
        {isIntro ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-3 md:gap-6"
          >
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-gold-deep">
              {t('intro.eyebrow')}
            </p>
            <h3 className="font-serif text-[1.5rem] leading-[1.12] text-ink tracking-[-0.01em] max-w-[16ch] md:text-[clamp(1.75rem,3.2vw,2.25rem)] md:leading-[1.15]">
              {t('intro.headlineLine1')}
              <br />
              <Accent surface="paper">{t('intro.headlineLine2')}</Accent>
            </h3>
            <span aria-hidden className="hidden h-px w-8 bg-gold md:block" />
            <p className="line-clamp-3 text-[14px] leading-snug text-ink-60 max-w-[36ch] md:line-clamp-none md:text-[15px] md:leading-relaxed">
              {t('intro.body')}
            </p>
            <FloorIndex step={step} total={total} active={counterActive} totalLabel={counterTotal} onJump={onJump} onSkip={onSkip} pinned={pinned} />
          </motion.div>
        ) : (
          floor && (
            <motion.div
              key={floor.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-3 md:gap-6"
            >
              <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-gold-deep">
                {t('etasje', { n: floor.levelLabel })}
              </p>
              <h3 className="font-serif text-[1.5rem] leading-[1.12] text-ink tracking-[-0.01em] max-w-[16ch] text-balance md:text-[clamp(1.75rem,3.2vw,2.25rem)] md:leading-[1.15]">
                {t.rich(`floors.${floor.key}.headline`, {
                  em: (chunks) => <Accent surface="paper">{chunks}</Accent>,
                })}
              </h3>
              <span aria-hidden className="hidden h-px w-8 bg-gold md:block" />
              <p className="line-clamp-3 text-[14px] leading-snug text-ink-60 max-w-[36ch] md:line-clamp-none md:text-[15px] md:leading-relaxed">
                {t(`floors.${floor.key}.body`)}
              </p>
              <FloorIndex step={step} total={total} active={counterActive} totalLabel={counterTotal} onJump={onJump} onSkip={onSkip} pinned={pinned} />
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}

// Counter, a clickable index of the seven floors, and the way out. The
// index is the same mark the counter uses (mono, small), so it reads as
// part of the counter rather than as a second control; the skip link is a
// plain text link, visible from the first step, because the person who
// wants out wants out immediately.
function FloorIndex({
  step,
  total,
  active,
  totalLabel,
  onJump,
  onSkip,
  pinned,
}: {
  step: number;
  total: number;
  active: string;
  totalLabel: string;
  onJump: (step: number) => void;
  onSkip: () => void;
  pinned: boolean;
}) {
  const t = useTranslations('building');
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 md:flex-col md:items-start md:gap-3">
      <div className="flex items-center gap-4">
        <p className="font-mono text-label uppercase tracking-widest text-ink-60 tabular-nums">
          <span className="text-ink">{active}</span> / {totalLabel}
        </p>
        {pinned && (
          <ol className="flex items-center gap-1.5" aria-label={t('index')}>
            {Array.from({ length: total }).map((_, i) => {
              const isOn = step === i + 1;
              const done = step > i + 1;
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => onJump(i + 1)}
                    aria-label={t('jumpTo', { n: i + 1 })}
                    aria-current={isOn ? 'step' : undefined}
                    className="grid h-6 w-4 place-items-center"
                  >
                    <span
                      className={cn(
                        'block h-[2px] w-3 transition-colors',
                        isOn ? 'bg-gold-deep' : done ? 'bg-ink/60' : 'bg-rule',
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>
      {pinned && (
        <button
          type="button"
          onClick={onSkip}
          className="group inline-flex min-h-9 items-center gap-2 self-start text-[13px] font-semibold text-ink-60 transition-colors hover:text-gold-deep"
        >
          <span className="border-b border-rule pb-px group-hover:border-gold-deep">{t('skip')}</span>
          <span aria-hidden className="transition-transform duration-200 group-hover:translate-y-0.5">&darr;</span>
        </button>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// BUILDING SVG
// -----------------------------------------------------------------------------

function BuildingSVG({
  step,
  activeFloor,
  wallTopY,
  showRoof,
  labelT,
}: {
  step: number;
  activeFloor: number;
  wallTopY: number;
  showRoof: boolean;
  labelT: ReturnType<typeof useTranslations>;
}) {
  const { w, h } = BUILDING_VIEWBOX;
  // Starts true to match what the server rendered. If it started at the real value,
  // hydration would find the state already correct, never re-render, and leave the
  // server's viewBox attribute in the DOM.
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const isIntro = activeFloor < 0;
  const anyFloorLanded = activeFloor >= 0;
  const introVisibleOpacity = isIntro ? 1 : 0;

  return (
    <svg
      viewBox={wide ? `0 0 ${w} ${h}` : `0 0 400 ${h}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full max-h-full"
      role="img"
      aria-labelledby="building-rises-heading"
    >
      {/* A narrow viewBox does NOT clip. A viewBox only maps coordinates —
         the clip is the SVG *viewport*, which stays the full container width.
         So at `0 0 400 700` everything drawn past x=400 (the whole right-hand
         label column, which runs out to x=727) kept painting into the viewport
         and got sliced at the phone's edge: the half-cut "04 PRAYE…" the
         client reported on 2026-08-30. Clip to the viewBox explicitly. The
         floor's name and description are carried by the text block above the
         drawing, which is where a phone reader takes them from anyway. */}
      <defs>
        <clipPath id="building-rises-clip">
          <rect x={0} y={0} width={wide ? w : 400} height={h} />
        </clipPath>
      </defs>
      <g clipPath="url(#building-rises-clip)">
      {/* -------------------------------------------------------------------
         PERSISTENT — neighbours, ground line, plot boundary, hatching.
         These render at every step; they ARE the site, not the intro.
      -------------------------------------------------------------------- */}

      {/* Left neighbour — flat roof, 2×4 window grid */}
      <g stroke={RULE} strokeOpacity={0.85} strokeWidth={1} fill="none">
        <rect x={LEFT_NB_X} y={LEFT_NB_TOP} width={LEFT_NB_W} height={GROUND_Y - LEFT_NB_TOP} />
        {[280, 316, 356, 396, 436, 476].map((y) => (
          <g key={`ln-${y}`}>
            <rect x={LEFT_NB_X + 4} y={y} width={9} height={10} />
            <rect x={LEFT_NB_X + 19} y={y} width={9} height={10} />
          </g>
        ))}
      </g>

      {/* Right neighbour — pitched roof, larger window grid */}
      <g stroke={RULE} strokeOpacity={0.85} strokeWidth={1} fill="none">
        <rect x={RIGHT_NB_X} y={RIGHT_NB_TOP} width={RIGHT_NB_W} height={GROUND_Y - RIGHT_NB_TOP} />
        {/* Pitched roof */}
        <polygon
          points={`${RIGHT_NB_X},${RIGHT_NB_TOP} ${RIGHT_NB_X + RIGHT_NB_W},${RIGHT_NB_TOP} ${RIGHT_NB_X + RIGHT_NB_W / 2},${RIGHT_NB_TOP - 24}`}
        />
        {[220, 256, 296, 336, 376, 416, 456].map((y) => (
          <g key={`rn-${y}`}>
            <rect x={RIGHT_NB_X + 5} y={y} width={9} height={10} />
            <rect x={RIGHT_NB_X + 22} y={y} width={9} height={10} />
          </g>
        ))}
      </g>

      {/* Plot boundary — dashed vertical lines flanking the building */}
      <line
        x1={BUILDING_X}
        x2={BUILDING_X}
        y1={BUILDING_TOP}
        y2={BUILDING_BOTTOM}
        stroke={RULE}
        strokeWidth={1}
        strokeDasharray="3 6"
        strokeOpacity={0.5}
      />
      <line
        x1={BUILDING_RIGHT}
        x2={BUILDING_RIGHT}
        y1={BUILDING_TOP}
        y2={BUILDING_BOTTOM}
        stroke={RULE}
        strokeWidth={1}
        strokeDasharray="3 6"
        strokeOpacity={0.5}
      />

      {/* Ground line — solid ink, full width */}
      <line
        x1={0}
        x2={w}
        y1={GROUND_Y}
        y2={GROUND_Y}
        stroke={INK}
        strokeWidth={1.2}
      />
      {/* On narrow the drawing is clipped at x=400, and this label starts at
         372 — it ran straight into the clip edge and read as "STRE…". Inside
         the building, right-aligned, on a phone. */}
      <text
        x={wide ? BUILDING_RIGHT + 12 : BUILDING_RIGHT - 8}
        y={GROUND_Y - 4}
        textAnchor={wide ? 'start' : 'end'}
        fill={INK}
        fontFamily="var(--font-mono)"
        fontSize={13}
        letterSpacing="0.07em"
      >
        {labelT('svg.groundLevel')}
      </text>

      {/* Excavation hatching — short diagonals below ground, sparser
         beneath the plot itself so the site reads as "under construction". */}
      {Array.from({ length: 26 }).map((_, i) => {
        const x = 6 + i * 24;
        // Skip the two hatches directly under the plot interior
        const underPlot = x > BUILDING_X - 4 && x < BUILDING_RIGHT - 6;
        if (underPlot && i % 2 === 1) return null;
        return (
          <line
            key={`hatch-${i}`}
            x1={x}
            y1={GROUND_Y + 4}
            x2={x + 6}
            y2={GROUND_Y + 10}
            stroke={RULE}
            strokeWidth={0.8}
            strokeOpacity={0.55}
          />
        );
      })}

      {/* TOMT label — on the ground line, knocked out of what is behind it */}
      <g>
        <rect
          x={BUILDING_RIGHT - 152}
          y={GROUND_Y + 4}
          width={148}
          height={20}
          fill="#F2EEE7"
        />
        <text
          x={BUILDING_RIGHT - 8}
          y={GROUND_Y + 19}
          textAnchor="end"
          fill={INK_60}
          fontFamily="var(--font-mono)"
          fontSize={13}
          letterSpacing="0.1em"
        >
          {labelT('svg.plot')}
        </text>
      </g>

      {/* -------------------------------------------------------------------
         GHOST outline — full height ghost of the finished building.
         Walls extend only above the landed area (wallTopY → BUILDING_TOP
         as floors land). Slab lines fade out per-floor as each real
         floor lands.
      -------------------------------------------------------------------- */}

      <motion.line
        x1={BUILDING_X}
        x2={BUILDING_X}
        y1={BUILDING_TOP}
        stroke={RULE}
        strokeWidth={1}
        strokeOpacity={0.32}
        initial={false}
        animate={{ y2: wallTopY }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.line
        x1={BUILDING_RIGHT}
        x2={BUILDING_RIGHT}
        y1={BUILDING_TOP}
        stroke={RULE}
        strokeWidth={1}
        strokeOpacity={0.32}
        initial={false}
        animate={{ y2: wallTopY }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Ghost slab lines — one per floor + roofline; each fades as its
         corresponding real slab lands. */}
      {FLOORS.map((f, i) => {
        const landed = i <= activeFloor;
        return (
          <line
            key={`ghost-slab-${f.key}`}
            x1={BUILDING_X}
            x2={BUILDING_RIGHT}
            y1={floorTop(i)}
            y2={floorTop(i)}
            stroke={RULE}
            strokeWidth={1}
            strokeOpacity={landed ? 0 : 0.32}
            style={{ transition: 'stroke-opacity 300ms ease-out' }}
          />
        );
      })}
      {/* Ghost roofline (top of building) — fades when top floor lands */}
      <line
        x1={BUILDING_X - 6}
        x2={BUILDING_RIGHT + 6}
        y1={BUILDING_TOP}
        y2={BUILDING_TOP}
        stroke={RULE}
        strokeWidth={1}
        strokeOpacity={showRoof ? 0 : 0.32}
        style={{ transition: 'stroke-opacity 300ms ease-out' }}
      />
      {/* Ghost minaret — fades when top floor lands (real minaret takes over) */}
      <g
        fill="none"
        stroke={RULE}
        strokeWidth={1}
        strokeOpacity={showRoof ? 0 : 0.32}
        style={{ transition: 'stroke-opacity 300ms ease-out' }}
      >
        <rect x={BUILDING_RIGHT - 30} y={BUILDING_TOP - 56} width={14} height={56} />
        <polygon
          points={`${BUILDING_RIGHT - 30},${BUILDING_TOP - 56} ${BUILDING_RIGHT - 16},${BUILDING_TOP - 56} ${BUILDING_RIGHT - 23},${BUILDING_TOP - 76}`}
        />
      </g>

      {/* -------------------------------------------------------------------
         INTRO-only overlay — leader tick to the ghost + SCROLL hint.
         Fades out on step 1 (first floor lands).
      -------------------------------------------------------------------- */}
      <g
        opacity={introVisibleOpacity}
        style={{ transition: 'opacity 350ms ease-out' }}
      >
        {/* Leader tick from ghost top to 07 label */}
        <line
          x1={BUILDING_RIGHT + 6}
          x2={TICK_END}
          y1={BUILDING_TOP - 20}
          y2={BUILDING_TOP - 20}
          stroke={GOLD}
          strokeWidth={1}
        />
        <text
          x={LABEL_X + 34}
          y={BUILDING_TOP - 25}
          textAnchor="end"
          fill={GOLD_DEEP}
          fontFamily="var(--font-mono)"
          fontSize={15}
          letterSpacing="0.14em"
        >
          07
        </text>
        <text
          x={LABEL_X + 44}
          y={BUILDING_TOP - 25}
          fill={INK}
          fontFamily="var(--font-mono)"
          fontSize={17}
          letterSpacing="0.14em"
        >
          {labelT('svg.floorsUp')}
        </text>
        <text
          x={LABEL_X + 44}
          y={BUILDING_TOP - 6}
          fill={INK_60}
          fontFamily="var(--font-mono)"
          fontSize={15}
          letterSpacing="0.06em"
        >
          {labelT('svg.belowGround')}
        </text>
        {/* ↓ SCROLL hint — mono, subtle */}
        <text
          x={LABEL_X}
          y={GROUND_Y - 60}
          fill={RULE}
          fontFamily="var(--font-mono)"
          fontSize={17}
          letterSpacing="0.16em"
        >
          ↓ SCROLL
        </text>
      </g>

      {/* -------------------------------------------------------------------
         REAL walls, base slab, per-floor slab + content + label.
         (Same as before the intro was added.)
      -------------------------------------------------------------------- */}

      {/* Real walls — grow upward as floors land */}
      <motion.line
        x1={BUILDING_X}
        x2={BUILDING_X}
        y2={BUILDING_BOTTOM}
        stroke={RULE}
        strokeWidth={1}
        initial={false}
        animate={{ y1: wallTopY }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.line
        x1={BUILDING_RIGHT}
        x2={BUILDING_RIGHT}
        y2={BUILDING_BOTTOM}
        stroke={RULE}
        strokeWidth={1}
        initial={false}
        animate={{ y1: wallTopY }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Base slab — only visible once a floor lands so it doesn't compete
         with the ghost silhouette during the intro. */}
      <line
        x1={BUILDING_X}
        x2={BUILDING_RIGHT}
        y1={BUILDING_BOTTOM}
        y2={BUILDING_BOTTOM}
        stroke={RULE}
        strokeWidth={1}
        strokeOpacity={anyFloorLanded ? 1 : 0}
        style={{ transition: 'stroke-opacity 300ms ease-out' }}
      />

      {/* Real roofline (final step) */}
      <motion.line
        x1={BUILDING_X - 6}
        x2={BUILDING_RIGHT + 6}
        y1={BUILDING_TOP}
        y2={BUILDING_TOP}
        stroke={RULE}
        strokeWidth={1}
        initial={false}
        animate={{ opacity: showRoof ? 1 : 0 }}
        transition={{ duration: 0.35 }}
      />
      {/* Real minaret (final step) */}
      <motion.g
        initial={false}
        animate={{ opacity: showRoof ? 1 : 0 }}
        transition={{ duration: 0.4, delay: showRoof ? 0.1 : 0 }}
      >
        <rect
          x={BUILDING_RIGHT - 30}
          y={BUILDING_TOP - 56}
          width={14}
          height={56}
          fill="none"
          stroke={RULE}
          strokeWidth={1}
        />
        <polygon
          points={`${BUILDING_RIGHT - 30},${BUILDING_TOP - 56} ${BUILDING_RIGHT - 16},${BUILDING_TOP - 56} ${BUILDING_RIGHT - 23},${BUILDING_TOP - 76}`}
          fill="none"
          stroke={RULE}
          strokeWidth={1}
        />
      </motion.g>

      {/* Lattice on top-two-floor exterior walls */}
      {FLOORS.map((f, i) => {
        if (!f.lattice) return null;
        const landed = i <= activeFloor;
        return (
          <g
            key={`lat-${f.key}`}
            opacity={landed ? (i === activeFloor ? 0.9 : 0.4) : 0}
            style={{ transition: 'opacity 300ms ease-out' }}
          >
            <path
              d={zigzagPath(BUILDING_X - 8, BUILDING_X, floorTop(i), floorBottom(i), 12)}
              fill="none"
              stroke={i === activeFloor ? GOLD : RULE}
              strokeWidth={1}
            />
            <path
              d={zigzagPath(BUILDING_RIGHT, BUILDING_RIGHT + 8, floorTop(i), floorBottom(i), 12)}
              fill="none"
              stroke={i === activeFloor ? GOLD : RULE}
              strokeWidth={1}
            />
          </g>
        );
      })}

      {/* Real floors — slabs + contents */}
      {FLOORS.map((f, i) => {
        const landed = i <= activeFloor;
        const isActive = i === activeFloor;
        return (
          <g key={f.key}>
            <line
              x1={BUILDING_X}
              x2={BUILDING_RIGHT}
              y1={floorTop(i)}
              y2={floorTop(i)}
              stroke={isActive ? GOLD : RULE}
              strokeWidth={1}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={landed ? 0 : 1}
              style={{
                transition: 'stroke-dashoffset 350ms cubic-bezier(0.22, 1, 0.36, 1), stroke 300ms ease-out',
              }}
            />
            <g
              opacity={landed ? (isActive ? 1 : 0.4) : 0}
              style={{
                transition: 'opacity 300ms ease-out, transform 300ms ease-out',
                transform: landed ? 'translateY(0)' : 'translateY(6px)',
                transformOrigin: `${BUILDING_X + BUILDING_W / 2}px ${floorMid(i)}px`,
              }}
            >
              <FloorContent floorKey={f.key} index={i} active={isActive} />
            </g>
          </g>
        );
      })}

      {/* Per-floor labels (right side) — appear when their floor lands */}
      {FLOORS.map((f, i) => {
        const landed = i <= activeFloor;
        const isActive = i === activeFloor;
        const y = floorMid(i);
        const tickColor = isActive ? GOLD : RULE;
        const numberFill = isActive ? GOLD_DEEP : MUTE;
        const nameFill = isActive ? INK : MUTE;
        const factFill = isActive ? INK_60 : MUTE;
        return (
          <g
            key={`lbl-${f.key}`}
            opacity={landed ? 1 : 0}
            style={{ transition: 'opacity 300ms ease-out 100ms' }}
          >
            <line
              x1={TICK_START}
              x2={TICK_END}
              y1={y}
              y2={y}
              stroke={tickColor}
              strokeWidth={1}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={landed ? 0 : 1}
              style={{
                transition:
                  'stroke-dashoffset 250ms cubic-bezier(0.22, 1, 0.36, 1) 250ms, stroke 300ms ease-out',
              }}
            />
            <text
              x={LABEL_X + 34}
              y={y - 5}
              textAnchor="end"
              fill={numberFill}
              fontFamily="var(--font-mono)"
              fontSize={15}
              letterSpacing="0.12em"
              style={{ transition: 'fill 300ms ease-out' }}
            >
              {f.levelLabel}
            </text>
            <text
              x={LABEL_X + 44}
              y={y - 5}
              fill={nameFill}
              fontFamily="var(--font-mono)"
              fontSize={17}
              letterSpacing="0.14em"
              style={{ transition: 'fill 300ms ease-out' }}
            >
              {labelT(`floors.${f.key}.name`)}
            </text>
            <text
              x={LABEL_X + 44}
              y={y + 14}
              fill={factFill}
              fontFamily="var(--font-mono)"
              fontSize={15}
              letterSpacing="0.06em"
              style={{ transition: 'fill 300ms ease-out' }}
            >
              {labelT(`floors.${f.key}.fact`)}
            </text>
          </g>
        );
      })}
      </g>
    </svg>
  );
}

// -----------------------------------------------------------------------------
// FLOOR CONTENTS (unchanged)
// -----------------------------------------------------------------------------

function FloorContent({
  floorKey,
  index,
  active,
}: {
  floorKey: FloorKey;
  index: number;
  active: boolean;
}) {
  const stroke = active ? GOLD : RULE;
  const fig = active ? GOLD : RULE;
  const top = floorTop(index);

  switch (floorKey) {
    case 'prayer':
      return <PrayerFloor top={top} stroke={stroke} fig={fig} />;
    case 'school':
      return <SchoolFloor top={top} stroke={stroke} fig={fig} />;
    case 'library':
      return <LibraryFloor top={top} stroke={stroke} fig={fig} />;
    case 'youth':
      return <YouthFloor top={top} stroke={stroke} fig={fig} />;
    case 'entrance':
      return <EntranceFloor top={top} stroke={stroke} fig={fig} />;
    case 'p1':
    case 'p2':
      return <ParkingFloor top={top} stroke={stroke} />;
  }
}

function PrayerFloor({ top, stroke, fig }: { top: number; stroke: string; fig: string }) {
  const cx = BUILDING_X + BUILDING_W / 2;
  const rowY1 = top + 65;
  const rowY2 = top + 77;
  const figHeadY = top + 48;
  const figXs = [cx - 60, cx - 30, cx, cx + 30, cx + 60];
  return (
    <g fill="none" stroke={stroke} strokeWidth={1} strokeLinecap="round">
      <path d={`M ${cx - 12} ${top + 43} L ${cx - 12} ${top + 25} Q ${cx - 12} ${top + 11} ${cx} ${top + 11} Q ${cx + 12} ${top + 11} ${cx + 12} ${top + 25} L ${cx + 12} ${top + 43}`} />
      <line x1={BUILDING_X + 24} x2={BUILDING_RIGHT - 24} y1={rowY1} y2={rowY1} />
      <line x1={BUILDING_X + 24} x2={BUILDING_RIGHT - 24} y1={rowY2} y2={rowY2} />
      {figXs.map((x) => <Figure key={x} x={x} y={figHeadY} fill={fig} />)}
    </g>
  );
}

function SchoolFloor({ top, stroke, fig }: { top: number; stroke: string; fig: string }) {
  const boxY = top + 20;
  const boxSize = 40;
  const boxes = [BUILDING_X + 30, BUILDING_X + 90, BUILDING_X + 150];
  return (
    <g fill="none" stroke={stroke} strokeWidth={1}>
      {boxes.map((x) => <rect key={x} x={x} y={boxY} width={boxSize} height={boxSize} />)}
      <line x1={BUILDING_X + 16} x2={BUILDING_RIGHT - 16} y1={top + 72} y2={top + 72} />
      <Figure x={BUILDING_RIGHT - 50} y={top + 52} fill={fig} />
      <Figure x={BUILDING_RIGHT - 32} y={top + 52} fill={fig} />
    </g>
  );
}

function LibraryFloor({ top, stroke, fig }: { top: number; stroke: string; fig: string }) {
  const shelfTop = top + 20;
  const shelfBot = top + 68;
  const leftShelfXs = [BUILDING_X + 28, BUILDING_X + 44, BUILDING_X + 60, BUILDING_X + 76];
  const rightShelfXs = [BUILDING_RIGHT - 60, BUILDING_RIGHT - 44, BUILDING_RIGHT - 28];
  const tableL = BUILDING_X + BUILDING_W / 2 - 34;
  const tableR = BUILDING_X + BUILDING_W / 2 + 34;
  return (
    <g fill="none" stroke={stroke} strokeWidth={1}>
      {leftShelfXs.map((x) => <line key={`ls-${x}`} x1={x} x2={x} y1={shelfTop} y2={shelfBot} />)}
      {rightShelfXs.map((x) => <line key={`rs-${x}`} x1={x} x2={x} y1={shelfTop} y2={shelfBot} />)}
      <rect x={tableL} y={top + 48} width={tableR - tableL} height={16} rx={2} />
      <Figure x={tableL + 14} y={top + 30} fill={fig} seated />
      <Figure x={tableR - 14} y={top + 30} fill={fig} seated />
    </g>
  );
}

function YouthFloor({ top, stroke, fig }: { top: number; stroke: string; fig: string }) {
  const floorLineY = top + 62;
  const deskY = top + 48;
  const deskW = 40;
  const deskXs = [BUILDING_X + 24, BUILDING_X + 78, BUILDING_X + 132, BUILDING_X + 186];
  return (
    <g fill="none" stroke={stroke} strokeWidth={1}>
      <line x1={BUILDING_X + 12} x2={BUILDING_RIGHT - 12} y1={floorLineY} y2={floorLineY} />
      {deskXs.map((x) => <rect key={`d-${x}`} x={x} y={deskY} width={deskW} height={6} rx={1.5} />)}
      {deskXs.map((x) => <Figure key={`fig-${x}`} x={x + deskW / 2} y={top + 30} fill={fig} seated />)}
      <Figure x={BUILDING_RIGHT - 30} y={top + 34} fill={fig} />
    </g>
  );
}

function EntranceFloor({ top, stroke, fig }: { top: number; stroke: string; fig: string }) {
  const midY = top + 49;
  return (
    <g fill="none" stroke={stroke} strokeWidth={1}>
      <circle cx={BUILDING_X + 46} cy={midY} r={12} />
      <circle cx={BUILDING_X + 94} cy={midY} r={12} />
      <rect x={BUILDING_X + 156} y={midY - 12} width={130} height={22} rx={2} />
      <Figure x={BUILDING_X + 134} y={midY - 20} fill={fig} />
    </g>
  );
}

function ParkingFloor({ top, stroke }: { top: number; stroke: string }) {
  const carY = top + 33;
  const carW = 80;
  const carH = 22;
  const xs = [BUILDING_X + 20, BUILDING_X + 120, BUILDING_X + 220];
  return (
    <g fill="none" stroke={stroke} strokeWidth={1}>
      {xs.map((x) => <rect key={x} x={x} y={carY} width={carW} height={carH} rx={7} />)}
    </g>
  );
}

function Figure({
  x,
  y,
  fill,
  seated = false,
}: {
  x: number;
  y: number;
  fill: string;
  seated?: boolean;
}) {
  const bodyH = seated ? 6 : 13;
  return (
    <g fill={fill} stroke="none">
      <circle cx={x} cy={y} r={3} />
      <rect x={x - 4} y={y + 3.5} width={8} height={bodyH} rx={2} />
    </g>
  );
}

function zigzagPath(x1: number, x2: number, yTop: number, yBottom: number, step: number) {
  const parts: string[] = [`M ${x1} ${yTop}`];
  let toRight = true;
  for (let y = yTop + step; y <= yBottom; y += step) {
    parts.push(`L ${toRight ? x2 : x1} ${y}`);
    toRight = !toRight;
  }
  return parts.join(' ');
}


// The floor register, phones only.
//
// On the desktop the seven floor labels sit in the SVG itself, to the right of
// the building (x >= 406 in an 840-wide viewBox). A phone gets a 400-wide
// viewBox, so those labels fall outside it; and widening the viewBox to reach
// them scales the type down to about 7px. Setting them as HTML instead keeps
// them at a real size and lets them reflow.
//
// Behaviour mirrors the SVG labels exactly: a floor appears once it has landed
// (i <= activeFloor) and only the active one is at full strength, so scrolling
// reads the same on both.
function FloorRegister({
  activeFloor,
  labelT,
}: {
  activeFloor: number;
  labelT: ReturnType<typeof useTranslations>;
}) {
  return (
    <ol className="flex min-w-0 flex-1 flex-col justify-center gap-2 md:hidden" aria-hidden>
      {[...FLOORS].map((f, revIdx) => ({ f, i: revIdx })).reverse().map(({ f, i }) => {
        // Every row is present from the start here, unlike the SVG labels,
        // which fade in as their floor lands. On a desktop that reveal is a
        // pleasure because the drawing is large and legible on its own; on a
        // phone it meant the reader saw an unlabelled diagram until they had
        // scrolled most of the section, which is exactly the "I can't see any
        // info" the client reported. The list is the information here, so it
        // is always readable; only the emphasis tracks the active floor.
        const isActive = i === activeFloor;
        return (
          <li key={f.key}>
            <p className="flex items-baseline gap-1.5 font-mono text-[11px] uppercase leading-[1.25] tracking-[0.08em]">
              <span className={cn('tabular-nums transition-colors duration-300', isActive ? 'text-gold-deep' : 'text-ink-60/55')}>
                {f.levelLabel}
              </span>
              <span className={cn('transition-colors duration-300', isActive ? 'text-ink' : 'text-ink-60/55')}>
                {labelT(`floors.${f.key}.name`)}
              </span>
            </p>
            <p
              className={cn(
                'mt-0.5 font-mono text-[10px] leading-[1.3] transition-colors duration-300',
                isActive ? 'text-ink-60' : 'text-ink-60/40',
              )}
            >
              {labelT(`floors.${f.key}.fact`)}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
