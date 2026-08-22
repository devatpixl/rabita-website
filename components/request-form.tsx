'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

// One reusable form (§5). Subject-switch for nikah, janaza, shahada,
// counselling, visits, contact. Every field has a real <label>, so screen
// readers announce them correctly (§8).
export type RequestSubject =
  | 'nikah'
  | 'janaza'
  | 'shahada'
  | 'counselling'
  | 'hajj-umrah'
  | 'visit'
  | 'contact';

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
      <div className="border border-rule bg-paper-2 p-6">
        <p className="font-serif text-card text-ink">{t('doneTitle')}</p>
        <p className="mt-2 text-body text-ink-60">{t('doneBody')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <label className="block">
        <span className="mb-1 block text-[13px] font-semibold text-ink">{t('name')}</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-h-11 w-full border border-rule bg-paper px-3 py-2 text-body outline-none focus:border-ink"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[13px] font-semibold text-ink">{t('contact')}</span>
        <input
          required
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder={t('contactPlaceholder')}
          className="min-h-11 w-full border border-rule bg-paper px-3 py-2 text-body outline-none focus:border-ink"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[13px] font-semibold text-ink">{t('preferred')}</span>
        <input
          value={preferred}
          onChange={(e) => setPreferred(e.target.value)}
          placeholder={t('preferredPlaceholder')}
          className="min-h-11 w-full border border-rule bg-paper px-3 py-2 text-body outline-none focus:border-ink"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[13px] font-semibold text-ink">{t(`notes.${subject}`)}</span>
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border border-rule bg-paper px-3 py-2 text-body outline-none focus:border-ink"
        />
      </label>
      <button
        type="submit"
        disabled={submitting || !name.trim() || !contact.trim()}
        className="min-h-12 rounded-full bg-gold-deep px-5 py-3 text-[15px] font-semibold text-paper hover:bg-ink transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t('submit')}
      </button>
      <p className="text-[13px] text-ink-60">{t('privacy')}</p>
    </form>
  );
}
