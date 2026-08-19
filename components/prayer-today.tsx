'use client';

import { useEffect, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { PRAYER_TIMES_TODAY } from '@/lib/campaign';
import { cn } from '@/lib/cn';

// Today's prayer times, as a thing that is happening rather than a table of
// figures. The row you are inside is marked and carries a line that fills as
// the window runs down, and the row you are waiting for counts down to itself.
//
// This is the most used thing on a mosque site, and the flat list gave a
// reader no answer to the only question they arrive with, which is how long
// they have. Everything else here is unchanged: same times, same order, same
// tabular figures.
//
// Recomputed every 30 seconds, which is cheap and crosses a boundary cleanly.
// The clock runs under reduced motion too; only the entrance stagger drops.

const ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
type Key = (typeof ORDER)[number];

const mins = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Which window we are inside, and which one is next, in minutes from midnight. */
function windowNow(nowMin: number) {
  const stops = ORDER.map((k) => ({ key: k, at: mins(PRAYER_TIMES_TODAY[k]) }));
  let current = stops[stops.length - 1]; // before Fajr we are still inside last night's Isha
  let next = stops[0];
  let wrapped = true;
  for (let i = 0; i < stops.length; i++) {
    if (nowMin >= stops[i].at) {
      current = stops[i];
      next = stops[i + 1] ?? stops[0];
      wrapped = i === stops.length - 1;
    }
  }
  const from = current.at;
  const to = wrapped || next.at <= from ? next.at + 1440 : next.at;
  const n = nowMin < from ? nowMin + 1440 : nowMin;
  const span = Math.max(1, to - from);
  return {
    current: current.key,
    next: next.key,
    untilNext: Math.max(0, to - n),
    through: Math.min(1, Math.max(0, (n - from) / span)),
  };
}

export function PrayerToday() {
  const t = useTranslations('prayerVisit');
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<ReturnType<typeof windowNow> | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const live = useInView(root, { once: true, margin: '-10% 0px' });

  useEffect(() => setMounted(true), []);
  const still = mounted && reduced === true;

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setState(windowNow(d.getHours() * 60 + d.getMinutes()));
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  const countdown = (m: number) => {
    const h = Math.floor(m / 60);
    const r = m % 60;
    return h > 0 ? t('untilHm', { h, m: r }) : t('untilM', { m: r });
  };

  return (
    <div ref={root}>
      <ul className="border-y border-rule">
        {ORDER.map((key, i) => {
          const isNow = state?.current === key;
          const isNext = state?.next === key;
          return (
            <motion.li
              key={key}
              data-prayer={key}
              className={cn(
                'relative border-b border-rule last:border-b-0',
                isNow && 'bg-paper',
              )}
              initial={still ? false : { opacity: 0, y: 8 }}
              animate={live || still ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{
                duration: still ? 0 : 0.45,
                ease: [0.22, 1, 0.36, 1],
                delay: still ? 0 : i * 0.05,
              }}
            >
              <div className="flex items-baseline justify-between gap-4 py-3 text-body tabular-nums">
                <span className="flex items-baseline gap-3">
                  {/* the mark sits in the gutter so the names stay aligned */}
                  <span
                    aria-hidden
                    className={cn(
                      'inline-block h-[6px] w-[6px] shrink-0 rotate-45 transition-colors duration-300',
                      isNow ? 'bg-gold-deep' : 'bg-transparent',
                    )}
                  />
                  <span className={cn(isNow ? 'font-semibold text-ink' : 'text-ink')}>
                    {t(`names.${key}`)}
                  </span>
                  {isNow && (
                    <span className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-gold-deep">
                      {t('now')}
                    </span>
                  )}
                </span>

                <span className="flex items-baseline gap-3">
                  {isNext && state && (
                    <span className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-ink-60">
                      {countdown(state.untilNext)}
                    </span>
                  )}
                  <span className={cn(isNow ? 'font-semibold text-ink' : 'text-ink-60')}>
                    {PRAYER_TIMES_TODAY[key]}
                  </span>
                </span>
              </div>

              {/* How far through this window we are */}
              {isNow && state && (
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 block h-[2px] bg-gold-deep transition-[width] duration-1000 ease-out"
                  style={{ width: `${Math.round(state.through * 100)}%` }}
                />
              )}
            </motion.li>
          );
        })}
      </ul>

      <div
        id="fredagsbonn"
        className="flex items-baseline justify-between gap-4 border-b border-rule bg-paper py-3 text-body tabular-nums"
      >
        <span className="ps-[18px] font-semibold text-ink">{t('names.jumua')}</span>
        <span className="font-semibold text-ink">{PRAYER_TIMES_TODAY.jumua}</span>
      </div>
    </div>
  );
}
