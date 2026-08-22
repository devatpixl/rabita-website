'use client';

import { useTranslations } from 'next-intl';
import { openGiveSheet } from './giving-sheet';
import { CAMPAIGN } from '@/lib/campaign';

// Mobile only. Fixed bottom bar, two parts (§2): Vipps left, Velg beløp
// right. Thumb reach beats convention. 44px minimum on every hit target.
export function MobileGiveBar() {
  const t = useTranslations('mobile');

  return (
    <div data-print-hide className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-paper">
      <div className="grid grid-cols-2 divide-x divide-rule">
        <a
          href={`https://qr.vipps.no/28/2/01/031/${CAMPAIGN.vippsNumber}`}
          className="min-h-14 flex items-center justify-center px-4 py-3 text-body font-semibold text-ink hover:bg-paper-2"
        >
          {t('vipps', { number: CAMPAIGN.vippsNumber })}
        </a>
        <button
          type="button"
          onClick={() => openGiveSheet()}
          className="min-h-14 flex items-center justify-center bg-gold-deep text-paper px-4 py-3 text-[15px] font-semibold transition-colors duration-200 ease-out hover:bg-ink active:scale-[0.99]"
        >
          {t('pick')}
        </button>
      </div>
      <div className="pb-[env(safe-area-inset-bottom)]" aria-hidden />
    </div>
  );
}
