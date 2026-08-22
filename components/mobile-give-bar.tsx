'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { openGiveSheet } from './giving-sheet';
import { CAMPAIGN } from '@/lib/campaign';
import { formatAmount } from '@/lib/format';
import type { AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/cn';

// Mobile only. A floating pill rather than the edge to edge slab this used
// to be, following innocents.no: inset 16px, fully rounded, sitting above the
// iOS home indicator, sliding up once the reader has committed to the page.
//
// Three things changed and each was a fault, not a preference:
//
//   - it was pinned open from the first frame, so a phone visitor met a
//     permanent 56px band across the foot of the hero before they had read a
//     word. It now appears after 40vh, the same trigger innocents.no uses.
//   - it carried two competing actions side by side, and the left one wrapped
//     to two lines at 390px: "Gi med Vipps (23 956)" does not fit half of a
//     phone. Vipps is the first thing inside the sheet anyway, so the bar
//     makes one offer instead of two.
//   - it had square corners and a hairline against paper, which read as
//     browser chrome. On dusk with a gold action it reads as the site.
export function MobileGiveBar() {
  const t = useTranslations('mobile');
  const locale = useLocale() as AppLocale;
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const pct = CAMPAIGN.goalNok > 0
    ? Math.floor((CAMPAIGN.raisedNok / CAMPAIGN.goalNok) * 100)
    : 0;

  return (
    <div
      data-print-hide
      data-give-bar
      className={cn(
        'fixed inset-x-4 z-40 flex items-center justify-between gap-3 rounded-full bg-dusk py-2 ps-5 pe-2 text-paper shadow-[0_12px_32px_-10px_rgba(0,0,0,0.55)] md:hidden',
        'transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
        shown ? 'translate-y-0' : 'translate-y-[200%]',
      )}
      style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* The reason to tap, not a label for the button beside it. The figure
         is the same one the campaign meter carries further down the page. */}
      <span className="min-w-0 text-[13px] leading-tight text-paper/75">
        <span className="tabular-nums text-paper">{pct} %</span>{' '}
        {t('ofGoal', { goal: formatAmount(locale, CAMPAIGN.goalNok) })}
      </span>
      <button
        type="button"
        onClick={() => openGiveSheet()}
        className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-gold px-5 text-[14px] font-semibold text-dusk transition-colors active:scale-[0.99]"
      >
        {t('pick')}
      </button>
    </div>
  );
}
