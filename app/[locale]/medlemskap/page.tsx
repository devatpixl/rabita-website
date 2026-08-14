'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/page-header';
import { Section, SectionBody, SectionHeading } from '@/components/primitives';

type Tier = 'ordinary' | 'voting' | 'youth';

// §4.10 real module — 3 tiers, signup + payment + renewal + voting-eligibility.
// Payment is stubbed in phase 2; the flow is complete end-to-end otherwise.
export default function MembershipPage() {
  const t = useTranslations('medlemskapPage');
  const [tier, setTier] = useState<Tier>('voting');
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
        body: JSON.stringify({ tier, name, email, phone, guardian }),
      });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} lede={t('lede')} />
      <Section tone="paper">
        <SectionBody>
          <SectionHeading>{t('choose')}</SectionHeading>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {(['ordinary', 'voting', 'youth'] as Tier[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setTier(k)}
                aria-pressed={tier === k}
                className={`text-start border p-6 transition-colors ${
                  tier === k ? 'border-ink bg-paper-2' : 'border-rule bg-paper hover:border-ink'
                }`}
              >
                <h3 className="font-serif text-card text-ink">{t(`tiers.${k}.name`)}</h3>
                <p className="mt-2 font-serif text-display leading-none tabular-nums text-ink">{t(`tiers.${k}.price`)}</p>
                <p className="mt-4 text-body text-ink-60">{t(`tiers.${k}.body`)}</p>
              </button>
            ))}
          </div>
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
              {tier === 'youth' && (
                <label className="block">
                  <span className="mb-1 block text-[13px] text-ink-60">{t('form.guardian')}</span>
                  <input required value={guardian} onChange={(e) => setGuardian(e.target.value)}
                    className="min-h-11 w-full border border-rule bg-paper px-3 py-2 text-body outline-none focus:border-ink" />
                </label>
              )}
              <button type="submit" disabled={submitting}
                className="min-h-12 rounded-btn bg-gold-deep px-5 py-3 text-[15px] font-semibold text-paper hover:bg-ink transition-colors disabled:opacity-50">
                {tier === 'voting' ? t('form.submitPay') : t('form.submitFree')}
              </button>
              <p className="text-[13px] text-ink-60">{t('form.note')}</p>
            </form>
          )}
        </SectionBody>
      </Section>
    </main>
  );
}
