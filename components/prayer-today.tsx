'use client';

import { useEffect, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { cn } from '@/lib/cn';
import { PRAYER_ORDER, prayerWindow, type PrayerWindow } from '@/lib/prayer-window';
import { joinJumuah, usePrayerData, usePrayerDay } from './prayer-data-provider';

// Prayer times as a thing happening: the window you are in fills, the next one counts down.

const ORDER = PRAYER_ORDER;

export function PrayerToday() {
  const t = useTranslations('prayerVisit');
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const { jumuah } = usePrayerData();
  const today = usePrayerDay(now);
  const state: PrayerWindow | null =
    now && today ? prayerWindow(today, now.getHours() * 60 + now.getMinutes()) : null;
  const root = useRef<HTMLDivElement>(null);
  const live = useInView(root, { margin: '-10% 0px' });

  useEffect(() => setMounted(true), []);
  const still = mounted && reduced === true;

  useEffect(() => {
    const tick = () => setNow(new Date());
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
                    {today ? today[key] : '—'}
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
        <span className="font-semibold text-ink">{joinJumuah(jumuah)}</span>
      </div>
    </div>
  );
}
