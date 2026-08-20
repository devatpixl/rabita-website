import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import {
  ServiceCards,
  ServiceHero,
  ServiceRegister,
  ServiceVisit,
} from '@/components/service-page';

// The five subjects each keep their own page and request form, named in the words a member would type.
const SUBJECTS = ['nikah', 'janaza', 'shahada', 'counselling', 'hajj-umrah'] as const;

export default async function ServicesIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'servicesIndex' });
  const tp = await getTranslations({ locale, namespace: 'servicePages' });
  const l = await getLocale();

  const rows = SUBJECTS.map((s) => ({
    term: t(`items.${s}.title`),
    detail: t(`items.${s}.body`),
    href: `/${l}/tjenester/${s}`,
  }));

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
      <ServiceRegister
        eyebrow={tp('pages.services.regEyebrow')}
        heading={tp('pages.services.regHeading')}
        rows={rows}
      />
      <ServiceCards
        eyebrow={tp('pages.services.cardEyebrow')}
        heading={tp('pages.services.cardHeading')}
        cards={[
          { ...(tp.raw('pages.services.cards') as { title: string; body: string }[])[0], image: '/photos/svc-gathering.webp' },
          { ...(tp.raw('pages.services.cards') as { title: string; body: string }[])[1], image: '/photos/svc-counsel.webp' },
        ]}
      />
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
