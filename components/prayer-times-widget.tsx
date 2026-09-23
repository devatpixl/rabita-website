'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { PrayerDay } from '@/lib/prayer-times';
import type { AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/cn';
import {
  PRAYER_PANEL_ID,
  usePrayerPanel,
} from './prayer-panel-provider';
import { joinJumuah, usePrayerData, usePrayerDay, usePrayerDayAfter } from './prayer-data-provider';

// Utility-strip content — ALL SIX TIMES, always open.
//
// ── WHY IT IS A RAIL AND NOT A TRIGGER ────────────────────────────────────
// It used to show one time: the NEXT prayer, with a countdown and a chevron
// that opened a panel holding the other five. The client relayed congregation
// feedback on 2026-09-22:
//
//   "Har fått tilbakemelding om at veldig mange ser etter bønnetidene og de
//    ikke vil klikke seg videre når de trykker på hjemmesiden. Kanskje vi bør
//    vurdere å ha alle bønnetiden øverst ikke bare duhr?"
//
// Measured on the deployed site before changing anything: across the whole
// 10 592px home page there were exactly two prayer times in the DOM, both the
// same one, and both inside `hidden md:*` containers. So on a phone — the
// device people check prayer times on — the home page carried none at all,
// and the only route was burger → Bønnetider. Two taps for the one fact most
// visitors arrive for.
//
// His "ikke bare duhr" is a detail worth not repeating back to him wrong: the
// strip never picked Duhr. It showed whichever prayer was next, and he looked
// in the afternoon.
//
// The panel still exists behind the chevron and still earns its place — it
// carries the elapsed hairline, Jumu'ah, the Hijri date and the full-week
// link. What changed is that it is no longer the only way to see Asr.
//
// ── WHAT GAVE, TO FIT SIX IN 44px ─────────────────────────────────────────
// The Hijri date moved into the panel (it is a date, not a time, and nobody
// arrives for it). Jumu'ah stays in the strip but only from lg — below that
// six times plus a two-time Friday range does not fit, and the times win.
// Both are still one tap away, which is where they were for everything.
export function PrayerTimesWidget() {
  const t = useTranslations('utility.prayer');
  const locale = useLocale() as AppLocale;
  const { open, toggle, registerStripTrigger } = usePrayerPanel();
  const { jumuah } = usePrayerData();

  const [now, setNow] = useState<Date | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    registerStripTrigger(triggerRef.current);
    return () => registerStripTrigger(null);
  }, [registerStripTrigger]);

  const today = usePrayerDay(now);
  const tomorrow = usePrayerDayAfter(now);
  const next = useMemo(
    () => (now && today ? nextPrayer(now, today, tomorrow) : null),
    [now, today, tomorrow],
  );
  const countdown = useMemo(() => {
    if (!now || !next) return null;
    const diff = Math.max(0, next.at.getTime() - now.getTime());
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const tag = localeTag(locale);
    const hStr = new Intl.NumberFormat(tag).format(h);
    const mStr = new Intl.NumberFormat(tag, { minimumIntegerDigits: 2 }).format(m);
    return `${hStr}${t('hourUnit')} ${mStr}${t('minuteUnit')}`;
  }, [now, next, locale, t]);

  return (
    // `relative` + `pe-7` on mobile: the chevron is pinned to the right edge
    // and the two rows of times are inset to clear it. From md the chevron
    // rejoins the flow at the end of the single row.
    <div className="relative flex w-full items-center gap-4 py-1.5 pe-7 md:py-0 md:pe-0">
      {/* CONTENT-SIZED COLUMNS ON THE PHONE, not equal thirds.
         Equal thirds put every cell at 98px on a 390px screen, and
         "SOLOPPGANG 07:01" needs 110 — measured, it spilled 12px and ate the
         whole gutter before DHUHR. `auto` columns let column 2 take the width
         the longest word in it actually needs (Soloppgang / Maghrib), and
         justify-between spends what is left on the gutters. Nothing is
         abbreviated and nothing collides. From md the rail is a flex row and
         none of this applies. */}
      <ul className="grid flex-1 grid-cols-[repeat(3,auto)] justify-between gap-x-3 gap-y-0.5 md:flex md:justify-start md:gap-x-4 md:gap-y-0 lg:gap-x-5 xl:gap-x-7">
        {ORDER.map((key) => {
          const isNext = next?.key === key;
          // Sunrise is not a prayer — it closes Fajr. The panel has always
          // greyed it; the rail does the same so the eye counts five.
          const isSunrise = key === 'sunrise';
          return (
            <li
              key={key}
              className={cn(
                'flex items-baseline gap-1.5 whitespace-nowrap font-mono text-[10.5px] uppercase tracking-[0.06em] tabular-nums sm:text-[11px] md:gap-2 md:text-[12px] md:tracking-[0.08em] xl:text-[13px]',
                isNext && 'md:gap-2',
              )}
            >
              <span className={isNext ? 'text-gold-deep' : 'text-ink-60'}>
                {t(`names.${key}`)}
              </span>
              <span
                className={cn(
                  isSunrise ? 'text-ink-60' : isNext ? 'font-medium text-ink' : 'text-ink',
                )}
              >
                {today ? today[key] : '—'}
              </span>
              {isNext && countdown && (
                // Only on the next one, and only where there is room for it.
                <span className="hidden text-ink-60 lg:inline">({countdown})</span>
              )}
            </li>
          );
        })}
      </ul>

      {/* Jumu'ah keeps its place from lg. It is a weekly fact rather than a
         today fact, so it is the first thing to yield width, not the times. */}
      <span className="hidden shrink-0 whitespace-nowrap font-mono text-[12px] uppercase tracking-[0.08em] tabular-nums text-ink-60 lg:inline xl:text-[13px]">
        {t('jumua')} {joinJumuah(jumuah)}
      </span>

      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={PRAYER_PANEL_ID}
        aria-label={t('expandLabel')}
        className="absolute end-0 top-1/2 grid h-8 w-7 -translate-y-1/2 place-items-center text-gold-deep transition-colors hover:text-ink md:static md:h-11 md:w-5 md:translate-y-0"
      >
        <ChevronIcon
          className={cn('h-3 w-3 transition-transform duration-200', open && 'rotate-180')}
          aria-hidden
        />
      </button>
    </div>
  );
}

type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
const ORDER: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

function parseTimeOn(base: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

function nextPrayer(
  now: Date,
  today: PrayerDay,
  tomorrow: PrayerDay | null,
): { key: PrayerKey; at: Date; time: string } {
  for (const key of ORDER) {
    const at = parseTimeOn(now, today[key]);
    if (at.getTime() > now.getTime()) return { key, at, time: today[key] };
  }
  // Past Isha: tomorrow's Fajr, from tomorrow's row when we have it.
  const fajr = tomorrow?.fajr ?? today.fajr;
  const at = parseTimeOn(now, fajr);
  at.setDate(at.getDate() + 1);
  return { key: 'fajr', at, time: fajr };
}

function localeTag(locale: AppLocale): string {
  return locale === 'ar' ? 'ar-EG' : locale === 'en' ? 'en-GB' : 'nb-NO';
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
