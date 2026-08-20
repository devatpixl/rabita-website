import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { Section, SectionBody } from '@/components/primitives';
import { StoryColophon, StoryHero, StoryPlate } from '@/components/story-page';

// News index. Kept static in phase 2 — a real CMS is a phase-4+ decision
// (§13.5 blocker: who updates the site after handover).
// No article pages exist yet, so these are entries rather than links.
const POSTS = [
  { slug: 'grunnsteinen', date: '2026-07-12', key: 'foundation' as const },
  { slug: 'nytt-bibliotek-partnerskap', date: '2026-06-01', key: 'library' as const },
  { slug: 'arsmote-2026', date: '2026-05-20', key: 'agm' as const },
];

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'newsPage' });
  const ts = await getTranslations({ locale, namespace: 'storyPages' });
  const l = await getLocale();
  const fmt = new Intl.DateTimeFormat(l === 'en' ? 'en-GB' : l === 'ar' ? 'ar-EG' : 'nb-NO', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <main>
      <StoryHero
        crumb={ts('crumb')}
        index={ts('pages.news.index')}
        eyebrow={ts('pages.news.eyebrow')}
        title={ts('pages.news.title')}
        lede={ts('pages.news.lede')}
      />
      <StoryPlate image="/photos/story-news.webp" caption={ts('pages.news.caption')} />
      <Section tone="paper">
        <SectionBody>
          <ul className="divide-y divide-rule border-y border-rule">
            {POSTS.map((p) => (
              <li key={p.slug}>
                <div className="grid gap-4 py-6 md:grid-cols-12 md:items-baseline">
                  <p className="md:col-span-3 text-[13px] text-ink-60 tabular-nums">
                    {fmt.format(new Date(p.date))}
                  </p>
                  <h2 className="md:col-span-9 font-serif text-card text-ink">{t(`items.${p.key}.title`)}</h2>
                </div>
              </li>
            ))}
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
