'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { PRAYER_TIMES_TODAY } from '@/lib/campaign';
import { hijriDate } from '@/lib/hijri';
import { prayerTimesFor } from '@/lib/prayer-times';
import { PRAYER_ORDER, prayerWindow } from '@/lib/prayer-window';
import type { AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/cn';

// The page's lead block: six times at full width, and what is coming next.
//
// Deliberately NOT a list under a heading. A static row of six numbers is a
// table of contents; what a visitor actually wants is "what's next and how
// long have I got", and that answer changes every minute. So the next
// prayer carries the weight, and a rail underneath fills as the current
// window elapses toward it. That is where the design comes from — it
// encodes something true rather than decorating a list.
//
// Client-side and mount-guarded: the page is statically generated, so a
// date read at render time is the date the site was built.

export function PrayerNow() {
  const t = useTranslations('bonnetiderPage');
  const tv = useTranslations('prayerVisit');
  const tp = useTranslations('utility.prayer');
  const locale = useLocale() as AppLocale;
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const gregorian = useMemo(() => {
    if (!now) return '';
    const tag = locale === 'ar' ? 'ar-EG' : locale === 'en' ? 'en-GB' : 'nb-NO';
    return new Intl.DateTimeFormat(tag, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(now);
  }, [now, locale]);

  const today = useMemo(() => (now ? prayerTimesFor(now) : null), [now]);
  const win = useMemo(
    () => (now && today ? prayerWindow(today, now.getHours() * 60 + now.getMinutes()) : null),
    [now, today],
  );

  const until = win
    ? win.untilNext >= 60
      ? tv('untilHm', { h: Math.floor(win.untilNext / 60), m: win.untilNext % 60 })
      : tv('untilM', { m: win.untilNext })
    : '';

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
        <h1 className="font-serif text-display text-balance text-ink">{t('todayHeading')}</h1>
        {now && (
          // Both calendars. The Gregorian date carries the weight because
          // that is the one a reader in Oslo is checking against; the Hijri
          // sits beside it because on a mosque page it is the one that says
          // which day this is religiously. Showing only one answers half the
          // question.
          <p className="text-[0.9rem] tabular-nums text-ink-60">
            <span className="text-ink">{gregorian}</span>
            <span aria-hidden className="mx-2.5 text-rule">·</span>
            {hijriDate(locale, now)}
          </p>
        )}
      </div>

      {/* Six columns at full width. Three per row on a phone so the figures
         stay large rather than shrinking to fit six across 390px. */}
      <dl className="mt-10 grid grid-cols-3 border-t border-rule lg:grid-cols-6">
        {PRAYER_ORDER.map((key) => {
          // The NEXT prayer is highlighted, not the current window.
          //
          // Marking the current one was defensible — at 16:47 you really are
          // inside the Dhuhr window — but it put "Dhuhr · Now" beside
          // "Asr in 29m" and the two read as contradicting each other. It
          // also means a glance at nearly 5pm sees "Now" against 13:29.
          // Every prayer app resolves this the same way: highlight what is
          // coming, because that is the thing you are checking for.
          const isNext = win?.next === key;
          return (
            <div
              key={key}
              className={cn(
                'relative border-b border-rule px-1 py-6 lg:border-b-0',
                isNext && 'bg-paper-2',
              )}
            >
              {/* A 2px gold cap on the next prayer: the one mark of colour
                 in the block, so the eye lands on it first. */}
              <span
                aria-hidden
                className={cn(
                  'absolute inset-x-0 top-0 block h-[2px] transition-colors',
                  isNext ? 'bg-gold-deep' : 'bg-transparent',
                )}
              />
              <dt
                className={cn(
                  'flex items-baseline gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.14em]',
                  isNext ? 'text-gold-deep' : 'text-ink-60',
                )}
              >
                {tv(`names.${key}`)}
                {isNext && <span className="normal-case tracking-normal">· {tp('nextLabel')}</span>}
              </dt>
              <dd
                className={cn(
                  'mt-3 font-serif leading-none tabular-nums',
                  'text-[clamp(2rem,4.5vw,3.25rem)]',
                  isNext ? 'text-ink' : 'text-ink-60',
                )}
              >
                {today ? today[key] : '—'}
              </dd>
            </div>
          );
        })}
      </dl>

      {/* Rail: progress through the current window, which is the same thing
         as progress toward the highlighted prayer. Fills left to right and
         resets each time one begins. */}
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="h-[2px] min-w-[8rem] flex-1 overflow-hidden rounded-full bg-rule">
          <div
            className="h-full bg-gold-deep transition-[width] duration-1000 ease-out"
            style={{ width: `${Math.round((win?.through ?? 0) * 100)}%` }}
          />
        </div>
        {win && (
          <p className="text-[0.95rem] tabular-nums text-ink-60">
            <span className="text-ink">{tv(`names.${win.next}`)}</span> {until}
          </p>
        )}
      </div>

      {/* Jumu'ah apart from the six: the time most visitors come for, and a
         fixed hour rather than one that moves with the sun. */}
      <div className="mt-10 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-s-2 border-gold-deep bg-paper-2 px-6 py-5">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-gold-deep">
          {t('jumua')}
        </p>
        <p className="font-serif text-[clamp(1.75rem,4vw,2.25rem)] leading-none tabular-nums text-ink">
          {PRAYER_TIMES_TODAY.jumua}
        </p>
        <p className="text-[13px] text-ink-60">{t('jumuaNote')}</p>
      </div>

      {now && !today && (
        <p className="mt-6 max-w-prose text-body text-ink-60">{t('outOfRange')}</p>
      )}
    </div>
  );
}
