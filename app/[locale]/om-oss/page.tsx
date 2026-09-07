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
            <aside className="relative hidden xl:col-span-2 xl:block">
              {/* The arch, behind the note. It is a photograph, not a
                 drawing — the fretwork window and the light it throws, from
                 the client (2026-09-07) — but it is graded and washed until
                 it reads as ground rather than as a picture: colour mostly
                 pulled out, warmed towards paper, and taken to 22%.

                 The container is what makes it an arch: a tall box with a
                 9rem top radius and a gold hairline on it, which is the
                 outlined arch the mockup draws. The mask fades the foot away
                 so the shape has no bottom edge to end on.

                 It bleeds past its own column on purpose. -z-10 keeps it
                 behind the card beside it, and the section is
                 overflow-hidden, so it can spill toward the margin without
                 escaping. */}
              <div
                aria-hidden
                className="pointer-events-none absolute -top-12 -end-14 -z-10 h-[32rem] w-[19rem] overflow-hidden rounded-t-[9rem] border border-gold-deep/20"
                style={{
                  maskImage:
                    'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 52%, rgba(0,0,0,0) 100%)',
                  WebkitMaskImage:
                    'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 52%, rgba(0,0,0,0) 100%)',
                }}
              >
                <Image
                  src="/photos/arch-light.jpg"
                  alt=""
                  fill
                  // 304px, not "19rem": a sizes value Next cannot resolve to a
                  // viewport width makes it emit the whole width table, down
                  // to 3840w, for a 15KB decoration.
                  sizes="304px"
                  // Eager. It is 15KB, it sits above the fold at the width
                  // that shows it at all, and lazy-loading a background that
                  // is only ever 45% present buys nothing.
                  loading="eager"
                  className="object-cover opacity-[0.45]"
                  // Colour mostly out, pushed warm, so the marble and the
                  // light land in the paper palette rather than beside it.
                  style={{ filter: 'saturate(0.25) sepia(0.45) contrast(1.06) brightness(1.02)' }}
                />
                {/* A last veil in the section's own tone, so the photograph
                   sits IN the ground instead of on it. */}
                <span aria-hidden className="absolute inset-0 bg-paper-2/25" />
              </div>

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
