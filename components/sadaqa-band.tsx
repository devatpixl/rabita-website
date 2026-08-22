'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { Accent } from './accent';
import { SectionBody } from './primitives';
import { GiveCTA } from './give-cta';
import { cn } from '@/lib/cn';

// The dedication ask. Scrolling the section walks the rooms; touch, keyboard or the picker take over.
const GRADE = 'saturate(0.72) contrast(1.12) brightness(0.9)';
const SLIDE = 0.8;
const TRAVEL = [0.45, 0.02, 0.18, 1] as const;

const ROOMS = [
  { key: 'mainHall', src: '/photos/room-main-hall.webp' },
  { key: 'womensHall', src: '/photos/room-womens-hall.webp' },
  { key: 'qibla', src: '/photos/room-qibla.webp' },
  { key: 'lowerHall', src: '/photos/room-lower-hall.webp' },
] as const;

export function SadaqaBand() {
  const t = useTranslations('sadaqaBand');
  const locale = useLocale();
  const rtl = locale === 'ar';
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const still = mounted && reduced === true;

  const box = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [manual, setManual] = useState(false);
  const count = ROOMS.length;

  const go = useCallback(
    (n: number, d: number) => {
      setManual(true);
      setDir(d);
      setIndex((n + count) % count);
    },
    [count],
  );
  const next = useCallback(() => go(index + 1, 1), [index, go]);
  const prev = useCallback(() => go(index - 1, -1), [index, go]);

  // The section's own trip past the window, divided between the rooms.
  const { scrollYProgress } = useScroll({
    target: box,
    offset: ['start 88%', 'end 12%'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (manual || still) return;
    const n = Math.min(count - 1, Math.max(0, Math.floor(v * count)));
    setIndex((was) => {
      if (n === was) return was;
      setDir(n > was ? 1 : -1);
      return n;
    });
  });

  // In Arabic the whole thing reads the other way, so forward travels the other way.
  const away = rtl ? -1 : 1;
  const room = ROOMS[index];
  const touchX = useRef(0);

  return (
    <section
      id="sadaqa-jariya"
      aria-labelledby="sadaqa-band-heading"
      className="bg-paper py-section-lg"
    >
      <SectionBody>
        <div className="grid items-start gap-12 md:grid-cols-12 md:gap-16">
          {/* The ask */}
          <div className="md:col-span-5">
            <h2
              id="sadaqa-band-heading"
              className="font-serif text-section text-balance text-ink"
            >
              {t.rich('heading', {
                em: (chunks) => <Accent surface="paper">{chunks}</Accent>,
              })}
            </h2>
            <p className="mt-6 max-w-prose text-body text-ink-60">{t('body')}</p>
            <div className="mt-8">
              <GiveCTA label={t('cta')} />
            </div>
          </div>

          {/* The rooms */}
          <div
            ref={box}
            className="md:col-span-7"
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              const d = touchX.current - e.changedTouches[0].clientX;
              if (Math.abs(d) > 55) (d * away > 0 ? next : prev)();
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') (rtl ? prev : next)();
              if (e.key === 'ArrowLeft') (rtl ? next : prev)();
            }}
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-paper-2">
              <AnimatePresence initial={false} custom={dir * away}>
                <motion.div
                  key={room.key}
                  custom={dir * away}
                  className="absolute inset-0 overflow-hidden"
                  variants={{
                    enter: (d: number) => ({ x: still ? 0 : `${d * 100}%` }),
                    rest: { x: 0 },
                    leave: (d: number) => ({ x: still ? 0 : `${d * -100}%` }),
                  }}
                  initial="enter"
                  animate="rest"
                  exit="leave"
                  transition={{ duration: still ? 0 : SLIDE, ease: [...TRAVEL] }}
                >
                  {/* The picture lags the frame it sits in, which is what gives the travel depth instead of a flat slide. */}
                  <motion.div
                    className="absolute inset-0"
                    custom={dir * away}
                    variants={{
                      enter: (d: number) => ({
                        x: still ? 0 : `${d * -26}%`,
                        scale: still ? 1 : 1.06,
                      }),
                      rest: { x: 0, scale: 1 },
                      leave: (d: number) => ({
                        x: still ? 0 : `${d * 26}%`,
                        scale: still ? 1 : 1.06,
                      }),
                    }}
                    transition={{ duration: still ? 0 : SLIDE, ease: [...TRAVEL] }}
                  >
                    <Image
                      src={room.src}
                      alt={t(`rooms.${room.key}.alt`)}
                      fill
                      sizes="(min-width: 768px) 58vw, 90vw"
                      className="object-cover"
                      style={{ filter: GRADE }}
                      priority={index === 0}
                    />
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* Corner rules, the same frame gesture the chapter photo uses */}
              <span
                aria-hidden
                className="pointer-events-none absolute start-4 top-4 z-10 h-8 w-8 border-s border-t border-gold/70"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-4 end-4 z-10 h-8 w-8 border-b border-e border-gold/70"
              />
            </div>

            {/* Phone: one room at a time, with arrows.

               Four names in a 2x2 grid meant the reader was looking at ONE
               photograph while reading FOUR labels, three of which described
               something not on screen, and the 68px columns broke every name
               in half. Now the label names the picture above it and the
               arrows say the rest exist. */}
            <div className="mt-5 md:hidden">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => go(index - 1, -1)}
                  aria-label={t('rooms.prev')}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-rule text-ink transition-colors active:scale-95"
                >
                  <RoomChevron className="h-4 w-4 rtl:rotate-180" />
                </button>
                <p aria-live="polite" className="min-w-0 flex-1 text-center">
                  <span className="block font-serif text-[1.1rem] leading-tight text-ink">
                    {t(`rooms.${room.key}.label`)}
                  </span>
                  <span className="mt-0.5 block font-mono text-[11px] uppercase tracking-[0.16em] tabular-nums text-ink-60">
                    {index + 1} / {count}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => go(index + 1, 1)}
                  aria-label={t('rooms.next')}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-rule text-ink transition-colors active:scale-95"
                >
                  <RoomChevron className="h-4 w-4 rotate-180 rtl:rotate-0" />
                </button>
              </div>
              <span aria-hidden className="mt-4 flex gap-1.5">
                {ROOMS.map((r, i) => (
                  <span
                    key={r.key}
                    className={cn(
                      'h-[2px] flex-1 transition-colors duration-300',
                      i === index ? 'bg-gold-deep' : 'bg-rule',
                    )}
                  />
                ))}
              </span>
            </div>

            {/* Desktop keeps the four tracks side by side, where there is room
               for four names and the reader can see the whole set at once */}
            <ul
              className="mt-5 hidden gap-x-6 gap-y-2 md:grid md:[grid-template-columns:repeat(var(--rooms),minmax(0,1fr))]"
              style={{ '--rooms': count } as React.CSSProperties}
            >
              {ROOMS.map((r, i) => (
                <li key={r.key}>
                  <button
                    type="button"
                    onClick={() => go(i, i > index ? 1 : -1)}
                    aria-current={i === index}
                    className="group block w-full text-start"
                  >
                    <span aria-hidden className="block h-[2px] w-full overflow-hidden bg-rule">
                      <span
                        className="block h-full bg-gold-deep transition-[width] duration-500 ease-out"
                        style={{ width: i <= index ? '100%' : '0%' }}
                      />
                    </span>
                    <span
                      className={cn(
                        'mt-3 flex min-h-11 items-start text-[14px] leading-tight transition-colors duration-200',
                        i === index
                          ? 'font-semibold text-ink'
                          : 'text-ink-60 group-hover:text-ink',
                      )}
                    >
                      {t(`rooms.${r.key}.label`)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <p
              className="mt-2 min-h-[3rem] text-[14px] leading-relaxed text-ink-60"
              aria-live="polite"
            >
              {t(`rooms.${room.key}.caption`)}
            </p>
          </div>
        </div>
      </SectionBody>
    </section>
  );
}

function RoomChevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}
