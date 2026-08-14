import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { PageHeader } from '@/components/page-header';
import { Section, SectionBody, SectionHeading } from '@/components/primitives';
import { RequestForm } from '@/components/request-form';

export default async function VisitPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'visitPage' });

  return (
    <main>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} lede={t('lede')} />
      <Section tone="paper">
        <SectionBody>
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5 space-y-4">
              <SectionHeading>{t('addressHeading')}</SectionHeading>
              <address className="not-italic text-body text-ink">
                <p>Rabita</p>
                <p>{CAMPAIGN.address}</p>
                <p className="text-ink-60">{CAMPAIGN.postalCity}</p>
              </address>
              <p className="text-body text-ink-60">{CAMPAIGN.openingHours}</p>
              <p className="text-body text-ink">{t('groups')}</p>
            </div>
            <div className="md:col-span-7">
              <SectionHeading>{t('formHeading')}</SectionHeading>
              <div className="mt-6">
                <RequestForm subject="visit" />
              </div>
            </div>
          </div>
        </SectionBody>
      </Section>
    </main>
  );
}
