import { TimedCta } from '@/components/timed-cta';
import { SERVICES_POPUP_FILM } from '@/lib/media';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Accent } from '@/components/accent';
import { PageHeading } from '@/components/page-heading';
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
  // Fetched here now that the header is inline. ServicesHero used to pull
  // these two namespaces itself.
  const t = await getTranslations({ locale, namespace: 'servicesIndex' });
  const tp = await getTranslations({ locale, namespace: 'servicePages' });

  return (
    <main>
      {/* No photograph here any more (client, 2026-09-16: "Fjerne bildet
         øverst på hovedsiden"). The band's words are kept exactly — same
         kicker pair, same title, same lede — so the index still reads as the
         parent of the service pages under it; only the picture is gone.
         components/services-hero.tsx is left unused rather than deleted. */}
      {/* servicesIndex.allHeading — "Alt vi gjør, samlet." — four words
         against the eight of servicePages.pages.services.title (client,
         2026-09-16: "use shorter heading ... main goal is to see services").
         The long one ran to three lines and pushed the cards below the
         fold.

         It is the same string the grid used to print under its own eyebrow
         before that duplicate heading came off, so nothing new was written
         and nothing was lost — the line simply moved up to be the page's
         title instead of a section label inside it. */}
      <PageHeading
        kicker={tp('pages.services.eyebrow')}
        kickerNote={t('eyebrow')}
        title={t.rich('allHeading', {
          em: (chunks) => <Accent surface="paper">{chunks}</Accent>,
        })}
        lede={tp('pages.services.lede')}
      />
      {/* Every service as grouped boxes (client 2026-08-30: the register of
         rows read as clutter). The two "how to start" cards went with it —
         the visit block below already says where to come and how to write. */}

      {/* A grid, not the alternating bands (client, 2026-09-13: "too much to
         scroll"). Teaching moved to its own page the same day, so this is the
         ten on his Tjenester list rather than all thirteen. */}
      {/* header={false}: the grid used to print "Alle tjenester / Alt vi
         gjør, samlet" of its own, which under the page's own title made two
         headings stacked on one screen (client, 2026-09-16: "just one heading
         of services"). The page title is the one that stays — it is the h1,
         it is the better line, and it is the only one /undervisning could
         use, since the grid's pair is services copy. */}
      <ServiceGrid
        header={false}
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
    
      {/* Client, Bildeplassering (2026-09-19): a video pop-up on this page.
         
         The film is the customisation people notice; the QUOTES are the one
         that matters. `cta.services` carries hadith chosen for this page — mutual mercy, kindness, relieving hardship
         — rather than the prayer popup's charity narrations, which is why it
         is a namespace of its own and not a reuse of cta.prayer.
         
         Every narration is cited to Bukhari/Muslim by number. NOTHING here is
         paraphrased into scripture: if a citation cannot be verified it does
         not go on a mosque's website. Worth an imam's eye before launch.
         
         Delayed longer than the prayer popup's 6s. Someone checking a prayer
         time has finished in seconds; someone reading about a service or a
         course is still reading at six. */}
      <TimedCta
        ns="cta.services"
        storageKey="rabita:cta:services:v1"
        delayMs={11000}
        amountNok={20}
        showVideoInAsk
        video={SERVICES_POPUP_FILM}
      />
    </main>
  );
}
