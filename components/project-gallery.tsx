'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

// The renders of the new building, as one plate you page through. The
// caption sits INSIDE the picture, bottom-left on a dusk gradient, so the
// image keeps its full size and the words stay legible over any render.
// Arrows bottom-right, a thumbnail strip underneath, keyboard arrows and
// swipe on touch. Cross-fade between plates; nothing else moves.

const SLIDES = [
  { key: 'aerial', src: '/photos/project-aerial.webp', pos: '50% 40%' },
  { key: 'facadeDay', src: '/photos/band-facade.webp', pos: '50% 60%' },
  { key: 'facadeNight', src: '/photos/story-facade-night.webp', pos: '50% 50%' },
  { key: 'mainHall', src: '/photos/room-main-hall.webp', pos: '50% 50%' },
  { key: 'womensHall', src: '/photos/room-womens-hall.webp', pos: '50% 50%' },
  { key: 'qibla', src: '/photos/zoom-qibla-wall.webp', pos: '50% 50%' },
  { key: 'minaret', src: '/photos/zoom-minaret.webp', pos: '50% 40%' },
  { key: 'garden', src: '/photos/zoom-garden.webp', pos: '50% 50%' },
  { key: 'wudu', src: '/photos/zoom-wudu.webp', pos: '50% 50%' },
] as const;
export type SlideKey = (typeof SLIDES)[number]['key'];

const GRADE = 'saturate(0.8) contrast(1.08) brightness(0.95)';

export function ProjectGallery({ only }: { only?: SlideKey[] } = {}) {
  const t = useTranslations('projectPage.gallery');
  const slides = only ? SLIDES.filter((s) => only.includes(s.key)) : SLIDES;
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  const n = slides.length;
  const go = useCallback((to: number) => setI(((to % n) + n) % n), [n]);
  const next = useCallback(() => go(i + 1), [go, i]);
  const prev = useCallback(() => go(i - 1), [go, i]);

  // Keyboard, while the plate has focus.
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
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={t('label')}
      tabIndex={0}
      className="outline-none focus-visible:ring-2 focus-visible:ring-gold-deep/40 rounded-3xl"
    >
      <div
        // Full width, but never taller than the screen can show together
        // with the header and the thumbnail strip: on a 13-inch laptop the
        // 16:10 plate alone overran the viewport. Below the cap the aspect
        // ratio rules; above it the height does and object-cover crops.
        // `w-full` is load-bearing: with width:auto, aspect-ratio transfers
        // the max-height onto the width and the plate shrinks sideways.
        className="relative w-full aspect-[4/5] max-h-[calc(100svh-15rem)] min-h-[20rem] overflow-hidden rounded-2xl bg-dusk sm:aspect-[16/10] sm:rounded-3xl"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        style={{ touchAction: 'pan-y' }}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={k}
            className="absolute inset-0"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={slide.src}
              alt={t(`items.${k}.alt`)}
              fill
              priority={i === 0}
              sizes="(min-width: 1024px) 78vw, 92vw"
              className="select-none object-cover"
              style={{ filter: GRADE, objectPosition: slide.pos }}
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {/* Shade for the caption: strongest at the foot, gone by mid-plate. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%]"
          style={{ background: 'linear-gradient(180deg, rgba(22,36,46,0) 0%, rgba(22,36,46,0.55) 45%, rgba(22,36,46,0.9) 100%)' }}
        />

        {/* Caption, bottom-left; arrows, bottom-right. */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 text-paper sm:gap-6 sm:p-7 lg:p-9">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={k}
              className="min-w-0 max-w-[36rem]"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: reduced ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-gold">
                {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')} · {t(`items.${k}.tag`)}
              </p>
              <h3 className="mt-2 font-serif text-[clamp(1.35rem,2.6vw,2rem)] leading-tight text-paper">
                {t(`items.${k}.title`)}
              </h3>
              <p className="mt-1.5 hidden max-w-[52ch] text-[14px] leading-relaxed text-paper/80 sm:block sm:text-[15px]">
                {t(`items.${k}.caption`)}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex shrink-0 items-center gap-2">
            <ArrowButton dir="prev" label={t('prev')} onClick={prev} />
            <ArrowButton dir="next" label={t('next')} onClick={next} />
          </div>
        </div>
      </div>

      {/* Phones: nine dots. */}
      <ol className="mt-4 flex items-center justify-center gap-2 sm:hidden" aria-label={t('label')}>
        {slides.map((s, idx) => (
          <li key={s.key}>
            <button
              type="button"
              onClick={() => go(idx)}
              aria-label={t('goto', { n: idx + 1 })}
              aria-current={idx === i ? 'true' : undefined}
              className="grid h-8 w-5 place-items-center"
            >
              <span className={cn('block h-[2px] rounded-full transition-all', idx === i ? 'w-5 bg-gold-deep' : 'w-3 bg-ink/25')} />
            </button>
          </li>
        ))}
      </ol>
      {/* From sm: thumbnails, the whole set at a glance, current one framed in gold. */}
      <ol className="no-scrollbar mt-4 hidden gap-2 overflow-x-auto pb-1 sm:flex" aria-label={t('label')}>
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
                  'relative block h-14 w-[5.5rem] overflow-hidden rounded-lg transition-opacity sm:h-16 sm:w-24',
                  on ? 'opacity-100 ring-2 ring-gold-deep ring-offset-2 ring-offset-paper-2' : 'opacity-55 hover:opacity-90',
                )}
              >
                <Image src={s.src} alt="" fill sizes="96px" className="object-cover" style={{ objectPosition: s.pos }} />
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ArrowButton({ dir, label, onClick }: { dir: 'prev' | 'next'; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full border border-paper/35 bg-dusk/40 text-paper backdrop-blur-sm transition-colors hover:border-paper hover:bg-paper hover:text-dusk sm:h-11 sm:w-11"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn('h-4 w-4', dir === 'prev' ? 'rtl:rotate-180' : 'rotate-180 rtl:rotate-0')} aria-hidden>
        <path d="M15 5l-7 7 7 7" />
      </svg>
    </button>
  );
}
