import Image from 'next/image';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { CAMPAIGN, PRAYER_TIMES_TODAY } from '@/lib/campaign';
import { PrayerHairline } from './prayer-hairline';
import { Eyebrow, Section, SectionBody, SectionHeading } from './primitives';

// §4.08. Full week, Friday time, opening hours, address, booking form for
// school and university groups. Kept as a summary on the homepage; the full
// booking form lives at /besok-oss.
export async function PrayerVisit() {
  const t = await getTranslations('prayerVisit');
  const locale = await getLocale();

  const times: { key: string; name: string; time: string }[] = [
    { key: 'fajr', name: t('names.fajr'), time: PRAYER_TIMES_TODAY.fajr },
    { key: 'sunrise', name: t('names.sunrise'), time: PRAYER_TIMES_TODAY.sunrise },
    { key: 'dhuhr', name: t('names.dhuhr'), time: PRAYER_TIMES_TODAY.dhuhr },
    { key: 'asr', name: t('names.asr'), time: PRAYER_TIMES_TODAY.asr },
    { key: 'maghrib', name: t('names.maghrib'), time: PRAYER_TIMES_TODAY.maghrib },
    { key: 'isha', name: t('names.isha'), time: PRAYER_TIMES_TODAY.isha },
  ];

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
            <PrayerHairline />
            <ul className="divide-y divide-rule border-y border-rule">
              {times.map(({ key, name, time }) => (
                <li
                  key={key}
                  data-prayer={key}
                  className="flex items-baseline justify-between py-3 text-body tabular-nums"
                >
                  <span className="text-ink">{name}</span>
                  <span className="text-ink-60">{time}</span>
                </li>
              ))}
              <li id="fredagsbonn" className="flex items-baseline justify-between py-3 text-body tabular-nums bg-paper">
                <span className="text-ink font-semibold">{t('names.jumua')}</span>
                <span className="text-ink font-semibold">{PRAYER_TIMES_TODAY.jumua}</span>
              </li>
            </ul>
            <Link
              href={`/${locale}/bonnetider`}
              className="mt-4 inline-block text-body font-semibold text-ink underline underline-offset-4 hover:decoration-2"
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
