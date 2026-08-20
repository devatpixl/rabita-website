'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { PRAYER_TIMES_TODAY } from '@/lib/campaign';
import type { AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/cn';
import {
  PRAYER_PANEL_ID,
  usePrayerPanel,
} from './prayer-panel-provider';

// Utility-strip widget — the STRIP-side trigger for the shared prayer
// panel. Renders next-prayer name + time + countdown + gold-deep
// chevron. Click toggles the shared panel (no hover-open). Chevron
// rotates 180° when open.
//
// Panel body itself renders separately — this component is only the
// trigger + the always-visible bits of the strip (jumua + hijri).
//
// Countdown localises the hour + minute units via i18n; digits render
// in the locale's native script for this chrome element (Arabic-Indic
// in ar, Latin in no/en).

type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
const ORDER: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

function parseTimeToday(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function nextPrayer(now: Date): { key: PrayerKey; at: Date } {
  for (const key of ORDER) {
    const at = parseTimeToday(PRAYER_TIMES_TODAY[key]);
    if (at.getTime() > now.getTime()) return { key, at };
  }
  const at = parseTimeToday(PRAYER_TIMES_TODAY.fajr);
  at.setDate(at.getDate() + 1);
  return { key: 'fajr', at };
}

function hijriDate(locale: AppLocale): string {
  try {
    const tag =
      locale === 'ar'
        ? 'ar-SA-u-ca-islamic-umalqura'
        : locale === 'en'
        ? 'en-GB-u-ca-islamic-umalqura'
        : 'nb-NO-u-ca-islamic-umalqura';
    return new Intl.DateTimeFormat(tag, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  } catch {
    return `${PRAYER_TIMES_TODAY.hijriDayApprox} ${PRAYER_TIMES_TODAY.hijriMonth}`;
  }
}

function localeTag(locale: AppLocale): string {
  return locale === 'ar' ? 'ar-EG' : locale === 'en' ? 'en-GB' : 'nb-NO';
}

export function PrayerTimesWidget() {
  const t = useTranslations('utility.prayer');
  const locale = useLocale() as AppLocale;
  const { open, toggle, registerStripTrigger } = usePrayerPanel();

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

  const next = useMemo(() => (now ? nextPrayer(now) : null), [now]);
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

  const hijri = useMemo(() => hijriDate(locale), [locale]);

  return (
    <div className="flex items-center gap-3 text-label uppercase tracking-widest text-ink-60">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={PRAYER_PANEL_ID}
        aria-label={t('expandLabel')}
        className="flex items-center gap-2 tabular-nums hover:text-ink transition-colors"
      >
        <ClockIcon className="h-3.5 w-3.5 text-rule" aria-hidden />
        {next ? (
          <span>
            <span className="text-ink">{t(`names.${next.key}`)}</span>{' '}
            <span className="text-ink">{PRAYER_TIMES_TODAY[next.key]}</span>
            <span className="ms-2 text-ink-60">({countdown})</span>
          </span>
        ) : (
          <span aria-hidden>···</span>
        )}
        <ChevronIcon
          className={cn(
            'h-3 w-3 text-gold-deep transition-transform duration-200',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>
      <span aria-hidden className="text-rule">·</span>
      <span className="tabular-nums text-ink-60">
        {t('jumua')} {PRAYER_TIMES_TODAY.jumua}
      </span>
      <span aria-hidden className="text-rule">·</span>
      <span className="tabular-nums text-ink-60">{hijri}</span>
    </div>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
