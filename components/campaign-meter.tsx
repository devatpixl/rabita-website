import { getLocale, getTranslations } from 'next-intl/server';
import { CAMPAIGN, PHASES, SUB_CAMPAIGN, currentPhaseKey, type PhaseKey } from '@/lib/campaign';
import { formatAmount, formatDate } from '@/lib/format';
import type { AppLocale } from '@/i18n/routing';
import { AnimatedProgress } from './animated-progress';
import { Counter } from './counter';
import { GiveCTA } from './give-cta';
import { cn } from '@/lib/cn';

// Byggeregnskap layout — two columns on paper.
//   LEFT (1.35fr)  main total + segmented 3-phase bar with year labels
//   RIGHT (1fr)    sub-campaign card on paper-2 with thin bar + CTA
// Every figure sourced from lib/campaign.ts. Fill widths computed, not
// hardcoded. Bar + counter animate on view (~800ms), reduced-motion
// respected via AnimatedProgress + Counter.
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

  const active: PhaseKey = currentPhaseKey();

  return (
    <section id="byggeregnskap" aria-labelledby="meter-heading" className="bg-paper py-section-lg md:py-32">
      <div className="shell">
        {/* Eyebrow row — gold-deep pulse dot + mono editorial dateline.
           Red retired; the signal now sits inside the brand palette. */}
        <div className="mb-16 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-60">
          <span className="pulse-dot text-gold-deep" aria-hidden />
          <span className="text-gold-deep">{t('eyebrow')}</span>
          <span aria-hidden className="text-ink-60/50">·</span>
          <span>{t('updated', { date: formatDate(locale, CAMPAIGN.raisedAsOf) })}</span>
        </div>

        <div className="grid gap-12 md:gap-16 md:grid-cols-[1.4fr_1fr] md:items-start">
          {/* LEFT column — main total + phase timeline */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span aria-hidden className="h-px w-10 bg-gold" />
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-gold-deep">
                {t('label')}
              </span>
            </div>

            <h2
              id="meter-heading"
              className="flex items-baseline gap-3 font-serif leading-none tabular-nums text-ink tracking-[-0.025em]"
            >
              <span className="text-[clamp(3rem,7.5vw,5rem)]">
                <Counter to={raised} locale={locale} />
              </span>
              <span className="font-serif text-3xl md:text-4xl text-ink-60">kr</span>
            </h2>

            <p className="mt-6 text-[15px] text-ink-60 tabular-nums">
              {t('of')} {formatAmount(locale, goal)} kr
              <span aria-hidden className="mx-2 text-ink-60/50">·</span>
              <span className="text-ink font-semibold">{pctInt} %</span> {t('financed')}
            </p>

            {/* Segmented phase bar — taller, more breathing room */}
            <div className="mt-14 flex gap-3 h-4">
              {PHASES.map((p, i) => {
                const start = (i * 100) / PHASES.length;
                const end = ((i + 1) * 100) / PHASES.length;
                const local = Math.min(100, Math.max(0, ((pct - start) / (end - start)) * 100));
                return (
                  <AnimatedProgress
                    key={p.year}
                    percent={local}
                    className="flex-1 h-full bg-rule rounded"
                    fillClassName="bg-gradient-to-r from-gold-deep to-gold rounded"
                  />
                );
              })}
            </div>
            <ol className="mt-5 flex gap-3">
              {PHASES.map((p) => {
                const isCurrent = p.key === active;
                return (
                  <li key={p.year} className="flex-1">
                    <div
                      className={cn(
                        'text-[15px] tabular-nums',
                        isCurrent ? 'text-ink font-semibold' : 'text-ink-60/50',
                      )}
                    >
                      {p.year}
                    </div>
                    <div
                      className={cn(
                        'text-[15px] mt-1',
                        isCurrent ? 'text-ink' : 'text-ink-60/50',
                      )}
                    >
                      {tPhase(p.key)}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* RIGHT column — sub-campaign card on paper-2, roomier */}
          <aside className="rounded-2xl bg-paper-2 p-8 md:p-10 flex flex-col">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-gold-deep">
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
              className="mt-6 h-2 bg-paper rounded"
              fillClassName="bg-gradient-to-r from-gold to-gold-deep rounded"
            />

            <p className="mt-6 text-[15px] leading-relaxed text-ink-60 max-w-prose">
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
