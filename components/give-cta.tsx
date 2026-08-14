'use client';

import { openGiveSheet } from './giving-sheet';
import { cn } from '@/lib/cn';

// Shared primary CTA. Gold-deep fill, paper text, 4px radius, sans
// sentence case. Client so it can dispatch the sheet-open event. Used
// from server-rendered surfaces like CampaignMeter's sub-campaign card.
// Ink is reserved for selection states; primary action = brand bronze.
export function GiveCTA({
  label,
  className,
  fullWidth = false,
}: {
  label: string;
  className?: string;
  fullWidth?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => openGiveSheet()}
      className={cn(
        'inline-flex items-center justify-center gap-2 min-h-12 rounded-btn px-5 py-3',
        'bg-gold-deep text-paper text-[15px] font-semibold',
        'transition-colors duration-200 ease-out hover:bg-ink',
        'active:scale-[0.99]',
        fullWidth && 'w-full',
        className,
      )}
    >
      <span>{label}</span>
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12h14M13 5l7 7-7 7" />
      </svg>
    </button>
  );
}
