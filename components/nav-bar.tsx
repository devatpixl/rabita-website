'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { openGiveSheet } from './giving-sheet';
import { LinkVT } from './link-vt';
import { DesktopNav, MobileNav } from './nav-menu';
import { PrayerPanelBody } from './prayer-panel-body';
import {
  PRAYER_PANEL_ID,
  usePrayerPanel,
} from './prayer-panel-provider';
import { PRAYER_TIMES_TODAY } from '@/lib/campaign';
import { cn } from '@/lib/cn';

// Same curve the nav headings use, so the header resolves as one move.
const WORDMARK_EASE = [0.22, 1, 0.36, 1] as const;

// Primary bar (§2). Restructured header:
//   left    logo + wordmark  (no underline under Rabita)
//   then    nav items, LEFT-aligned, 48px after the wordmark, 28px gap
//   right   cluster in this order, vertically centred, 20px gaps:
//             — [compact prayer trigger, only when strip is OUT of view]
//             — "Prayer times" ghost button (hidden below lg; also
//               hidden when the compact trigger is showing — same job)
//             — "Give" primary                (ALWAYS visible ≥ md)
//             — mono "OPEN DAILY / 06:00–22:00" (hidden below xl)
//
// When the panel is open AND the strip is out of view, the panel body
// renders BELOW the nav row inside the same sticky <header>, so the
// sticky container grows and pushes page content down naturally. The
// panel is never absolute/fixed overlay.

type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
const ORDER: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

function parseTimeToday(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function nextPrayerKey(now: Date): PrayerKey {
  for (const key of ORDER) {
    const at = parseTimeToday(PRAYER_TIMES_TODAY[key]);
    if (at.getTime() > now.getTime()) return key;
  }
  return 'fajr';
}

export function NavBar() {
  const t = useTranslations('nav');
  const tPrayer = useTranslations('utility.prayer');
  const locale = useLocale();
  const { open, toggle, stripInView, registerNavTrigger } = usePrayerPanel();
  const reduced = useReducedMotion();

  const compactTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    registerNavTrigger(compactTriggerRef.current);
    return () => registerNavTrigger(null);
  }, [registerNavTrigger]);

  const nextInfo = useMemo(() => {
    if (!now) return null;
    const key = nextPrayerKey(now);
    return { key, time: PRAYER_TIMES_TODAY[key] };
  }, [now]);

  const compactVisible = !stripInView;

  return (
    <header
      data-prayer-panel-scope
      className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur"
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-2 focus:z-50 focus:rounded-btn focus:bg-ink focus:px-3 focus:py-2 focus:text-paper"
      >
        {t('skipToContent')}
      </a>

      <div className="mx-auto w-full max-w-[112rem] px-6 md:px-10 lg:px-24 flex items-center py-4">
        {/* Wordmark — mark + two-line stacked org name (matches the
           official brand lockup: "Det Islamske Forbundet" set bold in
           sans, with "Rabita" underneath at regular weight). No
           underline. Whole block links to home. */}
        <LinkVT
          href={`/${locale}`}
          className="vt-wordmark flex min-h-11 items-center gap-3 whitespace-nowrap"
          aria-label={`${t('orgName')}, ${t('wordmark')}`}
        >
          {/* Mark, then each line of the name, on the curve and duration the
             nav headings use. They land just before the headings start at
             0.35, so the lockup reads first and the menu follows it. */}
          <motion.span
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.06, ease: WORDMARK_EASE }}
            className="flex"
          >
            <Image
              src="/logo/rabita-mark-256.png"
              alt=""
              width={40}
              height={40}
              priority
              className="h-10 w-10 md:h-11 md:w-11"
            />
          </motion.span>
          <span className="flex flex-col font-sans text-ink leading-tight">
            <motion.span
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.14, ease: WORDMARK_EASE }}
              className="text-[13px] md:text-[14px] lg:text-[15px] font-bold tracking-[-0.01em]"
            >
              {t('orgName')}
            </motion.span>
            <motion.span
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: WORDMARK_EASE }}
              className="text-[12px] font-normal text-ink-60 tracking-normal"
            >
              {t('wordmark')}
            </motion.span>
          </span>
        </LinkVT>

        <DesktopNav />

        {/* Right cluster */}
        <div
          className="ms-auto hidden md:flex items-center"
          style={{ gap: '24px' }}
        >
          {/* Compact prayer trigger — visible when strip has scrolled
             away. Same underlying panel; the strip trigger is unusable
             at this point because it's out of viewport. */}
          {compactVisible && (
            <button
              ref={compactTriggerRef}
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-controls={PRAYER_PANEL_ID}
              aria-label={tPrayer('expandLabel')}
              className="inline-flex items-center gap-2 text-[14px] tabular-nums text-ink hover:text-gold-deep transition-colors"
            >
              {nextInfo && (
                <span>
                  <span>{tPrayer(`names.${nextInfo.key}`)}</span>{' '}
                  <span>{nextInfo.time}</span>
                </span>
              )}
              <ChevronIcon
                className={cn(
                  'h-3 w-3 text-gold-deep transition-transform duration-200',
                  open && 'rotate-180',
                )}
                aria-hidden
              />
            </button>
          )}

          {/* Primary "Give" — ALWAYS visible ≥ md. */}
          <button
            type="button"
            onClick={() => openGiveSheet()}
            style={{ opacity: 1 }}
            className="inline-flex items-center gap-2 min-h-11 rounded-btn bg-gold-deep text-paper px-5 py-2 text-[15px] font-semibold transition-colors duration-200 ease-out hover:bg-ink active:scale-[0.99] whitespace-nowrap"
          >
            {t('give')}
            <span aria-hidden className="rtl:rotate-180">
              &rarr;
            </span>
          </button>

        </div>
        <div className="ms-auto md:hidden">
          <MobileNav />
        </div>
      </div>

      {/* Panel — mounted inside the sticky header when the strip is
         out of view. Height transition on the wrapper (180ms ease-out);
         reduced motion falls back to instant show via the body's own
         opacity handling. Pushes content down as the sticky element
         grows. */}
      {open && !stripInView && (
        <div className="border-t border-rule bg-paper-deep">
          <PrayerPanelBody />
        </div>
      )}
    </header>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
