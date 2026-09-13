import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
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
import { GiveCTA } from '@/components/give-cta';
import { ProjectGallery } from '@/components/project-gallery';
import { GivingCard } from '@/components/giving-card';
// import { MotionRise } from '@/components/motion-rise'; // hidden sadaqa band
import { FloorByFloor } from '@/components/floor-by-floor';
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
  const PLACES = new Intl.NumberFormat('nb-NO').format(
    CAMPAIGN.mensPrayerCapacityAfter + CAMPAIGN.womensPrayerCapacityAfter,
  );

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
        lede={tp('pages.building.lede', { places: PLACES })}
        ledeShort={tp('pages.building.ledeShort', { places: PLACES })}
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
            <GivingCard purpose="building" fit />
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

      {/* Fremdrift, in digest. Sits here deliberately: the renders above
         answer "what will it look like", the key figures below open with
         Byggestart and Ferdigstillelse, and "when" belongs between the two.
         The totals are dropped (compact) because the campaign meter has
         already given a figure further up — the full page carries them. */}
      <Section tone="paper">
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
            {/* The site's own outline pill, the one used for every secondary
               action on paper (events, prayer visit) — not a third button
               shape invented for this one link. Outline rather than filled:
               it sits on a page whose filled gold buttons all mean "give",
               and this one only means "read on". */}
            <Link
              href={`/${locale}/moskeprosjektet/fremdrift`}
              className="group inline-flex min-h-12 shrink-0 items-center gap-2.5 rounded-full border border-ink px-6 py-3 text-[15px] font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              {tf('seeAll')}
              <span
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
              >
                &rarr;
              </span>
            </Link>
          </div>
          <div className="mt-12 md:mt-16">
            <ProgressPhases locale={locale as AppLocale} compact />
          </div>

          {/* The ask, under the costs (client, 2026-09-13: "add cta here").
             This is the moment for it: the reader has just been shown what
             each of five phases costs, and the next honest sentence is that
             people pay for them.

             No new copy. fremdrift.ctaHeading / ctaBody / ctaPrimary /
             ctaSecondary were written for this and translated into all three
             locales, and were rendering nowhere — not here, not even on the
             fremdrift page itself.

             Gold for the give, outline for the read-on, which is the rule
             the link at the head of this section already follows. */}
          <div className="mt-12 border-t border-rule pt-9">
            <div className="mx-auto max-w-xl text-center">
              <h3 className="font-serif text-[clamp(1.4rem,2.4vw,1.9rem)] leading-tight text-balance text-ink">
                {tf('ctaHeading')}
              </h3>
              <p className="mx-auto mt-3 max-w-[46ch] text-body text-ink-60">{tf('ctaBody')}</p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <GiveCTA label={tf('ctaPrimary')} />
                <Link
                  href={`/${locale}/hvor-pengene-gar`}
                  className="group inline-flex min-h-12 items-center gap-2.5 rounded-full border border-ink px-6 py-3 text-[15px] font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
                >
                  {tf('ctaSecondary')}
                  <span
                    aria-hidden
                    className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                  >
                    &rarr;
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </SectionBody>
      </Section>

      {/* Sage ground for the facts (client, 2026-09-04) — the same pale
         green the "Dette er Rabita" and follow sections own. The section
         above is paper, so the ground arrives through a tall soft gradient
         instead of a hard seam: the fade IS the space between the two. */}
      <section className="bg-[#e3eae4]">
        <div aria-hidden className="h-28 bg-gradient-to-b from-paper to-[#e3eae4] md:h-40" />
        <div className="pb-section-md">
        <SectionBody>
          {/* Key figures and capacity as two registers of the same design:
             mono label, 1px rule, hairline rows on one rhythm, serif values
             like the hero. Capacity carries the larger type (it is the data
             that matters most here) and the wider column. The architect is
             a credit, not a figure, so it signs the section at the foot. */}
          {(() => {
            const nf = new Intl.NumberFormat('nb-NO');
            const cap = [
              { key: 'women', before: CAMPAIGN.womensPrayerCapacityBefore, after: CAMPAIGN.womensPrayerCapacityAfter },
              { key: 'men', before: CAMPAIGN.mensPrayerCapacityBefore, after: CAMPAIGN.mensPrayerCapacityAfter },
            ] as const;
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
              { key: 'floors', icon: 'floors', value: `${CAMPAIGN.floorsAbove} + U${CAMPAIGN.floorsBelow}` },
              { key: 'startConstruction', icon: 'calendar', value: CAMPAIGN.constructionStart },
              // Completion came out and capacity came in, in the same slot
              // (client, 2026-09-13). The card that carried the two prayer
              // figures beside this register is gone, so its one number that
              // matters sits here on a single line — derived from the very
              // constants that card read, so the two cannot drift apart.
              // facts.completion* stay in the message files, unreferenced.
              {
                key: 'capacity',
                label: t('capacity.heading'),
                icon: 'people',
                value: nf.format(
                  CAMPAIGN.womensPrayerCapacityAfter + CAMPAIGN.mensPrayerCapacityAfter,
                ),
                unit: t('capacity.people'),
              },
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
            const row =
              'flex items-baseline justify-between gap-4 py-3.5 md:min-h-[4.5rem] md:items-center md:gap-5 md:py-3';
            // The card treatment the client asked for (2026-08-31), taken from
            // their mockup: a bordered plate per register, a mark beside every
            // figure, a gold rule off each register's label, and the capacity
            // rows set as inset panels.
            //
            // Every class here is md:-prefixed. The phone keeps the plain
            // ruled registers it has now — the client was explicit about that,
            // and a 40px chip beside a 13px label on a 390px screen would cost
            // the label its line anyway.
            const card = 'md:rounded-2xl md:border md:border-rule md:bg-paper-2/50 md:p-7';
            const chip =
              'hidden h-10 w-10 shrink-0 place-items-center rounded-lg border border-rule bg-paper text-gold-deep md:grid';
            const leader = 'hidden h-px flex-1 bg-rule md:block';
            return (
              <div>
                {/* A heading, so the registers have something to answer to:
                   the story of the numbers is "room for more". */}
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">{t('facts.eyebrow')}</p>
                <h2 className="mt-3 max-w-2xl font-serif text-section text-balance text-ink sm:mt-4">
                  {t.rich('facts.title', { em: (chunks) => <Accent surface="paper">{chunks}</Accent> })}
                </h2>
                <div className="mt-8 grid gap-9 md:mt-12 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
                  {/* Key figures */}
                  <div className={card}>
                    <div className="flex items-center gap-3">
                      <FigureIcon name="building" className="hidden h-[18px] w-[18px] shrink-0 text-gold-deep md:block" />
                      <h2 className={label}>{t('facts.heading')}</h2>
                      <span aria-hidden className="hidden h-px flex-1 bg-gold-deep/30 md:block" />
                    </div>
                    <dl className="mt-3 divide-y-[0.5px] divide-rule border-t border-ink md:mt-2 md:border-t-0">
                      {facts.map((f) => (
                        <div key={f.key} className={row}>
                          <span aria-hidden className={chip}>
                            <FigureIcon name={f.icon} className="h-[18px] w-[18px]" />
                          </span>
                          <dt className="text-[13px] text-ink-60">{f.label ?? t(`facts.${f.key}`)}</dt>
                          <span aria-hidden className={leader} />
                          <dd className="flex items-baseline gap-1.5 text-end">
                            {f.muted ? (
                              <span className="text-[13px] italic text-ink-60">{f.value}</span>
                            ) : (
                              <span className="font-serif text-[1.35rem] leading-none tabular-nums text-ink md:text-[1.5rem]">{f.value}</span>
                            )}
                            {f.unit && <span className="font-mono text-[11px] tracking-[0.08em] text-ink-60">{f.unit}</span>}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                    <div className={cn(card, 'relative md:overflow-hidden')}>
                    {/* The end panel: the photograph, bleeding off top,
                       bottom and end, with paper fading over its start edge.
                       Desktop only — on phones this register is a plain row
                       and a bleed has no card to bleed from. */}
                    <span aria-hidden className="pointer-events-none absolute inset-y-0 end-0 hidden w-[42%] md:block">
                      <Image
                        src="/photos/architect-fagernes.webp"
                        alt=""
                        fill
                        sizes="20rem"
                        className="object-cover object-[50%_22%]"
                      />
                      {/* The fade dies at 55% of the panel — past that the
                         photograph stands at full strength, so the face is
                         never behind a wash. */}
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
                          {/* Phones keep the round portrait; the bleed panel
                             replaces it from md. */}
                          <span className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-full ring-1 ring-rule md:hidden">
                            <Image
                              src="/photos/architect-fagernes.webp"
                              alt=""
                              fill
                              sizes="64px"
                              className="object-cover"
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
                </div>

              </div>
            );
          })()}
        </SectionBody>
        </div>
      </section>

      <GiftBuilds />

      {/* The apartments band closes the page where the sadaqa section used
         to (client, 2026-09-04) — the sadaqa band itself is off:
      <MotionRise><SadaqaBand /></MotionRise> */}
      <ApartmentsCta locale={locale as AppLocale} />


{/* Ways to give and the assurance list were removed from this page on
         2026-08-30 (client request); both still run on the other project pages. */}
    </main>
  );
}
