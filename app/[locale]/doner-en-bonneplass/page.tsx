'use client';

import { useTranslations, useLocale} from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import { Section, SectionBody, SectionHeading } from '@/components/primitives';
import { openGiveSheet } from '@/components/giving-sheet';

import { Accent } from '@/components/accent';
import {
  ProjectAssurance,
  ProjectBrief,
  ProjectColumns,
  ProjectHero,
} from '@/components/project-page';
// §4.05 + §5. Sadaqa jariya flow. Name entered and acknowledged, something
// to send to the family afterwards. Kept on one page for phase-2 shipping;
// phase-3 adds the certificate email delivery.
export default function SadaqaPage() {
  const t = useTranslations('sadaqaPage');
  const tp = useTranslations('projectPages');
  const locale = useLocale();
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    try {
      // Persist dedication (stub). Real endpoint arrives in phase 3 alongside
      // certificate email.
      await fetch('/api/dedications', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, relation, message }),
      });
      // Store selection in URL hash so the giving sheet can read it in phase 3.
      openGiveSheet();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <ProjectHero
        crumb={tp('crumb')}
        eyebrow={tp('pages.space.eyebrow')}
        title={tp.rich('pages.space.title', {
          em: (chunks) => <Accent surface="dusk">{chunks}</Accent>,
        })}
        lede={tp('pages.space.lede')}
        image="/photos/hero-space.webp"
        alt={tp('pages.space.eyebrow')}
        primary={{ label: tp('pages.space.primary'), give: true }}
        secondary={{ label: tp('pages.space.secondary'), href: `/${locale}/moskeprosjektet` }}
      />
      <ProjectBrief label={tp('pages.space.briefLabel')} body={tp('pages.space.brief')} />
      <ProjectColumns
        eyebrow={tp('pages.space.colEyebrow')}
        heading={tp('pages.space.colHeading')}
        items={tp.raw('pages.space.items') as { title: string; body: string }[]}
      />
      <Section tone="paper">
        <SectionBody>
          <div className="grid gap-10 md:grid-cols-12 md:items-center">
            <div className="md:col-span-5">
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-paper-2">
                <Image
                  src="/photos/give-dedication.webp"
                  alt={t('formHeading')}
                  fill
                  loading="eager"
                  sizes="(min-width: 768px) 40vw, 90vw"
                  className="object-cover"
                  style={{ filter: 'saturate(0.72) contrast(1.12) brightness(0.9)' }}
                />
              </div>
            </div>
            <form onSubmit={onSubmit} className="md:col-span-7 space-y-5">
              <SectionHeading>{t('formHeading')}</SectionHeading>
              <p className="text-body text-ink-60">{t('formLede')}</p>

              <label className="block">
                <span className="mb-1 block text-[13px] text-ink-60">{t('fields.name')}</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="min-h-11 w-full border border-rule bg-paper px-3 py-2 text-body outline-none focus:border-ink"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[13px] text-ink-60">{t('fields.relation')}</span>
                <input
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="min-h-11 w-full border border-rule bg-paper px-3 py-2 text-body outline-none focus:border-ink"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[13px] text-ink-60">{t('fields.message')}</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full border border-rule bg-paper px-3 py-2 text-body outline-none focus:border-ink"
                />
              </label>

              <button
                type="submit"
                disabled={!name.trim() || submitting}
                className="min-h-12 rounded-btn bg-gold-deep px-5 py-3 text-[15px] font-semibold text-paper hover:bg-ink transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('primary')}
              </button>
              <p className="text-[13px] text-ink-60">{t('note')}</p>
            </form>
          </div>
        </SectionBody>
      </Section>
          <ProjectAssurance
        heading={tp('assurance.heading')}
        lede={tp('assurance.lede')}
        items={tp.raw('assurance.items') as { title: string; body: string }[]}
      />
    </main>
  );
}
