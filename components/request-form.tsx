'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

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
  icon,
  children,
}: {
  label: string;
  /** Small gold mark before the label. Ornate forms only — see `ornate`. */
  icon?: FieldIconName;
  children: React.ReactNode;
}) {
  return (
    <label className="group relative block">
      <span className="flex items-center gap-2.5 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-60 transition-colors group-focus-within:text-gold-deep">
        {icon && <FieldIcon name={icon} className="h-[15px] w-[15px] shrink-0 text-gold-deep" />}
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
  ornate = false,
}: {
  subject: RequestSubject;
  /** Serif title set inside the form, above the first rule. */
  heading?: string;
  /** Raised paper card, for when the form sits on a tinted ground. */
  card?: boolean;
  /**
   * The subject pages' treatment (client mockup, 2026-08-31): a mark beside
   * every field label, a gold Send flanked by rules, and a lock on the
   * privacy line.
   *
   * Behind a flag rather than made the default, because this same form runs
   * /kontakt, /besok-oss and the apartments enquiry, and none of those were
   * part of the ask. Flip it on there too if the treatment is wanted
   * everywhere — nothing here is subject-specific.
   */
  ornate?: boolean;
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
      {/* The rule that opens the form. Dropped in the ornate treatment: the
         gold eyebrow rule above the heading already does this job, and two
         rules that close together read as an underline on the heading. */}
      <div
        className={cn(
          heading ? 'mt-4' : '',
          ornate ? 'border-t border-transparent' : 'border-t border-ink',
        )}
      />
      {/* Name and contact share a row from sm. */}
      <div className="grid gap-x-10 gap-y-7 pt-6 sm:grid-cols-2">
        <Field label={t('name')} icon={ornate ? 'person' : undefined}>
          <input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={FIELD} />
        </Field>
        <Field label={t('contact')} icon={ornate ? 'mail' : undefined}>
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
          <Field label={t('preferred')} icon={ornate ? 'calendar' : undefined}>
            <input value={preferred} onChange={(e) => setPreferred(e.target.value)} placeholder={t('preferredPlaceholder')} className={FIELD} />
          </Field>
        </div>
      )}

      <div className="mt-7">
        <Field label={t(`notes.${subject}`)} icon={ornate ? 'message' : undefined}>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${FIELD} min-h-[5.5rem] resize-none`}
          />
        </Field>
      </div>

      <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          {/* A rule running into the button, so Send reads as the end of the
             form rather than as a control parked under it. Hidden on a phone,
             where there is no width to spend on a line. */}
          {ornate && <span aria-hidden className="hidden h-px w-10 bg-gold-deep/40 sm:block" />}
          <button
            type="submit"
            disabled={submitting || !ready}
            className={cn(
              'group inline-flex min-h-12 items-center justify-center gap-3 rounded-full px-7 text-[15px] font-semibold text-paper transition-colors active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40',
              ornate ? 'bg-gold-deep hover:bg-ink' : 'bg-ink hover:bg-gold-deep',
            )}
          >
            {t('submit')}
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">
              &rarr;
            </span>
          </button>
          {ornate && <span aria-hidden className="hidden h-px w-10 bg-gold-deep/40 sm:block" />}
        </div>
        <p className="flex max-w-[34ch] items-start gap-2.5 font-mono text-[0.625rem] uppercase leading-relaxed tracking-[0.12em] text-ink-60 sm:text-end">
          {ornate && <FieldIcon name="lock" className="mt-px h-[15px] w-[15px] shrink-0 text-gold-deep" />}
          <span>{t('privacy')}</span>
        </p>
      </div>
    </form>
  );
}

/* The marks beside the field labels. Line drawings at 15px so they read as
   part of the mono label rather than as buttons next to it. */
type FieldIconName = 'person' | 'mail' | 'calendar' | 'message' | 'lock';

function FieldIcon({ name, className }: { name: FieldIconName; className?: string }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  };
  if (name === 'person') {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="3.25" />
        <path d="M5.5 20v-1a6.5 6.5 0 0 1 13 0v1" />
      </svg>
    );
  }
  if (name === 'mail') {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3.5 7 8.5 6 8.5-6" />
      </svg>
    );
  }
  if (name === 'calendar') {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </svg>
    );
  }
  if (name === 'message') {
    return (
      <svg {...common}>
        <path d="M20 15a2 2 0 0 1-2 2H8l-4 3.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
