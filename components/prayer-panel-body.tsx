'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import type { PrayerDay } from '@/lib/prayer-times';
import type { AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/cn';
import { PRAYER_PANEL_ID } from './prayer-panel-provider';
import { joinJumuah, usePrayerData, usePrayerDay, usePrayerDayAfter } from './prayer-data-provider';

// Shared panel body — mounted inside EITHER the utility strip (when
// the strip is in the viewport) or the sticky nav header (when the
// strip has scrolled away). Never both at once.
//
// Same visual: same background (--paper-deep, inherited from parent
// container), same content, same behaviour. Only its mount point
// changes as the strip enters/leaves the viewport.
//
// Timing is derived from `now` (updated every 30s), computed here
// once — the strip's small "next prayer" widget uses the same helpers
// via its own hook (findNext), so the countdown and the progress bar
// stay in lockstep without duplicating logic in a separate module.

type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
const ORDER: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

function parseTimeOn(base: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

function findNextAndPrev(
  now: Date,
  today: PrayerDay,
  tomorrow: PrayerDay | null,
): {
  nextKey: PrayerKey;
  nextAt: Date;
  prevAt: Date | null;
} {
  let prevAt: Date | null = null;
  for (const key of ORDER) {
    const at = parseTimeOn(now, today[key]);
    if (at.getTime() > now.getTime()) {
      return { nextKey: key, nextAt: at, prevAt };
    }
    prevAt = at;
  }
  // Past isha → next is tomorrow's fajr; prev stays isha (today)
  const tomorrowFajr = parseTimeOn(now, tomorrow?.fajr ?? today.fajr);
  tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
  return { nextKey: 'fajr', nextAt: tomorrowFajr, prevAt };
}

export function PrayerPanelBody() {
  const t = useTranslations('utility.prayer');
  const locale = useLocale() as AppLocale;
  const { jumuah } = usePrayerData();

  const [now, setNow] = useState<Date | null>(null);
  const [visible, setVisible] = useState(false);
  const regionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Content fade-in over 120ms; skips under reduced motion.
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setVisible(true);
      return;
    }
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Focus the region on mount so screen readers land here.
  useEffect(() => {
    regionRef.current?.focus();
  }, []);

  const today = usePrayerDay(now);
  const tomorrow = usePrayerDayAfter(now);
  const info = useMemo(
    () => (now && today ? findNextAndPrev(now, today, tomorrow) : null),
    [now, today, tomorrow],
  );

  const elapsedPct = useMemo(() => {
    if (!now || !info || !info.prevAt) return 0;
    const total = info.nextAt.getTime() - info.prevAt.getTime();
    if (total <= 0) return 0;
    const elapsed = now.getTime() - info.prevAt.getTime();
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  }, [now, info]);

  const nextKey = info?.nextKey ?? null;

  // THE HIJRI DATE USED TO BE COMPUTED HERE. It moved into this panel from
  // the utility strip on 2026-09-22, when the strip gave its width to all six
  // prayer times, and it came out of the panel on 2026-10-06 (client,
  // Mobilversjon: "For mye tekst under bønnetidene").
  //
  // The reasoning that moved it here is the reasoning that ended up removing
  // it: a Hijri date is something you read once, not something you arrive
  // for. /bonnetider still prints it beside the day band, which is the page
  // somebody opens when they want the date rather than the next prayer.
  //
  // Restoring it is one useMemo over hijriDate(locale, now) and a span.

  return (
    <div
      ref={regionRef}
      role="region"
      aria-label={t('panelLabel')}
      id={PRAYER_PANEL_ID}
      tabIndex={-1}
      className="outline-none transition-opacity ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transitionDuration: '120ms',
      }}
    >
      <div className="mx-auto max-w-6xl px-6 py-6">
        <dl className="grid grid-cols-2 min-[600px]:grid-cols-3 min-[900px]:grid-cols-6 gap-x-6 gap-y-4">
          {ORDER.map((key) => {
            const isNext = key === nextKey;
            const isSunrise = key === 'sunrise';
            return (
              <div key={key} className="flex flex-col">
                <dt
                  className={cn(
                    'text-[12px] leading-tight',
                    isNext ? 'text-gold-deep' : 'text-ink-60',
                  )}
                >
                  <span>{t(`names.${key}`)}</span>
                  {isNext && (
                    <span> · {t('nextLabel')}</span>
                  )}
                </dt>
                <dd
                  className={cn(
                    'mt-1 text-[17px] tabular-nums leading-tight',
                    isSunrise
                      ? 'text-ink-60'
                      : isNext
                      ? 'text-ink font-medium'
                      : 'text-ink',
                  )}
                >
                  {today ? today[key] : '—'}
                </dd>
              </div>
            );
          })}
        </dl>

        {/* Elapsed hairline — prev prayer → next prayer progression. */}
        <div
          role="progressbar"
          aria-label={t('elapsedLabel')}
          aria-valuenow={Math.round(elapsedPct)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-6 h-px w-full bg-rule overflow-hidden"
        >
          <div
            className="h-full bg-gold-deep"
            style={{ width: `${elapsedPct}%` }}
          />
        </div>

        {/* Footer row — Jumu'ah + venue left, full-week link right. */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          {/* THE ADDRESS IS THE TEMPORARY ONE, and that is not a detail.
             This line read "Calmeyers gate 8" until 2026-09-22, which is the
             building site. Client, Tekst (endelig): "Footer-kartet skal vise
             Sørligata 8a (der menigheten holder til midlertidig i dag) —
             IKKE Calmeyers gate 8." His rule was written about the footer
             map, but the reason behind it applies here with more force:
             anything printed beside a prayer time is read by somebody
             working out where to be at 19:22. Sending them to a hole in the
             ground is the one mistake this panel must not make. */}
          {/* ── FRIDAY FIRST, THEN THE VENUE (client, Mobilversjon 2026-10-06)
             "For mye tekst under bønnetidene. Det viktigste er at
             fredagsbønnetidene kommer tydelig fram. Bør stå fredagsbønn ikke
             jumua."

             It was one run-on line — Jumu'ah, the address and the hijri date
             at the same size, separated by middots — so the one figure he
             calls det viktigste read as the first third of a list.

             Now the Friday times are their own line in the ink colour and
             the venue sits under them at 13px. Nothing is bigger than the
             six times above; the weight comes from being alone on a line.

             THE HIJRI DATE IS GONE, at his instruction and the user's call
             over dropping the address too. It is the one item here nobody
             arrives looking for, and /bonnetider still prints it beside the
             day band. lib/hijri is no longer imported here; that page keeps
             its own import, so nothing about the date is lost from the site.

             `names.jumua` is "Jumu'ah"; `jumua` is "Fredagsbønn". The right
             word was in the file the whole time and this line read the wrong
             key. names.jumua still labels the prayer board, where it sits in
             a column of transliterated prayer names and belongs. */}
          {/* ── AND NOW FRIDAY ALONE (client, revised Mobilversjon text,
             2026-10-09): «FJERNE ALT tekst utenom Jummah --> Skriv fredagsbønn
             istedenfor Jummah» — remove all text except Jummah. The address
             line under it goes; the link stays because he named it himself
             («Pilen bør hete … «se bønnetider»»). The address is still on
             /bonnetider and in the footer, so nobody loses it. */}
          <p className="text-[14px] tabular-nums text-ink">
            {t('jumua')} {joinJumuah(jumuah)}
          </p>
          <Link
            href={`/${locale}/bonnetider`}
            className="text-[14px] font-semibold text-gold-deep border-b border-rule pb-px"
          >
            {t('fullWeek')} →
          </Link>
        </div>
      </div>
    </div>
  );
}
