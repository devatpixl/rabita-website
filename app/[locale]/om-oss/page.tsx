import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { Section, SectionBody } from '@/components/primitives';
import { StoryColophon, StoryHero, StoryPlate } from '@/components/story-page';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'aboutPage' });
  const ts = await getTranslations({ locale, namespace: 'storyPages' });

  return (
    <main>
      <StoryHero
        crumb={ts('crumb')}
        index={ts('pages.about.index')}
        eyebrow={ts('pages.about.eyebrow')}
        title={ts('pages.about.title')}
        lede={ts('pages.about.lede')}
      />
      <StoryPlate image="/photos/story-facade-night.webp" caption={ts('pages.about.caption')} />

      <Section tone="paper">
        <SectionBody>
          {/* Prose first, then the figures as a band beneath it.
             They used to sit in a col-span-4 rail beside the text, set in
             text-display. Two problems: "10 000" and "4 344" all but filled a
             360px column at that size, and six stacked entries ran ~930px
             against ~260px of prose — some 670px of nothing beside them.
             Across the full width in three columns they fit comfortably, read
             as key figures rather than as a list, and the section stops
             having a hole in it. */}
          <div className="max-w-prose space-y-6 text-body text-ink">
            <p>{t('history.p1')}</p>
            <p>{t('history.p2')}</p>
            <p>{t('history.p3', { year: 2009 })}</p>
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-x-8 sm:grid-cols-3 md:mt-20 md:gap-x-12">
            {/* Key figures as confirmed in Årsrapport 2025, in the order the
               client listed them (2026-08-30). */}
            {([
              [String(CAMPAIGN.foundedYear), t('facts.founded')],
              [CAMPAIGN.members.toLocaleString('nb-NO'), t('facts.members')],
              [`${CAMPAIGN.volunteers}`, t('facts.volunteers')],
              [`${CAMPAIGN.pupils}+`, t('facts.pupils')],
              [`${CAMPAIGN.nationalities}+`, t('facts.nationalities')],
              [CAMPAIGN.visitorsPerWeek.toLocaleString('nb-NO'), t('facts.visits')],
            ] as const).map(([value, label]) => (
              <div key={label} className="border-t border-rule pb-8 pt-5 md:pb-10 md:pt-6">
                <dd className="font-serif text-[clamp(1.9rem,3.2vw,2.75rem)] leading-none tabular-nums text-ink">
                  {value}
                </dd>
                <dt className="mt-3 font-mono text-[0.6875rem] uppercase leading-snug tracking-[0.16em] text-ink-60">
                  {label}
                </dt>
              </div>
            ))}
          </dl>
        </SectionBody>
      </Section>

      {/* The board and Documents sections were removed on 2026-08-31
         (client). Both were placeholders in practice: the board listed six
         roles with no names, and Documents listed three files that do not
         exist yet with no links behind them. Their strings are still in
         messages/*.json under about.board and about.legal, so either can be
         restored once there are real names and real files. */}

      <StoryColophon
        heading={ts('colophon.heading')}
        body={ts('colophon.body')}
        hours={ts('colophon.hours')}
        labels={ts.raw('colophon.labels') as {
          founded: string;
          orgNr: string;
          members: string;
          address: string;
          hours: string;
          bank: string;
        }}
      />
    </main>
  );
}
