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

// Optional `amount` pre-fills the sheet's card (Gift Ladder → sheet).
// Passing 0 or omitting leaves the sheet in its default state.
export function openGiveSheet(amount?: number) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(OPEN_GIVE_SHEET_EVENT, {
        detail: { amount: typeof amount === 'number' ? amount : undefined },
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
      const detail = (e as CustomEvent<{ amount?: number }>).detail;
      setInitialAmount(detail?.amount);
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
          className="min-h-11 min-w-11 rounded-btn p-2 text-ink hover:bg-paper-2"
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
