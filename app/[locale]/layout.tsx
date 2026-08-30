import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { cairo, fraunces, inter, jetbrainsMono, notoSansArabic } from '../fonts';
import { ConsentBanner } from '@/components/consent-banner';
import { Footer } from '@/components/footer';
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
          <Footer />
          <GivingSheet />
          <RsvpSheet />
          <ConsentBanner />
          </PrayerDataProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
