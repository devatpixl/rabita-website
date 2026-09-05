'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { openGiveSheet } from './giving-sheet';
import { LinkVT } from './link-vt';
import { LanguageSwitcher } from './language-switcher';
import { DesktopNav, MobileNav } from './nav-menu';
import { PrayerPanelBody } from './prayer-panel-body';
import {
  PRAYER_PANEL_ID,
  usePrayerPanel,
} from './prayer-panel-provider';
import { cn } from '@/lib/cn';
import type { PrayerDay } from '@/lib/prayer-times';
import { usePrayerDay, usePrayerDayAfter } from './prayer-data-provider';

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
//             — mono "OPEN DAILY / 06:00 til 22:00" (hidden below xl)
//
// When the panel is open AND the strip is out of view, the panel body
// renders BELOW the nav row inside the same sticky <header>, so the
// sticky container grows and pushes page content down naturally. The
// panel is never absolute/fixed overlay.

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
): { key: PrayerKey; time: string } {
  for (const key of ORDER) {
    const at = parseTimeOn(now, today[key]);
    if (at.getTime() > now.getTime()) return { key, time: today[key] };
  }
  return { key: 'fajr', time: tomorrow?.fajr ?? today.fajr };
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

  const today = usePrayerDay(now);
  const tomorrow = usePrayerDayAfter(now);
  const nextInfo = useMemo(
    () => (now && today ? nextPrayer(now, today, tomorrow) : null),
    [now, today, tomorrow],
  );

  const compactVisible = !stripInView;

  return (
    <header
      data-prayer-panel-scope
      data-print-hide
      className={cn(
        // `sticky` is a positioned value, so it already establishes the
        // containing block the capsule layer below absolutely positions
        // against — do not add `relative`, it would fight it. Only colours
        // cross-fade here, which is paint work rather than layout.
        // Mobile heights: the capsule carried desktop's 77px onto a 390px
        // screen, where it ate a sixth of the viewport before any content.
        // 60px on phones, unchanged from md up.
        'sticky top-0 z-40 min-h-[60px] md:min-h-[77px] border-b transition-colors duration-300 ease-out',
        compactVisible
          ? 'border-transparent bg-transparent'
          : 'border-rule bg-paper/95 backdrop-blur',
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-2 focus:z-50 focus:rounded-btn focus:bg-ink focus:px-3 focus:py-2 focus:text-paper"
      >
        {t('skipToContent')}
      </a>

      {/* The capsule, as a background layer.

         This used to be the content container itself, animating max-width,
         padding and border-radius. Those are layout properties: the
         compositor cannot touch them, so every frame relaid out the
         wordmark, five nav items and both buttons, and the row visibly
         swam into place. The capsule is now a separate element behind the
         content that animates ONLY opacity and transform — both
         compositable — while the content does not move at all. */}
      {/* The capsule and the nav row share a wrapper so the capsule sizes
         to the ROW. It used to be absolute against the <header>, which was
         fine until the prayer panel opened: the header grows to contain the
         panel, so the pill grew with it into a full-height rounded blob
         that painted over the panel's contents. */}
      <div className="relative">
      <div
        aria-hidden
        // inset-x-0 rather than the logical start/end pair: this inset is
        // symmetric, so the two are equivalent here and the physical form
        // reads plainer. Logical properties still matter for anything
        // asymmetric — the padding inside the bar, for instance.
        className="pointer-events-none absolute inset-y-1.5 inset-x-0 flex justify-center px-3 md:px-6"
      >
        <div
          className={cn(
            'h-full w-full max-w-[83rem] rounded-full bg-paper/95 backdrop-blur',
            'shadow-[0_10px_30px_-12px_rgba(26,26,24,0.45)]',
            'transition-[opacity,transform] duration-[320ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]',
            'will-change-[opacity,transform] motion-reduce:transition-none',
            compactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1',
          )}
        />
      </div>

      {/* justify-between, three children: lockup, nav, actions. Whatever the
         row does not use is split equally between the two gaps rather than
         dumped on one side. At 1920 that is ~123px either side of the nav
         instead of 246px in a single hole after "About us". */}
      <div className="relative mx-auto flex w-full max-w-[84rem] items-center justify-between px-4 py-2 md:px-10 md:py-4 lg:px-12">
        {/* Wordmark — mark + two-line stacked name ("Oslo Sentralmoské"
           over "Rabita", client 2026-09-04; together they read the full
           name, Oslo Sentralmoské Rabita). No underline. Whole block links
           to home. */}
        <LinkVT
          href={`/${locale}`}
          className="vt-wordmark flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap md:min-h-11 md:gap-3 md:pe-6 lg:pe-10"
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
              className="h-8 w-8 md:h-11 md:w-11"
            />
          </motion.span>
          <span className="flex flex-col font-serif text-ink leading-tight">
            <motion.span
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.14, ease: WORDMARK_EASE }}
              className="font-serif text-[13px] font-medium leading-[1.15] md:text-[17px] lg:text-[19px]"
            >
              {t('orgName')}
            </motion.span>
            <motion.span
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: WORDMARK_EASE }}
              className="font-serif text-[11px] italic leading-[1.15] text-ink-60 md:text-[14px]"
            >
              {t('wordmark')}
            </motion.span>
          </span>
        </LinkVT>

        <DesktopNav />

        {/* Right cluster. One wrapper around the buttons AND the hamburger so
           justify-between sees a single item here; two siblings would each
           take a share of the free space and open a gap between them. */}
        <div className="flex shrink-0 items-center gap-2 md:gap-4">
        <div className="hidden md:flex shrink-0 items-center gap-4">
          {/* Compact prayer trigger — the strip's own trigger is out of
             viewport by now, so the panel needs a handle up here.

             This used to be `{compactVisible && <button …>}`. Mounting it
             on the same frame the container starts animating its width
             meant a new flex item appeared mid-transition and shoved the
             row sideways — the jump you see before things settle. It now
             stays mounted and animates its own width and opacity on the
             same curve and duration as the container, so the row resolves
             as one move instead of two.

             The 24px gap that used to be on the flex parent lives inside
             this wrapper as pe-6, so collapsing to zero width takes the
             spacing with it. */}
          <div
            aria-hidden={!compactVisible}
            className={cn(
              // Only from 1440. With the nav pinned left the bar is fuller
              // than it was, and at 1280-1440 the five labels, both pills and
              // a live prayer readout do not all fit — this is the piece that
              // yields, because it is the only duplicate in the row: the
              // utility strip carries the same figure, and Prayer is one
              // click away in the nav itself.
              'hidden min-[1800px]:block',
              'overflow-hidden transition-[max-width,opacity] duration-[320ms]',
              '[transition-timing-function:cubic-bezier(0.32,0.72,0,1)]',
              compactVisible ? 'max-w-[220px] opacity-100' : 'max-w-0 opacity-0',
            )}
          >
            <button
              ref={compactTriggerRef}
              type="button"
              onClick={toggle}
              tabIndex={compactVisible ? undefined : -1}
              aria-expanded={open}
              aria-controls={PRAYER_PANEL_ID}
              aria-label={tPrayer('expandLabel')}
              className="inline-flex items-center gap-2 whitespace-nowrap border-s border-rule ps-5 pe-6 text-[14px] tabular-nums text-ink hover:text-gold-deep transition-colors"
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
          </div>

          {/* Become a member — an OUTLINE button, never a second filled
             gold one. Give owns the single filled action in this header;
             two would be the competing-CTA problem the brief warns about,
             and the outline says "secondary" without needing a label to.
             Hidden below lg: the bar already runs out of room at 13-14"
             and this is the least urgent thing in it. */}
          <LinkVT
            href={`/${locale}/bli-medlem`}
            className="hidden lg:inline-flex items-center min-h-11 rounded-full border border-ink/25 px-4 py-2 text-[14px] font-semibold text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper whitespace-nowrap"
          >
            {t('join')}
          </LinkVT>

          {/* Primary "Give" — ALWAYS visible ≥ md. */}
          <button
            type="button"
            onClick={() => openGiveSheet()}
            style={{ opacity: 1 }}
            className="inline-flex items-center gap-2 min-h-11 rounded-full bg-gold-deep text-paper px-5 py-2 text-[14px] font-semibold transition-colors duration-200 ease-out hover:bg-ink active:scale-[0.99] whitespace-nowrap"
          >
            {t('give')}
            <span aria-hidden className="rtl:rotate-180">
              &rarr;
            </span>
          </button>

          {/* Language switcher, moved down from the utility strip (client,
             2026-09-04): the strip is prayer-facts now, and language sits
             with the other controls instead of alone up there. */}
          <LanguageSwitcher />
        </div>
        {/* Phone give button. The utility strip is hidden below md and the
           floating bar only arrives after 40vh, so until now a phone had no
           way to give from the chrome at all on first paint. Icon only, with
           the label carried by aria-label, which is what innocents.no does
           with its donate glyph at this width. */}
        <button
          type="button"
          onClick={() => openGiveSheet()}
          aria-label={t('give')}
          className="grid h-10 w-10 place-items-center rounded-full bg-gold-deep text-paper transition-colors active:scale-[0.98] md:hidden"
        >
          <HeartIcon className="h-4 w-4" />
        </button>

        {/* Up to xl, not md. The desktop nav now starts at 1280 — below that
           the hamburger is the only way to reach the five sections, so it has
           to stay mounted through the whole tablet-to-small-laptop range
           instead of handing off at 768 to a nav that isn't there yet. */}
        <div className="xl:hidden">
          <MobileNav />
        </div>
        </div>
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

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 21s-7.5-4.7-9.6-9A5.3 5.3 0 0 1 12 6.6 5.3 5.3 0 0 1 21.6 12c-2.1 4.3-9.6 9-9.6 9Z" />
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
