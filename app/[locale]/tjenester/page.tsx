import { setRequestLocale } from 'next-intl/server';
import { ServicesHero } from '@/components/services-hero';
import { ServiceGrid } from '@/components/service-grid';
import { ServicePicker } from '@/components/service-picker';
import { SERVICE_PAGES } from '@/lib/services';

export default async function ServicesIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      {/* The tallest band on the site (client, 2026-09-05), so the index
         belongs to the same family as the eleven services under it while
         still outranking them. Replaces the full-bleed hero of 2026-08-31. */}
      <ServicesHero />
      {/* Every service as grouped boxes (client 2026-08-30: the register of
         rows read as clutter). The two "how to start" cards went with it —
         the visit block below already says where to come and how to write. */}

      {/* A grid, not the alternating bands (client, 2026-09-13: "too much to
         scroll"). Teaching moved to its own page the same day, so this is the
         ten on his Tjenester list rather than all thirteen. */}
      <ServiceGrid
        items={SERVICE_PAGES.tjenester}
        locale={locale}
        picker={<ServicePicker items={SERVICE_PAGES.tjenester} />}
      />

      {/* The "Coming in person" band (ServiceVisit) was removed on 2026-08-31:
         it repeated verbatim on this page, the services index and all eleven
         subject pages, so the address stopped registering as information and
         started reading as furniture. It survives on /besok-oss, which is the
         page that exists to answer it. The component is left in
         components/service-page.tsx, unused, so it can go back with one line. */}
    </main>
  );
}
