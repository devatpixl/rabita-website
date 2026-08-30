'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { hijriDate } from '@/lib/hijri';
import { PRAYER_ORDER, prayerWindow } from '@/lib/prayer-window';
import type { AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/cn';
import { joinJumuah, usePrayerData, usePrayerDay } from './prayer-data-provider';

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
  const { jumuah, jamaah } = usePrayerData();

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

  const today = usePrayerDay(now);
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
        {/* The heading is a label now, not a rival to the figures: the
           times are what the page is for. */}
        <h1 className="font-mono text-[0.75rem] uppercase tracking-[0.18em] text-gold-deep">{t('todayHeading')}</h1>
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
      <dl className="mt-6 grid grid-cols-3 border-t border-rule lg:grid-cols-6">
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
                'relative overflow-hidden border-b border-rule px-2 py-6 lg:border-b-0',
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
                  'mt-3 font-serif leading-none tabular-nums transition-colors',
                  // The next prayer is the biggest thing on the page and the
                  // only gold figure; the other five step back.
                  // Capped so "20:32" in tabular figures still fits one of
                  // six columns — at 6vw it ran past its cell into Isha.
                  isNext
                    ? 'text-[clamp(2.25rem,4.2vw,3.25rem)] text-gold-deep'
                    : 'text-[clamp(1.75rem,3.4vw,2.35rem)] text-ink-60',
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
      <div id="fredagsbonn" className="mt-10 scroll-mt-24 border-s-2 border-gold-deep bg-paper-2 px-6 py-5">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-gold-deep">
            {t('jumua')}
          </p>
          <p className="font-serif text-[clamp(1.75rem,4vw,2.25rem)] leading-none tabular-nums text-ink">
            {joinJumuah(jumuah)}
          </p>
          <p className="text-[13px] text-ink-60">{t('jumuaNote')}</p>
        </div>
        {/* Who leads it — the reason to come, not just the hour. */}
        <a
          href="#imamene"
          className="group mt-3 inline-flex min-h-9 items-center gap-2 text-[14px] font-semibold text-ink transition-colors hover:text-gold-deep"
        >
          <span className="border-b border-gold pb-px">{t('jumuaImams')}</span>
          <span aria-hidden className="transition-transform duration-200 group-hover:translate-y-0.5">&darr;</span>
        </a>
      </div>

      {/* Jama'ah: when the congregation actually stands, as the mosque has
         registered it with IRN. Only the prayers with a fixed time show. */}
      {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).some((k) => jamaah[k]) && (
        <p className="mt-4 text-[0.9rem] tabular-nums text-ink-60">
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em]">{t('jamaah')}</span>
          {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const)
            .filter((k) => jamaah[k])
            .map((k) => (
              <span key={k} className="ms-4">
                <span className="text-ink">{tv(`names.${k}`)}</span> {jamaah[k]}
              </span>
            ))}
        </p>
      )}

      {now && !today && (
        <p className="mt-6 max-w-prose text-body text-ink-60">{t('outOfRange')}</p>
      )}
    </div>
  );
}
