import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { ServiceVisit } from '@/components/service-page';
import { ServicesHero } from '@/components/services-hero';
import { ServiceIndex } from '@/components/service-index';

export default async function ServicesIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tp = await getTranslations({ locale, namespace: 'servicePages' });
  const l = await getLocale();

  return (
    <main>
      {/* Full-bleed picture with the words in front (client, 2026-08-31).
         The split ServiceHero still runs every /tjenester/[subject] page. */}
      <ServicesHero />
      {/* Every service as grouped boxes (client 2026-08-30: the register of
         rows read as clutter). The two "how to start" cards went with it —
         the visit block below already says where to come and how to write. */}
      <ServiceIndex />

      <ServiceVisit
        heading={tp('visit.heading')}
        body={tp('visit.body')}
        address="Calmeyers gate 8"
        postal="0183 Oslo"
        hours={tp('visit.hours')}
        primary={{ label: tp('visit.primary'), href: `/${l}/besok-oss` }}
        secondary={{ label: tp('visit.secondary'), href: `/${l}/kontakt` }}
      />
    </main>
  );
}
