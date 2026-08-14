'use client';

import { use, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { PageHeader } from '@/components/page-header';
import { Section, SectionBody } from '@/components/primitives';

// RSVP with capture. In phase 2 the list is written to the stub route; the
// admin export UI ships with the CMS decision.
type Params = { locale: string; slug: string };

const KNOWN: Record<string, 'ramadan' | 'lecture' | 'school'> = {
  'ramadan-iftar-2026': 'ramadan',
  'aabent-hus-oktober': 'lecture',
  'skolebesok-host': 'school',
};

export default function EventDetail({ params }: { params: Promise<Params> }) {
  const { slug } = use(params);
  const key = KNOWN[slug] ?? 'lecture';
  const t = useTranslations('eventsPage');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [count, setCount] = useState(1);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  useLocale(); // ensure client provider hooked

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await fetch('/api/rsvps', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug, name, email, count }),
      });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <PageHeader eyebrow={t('eyebrow')} title={t(`items.${key}.title`)} lede={t(`items.${key}.body`)} />
      <Section tone="paper">
        <SectionBody>
          {done ? (
            <div className="max-w-lg border border-rule bg-paper-2 p-6">
              <p className="font-serif text-card text-ink">{t('doneTitle')}</p>
              <p className="mt-2 text-body text-ink-60">{t('doneBody')}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="max-w-lg space-y-5">
              <label className="block">
                <span className="mb-1 block text-[13px] text-ink-60">{t('name')}</span>
                <input required value={name} onChange={(e) => setName(e.target.value)}
                  className="min-h-11 w-full border border-rule bg-paper px-3 py-2 text-body outline-none focus:border-ink" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[13px] text-ink-60">{t('email')}</span>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="min-h-11 w-full border border-rule bg-paper px-3 py-2 text-body outline-none focus:border-ink" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[13px] text-ink-60">{t('count')}</span>
                <input required type="number" min={1} max={20} value={count} onChange={(e) => setCount(Number(e.target.value))}
                  className="min-h-11 w-full border border-rule bg-paper px-3 py-2 text-body tabular-nums outline-none focus:border-ink" />
              </label>
              <button type="submit" disabled={submitting}
                className="min-h-12 rounded-btn bg-gold-deep px-5 py-3 text-[15px] font-semibold text-paper hover:bg-ink transition-colors disabled:opacity-50">
                {t('rsvp')}
              </button>
            </form>
          )}
        </SectionBody>
      </Section>
    </main>
  );
}
