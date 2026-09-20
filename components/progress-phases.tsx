import { getTranslations } from 'next-intl/server';
import {
  PROJECT_PHASES,
  TOTAL_BUILD_COST_NOK,
  TOTAL_BUILD_COST_EUR,
  CAMPAIGN,
  projectPhaseState,
} from '@/lib/campaign';
import { formatAmount } from '@/lib/format';
import type { AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/cn';
import { PhaseTasks } from './phase-tasks';

// The project in five funded phases, as a rail.
//
// The client's brochure draws this horizontally with hexagonal nodes; this is
// the same information in the site's own language — a hairline with a diamond
// per phase, a mono label, the sum in serif, and what that sum buys underneath.
//
// Two rules it follows, both of them about honesty with money:
//
//   1. BOTH figures are kroner since 2026-09-18 (client: "Faser: Legge inn
//      riktig valuta så kroner"). They still measure different things — the
//      cost of putting the building up versus the donated share of it — and
//      the labels say so, but they are no longer in different currencies.
//      The conversion rate lives in ONE constant in lib/campaign.ts; see the
//      note above PROJECT_PHASES for why, and for what to do if Rabita can
//      supply the budget in kroner directly.
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
  // THE BUILD COST IS PRINTED IN THE CURRENCY EACH AUDIENCE WAS GIVEN
  // (client, Tekst (endelig) Sept 2026): kroner on the Norwegian pages,
  // euro on the English and Arabic ones. The donation GOAL is not touched —
  // it is a kroner target either way, and the note under these two figures
  // is there precisely to say they are not the same number.
  const euro = locale !== 'no';
  const t = await getTranslations('fremdrift');
  const now = new Date();

  return (
    <div>
      {/* lg:gap-x-3, down from 4. See the note on the amount below: the
         kroner figures need horizontal room and the client asked for them
         bigger "without increasing height of this section", so the width
         comes from the gutters and the side padding rather than from a
         taller card. Only at lg, where the row is five across; the phone and
         tablet stacks are untouched. */}
      <ol className="grid items-stretch gap-x-5 gap-y-5 sm:grid-cols-2 sm:gap-y-8 lg:grid-cols-5 lg:gap-x-3">
        {PROJECT_PHASES.map((phase) => {
          const state = projectPhaseState(phase, now);
          // Phases 3-5 carry no dates since Sept 2026 (client: no year may be
          // promised), so this slot is simply empty for them. NOT filled with
          // the status: the card already prints its status as a badge lower
          // down, and putting it here too made "Fase 3 · Pågår … Pågår".
          //
          // An empty slot is safe because the row it sits on is flex-wrap
          // with a gap — no separator to leave dangling, and the phase
          // number holds the line on its own.
          const years =
            phase.from == null || phase.to == null
              ? null
              : phase.from === phase.to
                ? String(phase.from)
                : `${phase.from}\u2013${phase.to}`;
          const items = t.raw(`phases.${phase.key}.items`) as string[];
          return (
            <li key={phase.key} className="flex flex-col">
              {/* The rail, above the cards rather than through them. One
                 hairline per cell rather than one line behind the row, so it
                 breaks correctly when the grid wraps to two columns or one —
                 a single absolutely-positioned line would run through the
                 gaps and out the side. */}
              <div aria-hidden className="relative mb-3 h-3 sm:mb-5">
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
                  // md:px-4 md:py-6, not md:p-6. The vertical padding is
                  // exactly what it was, so the card's height and rhythm do
                  // not move; the eight pixels a side go to the amount.
                  'flex flex-1 flex-col rounded-[1.25rem] border p-4 sm:p-5 md:px-4 md:py-6',
                  state === 'current'
                    ? 'border-gold-deep/40 bg-paper-2 shadow-[0_18px_40px_-32px_rgba(28,25,23,0.55)]'
                    : 'border-rule bg-paper',
                )}
              >
                <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 font-mono text-[0.625rem] uppercase tracking-[0.16em]">
                  <span className="text-gold-deep">{t('phaseLabel', { n: phase.n })}</span>
                  {years && <span className="tabular-nums text-ink-60">{years}</span>}
                </p>

                {/* Name and sum share a line on a phone. At 341px the two
                   fit side by side and stacking them spent 34px on a line
                   break; the money is what the page is asking about, so it
                   sits opposite the name rather than under it. From sm they
                   stack exactly as before. */}
                <div className="mt-2 flex items-baseline justify-between gap-3 sm:mt-0 sm:block">
                  <h3 className="font-serif text-[1.15rem] leading-tight text-ink sm:mt-2.5">
                    {t(`phases.${phase.key}.name`)}
                  </h3>

                  {/* Every sum in gold, and the current one a size larger.
                     Dimming the phases still ahead would be the wrong signal
                     on a page asking people to pay for them. */}
                  {/* ── SIZED TO THE LONGEST FIGURE, AND IT MAY NOT WRAP ──
                     Client, 2026-09-18: "make sure doesnt gom in next line".

                     The euro figures were seven digits; the kroner ones are
                     nine, and at the old 30px "113 700 000 kr" needed 190px
                     inside a card that offers 158. Three of the five cards
                     were breaking, and two of those dropped the bare "kr"
                     onto a line of its own, which reads as a mistake.

                     MEASURED, not guessed, and re-measured on 2026-09-18
                     when the client asked for them bigger "without increasing
                     height of this section":

                     The widest figure is 113 700 000 kr, and all three
                     locales render it in Latin digits at the same width — so
                     Norwegian, English and Arabic all size the same. It needs
                     168px at 26px type and 174px at 27px.

                     The card offered 158px. Rather than shrink the type to
                     fit, the width was taken from places that do not affect
                     height: the column gap (lg:gap-x-4 → 3) and the card's
                     SIDE padding (md:p-6 → md:px-4 md:py-6). That puts about
                     179px inside the card, so 26px fits with ~11px of slack
                     — real margin, not the 3px that a slightly longer number
                     would have eaten.

                     Hence 1.625rem current / 1.5rem the rest. Below lg the
                     grid is two-up or stacked, the cards are far wider than
                     any figure needs, and nothing here applies.

                     whitespace-nowrap is the belt to that braces: the space
                     between the number and its unit is a legal break point,
                     so without it a slightly wider translation or a bigger
                     sum orphans the "kr" again. It cannot now — it will
                     overflow visibly instead, which is a bug you can see
                     rather than one you cannot. */}
                  <p
                    className={cn(
                      'shrink-0 whitespace-nowrap font-serif leading-none tabular-nums text-gold-deep sm:mt-3',
                      state === 'current'
                        ? 'text-[clamp(1.3rem,2.1vw,1.625rem)]'
                        : 'text-[clamp(1.2rem,1.9vw,1.5rem)]',
                    )}
                  >
                    {formatAmount(locale, euro ? phase.eur : phase.nok)}{' '}
                    <span className="font-mono text-[0.75rem] tracking-[0.06em]">{euro ? '\u20AC' : 'kr'}</span>
                  </p>
                </div>

                {/* Everything but the current phase folds its rule and list
                   away on a phone. From sm this is the card it always was. */}
                <PhaseTasks
                  collapsible={state !== 'current'}
                  labelShow={t('tasksShow', { n: items.length })}
                  labelHide={t('tasksHide')}
                  panel={
                    <>
                      <span aria-hidden className="mt-4 block h-px w-full bg-rule sm:mt-5" />
                      <ul className="mt-3.5 space-y-1.5 sm:mt-4">
                        {items.map((item) => (
                          <li key={item} className="flex gap-2 text-[13px] leading-snug text-ink-60">
                            <span aria-hidden className="mt-[0.55em] block h-px w-2 shrink-0 bg-gold-deep/50" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  }
                  footer={
                    <p
                      className={cn(
                        'inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.14em]',
                        state === 'current'
                          ? 'bg-gold-deep text-paper'
                          : 'border border-rule text-ink-60',
                      )}
                    >
                      <StateMark state={state} />
                      {state === 'done' ? t('stateDone') : state === 'current' ? t('stateCurrent') : t('stateNext')}
                    </p>
                  }
                />
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
                {formatAmount(locale, euro ? TOTAL_BUILD_COST_EUR : TOTAL_BUILD_COST_NOK)}{' '}
                <span className="font-mono text-[0.8125rem] tracking-[0.06em] text-ink-60">{euro ? '\u20AC' : 'kr'}</span>
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
