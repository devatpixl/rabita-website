import Image from 'next/image';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { PrayerToday } from './prayer-today';
import { Eyebrow, Section, SectionBody, SectionHeading } from './primitives';

// §4.08. Full week, Friday time, opening hours, address, booking form for
// school and university groups. Kept as a summary on the homepage; the full
// booking form lives at /besok-oss.
export async function PrayerVisit() {
  const t = await getTranslations('prayerVisit');
  const locale = await getLocale();

  return (
    <Section id="bonn-og-besok" tone="paper-2">
      <SectionBody>
        <div className="mb-10 max-w-3xl">
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <SectionHeading className="mt-3">{t('heading')}</SectionHeading>
        </div>

        <div className="grid gap-10 md:grid-cols-12">
          <div id="bonnetider" className="md:col-span-5">
            <h3 className="mb-4 font-serif text-card text-ink">{t('todayHeading')}</h3>
            <PrayerToday />
            <Link
              href={`/${locale}/bonnetider`}
              className="mt-4 inline-flex min-h-11 items-center text-body font-semibold text-ink underline underline-offset-4 hover:decoration-2"
            >
              {t('fullWeek')}
            </Link>
          </div>

          <div className="md:col-span-7">
            {/* Full-bleed photo above the visit copy — Rabita volunteers
               praying together in a Grønland underpass. The photograph
               that argues for the campaign more than any statistic. */}
            <div className="relative w-full aspect-[16/9] overflow-hidden bg-paper-2 mb-6">
              <Image
                src="/photos/prayer-underpass.webp"
                alt="Rabita volunteers praying together in the Grønland underpass"
                fill
                sizes="(min-width: 768px) 55vw, 90vw"
                className="object-cover editorial-photo"
              />
            </div>
            <h3 className="mb-4 font-serif text-card text-ink">{t('visitHeading')}</h3>
            <p className="mb-4 text-body text-ink">{CAMPAIGN.address}</p>
            <p className="mb-6 text-body text-ink-60">{CAMPAIGN.openingHours}</p>
            <p className="mb-6 text-body text-ink">{t('groupsBody')}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${locale}/besok-oss`}
                className="min-h-11 rounded-btn bg-gold-deep px-4 py-2 text-[15px] font-semibold text-paper hover:bg-ink transition-colors"
              >
                {t('bookGroup')}
              </Link>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(CAMPAIGN.address)}`}
                target="_blank"
                rel="noreferrer"
                className="min-h-11 rounded-btn border border-ink px-4 py-2 text-body font-semibold text-ink hover:bg-ink hover:text-paper transition-colors"
              >
                {t('directions')}
              </a>
            </div>
          </div>
        </div>
      </SectionBody>
    </Section>
  );
}
