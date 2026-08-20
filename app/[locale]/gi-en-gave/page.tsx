import Link from 'next/link';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { GivingCard } from '@/components/giving-card';
import { Section, SectionBody, SectionHeading, Eyebrow } from '@/components/primitives';
import { CAMPAIGN } from '@/lib/campaign';
import { Copyable } from '@/components/copyable';

import { Accent } from '@/components/accent';
import {
  ProjectAssurance,
  ProjectBrief,
  ProjectColumns,
  ProjectHero,
} from '@/components/project-page';
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
  const tp = await getTranslations({ locale, namespace: 'projectPages' });
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
      <ProjectHero
        crumb={tp('crumb')}
        eyebrow={tp('pages.give.eyebrow')}
        title={tp.rich('pages.give.title', {
          em: (chunks) => <Accent surface="dusk">{chunks}</Accent>,
        })}
        lede={tp('pages.give.lede')}
        image="/photos/hero-give.webp"
        alt={tp('pages.give.eyebrow')}
        primary={{ label: tp('pages.give.primary'), give: true }}
        secondary={{ label: tp('pages.give.secondary'), href: `/${locale}/hvor-pengene-gar` }}
      />
      <ProjectBrief label={tp('pages.give.briefLabel')} body={tp('pages.give.brief')} />
      <ProjectColumns
        eyebrow={tp('pages.give.colEyebrow')}
        heading={tp('pages.give.colHeading')}
        items={tp.raw('pages.give.items') as { title: string; body: string }[]}
      />
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
          <ProjectAssurance
        heading={tp('assurance.heading')}
        lede={tp('assurance.lede')}
        items={tp.raw('assurance.items') as { title: string; body: string }[]}
      />
    </main>
  );
}
