import { getLocale, getTranslations } from 'next-intl/server';
import { CAMPAIGN, PHASES, SUB_CAMPAIGN, currentPhaseKey } from '@/lib/campaign';
import { formatAmount, formatDate } from '@/lib/format';
import type { AppLocale } from '@/i18n/routing';
import { AnimatedProgress } from './animated-progress';
import { Counter } from './counter';
import { GiveCTA } from './give-cta';
import { Accent } from './accent';
import { PhasePopover, type PhaseStep } from './phase-popover';

// Byggeregnskap, rebuilt 2026-08-30 on the pattern every large fundraising
// platform has converged on (GoFundMe, Kickstarter, JustGiving, charity:
// water): ONE raised figure, "of goal", ONE bar with the percentage, a
// short row of supporting stats, ONE button.
//
// What went: the 100-mark lattice, the three-year funding scale and the
// sub-campaign card — three more ways of saying the same thing, which is
// what the client found confusing. The sub-campaign survives as a single
// stat, and "last month" is now the second-largest figure on the page,
// because "how much, and how is it moving" is the question this section
// answers. Every figure comes from lib/campaign.ts.
export async function CampaignMeter() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations('meter');
  const tPhase = await getTranslations('meter.phases');

  const raised = CAMPAIGN.raisedNok;
  const goal = CAMPAIGN.goalNok;
  const pct = goal > 0 ? Math.min(100, (raised / goal) * 100) : 0;
  const pctInt = Math.round(pct);
  const subPct = SUB_CAMPAIGN.goalNok > 0 ? Math.round((SUB_CAMPAIGN.raisedNok / SUB_CAMPAIGN.goalNok) * 100) : 0;
  const phase = PHASES.find((p) => p.key === currentPhaseKey());

  // The roadmap shown on hover over the goal and the phase: the three build
  // years, each marked done / now / to come relative to the current phase.
  const currentIdx = PHASES.findIndex((p) => p.key === currentPhaseKey());
  const steps: PhaseStep[] = PHASES.map((p, i) => ({
    year: String(p.year),
    name: tPhase(p.key),
    note: t(`phaseNotes.${p.key}`),
    state: i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'next',
  }));

  return (
    <section id="byggeregnskap" aria-labelledby="meter-heading" className="bg-paper-2 py-10 md:py-section-md lg:py-section-lg">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <h2 id="meter-heading" className="font-serif text-section text-balance text-ink">
          {t.rich('eyebrow', {
            em: (chunks) => <Accent surface="paper">{chunks}</Accent>,
          })}
        </h2>

        {/* Raised and goal as two figures on one baseline — the goal is the
           other half of the story, so it is set in the same serif rather
           than as a caption. The button closes the row. */}
        <div className="mt-6 flex flex-col gap-6 md:mt-8 md:flex-row md:items-end md:justify-between md:gap-12">
          <dl className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-12">
            <div>
              <dd className="flex items-baseline gap-2 font-serif leading-none tabular-nums tracking-[-0.025em] text-ink">
                <span className="text-[clamp(2.35rem,5.5vw,5.5rem)]">
                  <Counter to={raised} locale={locale} />
                </span>
                <span className="text-2xl text-ink-60 md:text-3xl">kr</span>
              </dd>
              <dt className="mt-2 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-60 md:mt-3">
                {t('label')}
              </dt>
            </div>
            <div className="sm:border-s sm:border-rule sm:ps-12">
              {/* The goal in the site's accent — gold italic — so the two
                 figures read as "what we have" and "what we are reaching
                 for" rather than two of the same. */}
              <dd>
                <PhasePopover steps={steps} label={t('roadmap')} currentLabel={t('now')}>
                  <span className="flex items-baseline gap-2 font-serif italic leading-none tabular-nums tracking-[-0.02em] text-gold-deep">
                    <span className="text-[clamp(1.65rem,3.2vw,3.25rem)]">{formatAmount(locale, goal)}</span>
                    <span className="text-xl md:text-2xl">kr</span>
                  </span>
                </PhasePopover>
              </dd>
              <dt className="mt-2 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-60 md:mt-3">
                {t('goalLabel')}
              </dt>
            </div>
          </dl>

          <div className="shrink-0">
            <GiveCTA label={t('give')} />
          </div>
        </div>

        {/* The bar. One fill, the percentage at its head, the goal at the end. */}
        <div className="mt-7 md:mt-10">
          <div className="mb-2 flex items-baseline justify-between font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-60">
            <span className="tabular-nums text-gold-deep">{pctInt} %</span>
            <span className="tabular-nums">{t('remaining', { amount: formatAmount(locale, Math.max(0, goal - raised)) })}</span>
          </div>
          <AnimatedProgress
            percent={pct}
            className="h-2.5 rounded-full bg-paper"
            fillClassName="rounded-full bg-gradient-to-r from-gold to-gold-deep"
          />
        </div>

        {/* Supporting stats. One ruled row from sm; on a phone the first two
           sit two-up with a hairline between them and the phase runs full
           width beneath, because three stacked rows of one figure each was
           most of the second screen of this section (client, 2026-08-30).
           Movement first: it is the figure the reader compares to the total. */}
        <dl className="mt-7 grid grid-cols-2 gap-x-5 gap-y-5 border-t border-rule pt-6 sm:mt-10 sm:grid-cols-3 sm:gap-x-8 sm:pt-7">
          <div>
            <dd className="font-serif text-[clamp(1.6rem,2.6vw,2.25rem)] leading-none tabular-nums text-gold-deep">
              +{formatAmount(locale, CAMPAIGN.lastMonthNok)} kr
            </dd>
            <dt className="mt-2 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-60">
              {t('lastMonthLabel')}
            </dt>
          </div>
          <div className="border-s border-rule ps-5 sm:ps-8">
            <dd className="font-serif text-[clamp(1.6rem,2.6vw,2.25rem)] leading-none tabular-nums text-ink">
              {subPct} %
            </dd>
            <dt className="mt-2 max-w-[26ch] font-mono text-[0.6875rem] uppercase leading-snug tracking-[0.14em] text-ink-60">
              {t('subLabel', { name: SUB_CAMPAIGN.name, year: phase?.year ?? '' })}
              <br />
              <span className="normal-case tracking-normal">
                {t('subValue', {
                  raised: formatAmount(locale, SUB_CAMPAIGN.raisedNok),
                  goal: formatAmount(locale, SUB_CAMPAIGN.goalNok),
                })}
              </span>
            </dt>
          </div>
          <div className="col-span-2 border-t border-rule pt-5 sm:col-span-1 sm:border-t-0 sm:border-s sm:border-rule sm:ps-8 sm:pt-0">
            <dd>
              <PhasePopover steps={steps} label={t('roadmap')} currentLabel={t('now')} align="end">
                <span className="block font-serif text-[clamp(1.6rem,2.6vw,2.25rem)] leading-none text-ink">
                  {tPhase(phase?.key ?? 'fundament')}
                </span>
              </PhasePopover>
            </dd>
            <dt className="mt-2 flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-60">
              <span className="pulse-dot text-gold-deep" aria-hidden />
              {t('updated', { date: formatDate(locale, CAMPAIGN.raisedAsOf) })}
            </dt>
          </div>
        </dl>
      </div>
    </section>
  );
}
