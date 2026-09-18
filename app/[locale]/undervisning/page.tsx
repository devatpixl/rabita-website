import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Accent } from '@/components/accent';
import { PageHeading } from '@/components/page-heading';
import { ServiceGrid } from '@/components/service-grid';
import { ServicePicker } from '@/components/service-picker';
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
// All of the client's Undervisning entries now exist as services. The list
// shows five of them: "Kurs for konvertitter" was removed on 2026-09-16 at his
// instruction, and is hidden rather than deleted — /tjenester/kurs-konvertitter
// still renders, and restoring it is one key in SERVICE_PAGES.undervisning.
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
      {/* No photograph here any more (client, 2026-09-16, Undervisning list:
         "Fjerne bildet øverst på hovedsiden"). Same words as the band it
         replaces — they were recovered from the old teaching page in all
         three locales and are not being rewritten a second time. */}
      {/* titleShort, not title (client, 2026-09-16). The full line —
         "Arabisk, Koran og en skoleuke som passer rundt den norske." — is
         good copy and stays in the message files, but at display size it ran
         to three lines and the five cards it introduces started below the
         fold. titleShort is "Alt vi underviser.", cut to mirror
         servicesIndex.allHeading on /tjenester so the two index pages open
         the same way. The lede underneath still carries the detail. */}
      <PageHeading kicker={t('eyebrow')} title={t.rich('titleShort', { em: (c) => <Accent surface="paper">{c}</Accent> })} lede={t('lede')} />


      {/* No featured row any more, as of 2026-09-17.
         
         It was featured={2} — Rabita skole and Koranskolen across the top at
         half the page each, the other three beneath at a third (client,
         2026-09-16). That arrangement only works at FIVE items: the grid is
         six columns, a featured card spans three and the rest span two, so
         2 + 3 fills two rows flush.
         
         Kalligrafi og geometri arrived on 2026-09-17 at the client's own
         request and made it six, which lays out as 2 + 3 + 1 — a single
         third-width card hanging alone on the left of a third row. Six equal
         cards are three-and-three, flush, and that is the lesser loss.
         
         If a seventh and eighth course are ever added, featured={2} becomes
         correct again (2 + 3 + 3) and this should go back. */}
      <ServiceGrid
        items={SERVICE_PAGES.undervisning}
        locale={locale}
        header={false}
        picker={<ServicePicker items={SERVICE_PAGES.undervisning} />}
      />
    </main>
  );
}
