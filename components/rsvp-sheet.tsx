'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

// Singleton dialog for event RSVPs. Mounted once in the locale layout.
// Any button on any page opens it by dispatching OPEN_RSVP_SHEET_EVENT
// with a payload identifying the event. Same pattern and interaction
// model as the giving sheet — native <dialog>, backdrop click closes,
// Escape closes, focus is trapped by the browser.

export const OPEN_RSVP_SHEET_EVENT = 'rabita:open-rsvp-sheet';

export type OpenRsvpDetail = {
  slug: string;
  title: string;
  dateLabel: string;
};

export function openRsvpSheet(detail: OpenRsvpDetail) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OPEN_RSVP_SHEET_EVENT, { detail }));
}

type FormState = 'idle' | 'submitting' | 'done';

export function RsvpSheet() {
  const t = useTranslations('events.sheet');
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const [event, setEvent] = useState<OpenRsvpDetail | null>(null);
  const [state, setState] = useState<FormState>('idle');
  const [error, setError] = useState<string | null>(null);

  const open = useCallback((detail: OpenRsvpDetail) => {
    const el = dialogRef.current;
    if (!el) return;
    setEvent(detail);
    setState('idle');
    setError(null);
    if (!el.open) {
      el.showModal();
      document.documentElement.classList.add('sheet-open');
      // Move focus into the first field for keyboard users.
      window.setTimeout(() => nameRef.current?.focus(), 30);
    }
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<OpenRsvpDetail>).detail;
      if (detail?.slug) open(detail);
    };
    window.addEventListener(OPEN_RSVP_SHEET_EVENT, handler as EventListener);
    return () => window.removeEventListener(OPEN_RSVP_SHEET_EVENT, handler as EventListener);
  }, [open]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const onClose = () => {
      document.documentElement.classList.remove('sheet-open');
    };
    el.addEventListener('close', onClose);
    return () => el.removeEventListener('close', onClose);
  }, []);

  const onDialogClick: React.MouseEventHandler<HTMLDialogElement> = (e) => {
    if (e.target === dialogRef.current) close();
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!event || state === 'submitting') return;
    const form = new FormData(e.currentTarget);
    const payload = {
      slug: event.slug,
      name: String(form.get('name') ?? '').trim(),
      email: String(form.get('email') ?? '').trim(),
      phone: String(form.get('phone') ?? '').trim() || undefined,
      count: Number(form.get('count') ?? 1),
      newsletterOptIn: form.get('newsletter') === 'on',
    };
    setState('submitting');
    setError(null);
    try {
      const res = await fetch('/api/rsvps', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setState('idle');
        setError(t('errorGeneric'));
        return;
      }
      setState('done');
    } catch {
      setState('idle');
      setError(t('errorGeneric'));
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={onDialogClick}
      aria-labelledby="rsvp-sheet-title"
      className="w-full max-w-lg bg-paper"
    >
      <div className="flex items-center justify-between border-b border-rule bg-paper px-6 py-4">
        <div className="min-w-0">
          <h2 id="rsvp-sheet-title" className="font-serif text-card text-ink">
            {event ? event.title : t('title')}
          </h2>
          {event && (
            <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.12em] text-ink-60">
              {event.dateLabel}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={close}
          aria-label={t('close')}
          className="min-h-11 min-w-11 rounded-full p-2 text-ink hover:bg-paper-2"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="max-h-[80vh] overflow-y-auto px-6 py-6">
        {state === 'done' ? (
          <div>
            <p className="font-serif text-[22px] leading-tight text-ink">
              {t('confirmationTitle')}
            </p>
            <p className="mt-3 text-body text-ink-60">
              {t('confirmationBody')}
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-6 min-h-11 rounded-full border border-ink px-5 py-2 text-body font-semibold text-ink hover:bg-ink hover:text-paper transition-colors"
            >
              {t('confirmationClose')}
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="space-y-5">
            <Field id="rsvp-name" label={t('nameLabel')}>
              <input
                ref={nameRef}
                id="rsvp-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className="min-h-11 w-full rounded-btn border border-rule bg-paper px-3 py-2 text-body text-ink outline-none focus:border-ink"
              />
            </Field>
            <Field id="rsvp-email" label={t('emailLabel')}>
              <input
                id="rsvp-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="min-h-11 w-full rounded-btn border border-rule bg-paper px-3 py-2 text-body text-ink outline-none focus:border-ink"
              />
            </Field>
            <Field id="rsvp-phone" label={t('phoneLabel')} hint={t('optional')}>
              <input
                id="rsvp-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className="min-h-11 w-full rounded-btn border border-rule bg-paper px-3 py-2 text-body text-ink outline-none focus:border-ink"
              />
            </Field>
            <Field id="rsvp-count" label={t('countLabel')}>
              <input
                id="rsvp-count"
                name="count"
                type="number"
                min={1}
                max={10}
                defaultValue={1}
                required
                className="min-h-11 w-24 rounded-btn border border-rule bg-paper px-3 py-2 text-body text-ink tabular-nums outline-none focus:border-ink"
              />
            </Field>
            <label className="flex items-start gap-3 text-body text-ink">
              <input
                type="checkbox"
                name="newsletter"
                defaultChecked={false}
                className="mt-1 h-5 w-5 rounded border-rule text-gold-deep focus:ring-2 focus:ring-ink"
              />
              <span>{t('newsletter')}</span>
            </label>

            {error && (
              <p role="alert" className="text-[13px] text-[#b4381f]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={state === 'submitting'}
              className="min-h-12 w-full rounded-full bg-gold-deep px-5 py-3 text-body font-semibold text-paper transition-colors hover:bg-ink disabled:opacity-60"
            >
              {state === 'submitting' ? t('submitting') : t('submit')}
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Quiet label, same as every other form on the site. Bold ink at 13px
         outweighed the field it names. */}
      <label htmlFor={id} className="mb-1.5 block text-[13px] text-ink-60">
        {label}
        {hint && <span className="ms-2">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
