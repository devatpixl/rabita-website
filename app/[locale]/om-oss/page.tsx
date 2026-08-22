import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { Section, SectionBody, SectionHeading, Stat } from '@/components/primitives';
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
          <div className="grid gap-10 md:grid-cols-12">
            {/* A ruled register, not three numbers 12px apart. Each entry is
               divided off, which gives the column structure and gives the
               numerals the room they need. */}
            <dl className="md:col-span-4">
              {([
                [String(CAMPAIGN.foundedYear), t('facts.founded')],
                [CAMPAIGN.members.toLocaleString('nb-NO'), t('facts.members')],
                [`${CAMPAIGN.nationalities}+`, t('facts.nationalities')],
              ] as const).map(([value, label]) => (
                <div key={label} className="border-t border-rule py-5 first:pt-0 last:border-b last:border-rule">
                  <Stat value={value} label={label} />
                </div>
              ))}
            </dl>
            <div className="md:col-span-8 space-y-6 max-w-prose text-body text-ink">
              <p>{t('history.p1')}</p>
              <p>{t('history.p2')}</p>
              <p>{t('history.p3', { year: 2009 })}</p>
            </div>
          </div>
        </SectionBody>
      </Section>

      <Section tone="paper-2">
        <SectionBody>
          <SectionHeading>{t('board.heading')}</SectionHeading>
          <p className="mt-6 max-w-prose text-body text-ink">{t('board.body')}</p>
          {/* Each role used to render the name as "TBD" — six placeholders
             in a row, which reads as an unfinished page rather than a real
             board. The roles are real information and stay; the names
             appear here once Rabita supplies them. */}
          <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(['chair', 'vice', 'treasurer', 'secretary', 'member', 'member2'] as const).map((k) => (
              <li key={k} className="border-t border-rule pt-6">
                <p className="font-serif text-card text-ink">{t(`board.roles.${k}`)}</p>
              </li>
            ))}
          </ul>
        </SectionBody>
      </Section>

      <Section tone="paper">
        <SectionBody>
          <SectionHeading>{t('legal.heading')}</SectionHeading>
          {/* These were links to #statuter / #arsrapport / #press. None of
             those targets exist and no document is published yet, so they
             were three arrows that did nothing. Listed as rows until the
             files exist, with one line saying how to get a copy. */}
          <ul className="mt-8 border-t border-rule">
            {(['statutes', 'annual', 'press'] as const).map((k) => (
              <li key={k} className="border-b border-rule">
                <p className="flex min-h-14 items-center gap-4 font-sans text-[15px] font-medium text-ink">
                  {t(`legal.${k}`)}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-prose text-[13px] text-ink-60">{t('legal.onRequest')}</p>
        </SectionBody>
      </Section>
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
