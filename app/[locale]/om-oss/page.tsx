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
            <div className="md:col-span-4 space-y-3">
              <Stat value={String(CAMPAIGN.foundedYear)} label={t('facts.founded')} />
              <Stat value={CAMPAIGN.members.toLocaleString('nb-NO')} label={t('facts.members')} />
              <Stat value={`${CAMPAIGN.nationalities}+`} label={t('facts.nationalities')} />
            </div>
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
          <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(['chair', 'vice', 'treasurer', 'secretary', 'member', 'member2'] as const).map((k) => (
              <li key={k} className="border-t border-rule pt-6">
                <p className="text-[13px] text-ink-60">{t(`board.roles.${k}`)}</p>
                <p className="mt-2 font-serif text-card text-ink">{t('board.tbd')}</p>
              </li>
            ))}
          </ul>
        </SectionBody>
      </Section>

      <Section tone="paper">
        <SectionBody>
          <SectionHeading>{t('legal.heading')}</SectionHeading>
          <ul className="mt-8 border-t border-rule">
            <li className="border-b border-rule">
              <a
                href="#statuter"
                className="group flex min-h-14 items-center justify-between gap-4 font-sans text-[15px] font-medium text-ink transition-colors hover:text-gold-deep"
              >
                {t('legal.statutes')}
                <span aria-hidden className="font-mono text-[0.75rem] text-ink-60 transition-transform group-hover:translate-x-1">&#8594;</span>
              </a>
            </li>
            <li className="border-b border-rule">
              <a
                href="#arsrapport"
                className="group flex min-h-14 items-center justify-between gap-4 font-sans text-[15px] font-medium text-ink transition-colors hover:text-gold-deep"
              >
                {t('legal.annual')}
                <span aria-hidden className="font-mono text-[0.75rem] text-ink-60 transition-transform group-hover:translate-x-1">&#8594;</span>
              </a>
            </li>
            <li className="border-b border-rule">
              <a
                href="#press"
                className="group flex min-h-14 items-center justify-between gap-4 font-sans text-[15px] font-medium text-ink transition-colors hover:text-gold-deep"
              >
                {t('legal.press')}
                <span aria-hidden className="font-mono text-[0.75rem] text-ink-60 transition-transform group-hover:translate-x-1">&#8594;</span>
              </a>
            </li>
          </ul>
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
