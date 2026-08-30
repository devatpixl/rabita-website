import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { ServiceHero, ServiceVisit } from '@/components/service-page';
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
      <ServiceHero
        crumb={tp('crumb')}
        eyebrow={tp('pages.services.eyebrow')}
        title={tp('pages.services.title')}
        lede={tp('pages.services.lede')}
        note={tp('pages.services.note')}
        image="/photos/svc-services.webp"
        alt={tp('pages.services.eyebrow')}
      />
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
