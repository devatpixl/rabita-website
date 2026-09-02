import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { CAMPAIGN } from '@/lib/campaign';
import { ProgressPhases } from '@/components/progress-phases';
import type { AppLocale } from '@/i18n/routing';
import { FigureIcon, type FigureIconName } from '@/components/figure-icons';
import { cn } from '@/lib/cn';
import { Section, SectionBody } from '@/components/primitives';
import { BuildingRises } from '@/components/building-rises';
import { ApartmentsCta } from '@/components/apartments-cta';
import { GiftBuilds } from '@/components/gift-builds';
import { ProjectGallery } from '@/components/project-gallery';
import { GivingCard } from '@/components/giving-card';
import { MotionRise } from '@/components/motion-rise';
import { SadaqaBand } from '@/components/sadaqa-band';

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
        secondary={{ label: tp('pages.building.secondary'), href: `/${locale}/hvor-pengene-gar` }}
        aside={
          // The whole giving flow, in place: amounts, details, payment, all
          // inside the hero card, earmarked for the building.
          <div className="overflow-hidden rounded-2xl border border-paper/15 bg-paper text-ink shadow-[0_24px_60px_-28px_rgba(0,0,0,0.6)]">
            <p className="flex items-center gap-2 border-b border-rule bg-paper-2 px-6 py-2.5 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-gold-deep">
              <span aria-hidden className="inline-block h-1.5 w-1.5 rotate-45 bg-gold-deep" />
              {t('giveBox.eyebrow')}
            </p>
            <GivingCard presets={[20, 150, 500, 1000]} recommended={150} defaultAmount={150} purpose="building" compact />
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
      {/* The build, program by program. Moved here from the homepage, where
         it was 800vh of a 25-viewport page — the deepest content on the site
         sitting on the page that is meant to introduce things. */}
      <BuildingRises />

      {/* The renders, as a gallery. Replaced the single aerial plate on
         2026-08-30: the client wanted the whole set, paged with arrows,
         each with a line of context — set inside the picture rather than
         beside it, so the render keeps the full width. */}
      <section className="bg-paper-2 pb-section-md">
        <SectionBody>
          <ProjectGallery />
        </SectionBody>
      </section>

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
        </SectionBody>
      </Section>

      <Section tone="paper">
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
              icon: FigureIconName;
              value: string;
              unit?: string;
              muted?: boolean;
            }[] = [
              { key: 'building', icon: 'building', value: nf.format(CAMPAIGN.buildingM2), unit: 'm²' },
              { key: 'floors', icon: 'floors', value: `${CAMPAIGN.floorsAbove}+${CAMPAIGN.floorsBelow}` },
              { key: 'startConstruction', icon: 'calendar', value: CAMPAIGN.constructionStart },
              CAMPAIGN.completionDate
                ? { key: 'completion', icon: 'check', value: CAMPAIGN.completionDate }
                : { key: 'completion', icon: 'check', value: t('facts.completionTbd'), muted: true },
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
                          <dt className="text-[13px] text-ink-60">{t(`facts.${f.key}`)}</dt>
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

                  {/* Capacity, then the school as its own register */}
                  <div className="md:space-y-6">
                    <div className={card}>
                    <div className="flex items-center gap-3">
                      <FigureIcon name="people" className="hidden h-[18px] w-[18px] shrink-0 text-gold-deep md:block" />
                      <h2 className={label}>{t('capacity.heading')}</h2>
                      <span aria-hidden className="hidden h-px flex-1 bg-gold-deep/30 md:block" />
                    </div>
                    <dl className="mt-3 border-t border-ink md:mt-2 md:space-y-2.5 md:border-t-0">
                      {cap.map((c) => (
                        <div
                          key={c.key}
                          className={cn(
                            row,
                            'flex-col items-start gap-2 md:flex-row md:items-center',
                            // the phone's hairline, set on the row rather than
                            // by divide-* — see the note on the <dl>
                            '[&:not(:first-child)]:border-t-[0.5px] [&:not(:first-child)]:border-t-rule',
                            // the inset panel from the mockup, gold edge first
                            'md:rounded-lg md:border-s-2 md:border-gold-deep md:bg-paper md:px-4 md:[&:not(:first-child)]:border-t-0',
                          )}
                        >
                          <span aria-hidden className={chip}>
                            <FigureIcon name="person" className="h-[18px] w-[18px]" />
                          </span>
                          <dt className="text-[13px] text-ink-60 md:w-[7.5rem] md:shrink-0">{t(`capacity.${c.key}`)}</dt>
                          <dd className="flex w-full flex-1 items-baseline gap-3 leading-none md:w-auto">
                            <span className="font-serif text-[1.1rem] tabular-nums text-ink-60">{nf.format(c.before)}</span>
                            <span aria-hidden className="text-ink-60 rtl:rotate-180">&rarr;</span>
                            <span className="font-serif italic text-[clamp(2.25rem,3.6vw,3rem)] tabular-nums text-gold-deep">{nf.format(c.after)}</span>
                            <span className="ms-auto shrink-0 font-mono text-[0.6875rem] tracking-[0.14em] text-gold-deep md:hidden">
                              {Math.round(c.after / c.before)}×
                            </span>
                          </dd>
                          <span className="hidden shrink-0 font-mono text-[0.6875rem] tracking-[0.14em] text-gold-deep md:inline">
                            {Math.round(c.after / c.before)}×
                          </span>
                        </div>
                      ))}
                    </dl>

                    {/* The architect, as its own register where the school
                       block used to be; the credit line at the foot is gone. */}
                    </div>

                    <div className={card}>
                    <div className="flex items-center gap-3 mt-8 md:mt-0">
                      <FigureIcon name="building" className="hidden h-[18px] w-[18px] shrink-0 text-gold-deep md:block" />
                      <h2 className={label}>{t('facts.architect')}</h2>
                      <span aria-hidden className="hidden h-px flex-1 bg-gold-deep/30 md:block" />
                    </div>
                    <dl className="mt-3 border-t border-ink md:mt-2 md:border-t-0">
                      <div className={cn(row, 'md:min-h-0')}>
                        <dd className="flex flex-col gap-1 leading-none">
                          <span className="font-serif text-[1.35rem] text-ink md:text-[1.5rem]">{CAMPAIGN.architect.split(',')[0]}</span>
                          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-60">{CAMPAIGN.architect.split(',').slice(1).join(',').trim()}</span>
                        </dd>
                      </div>
                    </dl>
                    </div>
                  </div>
                </div>

              </div>
            );
          })()}
        </SectionBody>
      </Section>

      {/* The same four gifts as a dark card grid. Swapped in for the row
         version, which moved to the homepage — both read the same
         `giftLadder` copy, so this is purely a change of treatment. */}
      <ApartmentsCta locale={locale as AppLocale} />

      <GiftBuilds />

      {/* Sadaqa jariya — a prayer space given in someone's name. Moved here
         from the homepage (2026-08-30): the ask belongs next to the gifts
         that build the hall. */}
      <MotionRise><SadaqaBand /></MotionRise>

{/* Ways to give and the assurance list were removed from this page on
         2026-08-30 (client request); both still run on the other project pages. */}
    </main>
  );
}
