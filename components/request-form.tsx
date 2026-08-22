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
  | 'visit'
  | 'contact';

// One string, so a field can never drift from the others again.
const FIELD =
  'w-full rounded-btn border border-rule bg-paper px-3.5 py-2.5 text-body text-ink outline-none transition-colors placeholder:text-ink-40 focus:border-ink';

function Label({ children }: { children: React.ReactNode }) {
  // Quiet, not bold ink. A label names a field; it should not outweigh it.
  return <span className="mb-1.5 block text-[13px] text-ink-60">{children}</span>;
}

export function RequestForm({ subject }: { subject: RequestSubject }) {
  const t = useTranslations('requestForm');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [preferred, setPreferred] = useState('');
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
        body: JSON.stringify({ subject, name, contact, notes, preferred }),
      });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl bg-paper-2 p-7 shadow-[0_1px_2px_rgba(26,26,24,0.04),0_24px_60px_-34px_rgba(26,26,24,0.28)] md:p-8">
        <span aria-hidden className="block h-px w-8 bg-gold" />
        <p className="mt-5 font-serif text-card text-ink">{t('doneTitle')}</p>
        <p className="mt-2 max-w-prose text-body text-ink-60">{t('doneBody')}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl bg-paper-2 p-7 text-ink shadow-[0_1px_2px_rgba(26,26,24,0.04),0_24px_60px_-34px_rgba(26,26,24,0.28)] md:p-8"
    >
      {/* The gold hairline the rest of the site uses to open a block. */}
      <span aria-hidden className="block h-px w-8 bg-gold" />

      {/* Name and contact share a row from sm. Four stacked full width fields
         made a short form look like a long one. */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <Label>{t('name')}</Label>
          <input
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={FIELD}
          />
        </label>
        <label className="block">
          <Label>{t('contact')}</Label>
          <input
            required
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={t('contactPlaceholder')}
            className={FIELD}
          />
        </label>
      </div>

      <label className="mt-4 block">
        <Label>{t('preferred')}</Label>
        <input
          value={preferred}
          onChange={(e) => setPreferred(e.target.value)}
          placeholder={t('preferredPlaceholder')}
          className={FIELD}
        />
      </label>

      <label className="mt-4 block">
        <Label>{t(`notes.${subject}`)}</Label>
        {/* resize-none: the browser's drag handle in the corner was the most
           visible thing in the whole form. */}
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={`${FIELD} min-h-[7rem] resize-none leading-relaxed`}
        />
      </label>

      <div className="mt-7 flex flex-col gap-4 border-t border-rule pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={submitting || !name.trim() || !contact.trim()}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold-deep px-6 text-[15px] font-semibold text-paper transition-colors hover:bg-ink active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('submit')}
          <span aria-hidden className="rtl:rotate-180">
            &rarr;
          </span>
        </button>
        <p className="max-w-prose text-[12px] leading-snug text-ink-60 sm:text-end">
          {t('privacy')}
        </p>
      </div>
    </form>
  );
}
