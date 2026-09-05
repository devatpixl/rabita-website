'use client';

import { useId, useState } from 'react';
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
  | 'skole'
  | 'koran'
  | 'kurs'
  | 'apartments'
  | 'visit'
  | 'contact';

// Field language (2026-09-05, client): the fields are WELLS — filled, a
// shade off the surface they stand on, inside a 1.5px box.
//
// This reverses the note of 2026-08-30 above it, which took the boxes away
// so the form would "read as part of the page rather than a widget dropped
// on it". That succeeded too completely: the control ended up with no fill
// and no border on any side, and the client's report was that the fields do
// not look like fields. The premise has changed too — the form is no longer
// a passage inside a text column, it is a section standing on its own
// ground, so "part of the page" is no longer the goal.
//
// The shape is the one the giving card already established (giving-card.tsx,
// the custom-amount box): one bordered well holding a mono small-caps label
// and a large serif value. That makes the enquiry form a sibling of the
// site's other two asks rather than a third dialect.
export type FormTone = 'paper' | 'dusk';

const TONE = {
  paper: {
    box: 'border-ink/20 bg-paper hover:border-ink/35 focus-within:border-ink',
    // Inside the raised paper card the well has to go DARKER than its
    // panel, or a paper field on a paper card disappears entirely.
    boxOnCard: 'border-ink/20 bg-paper-2 hover:border-ink/35 focus-within:border-ink',
    label: 'text-ink-60 group-focus-within:text-gold-deep',
    hint: 'text-ink-60',
    value: 'text-ink caret-gold-deep placeholder:text-ink-40',
    icon: 'text-gold-deep',
    rule: 'border-rule',
    button: 'bg-ink text-paper hover:bg-gold-deep',
    meta: 'text-ink-60',
    error: 'border-gold-deep/50 bg-gold-soft/40 text-ink',
    diamond: 'bg-gold-deep',
    doneH: 'text-ink',
    doneB: 'text-ink-60',
  },
  dusk: {
    box: 'border-paper/20 bg-paper/[0.06] hover:border-paper/35 focus-within:border-gold focus-within:bg-paper/10',
    boxOnCard: '',
    label: 'text-paper/55 group-focus-within:text-gold',
    hint: 'text-paper/55',
    value: 'text-paper caret-gold placeholder:text-paper/35',
    icon: 'text-gold',
    rule: 'border-paper/15',
    // gold on dusk, not gold-deep on paper: #16242E on #C0A165 is ~7:1,
    // where paper on #9B7F4A is a borderline 4.3:1.
    button: 'bg-gold text-dusk hover:bg-paper hover:text-ink',
    meta: 'text-paper/60',
    error: 'border-gold/50 bg-gold/10 text-paper',
    diamond: 'bg-gold',
    doneH: 'text-paper',
    doneB: 'text-paper/70',
  },
} as const;

const VALUE = 'mt-2 block w-full bg-transparent font-serif text-[1.15rem] leading-snug outline-none';

