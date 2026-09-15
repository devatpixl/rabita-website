'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Section, SectionBody, SectionHeading } from '@/components/primitives';
import { type ColophonLabels, StoryColophon, StoryHero, StoryPlate } from '@/components/story-page';

// §4.10 real module — signup + renewal. Payment is stubbed in phase 2; the
// flow is complete end-to-end otherwise.
//
// THE TIERS ARE GONE (client, 2026-09-16: "make all memberships free, remove
// categories, all can vote"). This page carried the same three-tile picker
// as the join card — Ordinary 0 kr / Voting 1 000 kr / Under 15 0 kr — and
// left standing it would have contradicted every other membership surface on
// the site the moment they changed.
//
// NOTE: this page and /bli-medlem are two explanations of one thing, and
// nothing in the nav links here any more — the AGM section's buttons were
// the last references and they now point at /bli-medlem. Recommended
// follow-up is a redirect to /bli-medlem, the way /besok-oss and
// /tjenester/megling were retired in next.config.ts. Not done unasked: it
// deletes a page, which is the client's call, not ours.
export default function MembershipPage() {
  const t = useTranslations('medlemskapPage');
  const ts = useTranslations('storyPages');
  const [under15, setUnder15] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [guardian, setGuardian] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || submitting) return;
    setSubmitting(true);
    try {
      await fetch('/api/memberships', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ under15, name, email, phone, guardian }),
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
        index={ts('pages.membership.index')}
        eyebrow={ts('pages.membership.eyebrow')}
        title={ts('pages.membership.title')}
        lede={ts('pages.membership.lede')}
      />
      <StoryPlate image="/photos/story-members.webp" caption={ts('pages.membership.caption')} />
      <Section tone="paper">
        <SectionBody>
          <SectionHeading>{t('choose')}</SectionHeading>
          <p className="mt-4 max-w-prose text-body text-ink-60">{t('lede')}</p>
        </SectionBody>
      </Section>

      <Section tone="paper-2">
        <SectionBody>
          {done ? (
            <div className="max-w-lg border border-rule bg-paper p-6">
              <p className="font-serif text-card text-ink">{t('done.title')}</p>
              <p className="mt-2 text-body text-ink-60">{t('done.body')}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="max-w-lg space-y-5">
              <SectionHeading>{t('form.heading')}</SectionHeading>
              <label className="block">
                <span className="mb-1 block text-[13px] text-ink-60">{t('form.name')}</span>
                <input required value={name} onChange={(e) => setName(e.target.value)}
                  className="min-h-11 w-full border border-rule bg-paper px-3 py-2 text-body outline-none focus:border-ink" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[13px] text-ink-60">{t('form.email')}</span>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="min-h-11 w-full border border-rule bg-paper px-3 py-2 text-body outline-none focus:border-ink" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[13px] text-ink-60">{t('form.phone')}</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="min-h-11 w-full border border-rule bg-paper px-3 py-2 text-body outline-none focus:border-ink" />
              </label>
              <label className="flex cursor-pointer items-center gap-3 text-body text-ink">
                <input type="checkbox" checked={under15} onChange={(e) => setUnder15(e.target.checked)}
                  className="h-4 w-4 shrink-0 rounded-[3px] border-ink/25 accent-gold-deep" />
                {t('form.under15')}
              </label>
              {under15 && (
                <label className="block">
                  <span className="mb-1 block text-[13px] text-ink-60">{t('form.guardianName')}</span>
                  <input required value={guardian} onChange={(e) => setGuardian(e.target.value)}
                    className="min-h-11 w-full border border-rule bg-paper px-3 py-2 text-body outline-none focus:border-ink" />
                </label>
              )}
              <button type="submit" disabled={submitting}
                className="min-h-12 rounded-full bg-gold-deep px-5 py-3 text-[15px] font-semibold text-paper hover:bg-ink transition-colors disabled:opacity-50">
                {t('form.submitFree')}
              </button>
              <p className="text-[13px] text-ink-60">{t('form.note')}</p>
            </form>
          )}
        </SectionBody>
      </Section>
      <StoryColophon
        heading={ts('colophon.heading')}
        body={ts('colophon.body')}
        hours={ts('colophon.hours')}
        labels={ts.raw('colophon.labels') as ColophonLabels}
      />
    </main>
  );
}
