'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

// The project's six years, as a pinned scroll sequence.
//
// The shape is the one the client pointed at (moenengros.no/om-oss): a year
// rail that fills as you go, one chapter held on screen at a time, the picture
// swapping sides each step, and a counter at the foot. Taken as a pattern, not
// copied — the type, colour and rules are this site's.
//
// One chapter is mounted at a time and cross-faded, rather than all six
// stacked: these images are unrelated to each other, so a dissolve is a
// dissolve, not the "same camera" trick that components/rise-figures.tsx can
// rely on.
//
// Under prefers-reduced-motion the pin is dropped entirely and all six run as
// an ordinary stacked list — no track, no sticky, nothing driven by scroll.

const YEARS = ['vision', 'preparation', 'demolition', 'construction', 'interior', 'completion'] as const;

const IMAGES: Record<(typeof YEARS)[number], string> = {
  vision: '/photos/fremdrift/vision.webp',
  preparation: '/photos/fremdrift/preparation.webp',
  demolition: '/photos/fremdrift/demolition.webp',
  construction: '/photos/fremdrift/construction.webp',
  interior: '/photos/fremdrift/interior.webp',
  completion: '/photos/fremdrift/completion.webp',
};

export function ProgressTimeline() {
  const t = useTranslations('fremdrift');
  const track = useRef<HTMLDivElement>(null);
  // The bar is written straight to the element's style rather than held in
  // state: it changes on every animation frame, and re-rendering six chapters
  // sixty times a second to move one width is waste. Only the step — which
  // changes six times in the whole section — goes through React.
  const fill = useRef<HTMLSpanElement>(null);
  const [step, setStep] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      const el = track.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const travel = r.height - window.innerHeight;
      const p = travel <= 0 ? 0 : Math.min(1, Math.max(0, -r.top / travel));

      // Six chapters, five gaps between six dots. The bar has to reach dot i
      // at the exact moment chapter i+1 takes over, so progress is remapped
      // rather than used raw: chapter i owns the slice [i/6, (i+1)/6), and
      // across that slice the bar travels from dot i to dot i+1, which are
      // i/5 and (i+1)/5 of the rail. Used raw, the bar would reach the last
      // dot a whole chapter early and the last chapter would never get a
      // slice of its own.
      const i = Math.min(YEARS.length - 1, Math.floor(p * YEARS.length));
      const local = p * YEARS.length - i;
      const gaps = YEARS.length - 1;
      const pct = i >= gaps ? 1 : (i + local) / gaps;
      if (fill.current) fill.current.style.width = `${(pct * 100).toFixed(2)}%`;

      setStep(i);
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

  // Reduced motion, and the no-JS shape: all six, plainly, in order.
  if (reduced) {
    return (
      <section className="bg-paper py-section-md">
        <div className="mx-auto max-w-6xl px-6">
          <Head t={t} />
          <ol className="mt-14 space-y-16">
            {YEARS.map((k, i) => (
              <li key={k} className="grid gap-8 md:grid-cols-2 md:items-center md:gap-14">
                <Figure k={k} alt={t(`years.${k}.name`)} flip={i % 2 === 1} />
                <Chapter t={t} k={k} />
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section ref={track} className="relative bg-paper" style={{ height: `${YEARS.length * 90 + 40}vh` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-6 pt-24 md:pt-28">
          <Head t={t} centred />
          <YearRail t={t} step={step} fillRef={fill} />
        </div>

        {/* The chapter. Both halves swap sides on odd steps, which is what
           stops six chapters in a row reading as a list. */}
        <div className="relative mx-auto min-h-0 w-full max-w-6xl flex-1 px-6 py-6">
          {YEARS.map((k, i) => (
            <div
              key={k}
              aria-hidden={i !== step}
              className={cn(
                'absolute inset-x-6 inset-y-6 grid gap-8 md:grid-cols-2 md:items-center md:gap-14',
                'transition-opacity duration-500 ease-out',
                i === step ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
            >
              <Figure k={k} alt={t(`years.${k}.name`)} flip={i % 2 === 1} />
              <Chapter t={t} k={k} flip={i % 2 === 1} />
            </div>
          ))}
        </div>

        <div className="mx-auto flex w-full max-w-6xl items-end justify-between gap-6 px-6 pb-10">
          <span aria-hidden className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-60">
            {t('scrollHint')}
          </span>
          <p className="font-mono text-[0.6875rem] tabular-nums tracking-[0.14em] text-ink-60">
            <span className="font-serif text-[1.35rem] text-ink">{String(step + 1).padStart(2, '0')}</span>
            {' / '}
            {String(YEARS.length).padStart(2, '0')}
          </p>
        </div>
      </div>
    </section>
  );
}

function Head({ t, centred }: { t: ReturnType<typeof useTranslations>; centred?: boolean }) {
  return (
    <div className={cn(centred && 'text-center')}>
      <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
        {t('timelineEyebrow')}
      </p>
      <h2 className={cn('mt-3 font-serif text-section text-balance text-ink', centred && 'mx-auto max-w-2xl')}>
        {t('timelineHeading')}
      </h2>
    </div>
  );
}

// The rail: one continuous track with a single fill running along it, and
// six dots pinned at fixed percentages. It used to be six independent
// segments that each snapped to gold — which read as a stepper, not as
// something loading. Now the line grows, and a dot lights the moment the
// line arrives at it.
function YearRail({
  t,
  step,
  fillRef,
}: {
  t: ReturnType<typeof useTranslations>;
  step: number;
  fillRef: React.RefObject<HTMLSpanElement | null>;
}) {
  const gaps = YEARS.length - 1;
  return (
    <div className="mt-9 md:mt-11">
      {/* The track is inset by half a dot at each end so the line starts and
         finishes at the dot centres rather than past them. */}
      <div className="relative h-2">
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-rule" />
        <span
          ref={fillRef}
          aria-hidden
          className="absolute inset-y-0 start-0 top-1/2 h-px w-0 -translate-y-1/2 bg-gold-deep rtl:origin-right"
        />
        {YEARS.map((k, i) => (
          <span
            key={k}
            aria-hidden
            className={cn(
              'absolute top-1/2 block h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 transition-colors duration-300 rtl:translate-x-1/2',
              i <= step ? 'bg-gold-deep' : 'bg-rule',
            )}
            style={{ insetInlineStart: `${(i / gaps) * 100}%` }}
          />
        ))}
      </div>

      {/* Labels on their own row, so a long one like 2019–2024 cannot push
         the dots off their percentages. */}
      <div className="relative mt-3 h-4">
        {YEARS.map((k, i) => (
          <span
            key={k}
            className={cn(
              'absolute top-0 whitespace-nowrap font-mono text-[0.5625rem] tabular-nums tracking-[0.1em] transition-colors duration-300 sm:text-[0.625rem]',
              i <= step ? 'text-ink' : 'text-ink-60/60',
              // The end labels hug the ends instead of centring, or they hang
              // off the rail.
              i === 0 ? 'start-0' : i === gaps ? 'end-0' : '-translate-x-1/2 rtl:translate-x-1/2',
            )}
            style={i === 0 || i === gaps ? undefined : { insetInlineStart: `${(i / gaps) * 100}%` }}
          >
            {t(`years.${k}.label`)}
          </span>
        ))}
      </div>
    </div>
  );
}

function Figure({ k, alt, flip }: { k: (typeof YEARS)[number]; alt: string; flip?: boolean }) {
  return (
    <div
      className={cn(
        'relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] bg-paper-2',
        flip && 'md:order-2',
      )}
    >
      <Image src={IMAGES[k]} alt={alt} fill sizes="(min-width: 768px) 40rem, 92vw" className="object-cover" />
    </div>
  );
}

function Chapter({
  t,
  k,
  flip,
}: {
  t: ReturnType<typeof useTranslations>;
  k: (typeof YEARS)[number];
  flip?: boolean;
}) {
  return (
    <div className={cn(flip && 'md:order-1 md:text-end')}>
      <span
        aria-hidden
        className={cn('block h-2.5 w-2.5 rotate-45 bg-gold-deep', flip && 'md:ms-auto')}
      />
      <p className="mt-4 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-60">
        {t(`years.${k}.label`)}
      </p>
      <h3 className="mt-3 font-serif text-[clamp(1.6rem,3.2vw,2.4rem)] leading-[1.1] text-ink">
        {t(`years.${k}.name`)}
      </h3>
      <p className={cn('mt-4 max-w-[46ch] text-body text-ink-60', flip && 'md:ms-auto')}>
        {t(`years.${k}.body`)}
      </p>
    </div>
  );
}
