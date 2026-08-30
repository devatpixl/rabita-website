'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { hijriDate } from '@/lib/hijri';
import { PRAYER_ORDER } from '@/lib/prayer-window';
import type { AppLocale } from '@/i18n/routing';
import { usePrayerDay, usePrayerDayAfter } from './prayer-data-provider';
import { cn } from '@/lib/cn';

// The board, as a mosque would hang one — but built out of the site's own
// materials rather than a black rectangle with LED type.
//
// It answers the two questions a visitor actually arrives with, in order:
// what time is it, and how long until the next prayer. Everything else on
// the panel is context for those two numbers.
//
// The strip underneath is the day itself: each prayer sits at its TRUE
// position between midnight and midnight, so the shape of the day — the
// long emptiness after Asr, the three that crowd the evening — is visible
// at a glance. The gold fill is how much of today has gone.
//
// Client-only and mount-guarded: a clock rendered on the server is wrong
// by the time it reaches the browser.

const SECONDS_IN_DAY = 86_400;

function secondsOf(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 3600 + m * 60;
}

/** "01:12:45", always two digits, so the panel never reflows as it counts. */
function hms(total: number): string {
  const s = Math.max(0, Math.floor(total));
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
}

export function PrayerClock() {
  const t = useTranslations('prayerClock');
  const tv = useTranslations('prayerVisit');
  const locale = useLocale() as AppLocale;

  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const today = usePrayerDay(now);
  const tomorrow = usePrayerDayAfter(now);

  const state = useMemo(() => {
    if (!now || !today) return null;
    const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const stops = PRAYER_ORDER.map((key) => ({ key, time: today[key], at: secondsOf(today[key]) }));

    let next = stops.find((s) => s.at > nowSec);
    let prev = [...stops].reverse().find((s) => s.at <= nowSec) ?? null;
    let untilNext: number;
    if (next) {
      untilNext = next.at - nowSec;
    } else {
      // Past Isha: tomorrow's Fajr, so the countdown crosses midnight.
      const fajr = tomorrow?.fajr ?? today.fajr;
      next = { key: 'fajr' as const, time: fajr, at: secondsOf(fajr) };
      untilNext = SECONDS_IN_DAY - nowSec + next.at;
      prev = stops[stops.length - 1];
    }
    return { nowSec, stops, next, prev, untilNext };
  }, [now, today, tomorrow]);

  const clock = now
    ? {
        hm: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        ss: String(now.getSeconds()).padStart(2, '0'),
      }
    : { hm: '--:--', ss: '--' };

  return (
    <section className="bg-paper py-section-sm">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-dusk px-6 py-8 text-paper md:px-10 md:py-10">
          {/* A single soft glow behind the figures, so the panel reads as lit
             rather than printed. No animation — it is a clock, not a toy. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 -top-32 h-80 w-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(201,169,106,0.16) 0%, rgba(201,169,106,0) 70%)' }}
          />

          <div className="relative flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-gold">
              {t('eyebrow')}
            </p>
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-paper/45">
              {now ? hijriDate(locale, now) : ''}
            </p>
          </div>

          {/* The two numbers that matter, side by side. */}
          <div className="relative mt-6 grid gap-8 md:mt-8 md:grid-cols-2 md:items-end md:gap-12">
            <div>
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-paper/45">
                {t('nowLabel')}
              </p>
              <p className="mt-3 flex items-baseline gap-2 font-serif leading-none tabular-nums text-paper">
                <span className="text-[clamp(3.25rem,9vw,5.5rem)] tracking-[-0.02em]">{clock.hm}</span>
                <span className="font-mono text-[clamp(1rem,2vw,1.35rem)] text-gold">{clock.ss}</span>
              </p>
            </div>

            <div className="md:text-end">
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-gold">
                {state ? `${t('nextLabel')} · ${tv(`names.${state.next.key}`)}` : t('nextLabel')}
              </p>
              <p className="mt-3 font-mono text-[clamp(2.25rem,6vw,3.5rem)] leading-none tabular-nums text-paper">
                {state ? hms(state.untilNext) : '--:--:--'}
              </p>
              <p className="mt-2 font-serif text-[1.15rem] tabular-nums text-paper/60">
                {state ? state.next.time : '--:--'}
              </p>
            </div>
          </div>

          {/* The day as one strip: midnight to midnight, each prayer at its
             true hour, the gold fill showing how much has gone. */}
          <div className="relative mt-10 md:mt-12">
            <div className="relative h-px w-full bg-paper/15">
              <div
                className="absolute inset-y-0 left-0 bg-gold"
                style={{ width: state ? `${(state.nowSec / SECONDS_IN_DAY) * 100}%` : '0%' }}
              />
              {state?.stops.map((s) => {
                const isNext = s.key === state.next.key;
                return (
                  <span
                    key={s.key}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${(s.at / SECONDS_IN_DAY) * 100}%` }}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'block rotate-45',
                        isNext ? 'h-2.5 w-2.5 bg-gold' : 'h-1.5 w-1.5 bg-paper/40',
                      )}
                    />
                  </span>
                );
              })}
              {/* Now. */}
              {state && (
                <span
                  aria-hidden
                  className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dusk bg-gold"
                  style={{ left: `${(state.nowSec / SECONDS_IN_DAY) * 100}%` }}
                />
              )}
            </div>
            <div className="mt-3 flex justify-between font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-paper/35">
              <span>00</span>
              <span>06</span>
              <span>12</span>
              <span>18</span>
              <span>24</span>
            </div>
          </div>

          {/* The six times, given the same weight they have on the light
             block above: this is what the board is for. The next one sits
             in a lit cell under a gold cap, so it is found before it is
             read. */}
          <dl className="mt-8 grid grid-cols-3 border-t border-paper/15 lg:grid-cols-6">
            {PRAYER_ORDER.map((key) => {
              const isNext = state?.next.key === key;
              return (
                <div
                  key={key}
                  className={cn(
                    'relative border-b border-paper/10 px-2 py-6 lg:border-b-0',
                    isNext && 'bg-paper/[0.07]',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'absolute inset-x-0 top-0 block h-[2px]',
                      isNext ? 'bg-gold' : 'bg-transparent',
                    )}
                  />
                  <dt
                    className={cn(
                      'flex items-baseline gap-2 font-mono text-[0.625rem] uppercase tracking-[0.14em]',
                      isNext ? 'text-gold' : 'text-paper/45',
                    )}
                  >
                    {tv(`names.${key}`)}
                    {isNext && (
                      <span className="lowercase tracking-normal">· {t('nextLabel')}</span>
                    )}
                  </dt>
                  <dd
                    className={cn(
                      'mt-3 font-serif leading-none tabular-nums',
                      isNext
                        ? 'text-[clamp(1.75rem,4vw,2.75rem)] text-gold'
                        : 'text-[clamp(1.5rem,3vw,2.25rem)] text-paper',
                    )}
                  >
                    {today ? today[key] : '--:--'}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
}
