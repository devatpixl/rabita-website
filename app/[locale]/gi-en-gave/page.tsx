import Link from 'next/link';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { GivingCard } from '@/components/giving-card';
import { Section, SectionBody, SectionHeading, Eyebrow } from '@/components/primitives';
import { CAMPAIGN } from '@/lib/campaign';
import { Copyable } from '@/components/copyable';

// §6: `/gi-en-gave` treatment — evening facade full-bleed feel, two words
// over it, giving card below the fold. Split into named routes: one-off,
// monthly, dedication, company, legacy. Somebody giving 200 000 needs a
// different path from somebody giving 200.
export default async function GiveIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'givePage' });
  const l = await getLocale();

  const routes = [
    { hash: 'once', href: `/${l}/gi-en-gave` },
    { hash: 'monthly', href: `/${l}/gi-en-gave` },
    { hash: 'sadaqa', href: `/${l}/doner-en-bonneplass` },
    { hash: 'company', href: `/${l}/gi-en-gave` },
    { hash: 'legacy', href: `/${l}/gi-en-gave` },
  ] as const;

  return (
    <main>
      <div className="relative bg-ink text-paper">
        <div className="mx-auto flex min-h-[60vh] max-w-6xl items-end px-6 py-section-lg">
          <div className="max-w-3xl">
            <Eyebrow className="text-gold">{CAMPAIGN.address}</Eyebrow>
            <h1 className="mt-4 font-serif text-display leading-none">{t('title')}</h1>
          </div>
        </div>
      </div>

      <Section tone="paper" id="gikort">
        <SectionBody>
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-6">
              <SectionHeading>{t('cardHeading')}</SectionHeading>
              <p className="mt-4 text-body text-ink">{t('cardLede')}</p>
            </div>
            <div className="md:col-span-6">
              <GivingCard />
            </div>
          </div>
        </SectionBody>
      </Section>

      <Section tone="paper-2" id="routes">
        <SectionBody>
          <SectionHeading>{t('routes.heading')}</SectionHeading>
          <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {routes.map((r) => (
              <li key={r.hash} className="border-t border-rule pt-6">
                <h3 className="mb-2 font-serif text-card text-ink">{t(`routes.${r.hash}.title`)}</h3>
                <p className="mb-4 text-body text-ink-60">{t(`routes.${r.hash}.body`)}</p>
                <Link
                  href={r.href}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center text-body font-semibold text-ink underline underline-offset-4"
                >
                  {t('routes.cta')}
                </Link>
              </li>
            ))}
          </ul>
        </SectionBody>
      </Section>

      <Section tone="paper" id="direkte">
        <SectionBody>
          <SectionHeading>{t('direct.heading')}</SectionHeading>
          <p className="mt-4 max-w-prose text-body text-ink">{t('direct.body')}</p>
          <div className="mt-8 space-y-6 max-w-lg">
            <Copyable value={CAMPAIGN.vippsNumber} label="Vipps" size="display" />
            <Copyable value={CAMPAIGN.bankAccount} label={t('direct.account')} />
            <Copyable value={CAMPAIGN.iban} label="IBAN" />
            <Copyable value={CAMPAIGN.swift} label="SWIFT" />
          </div>
        </SectionBody>
      </Section>
    </main>
  );
}
