import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { Section, SectionBody, SectionHeading } from '@/components/primitives';
import { StoryColophon, StoryHero, StoryPlate } from '@/components/story-page';
import { RequestForm } from '@/components/request-form';

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'contactPage' });
  const ts = await getTranslations({ locale, namespace: 'storyPages' });

  return (
    <main>
      <StoryHero
        crumb={ts('crumb')}
        index={ts('pages.contact.index')}
        eyebrow={ts('pages.contact.eyebrow')}
        title={ts('pages.contact.title')}
        lede={ts('pages.contact.lede')}
      />
      <StoryPlate image="/photos/story-cafe.webp" caption={ts('pages.contact.caption')} />
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
