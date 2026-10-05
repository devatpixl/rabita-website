import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { cairo, fraunces, inter, jetbrainsMono, notoSansArabic } from '../fonts';
import { ConsentBanner } from '@/components/consent-banner';
import { ContactFab } from '@/components/contact-fab';
import { Footer } from '@/components/footer';
import { NewsletterBand } from '@/components/newsletter-band';
import { FindUsGoogle } from '@/components/find-us-google';
import { GivingSheet } from '@/components/giving-sheet';
import { NavBar } from '@/components/nav-bar';
import { PrayerDataProvider } from '@/components/prayer-data-provider';
import { PrayerPanelProvider } from '@/components/prayer-panel-provider';
import { RsvpSheet } from '@/components/rsvp-sheet';
import { UtilityStrip } from '@/components/utility-strip';
import { routing, type AppLocale } from '@/i18n/routing';
import { getPrayerData } from '@/lib/irn';

// Prayer times come from IRN (lib/irn.ts). Regenerate the shell every six
// hours so a new month, a changed jama'ah time or a jumu'ah slot lands
// without a deploy.
// Must be a literal — Next cannot evaluate an import here. Keep in step
// with IRN_REVALIDATE_SECONDS in lib/irn.ts (6 h).
export const revalidate = 21600;

function isSupported(x: string): x is AppLocale {
  return (routing.locales as readonly string[]).includes(x);
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('siteTitle'),
    description: t('siteDescription'),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isSupported(locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const prayer = await getPrayerData();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${fraunces.variable} ${inter.variable} ${cairo.variable} ${notoSansArabic.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-paper text-ink antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <PrayerDataProvider data={prayer}>
          <PrayerPanelProvider>
            <UtilityStrip />
            <NavBar />
          </PrayerPanelProvider>
          <div id="main" className="pb-16 md:pb-0">{children}</div>
          {/* The newsletter band, on every page, as the top of the footer
             (user, 2026-09-28: "add send newsletter in the footer like in
             aktuelt page, so attach that to top of footer everywhere"). It
             was /aktuelt's own section until then; that page no longer
             renders it itself, or it would appear twice. Dusk on dusk, so
             band and footer read as one block. */}
          <NewsletterBand />
          {/* The footer map is rendered HERE, on the server, and passed in.
             Footer is 'use client' and FindUsGoogle is an async server
             component, so the footer cannot import it — see the note beside
             the slot in footer.tsx. */}
          <Footer
            map={
              <FindUsGoogle
                locale={locale}
                variant="map"
                /* Sørligata, NOT Calmeyers gate. The client's written
                   instruction (Tekst (endelig) Sept 2026, quoted in full on
                   the `place` prop in find-us-google.tsx) is that the footer
                   map shows where the congregation IS — "Dette gjelder
                   footeren på ALLE sider" — while the Moskeprosjektet and
                   Leiligheter maps keep showing what is being BUILT.

                   This said "project" from 2026-09-28, when the footer moved
                   from the place embed to the landmark map, until 2026-10-06.
                   The prop existed and carried the instruction; only the call
                   site was wrong, so the footer printed "Sørligata 8a" over a
                   map centred on the building site 900 m away. He raised it a
                   second time on 2026-10-05 ("vi er ikke på denne adressen
                   nå"). Changing this back without him asking would break the
                   September instruction again. */
                place="visit"
                className="mx-auto max-w-[36rem] xl:max-w-none"
              />
            }
          />
          <GivingSheet />
          <RsvpSheet />
          <ConsentBanner />
          <ContactFab />
          </PrayerDataProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