function Field({
  id,
  label,
  hint,
  icon,
  tone,
  card,
  children,
}: {
  id: string;
  label: string;
  /** A sentence of guidance. Set as a sentence, not as a label. */
  hint?: string;
  icon?: FieldIconName;
  tone: FormTone;
  card?: boolean;
  children: React.ReactNode;
}) {
  const c = TONE[tone];
  return (
    <div
      className={cn(
        'group rounded-btn border-[1.5px] px-4 pb-3 pt-3 transition-colors',
        // No focus ring on the WELL. globals.css already draws one on the
        // control itself — its :where() selector has zero specificity but
        // still lands, because Tailwind's outline-none is a transparent
        // outline rather than none, and the two tie on specificity with the
        // base rule emitted last. A ring on the well as well would be two
        // rings. What the well does on focus is take a gold border, which is
        // its own signal and not a duplicate of the browser's.
        //
        // field-dusk recolours that one ring to gold and repaints Chrome's
        // autofill (globals.css, .field-dusk).
        tone === 'dusk' && 'field-dusk',
        // dusk has no separate on-card well — the shell ignores `card`
        // there too, so an empty boxOnCard must fall back, not blank out.
        card && c.boxOnCard ? c.boxOnCard : c.box,
      )}
    >
      <label
        htmlFor={id}
        className={cn(
          'flex cursor-pointer items-center gap-2.5 font-mono text-[0.625rem] uppercase tracking-[0.18em] transition-colors',
          c.label,
        )}
      >
        {icon && <FieldIcon name={icon} className={cn('h-[15px] w-[15px] shrink-0', c.icon)} />}
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className={cn('mt-1.5 text-[13px] leading-snug', c.hint)}>
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

const BEDROOMS = ['1', '2', '3', '4+'] as const;

export function RequestForm({
  subject,
  heading,
  card = false,
  tone = 'paper',
}: {
  subject: RequestSubject;
  /** Serif title set inside the form, above the first rule. */
  heading?: string;
  /** Raised paper card, for when the form sits on a tinted ground.
   *  Ignored under tone="dusk" — a paper card on a dusk plate is a different
   *  design, and this is not it. */
  card?: boolean;
  /** Which ground the form is standing on.
   *
   *  Replaces the old `ornate` flag (2026-09-05, client). Everything ornate
   *  used to gate — the gold marks beside labels, the lock on the privacy
   *  line — is simply the form now, on every page; what actually differs
   *  between placements is the ground, and that is what this says. */
  tone?: FormTone;
}) {
  const t = useTranslations('requestForm');
  const c = TONE[tone];
  const uid = useId();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [preferred, setPreferred] = useState('');
  const [bedrooms, setBedrooms] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<'network' | 'invalid' | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !name.trim() || !contact.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/requests', {
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
      // The route answers 400 on a zod failure. Neither the status nor the
      // body was checked before, so a REJECTED enquiry rendered the "we have
      // received it" screen and the sender never found out.
      if (!res.ok) {
        setError('invalid');
        return;
      }
      const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (!data?.ok) {
        setError('invalid');
        return;
      }
      setDone(true);
    } catch {
      // There was no catch at all: on a dropped connection the promise
      // rejected, and the form simply sat there having said nothing.
      setError('network');
    } finally {
      setSubmitting(false);
    }
  };

  // On dusk the form stands on the plate itself: a paper card inside a dusk
  // plate would be a panel on a panel, and the plate is already the panel.
  const shell = cn(
    tone === 'dusk'
      ? 'text-paper'
      : card
        ? 'rounded-2xl bg-paper p-6 text-ink shadow-[0_1px_2px_rgba(26,26,24,0.04),0_24px_60px_-34px_rgba(26,26,24,0.28)] sm:p-8'
        : 'text-ink',
  );

  if (done) {
    return (
      // No border-t here any more. The heavy black rule the ornate variant
      // reinstated was never part of this panel; the diamond opens it.
      <div className={cn(shell, tone === 'paper' && !card ? 'pt-8' : '')} role="status">
        <span aria-hidden className={cn('block h-2.5 w-2.5 rotate-45', c.diamond)} />
        <p className={cn('mt-5 font-serif text-[1.6rem] leading-tight', c.doneH)}>{t('doneTitle')}</p>
        <p className={cn('mt-3 max-w-prose text-body', c.doneB)}>{t('doneBody')}</p>
      </div>
    );
  }

  const ready = name.trim().length > 0 && contact.trim().length > 0;

  return (
    <form onSubmit={onSubmit} className={shell} noValidate>
      {heading && (
        <div className="flex items-baseline justify-between gap-4">
          <h3 className={cn('font-serif text-[1.75rem] leading-tight', c.doneH)}>{heading}</h3>
          <span aria-hidden className={cn('h-2.5 w-2.5 shrink-0 translate-y-[-2px] rotate-45', c.diamond)} />
        </div>
      )}
      {/* The rule that opens the form, kept only where it was doing work:
         /kontakt and /besok-oss set the form directly under body copy and
         need the break. A card brings its own edge, and the dusk plate is
         its own edge. */}
      {tone === 'paper' && !card && <div className={cn(heading ? 'mt-4' : '', 'border-t border-ink')} />}

      {/* Name and contact share a row from sm. gap-y-4, not gap-y-7: the
         wells carry their own 3px of internal padding on every side, so the
         old underline spacing would now read as drift. */}
      <div
        className={cn(
          'grid gap-x-4 gap-y-4 sm:grid-cols-2',
          // Three cases, one rule: after the opening hairline, clear it;
          // after a heading with no hairline, clear the heading; at the top
          // of its own column on the dusk plate, nothing — the form's first
          // field has to line up with the rail's eyebrow beside it.
          tone === 'paper' && !card ? 'pt-6' : heading ? 'mt-6' : '',
        )}
      >
        <Field id={`${uid}-name`} label={t('name')} icon="person" tone={tone} card={card}>
          <input
            id={`${uid}-name`}
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={cn(VALUE, c.value)}
          />
        </Field>
        <Field id={`${uid}-contact`} label={t('contact')} icon="mail" tone={tone} card={card}>
          <input
            id={`${uid}-contact`}
            required
            autoComplete="email"
            inputMode="email"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={t('contactPlaceholder')}
            className={cn(VALUE, c.value)}
          />
        </Field>
      </div>

      {/* Apartments: bedrooms as chips instead of a free-text time. */}
      {subject === 'apartments' && (
        <div className="mt-4">
          <span className={cn('block font-mono text-[0.625rem] uppercase tracking-[0.18em]', c.hint)}>
            {t('bedrooms')}
          </span>
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
                  className={cn(
                    'min-h-10 rounded-full border-[1.5px] px-4 font-serif text-[1.05rem] tabular-nums transition-colors',
                    tone === 'dusk'
                      ? on
                        ? 'border-gold bg-gold text-dusk'
                        : 'border-paper/25 text-paper hover:border-paper'
                      : on
                        ? 'border-ink bg-ink text-paper'
                        : 'border-ink/25 text-ink hover:border-ink',
                  )}
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
        <div className="mt-4">
          <Field id={`${uid}-preferred`} label={t('preferred')} icon="calendar" tone={tone} card={card}>
            <input
              id={`${uid}-preferred`}
              value={preferred}
              onChange={(e) => setPreferred(e.target.value)}
              placeholder={t('preferredPlaceholder')}
              className={cn(VALUE, c.value)}
            />
          </Field>
        </div>
      )}

      <div className="mt-4">
        {/* The per-subject sentence — "Tell us briefly about the planned date
           and the number of guests" — used to BE the label, set at 10px
           uppercase mono with 0.18em tracking. Good copy in the wrong slot:
           a sentence tracked out like a small-caps eyebrow is close to
           unreadable. It is now hint text under a two-word label. */}
        <Field
          id={`${uid}-notes`}
          label={t('notesLabel')}
          hint={t(`notes.${subject}`)}
          icon="message"
          tone={tone}
          card={card}
        >
          <textarea
            id={`${uid}-notes`}
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            aria-describedby={`${uid}-notes-hint`}
            className={cn(VALUE, c.value, 'min-h-[5.5rem] resize-none')}
          />
        </Field>
      </div>

      {/* One live region, mounted for the life of the form rather than
         appearing with the message: a region inserted at the same moment it
         gains content is announced unreliably. */}
      <div aria-live="polite" className="empty:hidden">
        {error && (
          <p
            role="alert"
            className={cn('mt-5 flex items-start gap-2.5 rounded-btn border-[1.5px] px-4 py-3 text-[14px] leading-snug', c.error)}
          >
            <span aria-hidden className={cn('mt-[7px] block h-1.5 w-1.5 shrink-0 rotate-45', c.diamond)} />
            <span>{t(`errors.${error}`)}</span>
          </p>
        )}
      </div>

      {/* Send, then the privacy line under it — not beside it.
         Side by side, the privacy sentence was squeezed into whatever the
         button left over: inside the enquiry plate's 7-column form that is
         about 30 characters, and a 10px tracked-out mono line broke to four
         ragged right-aligned lines. Stacked, it reads as one line of small
         print under the control it belongs to, at any width. */}
      <div className="mt-7">
        <div className="flex items-center gap-5">
          {/* A rule running into the button, so Send reads as the end of the
             form rather than as a control parked under it. Hidden on a phone,
             where there is no width to spend on a line. */}
          <span aria-hidden className={cn('hidden h-px w-10 sm:block', tone === 'dusk' ? 'bg-gold/45' : 'bg-gold-deep/45')} />
          <button
            type="submit"
            disabled={submitting || !ready}
            className={cn(
              'group inline-flex min-h-12 items-center justify-center gap-3 rounded-full px-7 text-[15px] font-semibold transition-colors active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40',
              c.button,
            )}
          >
            {submitting ? t('submitting') : t('submit')}
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">
              &rarr;
            </span>
          </button>
          <span aria-hidden className={cn('hidden h-px flex-1 sm:block', tone === 'dusk' ? 'bg-gold/20' : 'bg-gold-deep/20')} />
        </div>
        <p
          className={cn(
            'mt-5 flex max-w-[52ch] items-start gap-2.5 font-mono text-[0.625rem] uppercase leading-relaxed tracking-[0.12em]',
            c.meta,
          )}
        >
          <FieldIcon name="lock" className={cn('mt-px h-[15px] w-[15px] shrink-0', c.icon)} />
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
