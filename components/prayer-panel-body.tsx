'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { PRAYER_TIMES_TODAY } from '@/lib/campaign';
import type { AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/cn';
import { PRAYER_PANEL_ID } from './prayer-panel-provider';

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

function parseTimeToday(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function findNextAndPrev(now: Date): {
  nextKey: PrayerKey;
  nextAt: Date;
  prevAt: Date | null;
} {
  let prevAt: Date | null = null;
  for (const key of ORDER) {
    const at = parseTimeToday(PRAYER_TIMES_TODAY[key]);
    if (at.getTime() > now.getTime()) {
      return { nextKey: key, nextAt: at, prevAt };
    }
    prevAt = at;
  }
  // Past isha → next is tomorrow's fajr; prev stays isha (today)
  const tomorrowFajr = parseTimeToday(PRAYER_TIMES_TODAY.fajr);
  tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
  return { nextKey: 'fajr', nextAt: tomorrowFajr, prevAt };
}

export function PrayerPanelBody() {
  const t = useTranslations('utility.prayer');
  const locale = useLocale() as AppLocale;

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

  const info = useMemo(() => (now ? findNextAndPrev(now) : null), [now]);

  const elapsedPct = useMemo(() => {
    if (!now || !info || !info.prevAt) return 0;
    const total = info.nextAt.getTime() - info.prevAt.getTime();
    if (total <= 0) return 0;
    const elapsed = now.getTime() - info.prevAt.getTime();
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  }, [now, info]);

  const nextKey = info?.nextKey ?? null;

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
                  {PRAYER_TIMES_TODAY[key]}
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
          <p className="text-[14px] text-ink-60">
            <span className="tabular-nums">
              {t('names.jumua')} {PRAYER_TIMES_TODAY.jumua}
            </span>
            <span> · Calmeyers gate 8</span>
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
