'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { CAMPAIGN } from '@/lib/campaign';
import { formatAmount, formatPercent } from '@/lib/format';
import { openGiveSheet } from './giving-sheet';
import type { AppLocale } from '@/i18n/routing';

// Slim strip that appears only after the hero scrolls past (§2). Uses an
// IntersectionObserver on a sentinel that the Hero renders, so this bar is
// hidden on the home page above the fold, and always visible on inner
// pages that omit the sentinel.

const SENTINEL_ID = 'hero-sentinel';

export function CampaignStrip() {
  const t = useTranslations('meter');
  const locale = useLocale() as AppLocale;
  const [show, setShow] = useState(true);

  useEffect(() => {
    const sentinel = document.getElementById(SENTINEL_ID);
    if (!sentinel) {
      setShow(true);
      return;
    }
    setShow(false);
    const io = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting),
      { rootMargin: '-40px 0px 0px 0px' },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  const raised = CAMPAIGN.raisedNok;
  const goal = CAMPAIGN.goalNok;

  if (!show) return null;

  return (
    <div className="sticky top-0 z-30 border-b border-rule bg-paper/95 backdrop-blur">
      <div className="mx-auto w-full max-w-[84rem] px-6 md:px-10 lg:px-12 flex items-center justify-between gap-4 py-2 text-[12px] text-ink-60">
        <div className="flex items-center gap-3 tabular-nums">
          <span className="text-ink">{formatAmount(locale, raised)} kr</span>
          <span aria-hidden className="text-rule">·</span>
          <span>{formatPercent(locale, raised, goal)}</span>
          <span aria-hidden className="hidden sm:inline text-rule">·</span>
          <span className="hidden sm:inline">{t('phase')}</span>
        </div>
        <button
          type="button"
          onClick={() => openGiveSheet()}
          className="min-h-9 rounded-full border border-ink px-3 py-1 text-body font-semibold text-ink hover:bg-ink hover:text-paper transition-colors"
        >
          {/* Uses ink not action — the 4-slot rule already spent the Give button */}
          Gi
        </button>
      </div>
    </div>
  );
}

export function HeroSentinel() {
  // Rendered at the end of the Hero so the strip appears once the hero is
  // out of view. Zero-height, invisible, no layout impact.
  return <div id={SENTINEL_ID} aria-hidden style={{ height: 1 }} />;
}
