'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { GivingCard } from './giving-card';
import type { Frequency } from '@/lib/campaign';

// Singleton. Mounted once in the locale layout. Listens for a window event
// so any button on any page can open it without prop-drilling. Focused
// overlay per §3: nav suppressed by ::backdrop, native focus trap, Escape
// closes, no page load.

export const OPEN_GIVE_SHEET_EVENT = 'rabita:open-give-sheet';

// Fired after a gift completes when the caller asked to stay put. The opener
// listens and thanks the donor in place.
//
// An event rather than a URL change, because router.push() to the SAME route
// is a client-side navigation: it does not remount anything, so a component
// that reads the query string on mount never sees the flag. That is why the
// thank-you only appeared after a manual reload.
export const GIVE_COMPLETE_EVENT = 'rabita:give-complete';

// Optional `amount` pre-fills the sheet's card (Gift Ladder → sheet).
// Passing 0 or omitting leaves the sheet in its default state.
//
// Optional `returnTo` sends the donor back where they came from instead of
// to /takk. A visitor who was checking Maghrib, gave 10 kr from the prompt
// and then found themselves on a different page has been taken away from
// what they came for. The caller passes its own URL and thanks them in
// place. Everything else on the site still lands on /takk, which earns its
// keep with the receipt and the share prompt.
//
// This is also the shape the real Vipps flow needs: Vipps leaves the
// browser for the app and comes back via a redirect, so "return here" has
// to be a URL rather than in-page state that an app switch would destroy.
export function openGiveSheet(amount?: number, returnTo?: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(OPEN_GIVE_SHEET_EVENT, {
        detail: {
          amount: typeof amount === 'number' ? amount : undefined,
          returnTo,
        },
      }),
    );
  }
}

export function GivingSheet() {
  const t = useTranslations('giving');
  const locale = useLocale();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [initialAmount, setInitialAmount] = useState<number | undefined>();
  const returnToRef = useRef<string | undefined>(undefined);

  const open = useCallback(() => {
    const el = dialogRef.current;
    if (!el || el.open) return;
    el.showModal();
    document.documentElement.classList.add('sheet-open');
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  // Subscribe once. Any component that calls openGiveSheet(amount?) opens
  // this and passes the optional pre-fill amount through to the card.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ amount?: number; returnTo?: string }>).detail;
      setInitialAmount(detail?.amount);
      returnToRef.current = detail?.returnTo;
      open();
    };
    window.addEventListener(OPEN_GIVE_SHEET_EVENT, handler as EventListener);
    return () => window.removeEventListener(OPEN_GIVE_SHEET_EVENT, handler as EventListener);
  }, [open]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleClose = () => {
      document.documentElement.classList.remove('sheet-open');
    };
    el.addEventListener('close', handleClose);
    return () => el.removeEventListener('close', handleClose);
  }, []);

  // Backdrop click closes. Native dialog forwards a click on itself when
  // the backdrop area is clicked; verify by target identity.
  const onDialogClick: React.MouseEventHandler<HTMLDialogElement> = (e) => {
    if (e.target === dialogRef.current) close();
  };

  const handleSubmit = async (payload: {
    amount: number;
    frequency: Frequency;
    isZakat: boolean;
  }) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await fetch('/api/donations', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      close();
      const back = returnToRef.current;
      returnToRef.current = undefined;
      if (back) {
        // Staying put is the whole point, so do not navigate at all — just
        // tell the opener. `back` still matters for the real Vipps
        // integration, where the provider leaves the browser and returns to
        // that URL; the query flag is read on mount in that case.
        window.dispatchEvent(new CustomEvent(GIVE_COMPLETE_EVENT));
        return;
      }
      router.push(`/${locale}/takk`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={onDialogClick}
      aria-labelledby="giving-sheet-title"
      className="w-full max-w-lg overflow-hidden rounded-2xl border border-rule/60 bg-paper shadow-[0_2px_6px_rgba(0,0,0,0.06),0_24px_60px_-24px_rgba(0,0,0,0.45)]"
    >
      <div className="border-b border-rule bg-paper px-6 py-4 flex items-center justify-between">
        <h2 id="giving-sheet-title" className="text-card font-serif">
          {t('sheetTitle')}
        </h2>
        <button
          type="button"
          onClick={close}
          aria-label={t('closeSheet')}
          className="min-h-11 min-w-11 rounded-full p-2 text-ink hover:bg-paper-2"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="max-h-[80vh] overflow-y-auto">
        <GivingCard onSubmit={handleSubmit} initialAmount={initialAmount} />
      </div>
    </dialog>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
