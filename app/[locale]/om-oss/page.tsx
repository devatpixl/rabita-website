import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import Image from 'next/image';
import { Eyebrow, Section, SectionBody, SectionHeading } from '@/components/primitives';
import { FigureIcon } from '@/components/figure-icons';
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

      {/* The story and the figures, in the language /besok-oss took from
         the client's mockup (2026-09-07). This section was three paragraphs
         with no heading over them and a six-across figures grid underneath —
         nothing wrong with it, and nothing designed about it either.

         Now: a chip and a headline over the prose, and the figures lifted
         onto a raised card of their own with a mark against each. The
         headline is aboutPage.title, which was written and then orphaned
         when StoryHero took its title from the storyPages namespace instead.
         The margin quote is the tail of history.p3, so the one sentence that
         says what the place is for gets said twice on purpose. */}
      <Section tone="paper-2" className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 end-[4%] -z-10 h-[34rem] w-[34rem] rounded-full bg-gold/[0.06] blur-3xl"
        />
        {/* Its own childless layer: .star-texture sets
           `> * { position: relative }` and would drop any absolutely
           positioned sibling into the flow. */}
        <div
          aria-hidden
          className="star-texture star-texture--light pointer-events-none absolute inset-0 -z-10"
        />
        <SectionBody>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
            {/* ── the story ──────────────────────────────────────────── */}
            <div className="lg:col-span-5 xl:col-span-4">
              <p className="inline-flex items-center rounded-full bg-paper px-3.5 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-60 ring-1 ring-ink/10">
                {t('historyChip')}
              </p>
              <SectionHeading className="mt-5">{t('title')}</SectionHeading>
              <div className="mt-7 space-y-5 text-body text-ink-60">
                <p>{t('history.p1')}</p>
                <p>{t('history.p2')}</p>
                <p>{t('history.p3', { year: 2009 })}</p>
              </div>
            </div>

            {/* ── the figures ────────────────────────────────────────── */}
            {/* On a card, the way the booking form is on /besok-oss. Six
               numbers on bare paper read as a table; on a card with a mark
               each they read as a set of facts about one place. */}
            <div className="lg:col-span-7 xl:col-span-6">
              <div className="rounded-2xl bg-paper p-6 shadow-[0_1px_2px_rgba(26,26,24,0.04),0_24px_60px_-34px_rgba(26,26,24,0.28)] sm:p-8">
                <Eyebrow tone="gold-deep">{t('factsEyebrow')}</Eyebrow>
                <h2 className="mt-4 font-serif text-[clamp(1.5rem,2.4vw,2rem)] leading-tight text-balance text-ink">
                  {t('factsHeading')}
                </h2>
                <p className="mt-3 max-w-[44ch] text-[15px] leading-snug text-ink-60">{t('lede')}</p>

                <dl className="mt-8 grid gap-x-8 gap-y-7 border-t border-ink/10 pt-7 sm:grid-cols-2">
                  {/* Key figures as confirmed in Årsrapport 2025, in the order
                     the client listed them (2026-08-30). */}
                  {([
                    ['calendar', String(CAMPAIGN.foundedYear), t('facts.founded')],
                    ['people', CAMPAIGN.members.toLocaleString('nb-NO'), t('facts.members')],
                    ['person', `${CAMPAIGN.volunteers}+`, t('facts.volunteers')],
                    ['book', `${CAMPAIGN.pupils}+`, t('facts.pupils')],
                    ['globe', `${CAMPAIGN.nationalities}+`, t('facts.nationalities')],
                    ['route', CAMPAIGN.visitorsPerWeek.toLocaleString('nb-NO'), t('facts.visits')],
                  ] as const).map(([icon, value, label]) => (
                    <div key={label} className="flex items-start gap-3.5">
                      <span
                        aria-hidden
                        className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-soft/40 text-gold-deep ring-1 ring-gold-deep/20"
                      >
                        <FigureIcon name={icon} className="h-[18px] w-[18px]" />
                      </span>
                      {/* dt before dd, then reversed for display. A dl whose
                         dd precedes its dt is invalid HTML, and the figure
                         still has to read above its label. */}
                      <div className="flex min-w-0 flex-col-reverse">
                        <dt className="mt-2 font-mono text-[0.625rem] uppercase leading-snug tracking-[0.16em] text-ink-60">
                          {label}
                        </dt>
                        <dd className="font-serif text-[1.7rem] leading-none tabular-nums text-ink">
                          {value}
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* ── the margin note ────────────────────────────────────── */}
            <aside className="hidden xl:col-span-2 xl:block">
              <span aria-hidden className="block h-px w-10 bg-gold-deep/40" />
              <p className="mt-6 font-serif text-[1.05rem] italic leading-relaxed text-ink-60">
                {`«${t('quote')}»`}
              </p>
              <Image
                src="/logo/rabita-mark-256.png"
                alt=""
                width={32}
                height={32}
                aria-hidden
                className="mt-7 h-8 w-8 opacity-60"
              />
            </aside>
          </div>
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
