'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Section, SectionBody, SectionHeading } from '@/components/primitives';
import { StoryColophon, StoryHero, StoryPlate } from '@/components/story-page';

// Volunteer signup. Simple checkbox list of interest areas + contact.
const AREAS = ['events', 'teaching', 'library', 'youth', 'construction', 'admin'] as const;
type Area = (typeof AREAS)[number];

export default function VolunteerPage() {
  const t = useTranslations('volunteerPage');
  const ts = useTranslations('storyPages');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [interests, setInterests] = useState<Set<Area>>(new Set());
  const [availability, setAvailability] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toggle = (a: Area) => {
    setInterests((prev) => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a);
      else next.add(a);
      return next;
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || submitting) return;
    setSubmitting(true);
    try {
      await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, contact, interests: [...interests], availability }),
      });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <StoryHero
        crumb={ts('crumb')}
        index={ts('pages.volunteer.index')}
        eyebrow={ts('pages.volunteer.eyebrow')}
        title={ts('pages.volunteer.title')}
        lede={ts('pages.volunteer.lede')}
      />
      <StoryPlate image="/photos/story-volunteers.webp" caption={ts('pages.volunteer.caption')} />
      <Section tone="paper">
        <SectionBody>
          {done ? (
            <div className="max-w-lg border border-rule bg-paper-2 p-6">
              <p className="font-serif text-card text-ink">{t('done.title')}</p>
              <p className="mt-2 text-body text-ink-60">{t('done.body')}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
              <SectionHeading>{t('formHeading')}</SectionHeading>

              <label className="block">
                <span className="mb-1 block text-[13px] text-ink-60">{t('name')}</span>
                <input required value={name} onChange={(e) => setName(e.target.value)}
                  className="min-h-11 w-full border border-rule bg-paper px-3 py-2 text-body outline-none focus:border-ink" />
              </label>

              <label className="block">
                <span className="mb-1 block text-[13px] text-ink-60">{t('contact')}</span>
                <input required value={contact} onChange={(e) => setContact(e.target.value)}
                  className="min-h-11 w-full border border-rule bg-paper px-3 py-2 text-body outline-none focus:border-ink" />
              </label>

              <fieldset>
                <legend className="mb-3 text-[13px] text-ink-60">{t('interests')}</legend>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {AREAS.map((a) => (
                    <label key={a} className="flex min-h-11 items-start gap-2 text-body">
                      <input type="checkbox" checked={interests.has(a)} onChange={() => toggle(a)}
                        className="mt-1 h-5 w-5 accent-ink" />
                      <span>{t(`areas.${a}`)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="block">
                <span className="mb-1 block text-[13px] text-ink-60">{t('availability')}</span>
                <textarea rows={3} value={availability} onChange={(e) => setAvailability(e.target.value)}
                  className="w-full border border-rule bg-paper px-3 py-2 text-body outline-none focus:border-ink" />
              </label>

              <button type="submit" disabled={submitting}
                className="min-h-12 rounded-btn bg-gold-deep px-5 py-3 text-[15px] font-semibold text-paper hover:bg-ink transition-colors disabled:opacity-50">
                {t('submit')}
              </button>
            </form>
          )}
        </SectionBody>
      </Section>
      <StoryColophon
        heading={ts('colophon.heading')}
        body={ts('colophon.body')}
        hours={ts('colophon.hours')}
        labels={ts.raw('colophon.labels') as {
          founded: string;
          orgNr: string;
          members: string;
          address: string;
          hours: string;
          bank: string;
        }}
      />
    </main>
  );
}
