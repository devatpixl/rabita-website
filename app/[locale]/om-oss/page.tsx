import Image from 'next/image';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { Eyebrow, SectionBody, SectionHeading } from '@/components/primitives';
import { StoryColophon } from '@/components/story-page';
import { PageBand } from '@/components/page-band';
import { FigureIcon } from '@/components/figure-icons';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'aboutPage' });
  const ts = await getTranslations({ locale, namespace: 'storyPages' });
  const tpo = await getTranslations({ locale, namespace: 'projectOverview' });

  return (
    <main>
      {/* The band, in the family every other section page opens on (client,
         2026-09-07). It replaces StoryHero and StoryPlate, which between them
         were a headline block and then a separate full-width plate — two
         objects doing the job the band does in one, and the reason this page
         opened differently from /besok-oss and /tjenester.

         `over` at full measure: story-facade-night.webp is 2000x860, which
         is 1.81 source pixels per CSS pixel across a 1104px plate — the same
         ratio the prayer band was calibrated against.

         The headline pair swaps namespaces on purpose. aboutPage.title and
         .lede are short and declarative, which is the register the other
         bands are written in; storyPages' pair is longer and belongs in the
         prose column below, where it now is. Both had been written and only
         one was ever rendered.

         StoryHero and StoryPlate are untouched — /kontakt, /medlemskap,
         /frivillig, /aktuelt and /personvern all still use them. */}
      <PageBand
        kicker={ts('crumb')}
        kickerNote={ts('pages.about.eyebrow')}
        title={t('title')}
        lede={t('lede')}
        image="/photos/story-facade-night.webp"
        alt={ts('pages.about.caption')}
        layout="over"
        mark="elevation"
        objectClass="object-[50%_58%]"
        padBottom="none"
      >
        {/* The credit rides with the picture. It was StoryPlate's caption and
           it is an attribution, not decoration, so it cannot be dropped with
           the component. */}
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-60">
          {ts('pages.about.caption')}
        </p>
      </PageBand>

      {/* The story and the figures. Same bones as /besok-oss — chip, headline,
         a card beside it, a note in the margin — on a different ground.

         Visit runs on paper-2; this runs on the pale green the "Dette er
         Rabita" section, the follow band and the project facts already stand
         on. Two pages built from one set of parts should not be the same
         colour, and green is the tone this site keeps for the places that are
         about the congregation rather than about a service. */}
      <section className="relative isolate overflow-hidden bg-[#e3eae4]">
        {/* The ground arrives rather than cutting in, the way it does
           everywhere else the green is used. */}
        <div aria-hidden className="h-24 bg-gradient-to-b from-paper to-[#e3eae4] md:h-36" />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 end-[4%] -z-10 h-[34rem] w-[34rem] rounded-full bg-gold/[0.07] blur-3xl"
        />
        <div className="pb-section-lg md:pb-24">
          <SectionBody>
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
              {/* ── the story ────────────────────────────────────────── */}
              <div className="lg:col-span-5 xl:col-span-4">
                <p className="inline-flex items-center rounded-full bg-paper px-3.5 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-60 ring-1 ring-ink/10">
                  {t('historyChip')}
                </p>
                <SectionHeading className="mt-5">{t('historyHeading')}</SectionHeading>
                <div className="mt-7 space-y-5 text-body text-ink-60">
                  <p>{t('history.p1')}</p>
                  <p>{t('history.p2')}</p>
                  <p>{t('history.p3', { year: 2009 })}</p>
                </div>

                {/* A foot for the column, and the one link this page owes:
                   the whole of the last paragraph is about outgrowing the
                   building, which is what the project page answers. */}
                <Link
                  href={`/${locale}/moskeprosjektet`}
                  className="group mt-9 inline-flex min-h-11 items-center gap-3 border-t border-ink/15 pt-6 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-ink transition-colors hover:text-gold-deep"
                >
                  {tpo('cta')}
                  <span
                    aria-hidden
                    className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                  >
                    &rarr;
                  </span>
                </Link>
              </div>

              {/* ── the figures ──────────────────────────────────────── */}
              {/* On a card, the way the booking form is on /besok-oss. Six
                 numbers on bare ground read as a table; on a card with a mark
                 each they read as facts about one place. */}
              <div className="lg:col-span-7 xl:col-span-6">
                <div className="rounded-2xl bg-paper p-6 shadow-[0_1px_2px_rgba(26,26,24,0.04),0_24px_60px_-34px_rgba(26,26,24,0.28)] sm:p-8">
                  <Eyebrow tone="gold-deep">{t('factsEyebrow')}</Eyebrow>
                  <h2 className="mt-4 font-serif text-[clamp(1.5rem,2.4vw,2rem)] leading-tight text-balance text-ink">
                    {t('factsHeading')}
                  </h2>

                  {/* A ledger, not a grid. Two columns of three left the
                     card ~260px shorter than the prose beside it, which is
                     the hole this layout keeps having to be saved from. One
                     row per figure — mark, label, leader, number — fills the
                     column and reads as a set of accounts, which is what
                     these are. The row idiom is the mosque project's own
                     (moskeprosjektet/page.tsx). */}
                  <dl className="mt-7">
                    {/* Key figures as confirmed in Årsrapport 2025, in the
                       order the client listed them (2026-08-30). */}
                    {([
                      ['calendar', String(CAMPAIGN.foundedYear), t('facts.founded')],
                      ['people', CAMPAIGN.members.toLocaleString('nb-NO'), t('facts.members')],
                      ['person', `${CAMPAIGN.volunteers}+`, t('facts.volunteers')],
                      ['book', `${CAMPAIGN.pupils}+`, t('facts.pupils')],
                      ['globe', `${CAMPAIGN.nationalities}+`, t('facts.nationalities')],
                      ['route', CAMPAIGN.visitorsPerWeek.toLocaleString('nb-NO'), t('facts.visits')],
                    ] as const).map(([icon, value, label]) => (
                      <div
                        key={label}
                        className="flex items-center gap-4 border-t border-ink/10 py-3.5 first:border-t-0 first:pt-0"
                      >
                        <span
                          aria-hidden
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-soft/40 text-gold-deep ring-1 ring-gold-deep/20"
                        >
                          <FigureIcon name={icon} className="h-[18px] w-[18px]" />
                        </span>
                        <dt className="min-w-0 font-mono text-[0.625rem] uppercase leading-snug tracking-[0.16em] text-ink-60">
                          {label}
                        </dt>
                        <span aria-hidden className="hidden h-px flex-1 bg-ink/10 sm:block" />
                        <dd className="ms-auto shrink-0 font-serif text-[1.6rem] leading-none tabular-nums text-ink sm:ms-0">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              {/* ── the margin note ──────────────────────────────────── */}
              <aside className="relative hidden xl:col-span-2 xl:block">
                {/* The arch, behind the note. A photograph graded until it
                   reads as ground: colour mostly out, pushed warm, then a
                   last veil in this section's own green so it settles into
                   the ground rather than sitting on it. */}
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
                    sizes="304px"
                    loading="eager"
                    className="object-cover opacity-[0.45]"
                    style={{ filter: 'saturate(0.25) sepia(0.45) contrast(1.06) brightness(1.02)' }}
                  />
                  <span aria-hidden className="absolute inset-0 bg-[#e3eae4]/25" />
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
        </div>
      </section>

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
