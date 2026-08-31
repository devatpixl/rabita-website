import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
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

      {/* The "Coming in person" band (ServiceVisit) was removed on 2026-08-31:
         it repeated verbatim on this page, the services index and all eleven
         subject pages, so the address stopped registering as information and
         started reading as furniture. It survives on /besok-oss, which is the
         page that exists to answer it. The component is left in
         components/service-page.tsx, unused, so it can go back with one line. */}
    </main>
  );
}
