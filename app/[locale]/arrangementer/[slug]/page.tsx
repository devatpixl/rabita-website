'use client';

import { use, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Section, SectionBody } from '@/components/primitives';
import { VisitClose, VisitHero } from '@/components/visit-page';

// RSVP with capture. In phase 2 the list is written to the stub route; the
// admin export UI ships with the CMS decision.
type Params = { locale: string; slug: string };

// One photograph per event, all from the mosque's own archive
const EVENT_IMAGE: Record<'ramadan' | 'lecture' | 'school', string> = {
  ramadan: '/photos/event-iftar-tables.webp',
  lecture: '/photos/event-lecture-hall.webp',
  school: '/photos/event-school-visit.webp',
};

const KNOWN: Record<string, 'ramadan' | 'lecture' | 'school'> = {
  'ramadan-iftar-2026': 'ramadan',
  'aabent-hus-oktober': 'lecture',
  'skolebesok-host': 'school',
};

export default function EventDetail({ params }: { params: Promise<Params> }) {
  const { slug } = use(params);
  const key = KNOWN[slug] ?? 'lecture';
  const t = useTranslations('eventsPage');
  const tv = useTranslations('visitPages');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [count, setCount] = useState(1);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const locale = useLocale();

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
      <VisitHero
        crumb={tv('crumb')}
        eyebrow={tv('pages.events.eyebrow')}
        title={t(`items.${key}.title`)}
        lede={t(`items.${key}.body`)}
        image={EVENT_IMAGE[key]}
        alt={t(`items.${key}.title`)}
        facts={tv.raw('pages.events.facts') as { term: string; detail: string }[]}
      />
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
                className="min-h-12 rounded-full bg-gold-deep px-5 py-3 text-[15px] font-semibold text-paper hover:bg-ink transition-colors disabled:opacity-50">
                {t('rsvp')}
              </button>
            </form>
          )}
        </SectionBody>
      </Section>
      <VisitClose
        heading={tv('pages.events.closeHeading')}
        body={tv('pages.events.closeBody')}
        image="/photos/event-close.webp"
        alt={tv('pages.events.caption')}
        primary={{ label: tv('pages.events.closePrimary'), href: `/${locale}/besok-oss` }}
        secondary={{ label: tv('pages.events.closeSecondary'), href: `/${locale}/kontakt` }}
      />
    </main>
  );
}
