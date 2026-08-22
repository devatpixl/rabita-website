import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { Section, SectionBody, SectionHeading } from '@/components/primitives';
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
          {/* Rows on a phone, four columns from md. Two columns of 163px put
             "school (largest of its kind)" under a single digit and broke it
             across four lines. Same register treatment the mosque project
             figures use. */}
          <ul className="divide-y divide-rule border-y border-rule md:grid md:grid-cols-4 md:gap-8 md:divide-y-0 md:border-0">
            {([
              [`${CAMPAIGN.pupils}`, t('stats.pupils')],
              [`${CAMPAIGN.teachers}`, t('stats.teachers')],
              ['1', t('stats.school')],
              ['Ukentlig', t('stats.classes')],
            ] as const).map(([value, label]) => (
              <li
                key={label}
                className="flex items-baseline justify-between gap-6 py-3.5 md:block md:py-0"
              >
                <span className="font-serif text-[2rem] leading-none tabular-nums text-ink md:text-display">
                  {value}
                </span>
                <span className="text-end text-[13px] text-ink-60 md:mt-2 md:block md:text-start">
                  {label}
                </span>
              </li>
            ))}
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
