import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PRAYER_TIMES_TODAY } from '@/lib/campaign';
import { PageHeader } from '@/components/page-header';
import { Section, SectionBody } from '@/components/primitives';

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

  return (
    <main>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} lede={t('lede')} />
      <Section tone="paper">
        <SectionBody>
          <div className="overflow-x-auto">
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
          <p className="mt-6 text-[13px] text-ink-60">{t('note')}</p>
        </SectionBody>
      </Section>
    </main>
  );
}
