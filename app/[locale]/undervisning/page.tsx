import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageBand } from '@/components/page-band';
import { ServiceGrid } from '@/components/service-grid';
import { ServicePicker } from '@/components/service-picker';
import { SectionBody } from '@/components/primitives';
import { SERVICE_PAGES } from '@/lib/services';

// Teaching, back as a page of its own (client, 2026-09-13: "Del opp i to
// sider"). It was retired on 2026-09-10 at his own instruction — see the
// redirect this commit removes from next.config.ts — so this is a reversal,
// and the 308 has to go or the route never renders.
//
// The band's words are RECOVERED, not rewritten: they are the old teaching
// page's own eyebrow, title and lede, lifted out of 4d85ab4^ in all three
// locales, Arabic included. Nothing here is invented.
//
// Three of the six entries on his Undervisning list have no service yet —
// "Kurs i islam", "Kurs for konvertitter", and the "Kurs i arabisk" half of
// 'koran'. They are absent rather than stubbed. See SERVICE_PAGES.
export default async function UndervisningIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'undervisningPage' });

  return (
    <main>
      <PageBand
        kicker={t('eyebrow')}
        title={t('title')}
        lede={t('lede')}
        image="/photos/learning-class.webp"
        objectClass="object-center"
        layout="over"
        mark="elevation"
        sizes="(min-width: 1152px) 1104px, calc(100vw - 3rem)"
      />

      {/* The rullegardin, above the bands it jumps into. */}
      <SectionBody className="pt-10 md:pt-14">
        <ServicePicker items={SERVICE_PAGES.undervisning} />
      </SectionBody>

      <ServiceGrid items={SERVICE_PAGES.undervisning} locale={locale} header={false} />
    </main>
  );
}
