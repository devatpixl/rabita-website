import { getLocale, getTranslations } from 'next-intl/server';
import { CAMPAIGN, PHASES, SUB_CAMPAIGN, currentPhaseKey, type PhaseKey } from '@/lib/campaign';
import { formatAmount, formatDate } from '@/lib/format';
import type { AppLocale } from '@/i18n/routing';
import { AnimatedProgress } from './animated-progress';
import { FundingScale } from './funding-scale';
import { GoalLattice } from './goal-lattice';
import { Counter } from './counter';
import { GiveCTA } from './give-cta';
import { Accent } from './accent';

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

  const subPct =
    SUB_CAMPAIGN.goalNok > 0
      ? Math.min(100, (SUB_CAMPAIGN.raisedNok / SUB_CAMPAIGN.goalNok) * 100)
      : 0;
  const subPctInt = Math.floor(subPct);

  const active: PhaseKey = currentPhaseKey();

  return (
    <section id="byggeregnskap" aria-labelledby="meter-heading" className="bg-paper-2 py-section-md md:py-section-sm">
      <div className="mx-auto max-w-6xl px-6">
        {/* A real heading, in the section serif, rather than a mono
           small-caps dateline. The <h2> used to be the NUMBER, which left
           the section with no sentence at all — a first-time reader met
           26 995 179 with nothing saying what it counted. The sentence is
           the heading now and the figure sits under it. */}
        <h2 id="meter-heading" className="font-serif text-section text-balance text-ink">
          {/* surface="paper" — this section is on --paper-2, so the accent
             takes gold-deep for contrast on a warm neutral rather than the
             brighter gold reserved for dusk. */}
          {t.rich('eyebrow', {
            em: (chunks) => <Accent surface="paper">{chunks}</Accent>,
          })}
        </h2>

        {/* HEAD: the total, and the figures that qualify it, on one baseline. */}
        {/* No bottom rule here. The schedule below draws its own hairline,
           so this one put two parallel lines a few pixels apart. The
           padding went with it — mt-10 on the schedule is now the only
           thing setting the gap. */}
        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-12">
          <div className="shrink-0">
            <p className="flex items-baseline gap-3 font-serif leading-none tabular-nums text-ink tracking-[-0.025em] md:whitespace-nowrap">
              {/* 4.4vw, not 7.5. At 7.5vw the middle term overtook the 5rem
                 cap at about 1067px, so a 13-inch laptop and a 27-inch
                 monitor both rendered the same 80px — the figure could only
                 ever be "too big" or "too small", never proportional. At
                 4.4vw the cap is reached around 1820px, so the number
                 actually scales across the laptop range: ~63px at 1440,
                 ~67px at 1512, and still the full 80px on a large screen. */}
              <span className="text-[clamp(2.75rem,4.4vw,5rem)]">
                <Counter to={raised} locale={locale} />
              </span>
              <span className="font-serif text-3xl md:text-4xl text-ink-60">kr</span>
            </p>
            {/* Provenance for the figure, sitting under it rather than
               above the section. The live dot keeps its job of saying the
               total is maintained, not carved. */}
            <p className="mt-3 flex items-center gap-2 text-[13px] text-ink-60">
              <span className="pulse-dot text-gold-deep" aria-hidden />
              {t('updated', { date: formatDate(locale, CAMPAIGN.raisedAsOf) })}
            </p>
          </div>

          {/* Qualifiers sit as a small table so the numbers line up under each other. */}
          <dl className="grid gap-x-10 gap-y-4 sm:grid-cols-2 sm:gap-y-4 md:text-end">
            <div>
              <dt className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-ink-60">
                {t('goalLabel')}
              </dt>
              <dd className="mt-1 font-serif text-[1.15rem] leading-none tabular-nums text-ink md:whitespace-nowrap md:text-[1.5rem]">
                {formatAmount(locale, goal)} kr
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-ink-60">
                {tPhase(active)} · {PHASES.find((p) => p.key === active)?.year}
              </dt>
              <dd className="mt-1 font-serif text-[1.15rem] leading-none tabular-nums text-gold-deep md:whitespace-nowrap md:text-[1.5rem]">
                {t('lastMonth', { amount: formatAmount(locale, CAMPAIGN.lastMonthNok) })}
              </dd>
            </div>
          </dl>
        </div>

        {/* SCALE: the build years as equal bands, with the run showing how
           much of the goal is raised. */}
        <FundingScale
          className="mt-10"
          percent={pct}
          stations={PHASES.map((p, i) => ({
            at: (i * 100) / PHASES.length,
            year: String(p.year),
            label: tPhase(p.key),
            current: p.key === active,
          }))}
        />

        {/* FOOT: lattice beside the sub-campaign card, both closing level. */}
        <div className="mt-8 grid gap-8 md:grid-cols-12 md:items-stretch md:gap-12">
          <div className="md:col-span-7 md:self-start">
            <GoalLattice
              percent={pct}
              caption={t('lattice')}
            />
          </div>

          {/* Desktop only. On a phone this card followed the main total with
             a second total, a second bar, a second percentage and a second
             ask, and the reader had already been given all of that above. The
             page keeps one number on a phone. */}
          <aside className="hidden flex-col rounded-2xl bg-paper p-7 md:col-span-5 md:flex md:p-8">
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
              className="mt-6 h-2 rounded bg-paper-2"
              fillClassName="bg-gradient-to-r from-gold to-gold-deep rounded"
            />
            <p className="mt-3 font-mono text-[0.75rem] uppercase tracking-[0.14em] tabular-nums text-ink-60">
              {subPctInt} % {t('financed')}
            </p>

            <p className="mt-5 max-w-prose text-[15px] leading-relaxed text-ink-60">
              {t('sub.body')}
            </p>

            <div className="mt-auto pt-6">
              <GiveCTA label={t('give')} fullWidth />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
