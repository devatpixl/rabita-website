import { getLocale, getTranslations } from 'next-intl/server';
import { CAMPAIGN, PHASES, SUB_CAMPAIGN, currentPhaseKey, type PhaseKey } from '@/lib/campaign';
import { formatAmount, formatDate } from '@/lib/format';
import type { AppLocale } from '@/i18n/routing';
import { AnimatedProgress } from './animated-progress';
import { FundingScale } from './funding-scale';
import { GoalLattice } from './goal-lattice';
import { Counter } from './counter';
import { GiveCTA } from './give-cta';

// Byggeregnskap, read as a ledger page rather than two unrelated columns.
//   HEAD    total on the left, the figures that qualify it on the right,
//           closed by a hairline. Both sides sit on one baseline.
//   SCALE   the three build years as equal bands across the full measure.
//   FOOT    the 100-mark lattice (7 cols) beside the sub-campaign card (5).
// The old layout ran the left column past the bottom of the right one and
// left a screen-height hole under the card. Everything here is measured
// full width, so the section closes level.
// Every figure comes from lib/campaign.ts. Fill widths are computed, never
// hardcoded. Bar and counter animate on view, reduced motion respected via
// AnimatedProgress + Counter.
export async function CampaignMeter() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations('meter');
  const tPhase = await getTranslations('meter.phases');

  const raised = CAMPAIGN.raisedNok;
  const goal = CAMPAIGN.goalNok;
  const pct = goal > 0 ? Math.min(100, (raised / goal) * 100) : 0;
  const pctInt = Math.floor(pct);

  const subPct =
    SUB_CAMPAIGN.goalNok > 0
      ? Math.min(100, (SUB_CAMPAIGN.raisedNok / SUB_CAMPAIGN.goalNok) * 100)
      : 0;
  const subPctInt = Math.floor(subPct);

  const active: PhaseKey = currentPhaseKey();

  return (
    <section id="byggeregnskap" aria-labelledby="meter-heading" className="bg-paper py-section-lg">
      <div className="mx-auto max-w-6xl px-6">
        {/* Eyebrow row: gold-deep pulse dot + mono editorial dateline. */}
        <div className="mb-12 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-60">
          <span className="pulse-dot text-gold-deep" aria-hidden />
          <span className="text-gold-deep">{t('eyebrow')}</span>
          <span aria-hidden className="text-ink-40">·</span>
          <span>{t('updated', { date: formatDate(locale, CAMPAIGN.raisedAsOf) })}</span>
        </div>

        {/* HEAD: the total, and the figures that qualify it, on one baseline. */}
        <div className="flex flex-col gap-8 border-b border-rule pb-10 md:flex-row md:items-end md:justify-between md:gap-12">
          <div className="shrink-0">
            <div className="mb-5 flex items-center gap-3">
              <span aria-hidden className="h-px w-10 bg-gold" />
              <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-gold-deep">
                {t('label')}
              </span>
            </div>

            <h2
              id="meter-heading"
              className="flex items-baseline gap-3 font-serif leading-none tabular-nums text-ink tracking-[-0.025em] md:whitespace-nowrap"
            >
              <span className="text-[clamp(3rem,7.5vw,5rem)]">
                <Counter to={raised} locale={locale} />
              </span>
              <span className="font-serif text-3xl md:text-4xl text-ink-60">kr</span>
            </h2>
          </div>

          {/* Qualifiers sit as a small table so the numbers line up under each other. */}
          <dl className="grid gap-x-10 gap-y-6 sm:grid-cols-2 sm:gap-y-4 md:text-end">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-60">
                {t('of')} {formatAmount(locale, goal)} kr
              </dt>
              <dd className="mt-1 font-serif text-[1.5rem] leading-none tabular-nums text-ink md:whitespace-nowrap">
                {pctInt} %{' '}
                <span className="font-sans text-[13px] font-normal text-ink-60">
                  {t('financed')}
                </span>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-60">
                {tPhase(active)} · {PHASES.find((p) => p.key === active)?.year}
              </dt>
              <dd className="mt-1 font-serif text-[1.5rem] leading-none tabular-nums text-gold-deep md:whitespace-nowrap">
                {t('lastMonth', { amount: formatAmount(locale, CAMPAIGN.lastMonthNok) })}
              </dd>
            </div>
          </dl>
        </div>

        {/* SCALE: the build years as equal bands across the full measure. */}
        <FundingScale
          className="mt-14"
          percent={pct}
          pctLabel={`${pctInt} %`}
          stations={PHASES.map((p, i) => ({
            at: (i * 100) / PHASES.length,
            year: String(p.year),
            label: tPhase(p.key),
            current: p.key === active,
          }))}
        />

        {/* FOOT: lattice beside the sub-campaign card, both closing level. */}
        <div className="mt-20 grid gap-12 md:grid-cols-12 md:items-stretch md:gap-16">
          <div className="md:col-span-7 md:self-center">
            <GoalLattice
              percent={pct}
              caption={t('lattice')}
              countLabel={t('latticeCount', { lit: pctInt })}
            />
          </div>

          <aside className="flex flex-col rounded-2xl bg-paper-2 p-8 md:col-span-5 md:p-10">
            <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-gold-deep">
              {t('sub.label')} · {SUB_CAMPAIGN.name}
            </p>
            <p className="mt-6 flex items-baseline gap-3 font-serif tabular-nums text-ink">
              <span className="text-[clamp(2rem,4vw,2.5rem)] leading-none tracking-[-0.02em]">
                {formatAmount(locale, SUB_CAMPAIGN.raisedNok)}
              </span>
              <span className="text-[14px] text-ink-60 tabular-nums">
                / {formatAmount(locale, SUB_CAMPAIGN.goalNok)} kr
              </span>
            </p>

            <AnimatedProgress
              percent={subPct}
              className="mt-6 h-2 rounded bg-paper"
              fillClassName="bg-gradient-to-r from-gold to-gold-deep rounded"
            />
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] tabular-nums text-ink-60">
              {subPctInt} % {t('financed')}
            </p>

            <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-ink-60">
              {t('sub.body')}
            </p>

            <div className="mt-auto pt-8">
              <GiveCTA label={t('give')} fullWidth />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
