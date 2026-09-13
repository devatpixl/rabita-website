import Image from 'next/image';
import { AnnualReports } from '@/components/annual-reports';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { Eyebrow, SectionBody, SectionHeading } from '@/components/primitives';
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

         The photograph is the street iftar, not the facade render it opened
         on (client, 2026-09-08: "use a better image here"). This page is
         about a congregation that grew from a flat to one of the largest
         mosques in Norway; a render of the building that has not been built
         yet answers a different question, and it was a dark diagonal slab at
         band crop. Long tables of people read across a 4.6:1 letterbox in a
         way a facade does not.

         Same subject, brighter frame (client, 2026-09-08: "a lighter
         image"). Measured mean luminance over the actual band crop:
         hero-iftar 49.2, zoom-gateiftar 100.7 — twice the light for the same
         Grønland street iftar, so captionIftar stays literally true. It was
         not the grade: `warm` is already the lightest of the three tones
         (brightness 0.94), so the dark came from the photograph.

         The cost is resolution. zoom-gateiftar.webp is 1600x1069, which is
         1.45 source pixels per CSS pixel across a 1104px plate, under the
         1.81 the prayer band was calibrated against and well under the 2.32
         hero-iftar gave. It holds at 1x and softens on a 2x display. Every
         2000px+ frame in the library was checked and none of them is this
         page's subject — they are food trays, Quran pages, the unbuilt
         facade, or a posed group portrait that loses its heads at 4.6:1. A
         higher-resolution original of THIS frame is the real fix; until
         there is one, light beats sharp on a band that carries a scrim.

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
        image="/photos/visit-entrance.webp"
        alt={ts('pages.about.captionIftar')}
        layout="over"
        mark="elevation"
        // warm, not the default calm: this is a dusk photograph lit by
        // Ramadan lights, and the site's standard grade pulls exactly the
        // warmth out of it that makes it worth using.
        tone="warm"
        // The picture changed on 2026-09-10 (client) from zoom-gateiftar,
        // which was the canopies from above, to the conversation under them:
        // three people talking, the marquees and the gold stars behind. Same
        // evening, same event, so "Gateiftar på Grønland" still captions it —
        // and "Rabita siden 1987" over people talking says more about the
        // organisation than a picture of tents does.
        //
        // 45% re-measured for the new source. It is 2000x1100 rather than
        // 1600x1069, so the band keeps 40% of the height instead of 33%, and
        // the faces sit between 33% and 55% of the frame. 45 puts them
        // through the middle with the canopies still above them.
        objectClass="object-[50%_45%]"
        padBottom="none"
      >
        {/* The caption rides with the picture, as StoryPlate's did. */}
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-60">
          {ts('pages.about.captionIftar')}
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
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 end-[4%] -z-10 h-[34rem] w-[34rem] rounded-full bg-gold/[0.07] blur-3xl"
        />
        {/* The ground arrives rather than cutting in, the way it does
           everywhere else the green is used — but as a BACKGROUND, which is
           how /besok-oss draws the same seam.

           This was an in-flow div, so its 144px of fade was also 144px of
           empty layout, and the content below it had no top padding of its
           own: every pixel between the band's caption and the HISTORIEN chip
           was the gradient (client, 2026-09-08: "too much space"). One
           element was doing two jobs and neither was tunable without
           breaking the other.

           Absolute and -z-10, it now costs nothing, so it can be LONGER than
           before — a 160px fade instead of 144 — while the breathing room
           below it is set on its own terms. Painted after the bloom so the
           bloom fades in with it rather than sitting on top of the seam. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-paper to-[#e3eae4] md:h-40"
        />
        {/* 60/72 off the section scale, against 96/144 of pure gradient
           before. Still spacious, half the hole. */}
        {/* 36px top and bottom on a phone, against 60/72 before. Those are
           desktop measures: the bottom one stacked with the colophon's own
           top padding for 132px of dead ground between the card and "Til
           protokollen" at 390px (client, 2026-09-08). */}
        <div className="pb-9 pt-9 md:pb-24 md:pt-section-lg">
          <SectionBody>
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
              {/* ── the story ────────────────────────────────────────── */}
              <div className="lg:col-span-4">
                <div className="flex items-center gap-4">
                  <p className="inline-flex shrink-0 items-center rounded-full bg-paper px-3.5 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-60 ring-1 ring-ink/10">
                    {t('historyChip')}
                  </p>
                  <span aria-hidden className="h-px flex-1 bg-gold-deep/30" />
                </div>
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
              {/* The ledger and the arch are ONE object now (client mockup,
                 2026-09-08), not a card with a ghost floating behind it in
                 the margin. The quote moves onto the photograph, where it
                 has something to sit on, and the whole panel breaks a little
                 way into the margin at xl the way the project hero's card
                 does — the room outside SectionBody, capped, so it reaches
                 zero on its own before the grid stacks. */}
              {/* self-center, not items-center on the grid: the story column
                 is the taller of the two, so centring the row would be a
                 no-op on it and a claim about both. Only the card moves
                 (client, 2026-09-08). Below lg they stack and it is inert. */}
              <div
                className="lg:col-span-8 lg:self-center xl:me-[var(--about-panel-pull)]"
                style={{
                  ['--about-panel-pull' as string]:
                    'calc(-1 * clamp(0px, (100vw - 72rem) / 2 - 1.5rem, 6rem))',
                }}
              >
                {/* The card IN FRONT of the arch, not wrapped around it
                   (client, 2026-09-14: "the overall design here also, make it
                   like this", pointing at the visit page).

                   This reverses the 2026-09-08 merge, which made the ledger
                   and the arch one object because the arch had been a ghost
                   floating in the margin carrying nothing. What he wants back
                   is the visit page's composition — but that one works, and
                   this one did not, for a reason worth writing down: there
                   the arch has the QUOTE beside it, so the photograph is
                   holding something up. Same here now. The quote leaves the
                   photograph and sits in ink in its own column, which is what
                   gives the arch a job. */}
                <div className="relative">
                  {/* The arch: absolute, bleeding above and past the card, at
                     -z-10 so the card sits over it. Masked away at the foot so
                     the shape has no bottom edge to end on. Hidden below lg,
                     where there is no margin to bleed into. */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -top-12 end-0 -z-10 hidden h-[32rem] w-[19rem] overflow-hidden rounded-t-[9rem] border border-gold-deep/20 lg:block"
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
                    <span aria-hidden className="absolute inset-0 bg-paper-2/25" />
                  </div>

                  <div className="grid gap-8 lg:grid-cols-[1fr_13rem] lg:gap-10">
                    <div className="rounded-2xl bg-paper p-6 shadow-[0_1px_2px_rgba(26,26,24,0.04),0_24px_60px_-34px_rgba(26,26,24,0.28)] sm:p-8">
                        <Eyebrow tone="gold-deep">{t('factsEyebrow')}</Eyebrow>
                        <h2 className="mt-4 font-serif text-[clamp(1.5rem,2.4vw,2rem)] leading-tight text-balance text-ink">
                          {t('factsHeading')}
                        </h2>

                        <dl className="mt-5 md:mt-7">
                          {/* Key figures as confirmed in Årsrapport 2025, in the
                             order the client listed them (2026-08-30). The
                             second line under each label is theirs too, from the
                             mockup: it turns a number into a sentence. */}
                          {([
                            ['calendar', 'founded', String(CAMPAIGN.foundedYear)],
                            ['people', 'members', CAMPAIGN.members.toLocaleString('nb-NO')],
                            ['person', 'volunteers', `${CAMPAIGN.volunteers}+`],
                            ['book', 'pupils', `${CAMPAIGN.pupils}+`],
                            ['globe', 'nationalities', `${CAMPAIGN.nationalities}+`],
                            ['route', 'visits', CAMPAIGN.visitorsPerWeek.toLocaleString('nb-NO')],
                          ] as const).map(([icon, key, value]) => (
                            <div
                              key={key}
                              className="flex items-center gap-4 border-t border-ink/10 py-3 first:border-t-0 first:pt-0 md:py-3.5"
                            >
                              <span
                                aria-hidden
                                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-soft/40 text-gold-deep ring-1 ring-gold-deep/20"
                              >
                                <FigureIcon name={icon} className="h-[18px] w-[18px]" />
                              </span>
                              <dt className="min-w-0 flex-1">
                                <span className="block font-mono text-[0.625rem] uppercase leading-snug tracking-[0.16em] text-ink-60">
                                  {t(`facts.${key}`)}
                                </span>
                                <span className="mt-1 block font-serif text-[13px] italic leading-snug text-ink-40">
                                  {t(`factNotes.${key}`)}
                                </span>
                              </dt>
                              <dd className="flex shrink-0 items-start gap-1 font-serif text-[1.5rem] leading-none tabular-nums text-ink">
                                {value}
                                {/* The rising mark, on every figure but the
                                   founding year — a year is not a quantity that
                                   grows. Decorative, so aria-hidden. */}
                                {key !== 'founded' && (
                                  <svg
                                    aria-hidden
                                    viewBox="0 0 24 24"
                                    className="mt-0.5 h-3 w-3 shrink-0 text-gold-deep/70 rtl:-scale-x-100"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M7 17L17 7M9 7h8v8" />
                                  </svg>
                                )}
                              </dd>
                            </div>
                          ))}
                        </dl>
                    </div>

                    {/* The quote, in ink on the arch rather than paper-white
                       on a photograph. Below lg the arch is gone, so it sits
                       under the card as a plain pull quote — it is the line
                       the section ends on either way. */}
                    <aside className="relative lg:pt-8">
                      <span aria-hidden className="block h-px w-10 bg-gold-deep/40" />
                      <p className="mt-5 font-serif text-[1.05rem] italic leading-relaxed text-ink-60">
                        {`«${t('quote')}»`}
                      </p>
                      <Image
                        src="/logo/rabita-mark-256.png"
                        alt=""
                        width={30}
                        height={30}
                        aria-hidden
                        className="mt-6 h-[30px] w-[30px] opacity-60"
                      />
                    </aside>
                  </div>
                </div>
              </div>
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

      {/* The reports and the chart land where the "available on request"
         sentence used to stand for both (client, 2026-09-13). */}
      <AnnualReports />

      {/* "Til protokollen" came off this page on 2026-09-13 ("Fjern til
         protokollen"), listed under his Om oss notes. It is NOT deleted from
         the site: the same StoryColophon still closes /kontakt and
         /personvern-og-tilgjengelighet, which is where a journalist or an
         auditor would look for it anyway. Its strings stay under
         storyPages.colophon, so putting it back here is these six lines. */}
    </main>
  );
}
