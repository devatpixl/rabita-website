'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

// One reusable form (§5). Subject-switch for nikah, janaza, shahada,
// counselling, visits, contact. Every field has a real <label>, so screen
// readers announce them correctly (§8).
//
// This was the last set of unstyled controls on the site: square 1px boxes,
// bold black labels shouting over the fields they name, browser default
// placeholder grey, and a drag handle in the corner of the textarea. Every
// other form here, the giving card and the membership card, already used a
// house field style; this one had simply never been given it.
//
// It now sits in the same raised panel those two use, with the fields a shade
// lighter than the panel so they read as wells rather than outlines.
export type RequestSubject =
  | 'nikah'
  | 'janaza'
  | 'shahada'
  | 'counselling'
  | 'hajj-umrah'
  | 'megling'
  | 'barn-og-ungdom'
  | 'skole'
  | 'koran'
  | 'kurs'
  | 'veivisere'
  | 'apartments'
  | 'visit'
  | 'contact';

// Field language (2026-08-30): no boxes. A mono small-caps label, the
// value set large on a hairline, and a gold line that draws in from the
// start edge on focus — the same gesture the site's text links use. The
// form reads as part of the page rather than a widget dropped on it.
const FIELD =
  'peer w-full bg-transparent pb-3 pt-1 text-[17px] leading-snug text-ink outline-none placeholder:text-ink-60/50';

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="group relative block">
      <span className="block font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-60 transition-colors group-focus-within:text-gold-deep">
        {label}
      </span>
      {children}
      {/* Resting hairline, and the gold line that draws in on focus. */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-rule" />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gold-deep transition-transform duration-300 ease-out group-focus-within:scale-x-100 motion-reduce:transition-none rtl:origin-right"
      />
    </label>
  );
}

const BEDROOMS = ['1', '2', '3', '4+'] as const;

export function RequestForm({
  subject,
  heading,
  card = false,
}: {
  subject: RequestSubject;
  /** Serif title set inside the form, above the first rule. */
  heading?: string;
  /** Raised paper card, for when the form sits on a tinted ground. */
  card?: boolean;
}) {
  const t = useTranslations('requestForm');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [preferred, setPreferred] = useState('');
  const [bedrooms, setBedrooms] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !name.trim() || !contact.trim()) return;
    setSubmitting(true);
    try {
      await fetch('/api/requests', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          subject,
          name,
          contact,
          notes,
          preferred: subject === 'apartments' && bedrooms ? `${bedrooms} ${t('bedroomsUnit')}` : preferred,
        }),
      });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  const shell = card
    ? 'rounded-2xl bg-paper p-6 text-ink shadow-[0_1px_2px_rgba(26,26,24,0.04),0_24px_60px_-34px_rgba(26,26,24,0.28)] sm:p-8'
    : 'text-ink';

  if (done) {
    return (
      <div className={`${shell} ${card ? '' : 'border-t border-ink pt-8'}`}>
        <span aria-hidden className="block h-2.5 w-2.5 rotate-45 bg-gold-deep" />
        <p className="mt-5 font-serif text-[1.6rem] leading-tight text-ink">{t('doneTitle')}</p>
        <p className="mt-3 max-w-prose text-body text-ink-60">{t('doneBody')}</p>
      </div>
    );
  }

  const ready = name.trim().length > 0 && contact.trim().length > 0;

  return (
    <form onSubmit={onSubmit} className={shell}>
      {heading && (
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-serif text-[1.75rem] leading-tight text-ink">{heading}</h3>
          <span aria-hidden className="h-2.5 w-2.5 shrink-0 translate-y-[-2px] rotate-45 bg-gold-deep" />
        </div>
      )}
      <div className={heading ? 'mt-4 border-t border-ink' : 'border-t border-ink'} />
      {/* Name and contact share a row from sm. */}
      <div className="grid gap-x-10 gap-y-7 pt-6 sm:grid-cols-2">
        <Field label={t('name')}>
          <input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={FIELD} />
        </Field>
        <Field label={t('contact')}>
          <input
            required
            autoComplete="email"
            inputMode="email"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={t('contactPlaceholder')}
            className={FIELD}
          />
        </Field>
      </div>

      {/* Apartments: bedrooms as chips instead of a free-text time. */}
      {subject === 'apartments' && (
        <div className="mt-7">
          <span className="block font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-60">{t('bedrooms')}</span>
          <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label={t('bedrooms')}>
            {BEDROOMS.map((b) => {
              const on = bedrooms === b;
              return (
                <button
                  key={b}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setBedrooms(on ? '' : b)}
                  className={`min-h-10 rounded-full border-[1.5px] px-4 font-serif text-[1.05rem] tabular-nums transition-colors ${on ? 'border-ink bg-ink text-paper' : 'border-ink/25 text-ink hover:border-ink'}`}
                >
                  {b}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* "Preferred time" is for bookings; an apartment enquiry has none. */}
      {subject !== 'apartments' && (
        <div className="mt-7">
          <Field label={t('preferred')}>
            <input value={preferred} onChange={(e) => setPreferred(e.target.value)} placeholder={t('preferredPlaceholder')} className={FIELD} />
          </Field>
        </div>
      )}

      <div className="mt-7">
        <Field label={t(`notes.${subject}`)}>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${FIELD} min-h-[5.5rem] resize-none`}
          />
        </Field>
      </div>

      <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={submitting || !ready}
          className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-ink px-7 text-[15px] font-semibold text-paper transition-colors hover:bg-gold-deep active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t('submit')}
          <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">
            &rarr;
          </span>
        </button>
        <p className="max-w-[34ch] font-mono text-[0.625rem] uppercase leading-relaxed tracking-[0.12em] text-ink-60 sm:text-end">
          {t('privacy')}
        </p>
      </div>
    </form>
  );
}
