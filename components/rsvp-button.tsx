'use client';

import { openRsvpSheet, type OpenRsvpDetail } from './rsvp-sheet';
import { cn } from '@/lib/cn';

// Thin client shim so server-rendered event surfaces can dispatch the
// RSVP sheet. The event object is captured server-side and passed
// through as the detail payload.
export function RsvpButton({
  event,
  label,
  variant,
  className,
}: {
  event: OpenRsvpDetail;
  label: string;
  variant: 'primary' | 'ghost' | 'link';
  className?: string;
}) {
  const cls =
    variant === 'primary'
      ? 'min-h-12 rounded-btn bg-gold-deep px-5 py-3 text-body font-semibold text-paper hover:bg-ink transition-colors'
      : variant === 'ghost'
      ? 'min-h-12 rounded-btn border border-ink px-5 py-3 text-body font-semibold text-ink hover:bg-ink hover:text-paper transition-colors'
      : 'inline-flex min-h-11 min-w-11 items-center justify-center text-[14px] font-semibold text-ink underline decoration-gold decoration-1 underline-offset-4 hover:decoration-2';

  return (
    <button
      type="button"
      onClick={() => openRsvpSheet(event)}
      className={cn(cls, className)}
    >
      {label}
    </button>
  );
}
