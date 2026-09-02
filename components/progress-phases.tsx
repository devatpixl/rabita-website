import { getTranslations } from 'next-intl/server';
import { PROJECT_PHASES, TOTAL_BUILD_COST_EUR, CAMPAIGN, projectPhaseState } from '@/lib/campaign';
import { formatAmount } from '@/lib/format';
import type { AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/cn';

// The project in five funded phases, as a rail.
//
// The client's brochure draws this horizontally with hexagonal nodes; this is
// the same information in the site's own language — a hairline with a diamond
// per phase, a mono label, the sum in serif, and what that sum buys underneath.
//
// Two rules it follows, both of them about honesty with money:
//
//   1. The phase sums are EUR and the campaign meter is NOK, and the two are
//      never mixed or converted. They measure different things — the cost of
//      the building versus the donated share of it — and a conversion rate
//      printed once would start ageing the moment it shipped. See the §13.2
//      note in lib/campaign.ts.
//   2. The total is summed from the phases, never typed out, so it cannot
//      disagree with the figures directly above it.
//
// `compact` drops the closing total block, for the digest on /moskeprosjektet
// where the campaign meter is already doing that job further up the page.

export async function ProgressPhases({
  locale,
  compact = false,
}: {
  locale: AppLocale;
  compact?: boolean;
}) {
  const t = await getTranslations('fremdrift');
  const now = new Date();

  return (
    <div>
      <ol className="grid items-stretch gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-4">
        {PROJECT_PHASES.map((phase) => {
          const state = projectPhaseState(phase, now);
          const years =
            phase.from === phase.to ? String(phase.from) : `${phase.from}\u2013${phase.to}`;
          const items = t.raw(`phases.${phase.key}.items`) as string[];
          return (
            <li key={phase.key} className="flex flex-col">
              {/* The rail, above the cards rather than through them. One
                 hairline per cell rather than one line behind the row, so it
                 breaks correctly when the grid wraps to two columns or one —
                 a single absolutely-positioned line would run through the
                 gaps and out the side. */}
              <div aria-hidden className="relative mb-5 h-3">
                <span
                  className={cn(
                    'absolute inset-x-0 top-1/2 block h-px -translate-y-1/2',
                    state === 'next' ? 'bg-rule' : 'bg-gold-deep/45',
                  )}
                />
                {/* Three states, the same vocabulary phase-popover.tsx uses:
                   filled ink for done, gold for the phase we are in, hollow
                   for what is still ahead. The current one is larger and
                   ringed, so the eye finds "where are we" before it reads a
                   single word. */}
                <span
                  className={cn(
                    'absolute start-0 top-1/2 block -translate-y-1/2 rotate-45 border',
                    state === 'current'
                      ? 'h-3 w-3 border-gold-deep bg-gold-deep ring-4 ring-gold-deep/15'
                      : 'h-2.5 w-2.5',
                    state === 'done' && 'border-ink bg-ink',
                    state === 'next' && 'border-rule bg-paper',
                  )}
                />
              </div>

              {/* The card. The phase we are in is lifted off the paper —
                 warmer ground, a gold edge and a shadow — because on a page
                 about money the first question is always "where are we now".
                 Nothing else changes size: the lift is the only signal, so it
                 stays legible when four cards sit either side of it. */}
              <div
                className={cn(
                  'flex flex-1 flex-col rounded-[1.25rem] border p-5 md:p-6',
                  state === 'current'
                    ? 'border-gold-deep/40 bg-paper-2 shadow-[0_18px_40px_-32px_rgba(28,25,23,0.55)]'
                    : 'border-rule bg-paper',
                )}
              >
                <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 font-mono text-[0.625rem] uppercase tracking-[0.16em]">
                  <span className="text-gold-deep">{t('phaseLabel', { n: phase.n })}</span>
                  <span className="tabular-nums text-ink-60">{years}</span>
                </p>

                <h3 className="mt-2.5 font-serif text-[1.15rem] leading-tight text-ink">
                  {t(`phases.${phase.key}.name`)}
                </h3>

                {/* Every sum in gold, and the current one a size larger.
                   Dimming the phases still ahead would be the wrong signal on
                   a page asking people to pay for them. */}
                <p
                  className={cn(
                    'mt-3 font-serif leading-none tabular-nums text-gold-deep',
                    state === 'current'
                      ? 'text-[clamp(1.5rem,2.5vw,1.9rem)]'
                      : 'text-[clamp(1.35rem,2.2vw,1.65rem)]',
                  )}
                >
                  {formatAmount(locale, phase.eur)}{' '}
                  <span className="font-mono text-[0.75rem] tracking-[0.06em]">&euro;</span>
                </p>

                <span aria-hidden className="mt-5 block h-px w-full bg-rule" />

                {/* flex-1 on the list, so the status below it sits on the
                   floor of every card and the five line up across the row. */}
                <ul className="mt-4 flex-1 space-y-1.5">
                  {items.map((item) => (
                    <li key={item} className="flex gap-2 text-[13px] leading-snug text-ink-60">
                      <span aria-hidden className="mt-[0.55em] block h-px w-2 shrink-0 bg-gold-deep/50" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <p
                  className={cn(
                    'mt-6 inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.14em]',
                    state === 'current'
                      ? 'bg-gold-deep text-paper'
                      : 'border border-rule text-ink-60',
                  )}
                >
                  <StateMark state={state} />
                  {state === 'done' ? t('stateDone') : state === 'current' ? t('stateCurrent') : t('stateNext')}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      {!compact && (
        // The two figures, set side by side precisely so nobody has to wonder
        // whether one is a share of the other. The note says so in words.
        <div className="mt-14 border-t border-ink pt-7 md:mt-16">
          <dl className="grid gap-8 sm:grid-cols-2 sm:gap-12">
            <div>
              <dt className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-60">
                {t('totalLabel')}
              </dt>
              <dd className="mt-3 font-serif text-[clamp(1.75rem,3vw,2.4rem)] leading-none tabular-nums text-ink">
                {formatAmount(locale, TOTAL_BUILD_COST_EUR)}{' '}
                <span className="font-mono text-[0.8125rem] tracking-[0.06em] text-ink-60">&euro;</span>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-60">
                {t('goalLabel')}
              </dt>
              <dd className="mt-3 font-serif text-[clamp(1.75rem,3vw,2.4rem)] leading-none tabular-nums text-ink">
                {formatAmount(locale, CAMPAIGN.goalNok)}{' '}
                <span className="font-mono text-[0.8125rem] tracking-[0.06em] text-ink-60">kr</span>
              </dd>
            </div>
          </dl>
          <p className="mt-7 max-w-[62ch] text-[13px] leading-relaxed text-ink-60">
            {t('goalNote')}
          </p>
        </div>
      )}
    </div>
  );
}

// The glyph in the status pill: a tick for what is finished, a filled dot for
// the phase under way, a hollow one for what is ahead. Small enough that the
// word beside it is still doing the work — this only saves the reader from
// reading five of them to find the one that differs.
function StateMark({ state }: { state: 'done' | 'current' | 'next' }) {
  if (state === 'done') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-2.5 w-2.5">
        <path d="m5 12.5 4.5 4.5L19 7" />
      </svg>
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        'block h-1.5 w-1.5 rounded-full',
        state === 'current' ? 'bg-paper' : 'border border-ink-60/60',
      )}
    />
  );
}
