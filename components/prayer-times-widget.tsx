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
    // `relative` + `pe-7` on mobile: the chevron is pinned to the end edge and
    // the times are inset to clear it. From md the chevron rejoins the flow.
    <div className="relative flex w-full items-center gap-4 py-1.5 pe-7 md:py-0 md:pe-0">
      <PhoneRail today={today} nextKey={next?.key ?? null} t={t} />
      <DeskRail today={today} nextKey={next?.key ?? null} countdown={countdown} t={t} />

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

/**
 * The rail on phones: six columns, one row, the label above its figure.
 *
 * ── WHY THIS IS A SEPARATE LIST AND NOT MORE `max-md:` (2026-09-29) ───────
 * Two rows of three was the shape from the day the rail went in, and it was
 * always twelve pieces of text loose in 46px. It was tried twice as one list.
 * First with `auto` tracks, where every cell shrink-wrapped and no two figures
 * shared an edge. Then with `minmax(max-content,1fr)`, which lined the figures
 * up beautifully and, by spending the slack inside the cells, pushed each name
 * away from its own time — so the bar gained alignment and lost pairing, which
 * is the worse of the two faults. The client's word for both was "messy", and
 * he was right both times.
 *
 * Stacking fixes it by construction. Each pair is one centred column, so the
 * name cannot drift from its figure, every name sits on one baseline and every
 * figure on another, and six units read faster than twelve items. It also fits
 * in ONE row, which is the actual win: the bar gets shorter, not taller.
 *
 * The names lose their capitals and their monospace here. Mono caps at 10.5px
 * is the loudest quiet type in the system — it has no ascender rhythm, so six
 * of them make a grey wall. Sentence case in the body face recedes and lets
 * the figures, which are what anyone is looking for, be the loud part.
 *
 * `auto` tracks are right HERE, where they were wrong before: a column is now
 * as wide as its wider LINE, both lines are centred in it, and nothing inside
 * a cell can be pushed apart. Soloppgang, the longest word in the bar, simply
 * takes the width it needs and the rest of the space goes to the gutters.
 *
 * This is a paired branch (`md:hidden` beside `hidden md:flex`) rather than
 * more `max-md:` classes, and deliberately: the desktop row carries `sm:` and
 * `md:` type sizes that would beat `max-md:` in the 640-767 band, which is
 * still on this layout. Two lists means the phone rail owns its own classes
 * outright and the desktop rail is byte-identical to what shipped.
 */
function PhoneRail({
  today,
  nextKey,
  t,
}: {
  today: PrayerDay | null;
  nextKey: PrayerKey | null;
  t: (k: string) => string;
}) {
  return (
    <ul className="grid flex-1 grid-cols-[repeat(6,auto)] justify-between gap-x-2 md:hidden">
      {ORDER.map((key) => {
        const isNext = nextKey === key;
        // Sunrise is not a prayer, it closes Fajr. The panel has always greyed
        // it; here it goes one step quieter still so the eye counts five.
        const isSunrise = key === 'sunrise';
        return (
          <li key={key} className="flex flex-col items-center gap-[3px] whitespace-nowrap">
            <span
              className={cn(
                'text-[9.5px] leading-none tracking-[0.01em]',
                isNext ? 'text-gold-deep' : isSunrise ? 'text-ink-40' : 'text-ink-60',
              )}
            >
              {t(`names.${key}`)}
            </span>
            <span
              className={cn(
                'font-mono text-[12.5px] leading-none tabular-nums',
                isNext
                  ? 'font-medium text-gold-deep'
                  : isSunrise
                    ? 'text-ink-40'
                    : 'text-ink',
              )}
            >
              {today ? today[key] : '—'}
            </span>
            {/* Always drawn, transparent unless this is the next one, so the
               row cannot change height when the clock moves on. A 2px rule
               under the figure marks it without putting a filled block in a
               46px bar -- which is what the chip before this did, and why it
               read as one more thing rather than as the answer. */}
            <span
              aria-hidden
              className={cn(
                'h-[2px] w-full rounded-full',
                isNext ? 'bg-gold-deep' : 'bg-transparent',
              )}
            />
          </li>
        );
      })}
    </ul>
  );
}

/** The rail from md up: one flex row of inline pairs. Unchanged since 09-22. */
function DeskRail({
  today,
  nextKey,
  countdown,
  t,
}: {
  today: PrayerDay | null;
  nextKey: PrayerKey | null;
  countdown: string | null;
  t: (k: string) => string;
}) {
  return (
    <ul className="hidden flex-1 md:flex md:justify-start md:gap-x-4 lg:gap-x-5 xl:gap-x-7">
      {ORDER.map((key) => {
        const isNext = nextKey === key;
        const isSunrise = key === 'sunrise';
        return (
          <li
            key={key}
            className="flex items-baseline gap-2 whitespace-nowrap font-mono text-[12px] uppercase tracking-[0.08em] tabular-nums xl:text-[13px]"
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
