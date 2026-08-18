import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { PageHeader } from '@/components/page-header';
import { Section, SectionBody, SectionHeading } from '@/components/primitives';
import { RequestForm } from '@/components/request-form';

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'contactPage' });

  return (
    <main>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} lede={t('lede')} />
      <Section tone="paper">
        <SectionBody>
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5 space-y-4">
              <SectionHeading>{t('directHeading')}</SectionHeading>
              <address className="not-italic text-body text-ink">
                <p>Rabita</p>
                <p>{CAMPAIGN.address}</p>
                <p className="text-ink-60">{CAMPAIGN.postalCity}</p>
                <p className="mt-3">
                  <a href={`tel:${CAMPAIGN.contactPhone.replace(/\s/g, '')}`} className="inline-flex min-h-11 items-center hover:underline">
                    {CAMPAIGN.contactPhone}
                  </a>
                </p>
                <p>
                  <a href={`mailto:${CAMPAIGN.contactEmail}`} className="inline-flex min-h-11 items-center hover:underline">
                    {CAMPAIGN.contactEmail}
                  </a>
                </p>
              </address>
              <p className="text-body text-ink-60">{t('note')}</p>
            </div>
            <div className="md:col-span-7">
              <SectionHeading>{t('formHeading')}</SectionHeading>
              <div className="mt-6">
                <RequestForm subject="contact" />
              </div>
            </div>
          </div>
        </SectionBody>
      </Section>
    </main>
  );
}
