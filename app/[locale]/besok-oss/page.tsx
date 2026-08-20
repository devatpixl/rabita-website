import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { Section, SectionBody, SectionHeading } from '@/components/primitives';
import { VisitClose, VisitHero } from '@/components/visit-page';
import { RequestForm } from '@/components/request-form';

export default async function VisitPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'visitPage' });
  const tv = await getTranslations({ locale, namespace: 'visitPages' });

  return (
    <main>
      <VisitHero
        crumb={tv('crumb')}
        eyebrow={tv('pages.visit.eyebrow')}
        title={tv('pages.visit.title')}
        lede={tv('pages.visit.lede')}
        image="/photos/visit-entrance.webp"
        alt={tv('pages.visit.caption')}
        facts={tv.raw('pages.visit.facts') as { term: string; detail: string }[]}
      />
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
              <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-3xl bg-paper-2">
                <Image
                  src="/photos/visit-foyer.webp"
                  alt={tv('pages.visit.caption')}
                  fill
                  loading="eager"
                  sizes="(min-width: 768px) 38vw, 90vw"
                  className="object-cover"
                  style={{ filter: 'saturate(0.72) contrast(1.12) brightness(0.9)' }}
                />
              </div>
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
      <VisitClose
        heading={tv('pages.visit.closeHeading')}
        body={tv('pages.visit.closeBody')}
        image="/photos/visit-foyer.webp"
        alt={tv('pages.visit.caption')}
        primary={{ label: tv('pages.visit.closePrimary'), href: `/${locale}/kontakt` }}
        secondary={{ label: tv('pages.visit.closeSecondary'), href: `/${locale}/arrangementer` }}
      />
    </main>
  );
}
