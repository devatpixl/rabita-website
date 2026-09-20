import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { CAMPAIGN } from '@/lib/campaign';
import { ProgressPhases } from '@/components/progress-phases';
import type { AppLocale } from '@/i18n/routing';
import { FigureIcon, type FigureIconName } from '@/components/figure-icons';
import { cn } from '@/lib/cn';
import { Section, SectionBody } from '@/components/primitives';
// Hidden for now, not deleted — see the note where it rendered.
// import { BuildingRises } from '@/components/building-rises';
import { ApartmentsCta } from '@/components/apartments-cta';
import { GiftBuilds } from '@/components/gift-builds';
import { ProjectGallery } from '@/components/project-gallery';
import { GivingCard } from '@/components/giving-card';
// import { MotionRise } from '@/components/motion-rise'; // hidden sadaqa band
import { FloorByFloor } from '@/components/floor-by-floor';
import { FacilitiesCard } from '@/components/facilities-card';
// import { SadaqaBand } from '@/components/sadaqa-band'; // hidden, not deleted

import { Accent } from '@/components/accent';
import {
  ProjectHero,
} from '@/components/project-page';
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'projectPage' });
  const tp = await getTranslations({ locale, namespace: 'projectPages' });
  const tf = await getTranslations({ locale, namespace: 'fremdrift' });
  return (
    <main>
      {/* One call to action, not two (client, Hjem.pdf 2026-09-09). The
         giving one stays: the lede now ends on "vi mangler bare din støtte",
         and the whole giving flow is in the card beside it. "Hvor pengene
         går" is still reachable from the nav and the footer, and
         ProjectHero's `secondary` was already optional.

         {places} in the lede is interpolated rather than typed: the same
         figure is derived in the ledger below and on the home page. */}
      <ProjectHero
        crumb={tp('crumb')}
        eyebrow={tp('pages.building.eyebrow')}
        title={tp.rich('pages.building.title', {
          em: (chunks) => <Accent surface="dusk">{chunks}</Accent>,
        })}
        lede={tp('pages.building.lede')}
        ledeShort={tp('pages.building.ledeShort')}
        image="/photos/band-facade.webp"
        alt={tp('pages.building.eyebrow')}
        primary={{ label: tp('pages.building.primary'), give: true }}
        aside={
          // The whole giving flow, in place: amounts, details, payment, all
          // inside the hero card, earmarked for the building.
          <div className="overflow-hidden rounded-2xl border border-paper/15 bg-paper text-ink shadow-[0_24px_60px_-28px_rgba(0,0,0,0.6)]">
            <p className="flex items-center gap-2 border-b border-rule bg-paper-2 px-6 py-2.5 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-gold-deep">
              <span aria-hidden className="inline-block h-1.5 w-1.5 rotate-45 bg-gold-deep" />
              {t('giveBox.eyebrow')}
            </p>
            {/* NO purpose (client, Tekst (endelig) Sept 2026): "Bruk
               akkurat samme donasjonswidget som på hovedsiden — IKKE en
               øremerket variant spesifikt for moskeprosjektet." It ran
               purpose="building", which changed the sheet's title AND
               tagged the gift as a building donation in the API. Both go:
               he asked for the same widget, and a widget that records
               something different is not the same widget.

               CONSEQUENCE, flagged to the client: gifts made from this
               page are no longer distinguishable from any other. The
               enum still accepts 'building' (app/api/donations/route.ts)
               and giving.sheetTitleBuilding is still written in all three
               locales, so restoring it is this one prop. */}
            <GivingCard fit />
          </div>
        }
      />
      {/* The "Kort sagt" brief that sat here is folded into the hero lede
         (2026-08-30) — one statement, not two. */}

      {/* The four-card "What each level is for" grid used to sit here. It
         summarised prayer halls, the school, library and youth, and the
         entrance — the same four things the build sequence below walks
         through in detail, and it covers seven levels rather than four.
         Two answers to one question, the shorter one first. The component
         is untouched; four other pages still use it. */}
      {/* The build, program by program — HIDDEN, not deleted (client,
         2026-09-03): the architect's real cutaways below replaced it, and
         the hand-drawn SVG sequence is kept for reuse. Re-enable by
         restoring the element below.
      <BuildingRises /> */}
      {/* The renders, contained again and ABOVE the floor animation
         (client, 2026-09-13: "move this section above the mosque
         animation"). He had asked on 2026-09-07 to try the gallery ahead of
         the figures — "se om det er bedre" — and this settles it: you see
         the building before you are walked through it floor by floor.

         The CTA is gone with the full-bleed design that carried it;
         projectPage.gallery.cta is now unreferenced. */}
      <section className="bg-paper-2 pt-14 pb-section-md md:pt-20">
        <SectionBody>
          <ProjectGallery
            // Named explicitly, so adding a slide for another page cannot
            // quietly appear here. The two apartment interiors went into the
            // component's list on 2026-09-13 for /leiligheter and turned up at
            // the end of this gallery uninvited; this page is the mosque.
            only={[
              'facadeEvening',
              'foyer',
              'garden',
              'mainHall',
              'minaret',
              'youthClub',
              'meetingRoom',
              'roofTerrace',
            ]}
          />
        </SectionBody>
      </section>

      <FloorByFloor />

      {/* What a gift buys, straight after the walk through the building
         (client, 2026-09-13: "move this section above, in here"). It used to
         close the page under the facts. Here it lands while the reader still
         has the rooms in mind — the floors above name them, and this prices
         them — and everything that was below it keeps its order. */}
      <GiftBuilds />

      {/* Fremdrift, in digest. Still between the picture and the figures:
         the renders and the gift ladder above answer "what will it look like"
         and "what does it cost", the key figures below open with Byggestart,
         and "when" belongs between them.
         The totals are dropped (compact) because the campaign meter has
         already given a figure further up — the full page carries them. */}
      {/* Sage, not paper (client, 2026-09-13: "use the light green as below
         section, also white looks odd"). The phases sat on white between a
         dusk band above and the sage facts below, which made one pale strip
         in the middle of the page. */}
      <Section tone="sage" className="!pb-10 md:!pb-12 [@media(min-width:768px)_and_(max-height:900px)]:!pb-7">
        <SectionBody>
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
                {tf('eyebrow')}
              </p>
              <h2 className="mt-4 max-w-2xl font-serif text-section text-balance text-ink">
                {tf('phasesHeading')}
              </h2>
            </div>
            {/* The "see all" pill stood here until 2026-09-15, when the
               client hid /moskeprosjektet/fremdrift ("remove the submenu of
               progress, dont delete the page, hide it for now"). The page is
               intact and still builds; it simply has no way in.
               The digest below it stays — ProgressPhases is what actually
               tells a reader where the build has got to, and it reads the
               same PROJECT_PHASES the hidden page does. fremdrift.seeAll is
               still written and translated in all three locales. */}
          </div>
          <div className="mt-12 md:mt-16">
            <ProgressPhases locale={locale as AppLocale} compact />
          </div>

          {/* A "Build it with us" CTA stood here from earlier on
             2026-09-13 ("add cta here") and came out the same day at his
             request. fremdrift.ctaHeading / ctaBody / ctaPrimary /
             ctaSecondary are back to rendering nowhere — they are still
             written and translated in all three locales. */}
        </SectionBody>
      </Section>

      {/* Sage ground for the facts (client, 2026-09-04) — the same pale green
         the "Dette er Rabita" and follow sections own.
         A tall paper-to-sage gradient used to open this section, because the
         phases above it were white and the fade WAS the space between the
         two. The phases went sage, the gradient became a wash of one colour
         into itself and was removed — but its HEIGHT was kept, "as plain
         ground".
         
         That was the bug. Measured 2026-09-18: 298px of dead sage between the
         last phase card and "THE NEW BUILDING" — 78 inside the phases, 60 of
         section padding and a bare 160px spacer holding the place of a
         gradient that no longer exists. On a 13" laptop that is a third of
         the viewport showing nothing, and the client saw exactly that:
         "too much empty space ... modern space, not make it look like its
         empty".
         
         The space is not deleted, it is given a job. Two sections sharing one
         ground need SOMETHING to say where one ends — that is what the
         gradient used to do. A hairline rule does it in a single pixel, and
         is the device this site already uses everywhere else to divide. So
         the gap halves AND stops reading as a void. */}
      <section className="bg-sage">
        <SectionBody>
          {/* gold-deep at 30%, not ink/12 — measured on sage #E3EAE4, an ink
             hairline at 12% is invisible, and `sage-line` #CBDCD1 is only a
             shade off the ground it sits on. Gold is also what this site
             already rules with: every eyebrow draws a gold bar before it. */}
          <div aria-hidden className="h-px w-full bg-gold-deep/30" />
        </SectionBody>
        <div aria-hidden className="h-12 md:h-16 [@media(min-width:768px)_and_(max-height:900px)]:!h-8" />
        <div className="pb-section-md">
        <SectionBody>
          {/* Key figures and capacity as two registers of the same design:
             mono label, 1px rule, hairline rows on one rhythm, serif values
             like the hero. Capacity carries the larger type (it is the data
             that matters most here) and the wider column. The architect is
             a credit, not a figure, so it signs the section at the foot. */}
          {(() => {
            const nf = new Intl.NumberFormat('nb-NO');
            const facts: {
              key: string;
              /** Overrides t(`facts.<key>`), for a row whose label lives in
               *  another namespace. */
              label?: string;
              icon: FigureIconName;
              value: string;
              unit?: string;
              muted?: boolean;
            }[] = [
              { key: 'building', icon: 'building', value: nf.format(CAMPAIGN.buildingM2), unit: 'm²' },
              // SEVEN, not "6 + U1" (client, 2026-09-15). Derived, not typed:
              // it is the same two constants added up, so the figure cannot
              // drift from the drawings. This also ENDS A CONTRADICTION the
              // site was carrying — "Sju etasjer" is the project page's own
              // headline, the zoom band's heading and the completion note,
              // while this register alone said 6 + U1. The label loses its
              // "(over/under)" with the split.
              { key: 'floors', icon: 'floors', value: String(CAMPAIGN.floorsAbove + CAMPAIGN.floorsBelow) },
              // Build TIME, not build start (client, 2026-09-15: "Endre til
              // «2 års byggetid» i stedet for byggestart"). A duration answers
              // "when can we use it", which is what a reader of this register
              // is asking; a start quarter answers a question only the client
              // already knows the answer to.
              // Capacity came out of this slot and the apartments took it
              // (client, Tekst (endelig) Sept 2026: "«Kapasitet: 2 500
              // personer» er fjernet fra nøkkeltallene ... konkrete
              // kapasitets-/plasstall skal generelt ikke oppgis"). The same
              // instruction emptied the prayer-places figure out of the home
              // page's ledger, and the same fifteen apartments replaced it
              // there — so the two registers still read as one pair.
              //
              // The four rows are now exactly his four, in his order:
              // Bruksareal, Etasjer, Leiligheter, Byggetid.
              // projectPage.capacity.* stay in the message files,
              // unreferenced, as facts.completion* already do.
              { key: 'apartments', icon: 'home', value: String(CAMPAIGN.rentalApartments) },
              { key: 'buildTime', icon: 'calendar', value: t('facts.buildTimeValue', { years: CAMPAIGN.constructionYears }) },
            ];
            const label = 'font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-ink-60';
            // One rhythm for both registers: every row is 5rem tall with its
            // content on a single baseline, so rows line up across the gap.
            //
            // The fixed row height is md-and-up ONLY. Below md the two
            // registers stack, so there is no second column to line up with
            // and 3.75rem per row was just padding — it opened the gaps the
            // client flagged under "Completion" and under the architect.
            // Rows size to their content on a phone.
            // Shorter rows (client, 2026-09-13: "reduce the height of this part
            // a bit... modern and spacious but lesser vertical height"). The
            // 4.5rem floor never actually bound — the 40px chip plus its
            // padding already made a 64px row — so lowering the floor alone
            // would have done nothing. The chip comes down with it.
            // Client, 2026-09-18: "remove these lines ... keep it without the
            // lines and align as per modern way the texts and figures". The
            // hairline between registers and the leader dash from each label
            // are both gone from md up. Losing the leader cost the figures
            // their anchor — flush right, "5 745 m²" and "2 500 people" put
            // their numerals 80px apart — and the card is only ~229px of
            // content wide, too narrow to give the figures their own column
            // beside a label as long as "Construction time". So the pair
            // stacks instead: label over figure, one left edge for all four,
            // chip spanning both rows. Nothing is ragged and nothing needs a
            // rule to hold it together.
            const row =
              'flex items-baseline justify-between gap-4 py-3 md:grid md:min-h-[3.5rem] md:flex-1 md:grid-cols-[2.25rem_1fr] md:content-center md:items-center md:gap-x-4 md:gap-y-2 md:py-2.5';
            // The card treatment the client asked for (2026-08-31), taken from
            // their mockup: a bordered plate per register, a mark beside every
            // figure, a gold rule off each register's label, and the capacity
            // rows set as inset panels.
            //
            // Every class here is md:-prefixed. The phone keeps the plain
            // ruled registers it has now — the client was explicit about that,
            // and a 40px chip beside a 13px label on a 390px screen would cost
            // the label its line anyway.
            const card = 'md:flex md:flex-col md:rounded-[1.25rem] md:border md:border-rule md:bg-gradient-to-b md:from-paper md:to-paper-2 md:shadow-[0_1px_2px_rgba(26,26,24,0.04),0_16px_36px_-26px_rgba(26,26,24,0.28)] md:p-6';
            const chip =
              'hidden h-9 w-9 shrink-0 place-items-center rounded-lg border border-rule bg-paper text-gold-deep md:row-span-2 md:grid';
            return (
              <div>
                {/* A heading, so the registers have something to answer to:
                   the story of the numbers is "room for more". */}
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">{t('facts.eyebrow')}</p>
                <h2 className="mt-3 max-w-2xl font-serif text-section text-balance text-ink sm:mt-4">
                  {t.rich('facts.title', { em: (chunks) => <Accent surface="paper">{chunks}</Accent> })}
                </h2>
                {/* Two up to md, THREE from lg (2026-09-18). The md pair keeps
                   its old [0.85fr 1.15fr] proportions because the architect
                   card carries a bleeding photograph and wants the wider
                   half; at lg all three are equal and the photo re-crops to
                   suit. gap-10 at lg rather than 16: three cards across the
                   same measure have less room to give away. */}
                <div className="mt-8 grid gap-9 md:mt-12 md:grid-cols-[0.85fr_1.15fr] md:gap-16 lg:grid-cols-3 lg:gap-10">
                  {/* Key figures */}
                  <div className={card}>
                    <div className="flex items-center gap-3">
                      <FigureIcon name="building" className="hidden h-[18px] w-[18px] shrink-0 text-gold-deep md:block" />
                      <h2 className={label}>{t('facts.heading')}</h2>
                      <span aria-hidden className="hidden h-px flex-1 bg-gold-deep/30 md:block" />
                    </div>
                    <dl className="mt-3 divide-y-[0.5px] divide-rule border-t border-ink md:mt-2 md:flex md:flex-1 md:flex-col md:divide-y-0 md:border-t-0">
                      {facts.map((f) => (
                        <div key={f.key} className={row}>
                          <span aria-hidden className={chip}>
                            <FigureIcon name={f.icon} className="h-[18px] w-[18px]" />
                          </span>
                          <dt className="text-[13px] text-ink-60 md:font-mono md:text-[0.625rem] md:uppercase md:leading-none md:tracking-[0.16em] md:text-ink-40">{f.label ?? t(`facts.${f.key}`)}</dt>
                          <dd className="flex items-baseline gap-1.5 text-end">
                            {f.muted ? (
                              <span className="text-[13px] italic text-ink-60">{f.value}</span>
                            ) : (
                              <span className="font-serif text-[1.35rem] leading-none tabular-nums text-ink md:text-[1.75rem]">{f.value}</span>
                            )}
                            {f.unit && <span className="font-mono text-[11px] tracking-[0.08em] text-ink-60">{f.unit}</span>}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                    {/* ══ ARKITEKT — built to the client's mock ═══════════
                       Client, 2026-09-18: "for the arhitect card, also follow
                       this style and design, the fade as we have now doesnt
                       looks good, make it exactly like the image i gave you".

                       So it matches the FASILITETER card's construction: its
                       own ground, radius and border rather than the section's
                       `card` class, a gold mark beside a DARK label, and the
                       photograph meeting the card's own edges.

                       ── NO FADE. A HARD EDGE. ──────────────────────────────
                       Every version before this softened the seam with a wash
                       — down the side, then across the top, then across the
                       bottom — and each one put a gradient somewhere on his
                       face. The mock does not soften it at all: type above,
                       a clean horizontal line, photograph below. That is both
                       what was asked for and the only version where nothing
                       is laid over the man.

                       ── THE CROP, FROM THE FACE ────────────────────────────
                       The source is 800x800 and his head runs y=100→600, 62%
                       of it. object-cover on a 339px-wide band scales that
                       square to 339 tall, so the head is 212px on screen.
                       At 16rem (256px) and object-position 0% — as much room
                       above his head as the photograph physically holds — the
                       hair lands at 42px and the chin at 254px. 16rem is the
                       FLOOR, not a preference: the chin sits at 254 and a
                       shorter band cuts it. The client asked for the card
                       compacted (2026-09-18) and this is as far as it goes
                       without losing his jaw again.

                       Below lg this card still shares a two-up row and keeps
                       the side panel the client approved; the phone keeps its
                       round thumbnail. */}
                    <div className="relative hidden flex-col overflow-hidden rounded-[1.25rem] border border-rule bg-gradient-to-b from-paper to-paper-2 shadow-[0_1px_2px_rgba(26,26,24,0.04),0_16px_36px_-26px_rgba(26,26,24,0.28)] p-6 lg:flex">
                      <div className="flex items-center gap-2.5">
                        {/* A pair of dividers — the mock's mark, and the one
                           tool that means "architect" without a caption. */}
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                          className="h-[17px] w-[17px] shrink-0 text-gold-deep"
                        >
                          <circle cx="12" cy="4.8" r="1.7" />
                          <path d="m11.1 6.3-4.6 14.2M12.9 6.3l4.6 14.2" />
                          <path d="M7.9 16.6a8.6 8.6 0 0 1 8.2 0" />
                        </svg>
                        <h2 className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-ink">
                          {t('facts.architect')}
                        </h2>
                        <span aria-hidden className="h-px flex-1 bg-rule" />
                      </div>

                      <p className="mt-4 font-serif text-[1.5rem] leading-[1.15] text-ink">
                        {CAMPAIGN.architect.split(',')[0]}
                      </p>
                      <p className="mt-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ink-60">
                        {CAMPAIGN.architect.split(',').slice(1).join(',').trim()}
                      </p>

                      {/* Client, 2026-09-18: "his chin cut off, why soo zoomed in? zoom
                       out his image so shoiulderns and hair, both ends visible".
                       The band is 339x256 and the source is square, so cover
                       scaled it to 339x339 and threw away 83px — the shoulders
                       entirely, leaving the chin 2px off the bottom edge.
                       Squaring the band would show all of it but push the card
                       415 -> 498 and drag the other two up with it, which is the
                       stretching they asked me to undo an hour ago. So the photo
                       contains instead: the whole 800x800 frame at 256, centred,
                       with 41px to either side. That gap is invisible because the
                       portrait sits on a near-black ground (sampled #0d0d0d at
                       every edge) and the band is painted the same value, so the
                       black still bleeds to the card edges. */}
                      <span className="relative -mx-6 -mb-6 mt-5 block h-[16rem] overflow-hidden bg-[#0d0d0d]">
                        {/* The fill behind the contained portrait. A flat black
                           left a seam: the photo is vignetted, so its own edge
                           runs from 4 to 18 depending on height, and no single
                           value matches all of it. This is the same file,
                           cover-scaled past the band and blurred, so whatever
                           sits beside the portrait is that portrait's own tone
                           at that height. Same URL, so no second request.
                           brightness .35 because the blur averages in the lit
                           face: ungraded it sat at 23-37 against a 13 edge, a
                           halo round the portrait. Graded it lands 2-5 BELOW
                           the edge at every height, which reads as the vignette
                           carrying on outward rather than as a box. */}
                        <Image
                          aria-hidden
                          src="/photos/architect-fagernes.webp"
                          alt=""
                          fill
                          sizes="24rem"
                          loading="eager"
                          className="scale-125 object-cover object-center blur-2xl brightness-[0.35]"
                        />
                        <Image
                          src="/photos/architect-fagernes.webp"
                          alt=""
                          fill
                          sizes="24rem"
            // loading="eager". These never loaded otherwise: the browser
            // issued ZERO requests for them, while every other image on the
            // page loaded normally — verified from resource timings, and
            // flipping one to eager in the console made it arrive instantly.
            // Native lazy-loading does not fire for them here, most likely
            // because the card is display:none until lg and sits below a
            // 640vh sticky scroll track, which is enough to confuse the
            // proximity heuristic. They are small and they are the card's
            // resting state, so there is nothing to defer anyway.
            loading="eager"
                          className="object-contain object-center"
                        />
                      </span>
                    </div>

                    {/* The md two-up version, unchanged: the side panel the
                       client approved before the row went to three. */}
                    <div className={cn(card, 'relative md:overflow-hidden lg:hidden')}>
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-y-0 end-0 hidden w-[42%] md:block"
                      >
                        <Image
                          src="/photos/architect-fagernes.webp"
                          alt=""
                          fill
                          sizes="20rem"
                          className="object-cover object-[50%_22%]"
                        />
                        <span className="absolute inset-0 bg-gradient-to-r from-paper-2 to-transparent to-55% rtl:bg-gradient-to-l" />
                      </span>

                      <div className="relative flex items-center gap-3 mt-8 md:mt-0 md:max-w-[60%]">
                        <FigureIcon name="building" className="hidden h-[18px] w-[18px] shrink-0 text-gold-deep md:block" />
                        <h2 className={label}>{t('facts.architect')}</h2>
                        <span aria-hidden className="hidden h-px flex-1 bg-gold-deep/30 md:block" />
                      </div>
                      <dl className="relative mt-3 border-t border-ink md:mt-2 md:max-w-[55%] md:border-t-0">
                        <div className={cn(row, 'md:min-h-0')}>
                          <dd className="flex items-center gap-4 leading-none md:py-14">
                            {/* Client, 2026-09-18: "for phone only, why his photo
                               so small? make it more bigger, but not so much".
                               64 -> 88px. 88 is the ceiling: the name measures
                               267px in Fraunces at 1.35rem, and a 430px phone
                               leaves 382 - 88 - 16 = 278 for it, so it holds its
                               single line with 11px to spare. 96 would leave 3.
                               scale-125 as well, because the source is square
                               and so is the circle: cover fits the whole frame,
                               which put his head at 63% of the plate with black
                               over it. At 125% the window is the middle 80% and
                               the head reads at 79%, which is what an avatar
                               wants. */}
                            <span className="relative block h-[5.5rem] w-[5.5rem] shrink-0 overflow-hidden rounded-full ring-1 ring-rule md:hidden">
                              <Image
                                src="/photos/architect-fagernes.webp"
                                alt=""
                                fill
                                sizes="88px"
                                className="scale-125 object-cover"
                              />
                            </span>
                            <span className="flex min-w-0 flex-col gap-1.5">
                              <span className="font-serif text-[1.35rem] text-ink md:text-[1.5rem]">{CAMPAIGN.architect.split(',')[0]}</span>
                              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-60">{CAMPAIGN.architect.split(',').slice(1).join(',').trim()}</span>
                            </span>
                          </dd>
                        </div>
                      </dl>
                    </div>

                  {/* ══ FASILITETER — the third card ═══════════════════════
                     Client, 2026-09-18: "Kanskje legge inn boks med
                     fasiliteter slik at det blir tre bokser i en rad."

                     ── IT SUMMARISES, IT DOES NOT RE-LIST ─────────────────
                     This page already answers "what does the building
                     contain" twice, and both times ABOVE this section: the
                     photo gallery names seven rooms, and FloorByFloor walks
                     all 26 across seven floors. A third plain list would be
                     the third time the page reads the same inventory out.

                     So it is six rooms and a count, and then it SENDS you to
                     the walkthrough — a table of contents, not a second
                     table. It also gives the page something it did not have:
                     a way back up to the floors from down here.

                     Why these six: the first three are the home page's own
                     promise — "Moské, skole, bibliotek. Én adresse." — shown
                     to be literally true. The last three are what nobody
                     expects a mosque to contain.

                     The card itself lives in components/facilities-card.tsx
                     because pointing at a room reveals a photograph of it,
                     and knowing which row is under the pointer is state. The
                     card's own file carries the rest of the reasoning.

                     It no longer takes the section's `card` and `label`
                     classes: the client supplied a mock on 2026-09-18 and
                     asked for it copied exactly, so the card now carries its
                     own ground, radius, chips and label colour. Where the
                     mock and this section's language disagree, the mock
                     wins — see the note at the head of the component. */}
                  <FacilitiesCard />
                </div>

              </div>
            );
          })()}
        </SectionBody>
        </div>
      </section>


      {/* The apartments band closes the page where the sadaqa section used
         to (client, 2026-09-04) — the sadaqa band itself is off:
      <MotionRise><SadaqaBand /></MotionRise> */}
      <ApartmentsCta locale={locale as AppLocale} />


{/* Ways to give and the assurance list were removed from this page on
         2026-08-30 (client request); both still run on the other project pages. */}
    </main>
  );
}
