import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { Section, SectionBody, SectionHeading, Stat } from '@/components/primitives';
import { LearnClose, LearnHero } from '@/components/learn-page';

export default async function EducationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'educationPage' });
  const tl = await getTranslations({ locale, namespace: 'learnPages' });

  return (
    <main>
      <LearnHero
        crumb={tl('crumb')}
        eyebrow={tl('pages.teaching.eyebrow')}
        title={tl('pages.teaching.title')}
        lede={tl('pages.teaching.lede')}
        image="/photos/learn-school.webp"
        caption={tl('pages.teaching.caption')}
      />
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
      <LearnClose
        heading={tl('close.heading')}
        body={tl('close.body')}
        image="/photos/learn-classroom.webp"
        alt={tl('pages.teaching.eyebrow')}
        items={tl.raw('close.items') as { term: string; detail: string }[]}
        cta={{ label: tl('close.cta'), href: `/${locale}/kontakt` }}
      />
    </main>
  );
}
