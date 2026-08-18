import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { PageHeader } from '@/components/page-header';
import { Section, SectionBody, SectionHeading } from '@/components/primitives';
import { CampaignMeter } from '@/components/campaign-meter';

// §6. /hvor-pengene-gar. Anchored subsections for tax deduction, accounts,
// permit — those anchors are referenced from the home cards and footer.
export default async function WhereMoneyGoesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'wmgPage' });

  return (
    <main>
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        lede={t('lede')}
      />

      <CampaignMeter />

      <Section id="skattefradrag" tone="paper">
        <SectionBody>
          <SectionHeading>{t('tax.heading')}</SectionHeading>
          <div className="mt-6 grid gap-8 md:grid-cols-12">
            <p className="md:col-span-8 text-body text-ink">
              {t('tax.body', { cap: CAMPAIGN.taxDeductionCapNok.toLocaleString('nb-NO') })}
            </p>
            <aside className="md:col-span-4 border-s border-rule ps-6">
              <p className="text-[13px] text-ink-60">{t('tax.taxCapLabel')}</p>
              <p className="font-serif text-display tabular-nums text-ink leading-none">
                {CAMPAIGN.taxDeductionCapNok.toLocaleString('nb-NO')} kr
              </p>
              <p className="mt-2 text-[13px] text-ink-60">{t('tax.perYear')}</p>
            </aside>
          </div>
        </SectionBody>
      </Section>

      <Section id="regnskap" tone="paper-2">
        <SectionBody>
          <SectionHeading>{t('accounts.heading')}</SectionHeading>
          <p className="mt-6 max-w-prose text-body text-ink">{t('accounts.body')}</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[2022, 2023, 2024, 2025].map((y) => (
              <li key={y}>
                <a
                  href={`#regnskap-${y}`}
                  className="block border border-rule bg-paper p-4 hover:border-ink"
                >
                  <span className="text-[13px] text-ink-60">{t('accounts.year')}</span>
                  <span className="mt-2 block font-serif text-card text-ink tabular-nums">{y}</span>
                </a>
              </li>
            ))}
          </ul>
        </SectionBody>
      </Section>

      <Section id="tillatelse" tone="paper">
        <SectionBody>
          <SectionHeading>{t('permit.heading')}</SectionHeading>
          <p className="mt-6 max-w-prose text-body text-ink">{t('permit.body')}</p>
          <Link
            href="#permit-pdf"
            className="mt-6 inline-flex min-h-11 items-center text-body font-semibold text-ink underline underline-offset-4"
          >
            {t('permit.cta')}
          </Link>
        </SectionBody>
      </Section>

      <Section id="organisasjon" tone="paper-2">
        <SectionBody>
          <SectionHeading>{t('org.heading')}</SectionHeading>
          <p className="mt-6 max-w-prose text-body text-ink">
            {t('org.body', { orgNr: CAMPAIGN.orgNr, founded: CAMPAIGN.foundedYear })}
          </p>
        </SectionBody>
      </Section>
    </main>
  );
}
