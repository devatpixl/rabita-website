import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { PageHeader } from '@/components/page-header';
import { Section, SectionBody, SectionHeading, Stat } from '@/components/primitives';

export default async function EducationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'educationPage' });

  return (
    <main>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} lede={t('lede')} />
      <Section tone="paper">
        <SectionBody>
          <ul className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <li><Stat value={`${CAMPAIGN.pupils}`} label={t('stats.pupils')} /></li>
            <li><Stat value={`${CAMPAIGN.teachers}`} label={t('stats.teachers')} /></li>
            <li><Stat value="1" label={t('stats.school')} /></li>
            <li><Stat value="Ukentlig" label={t('stats.classes')} /></li>
          </ul>
        </SectionBody>
      </Section>

      <Section tone="paper-2">
        <SectionBody>
          <SectionHeading>{t('programs.heading')}</SectionHeading>
          <ul className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {(['arabic', 'quran', 'youth', 'calligraphy'] as const).map((k) => (
              <li key={k} className="border-t border-rule pt-6">
                <h3 className="mb-2 font-serif text-card text-ink">{t(`programs.items.${k}.title`)}</h3>
                <p className="text-body text-ink-60">{t(`programs.items.${k}.body`)}</p>
              </li>
            ))}
          </ul>
        </SectionBody>
      </Section>
    </main>
  );
}
