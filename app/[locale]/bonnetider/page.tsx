import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PRAYER_TIMES_TODAY } from '@/lib/campaign';
import { Section, SectionBody } from '@/components/primitives';
import {
  ServiceCards,
  ServiceHero,
  ServiceVisit,
} from '@/components/service-page';

// §6. Full week + Friday. Times come from PRAYER_TIMES_TODAY for now — real
// weekly feed is a §13.4 blocker; layout is ready when data lands.
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
type DayKey = (typeof DAYS)[number];

export default async function BonnetiderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'bonnetiderPage' });
  const tp = await getTranslations({ locale, namespace: 'servicePages' });

  const PRAYERS = [
    { label: 'Fajr', time: PRAYER_TIMES_TODAY.fajr },
    { label: t('sunrise'), time: PRAYER_TIMES_TODAY.sunrise },
    { label: 'Dhuhr', time: PRAYER_TIMES_TODAY.dhuhr },
    { label: 'Asr', time: PRAYER_TIMES_TODAY.asr },
    { label: 'Maghrib', time: PRAYER_TIMES_TODAY.maghrib },
    { label: 'Isha', time: PRAYER_TIMES_TODAY.isha },
  ];

  return (
    <main>
      <ServiceHero
        crumb={tp('crumb')}
        eyebrow={tp('pages.times.eyebrow')}
        title={tp('pages.times.title')}
        lede={tp('pages.times.lede')}
        note={tp('pages.times.note')}
        image="/photos/svc-prayer.webp"
        alt={tp('pages.times.eyebrow')}
      />
      <Section tone="paper">
        <SectionBody>
          {/* Seven columns do not fit a phone, so the table is desktop only
             and small screens get the same week as one card per day. */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-body">
              <thead>
                <tr className="text-[13px] text-ink-60">
                  <th className="border-b border-rule py-3 text-start">{t('day')}</th>
                  <th className="border-b border-rule py-3 text-end tabular-nums">Fajr</th>
                  <th className="border-b border-rule py-3 text-end tabular-nums">{t('sunrise')}</th>
                  <th className="border-b border-rule py-3 text-end tabular-nums">Dhuhr</th>
                  <th className="border-b border-rule py-3 text-end tabular-nums">Asr</th>
                  <th className="border-b border-rule py-3 text-end tabular-nums">Maghrib</th>
                  <th className="border-b border-rule py-3 text-end tabular-nums">Isha</th>
                </tr>
              </thead>
              <tbody>
                {DAYS.map((d) => {
                  const isFri = d === 'fri';
                  return (
                    <tr key={d} className={isFri ? 'bg-paper-2' : ''}>
                      <td className="border-b border-rule py-3 font-semibold text-ink">
                        {t(`days.${d}` as `days.${DayKey}`)}
                        {isFri && (
                          <span className="ms-3 text-[13px] text-ink-60">
                            {t('jumua')} {PRAYER_TIMES_TODAY.jumua}
                          </span>
                        )}
                      </td>
                      <td className="border-b border-rule py-3 text-end tabular-nums text-ink-60">{PRAYER_TIMES_TODAY.fajr}</td>
                      <td className="border-b border-rule py-3 text-end tabular-nums text-ink-60">{PRAYER_TIMES_TODAY.sunrise}</td>
                      <td className="border-b border-rule py-3 text-end tabular-nums text-ink-60">{PRAYER_TIMES_TODAY.dhuhr}</td>
                      <td className="border-b border-rule py-3 text-end tabular-nums text-ink-60">{PRAYER_TIMES_TODAY.asr}</td>
                      <td className="border-b border-rule py-3 text-end tabular-nums text-ink-60">{PRAYER_TIMES_TODAY.maghrib}</td>
                      <td className="border-b border-rule py-3 text-end tabular-nums text-ink-60">{PRAYER_TIMES_TODAY.isha}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="md:hidden">
            {DAYS.map((d) => {
              const isFri = d === 'fri';
              return (
                <li
                  key={d}
                  className={`border-b border-rule py-4 ${isFri ? 'bg-paper-2' : ''}`}
                >
                  <p className="flex flex-wrap items-baseline gap-x-3 font-semibold text-ink">
                    {t(`days.${d}` as `days.${DayKey}`)}
                    {isFri && (
                      <span className="font-normal text-[13px] text-ink-60">
                        {t('jumua')} {PRAYER_TIMES_TODAY.jumua}
                      </span>
                    )}
                  </p>
                  <dl className="mt-3 grid grid-cols-3 gap-x-4 gap-y-3">
                    {PRAYERS.map((row) => (
                      <div key={row.label}>
                        <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-60">
                          {row.label}
                        </dt>
                        <dd className="mt-1 tabular-nums text-ink">{row.time}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              );
            })}
          </ul>

          <p className="mt-6 text-[13px] text-ink-60">{t('note')}</p>
        </SectionBody>
      </Section>
      <ServiceCards
        eyebrow={tp('pages.times.cardEyebrow')}
        heading={tp('pages.times.cardHeading')}
        cards={[
          { ...(tp.raw('pages.times.cards') as { title: string; body: string }[])[0], image: '/photos/svc-friday.webp' },
          { ...(tp.raw('pages.times.cards') as { title: string; body: string }[])[1], image: '/photos/svc-wudu.webp' },
        ]}
      />
      <ServiceVisit
        heading={tp('visit.heading')}
        body={tp('visit.body')}
        address="Calmeyers gate 8"
        postal="0183 Oslo"
        hours={tp('visit.hours')}
        primary={{ label: tp('visit.primary'), href: `/${locale}/besok-oss` }}
        secondary={{ label: tp('visit.secondary'), href: `/${locale}/kontakt` }}
      />
    </main>
  );
}
