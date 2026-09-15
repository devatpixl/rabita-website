import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { Section, SectionBody, SectionHeading } from '@/components/primitives';
import { Eyebrow } from '@/components/primitives';
import { EVENT_PAGES } from '@/lib/event-pages';
import { type ColophonLabels, StoryColophon, StoryHero, StoryPlate } from '@/components/story-page';

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
  // Arrangementer moved in under Aktuelt on 2026-09-15 (client). Same two
  // namespaces /arrangementer renders from, so the cards say exactly what
  // they say there — one set of words, two places that show it.
  const te = await getTranslations({ locale, namespace: 'eventsPage' });
  const tev = await getTranslations({ locale, namespace: 'events' });
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
      {/* ══ Arrangementer ═══════════════════════════════════════════════
         Client, 2026-09-15: "Flytte «Arrangementer» inn under «Aktuelt»".

         Given his own rule that only Tjenester and Undervisning keep a
         dropdown, "inn under" cannot mean a submenu — it means hierarchy.
         Aktuelt is the front door and the events sit inside it.

         This page had already claimed them, which is the tell: its own
         standfirst reads "Byggingen, ARRANGEMENTENE og saker som gjelder
         menigheten". News and events are the same kind of thing — what is
         happening at Rabita — and they were split across two places, one of
         which nothing on the site linked to.

         ABOVE THE NEWS, deliberately. Events are dated, so they go stale;
         and they are the half with somewhere to go — every card opens a real
         page at /arrangementer/[slug], while the news posts below have no
         article pages and are entries rather than links. Putting the live,
         clickable half first is the honest order.

         The card is /arrangementer's own, not a second dialect of it: same
         grade, same cut corner, same floating date pill, same slow scale,
         whole card as the target. /arrangementer keeps its page — it carries
         the practical facts and the RSVP context this summary does not. */}
      <Section tone="paper-2" className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 end-[4%] -z-10 h-[34rem] w-[34rem] rounded-full bg-gold/[0.06] blur-3xl"
        />
        <div
          aria-hidden
          className="star-texture star-texture--light pointer-events-none absolute inset-0 -z-10"
        />
        <SectionBody>
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div>
              <Eyebrow tone="gold-deep">{te('eyebrow')}</Eyebrow>
              <SectionHeading className="mt-4">{te('title')}</SectionHeading>
            </div>
            {/* The way through to the full page, in the site's own secondary
               outline pill. events.all is already written in all three. */}
            <Link
              href={`/${locale}/arrangementer`}
              className="group inline-flex min-h-12 shrink-0 items-center gap-2.5 rounded-full border border-ink px-6 py-3 text-[15px] font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              {tev('all')}
              <span
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
              >
                &rarr;
              </span>
            </Link>
          </div>

          <ul className="mt-12 grid gap-8 md:grid-cols-3">
            {EVENT_PAGES.map((e) => (
              <li key={e.slug}>
                <Link
                  href={`/${locale}/arrangementer/${e.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] rounded-se-[3rem] bg-paper shadow-[0_1px_2px_rgba(26,26,24,0.04),0_18px_44px_-34px_rgba(26,26,24,0.3)] ring-1 ring-ink/5 transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(26,26,24,0.05),0_26px_60px_-34px_rgba(26,26,24,0.4)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-paper-deep">
                    <Image
                      src={e.image}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 33vw, calc(100vw - 3rem)"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                      style={{ filter: 'saturate(0.72) contrast(1.12) brightness(0.9)' }}
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-dusk/70 to-transparent"
                    />
                    <span className="absolute bottom-3.5 start-3.5 inline-flex items-center rounded-full bg-paper/95 px-3 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.16em] tabular-nums text-ink shadow-[0_2px_10px_-2px_rgba(26,26,24,0.35)] backdrop-blur-sm">
                      <bdi dir="ltr">{fmt.format(new Date(e.date))}</bdi>
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-serif text-card text-ink">{te(`items.${e.key}.title`)}</h3>
                    <p className="mt-2.5 text-[15px] leading-snug text-ink-60">
                      {te(`items.${e.key}.body`)}
                    </p>
                    <span className="mt-auto flex items-center gap-2.5 pt-6 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-ink transition-colors group-hover:text-gold-deep">
                      {te('rsvp')}
                      <span
                        aria-hidden
                        className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                      >
                        &rarr;
                      </span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </SectionBody>
      </Section>

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
        labels={ts.raw('colophon.labels') as ColophonLabels}
      />
    </main>
  );
}
