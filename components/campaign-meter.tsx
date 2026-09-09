import Image from 'next/image';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { CAMPAIGN, PHASES, currentPhaseKey } from '@/lib/campaign';
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
// The phone layout's small marks. Inline rather than an icon package: five
// glyphs at 16px, all one stroke weight, and the set never grows.
const ICON = 'h-[15px] w-[15px]';
const stroke = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function IconPeople() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} {...stroke} aria-hidden>
      <path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20" />
      <circle cx="9" cy="7" r="3.2" />
      <path d="M22 20v-1.5a4 4 0 0 0-3-3.87M16.5 4.13a4 4 0 0 1 0 5.74" />
    </svg>
  );
}
function IconTarget() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} {...stroke} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.2" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} {...stroke} aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}
function IconFoundation() {
  return (
    <svg viewBox="0 0 24 24" className={ICON} {...stroke} aria-hidden>
      <path d="M3 20h18" />
      <path d="M6 20v-6h12v6" />
      <path d="M12 14V8" />
      <path d="M8.5 8h7l-3.5-4.5L8.5 8Z" />
    </svg>
  );
}
function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" {...stroke} strokeWidth={1.8} aria-hidden>
      <path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9Z" />
    </svg>
  );
}

// A label in a tinted tile, the phone layout's repeating unit.
function Tile({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold-soft/45 text-gold-deep">
      {children}
    </span>
  );
}

export async function CampaignMeter() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations('meter');
  const tPhase = await getTranslations('meter.phases');

  const raised = CAMPAIGN.raisedNok;
  const goal = CAMPAIGN.goalNok;
  const pct = goal > 0 ? Math.min(100, (raised / goal) * 100) : 0;
  const pctInt = Math.round(pct);
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

        {/* ── tablet and up: unchanged ─────────────────────────────────
           Raised and goal as two figures on one baseline — the goal is the
           other half of the story, so it is set in the same serif rather
           than as a caption. The button closes the row. */}
        <div className="hidden md:block">
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

        {/* The bar. The percentage at its head, and at the very end a
           finish-line marker PLANTED on the track — the client's race-flag
           instinct, in the site's own vocabulary: a pole rising from the
           100% point with the minaret at its top, because what stands at
           this finish is the building. The phrase names the moment. */}
        <div className="mt-7 md:mt-10">
          <div className="mb-2 flex items-baseline justify-between pe-8 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-60">
            <span className="tabular-nums text-gold-deep">{pctInt} %</span>
            <span className="text-gold-deep">{t('goalMark')}</span>
          </div>
          <div className="relative">
            <span aria-hidden className="absolute -top-6 end-0 flex w-5 flex-col items-center text-gold-deep">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M12 2v3" />
                <path d="M8 21V11a4 4 0 0 1 8 0v10" />
                <path d="M5 21h14" />
              </svg>
              <span className="h-2.5 w-px bg-gold-deep" />
            </span>
            <AnimatedProgress
              percent={pct}
              className="h-2.5 rounded-full bg-paper"
              fillClassName="rounded-full bg-gradient-to-r from-gold to-gold-deep"
            />
          </div>
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
              {formatAmount(locale, CAMPAIGN.goalNok - CAMPAIGN.raisedNok)} kr
            </dd>
            <dt className="mt-2 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-60">
              {t('remainingLabel')}
            </dt>
          </div>
          <div className="col-span-2 border-t border-rule pt-5 sm:col-span-1 sm:border-t-0 sm:border-s sm:border-rule sm:ps-8 sm:pt-0">
            <dd>
              <PhasePopover steps={steps} label={t('roadmap')} currentLabel={t('now')} align="end">
                {/* A sentence, not the bare word "Fundament" (client,
                   Hjem.pdf 2026-09-09), and keyed off the current phase so
                   it stays true when the build moves on. Set smaller than
                   the two money figures beside it and given leading: this
                   tile now states where the project is rather than printing
                   a value, and a sentence at 2.25rem would dwarf them.
                   meter.phases keeps the short words for the roadmap list
                   inside this popover. */}
                <span className="block max-w-[22ch] font-serif text-[clamp(1.15rem,1.8vw,1.5rem)] leading-snug text-ink">
                  {t(`phaseNow.${phase?.key ?? 'fundament'}`)}
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

        {/* ── phone ────────────────────────────────────────────────────
           A separate layout, not the desktop one reflowed (client,
           2026-09-10, with a reference design). The desktop version reads
           as one continuous ledger — figures on a baseline, hairline rules,
           a bar across the full measure — and a phone cannot hold that
           measure, so on a 390px screen it became six stacked rows that all
           looked alike.

           The reference answers it the way donation pages do: the money is
           the page, everything supporting it is a card, and every card is
           announced by a mark. Same figures, same order, same strings — no
           new copy, nothing dropped.

           Rabita's palette rather than the reference's green: gold-deep on
           gold-soft tiles, because every other call to give on this site is
           gold and one green button here would read as a different site.
           Say the word and it is one token. */}
        <div className="relative mt-7 md:hidden">
          {/* The reference sets a mosque illustration behind the figure. Ours
             is the Rabita mark, which is the same gesture in the house's own
             hand: large, faint, cropped by the corner, and aria-hidden. */}
          <Image
            src="/logo/rabita-mark-256.png"
            alt=""
            aria-hidden
            width={256}
            height={256}
            className="pointer-events-none absolute -top-6 -end-10 h-40 w-40 opacity-[0.07]"
          />

          <div className="relative">
            <p className="flex items-baseline gap-2 font-serif leading-none tabular-nums tracking-[-0.03em] text-ink">
              <span className="text-[clamp(2.4rem,11.5vw,3.4rem)]">
                <Counter to={raised} locale={locale} />
              </span>
              <span className="text-xl text-ink-60">kr</span>
            </p>
            <p className="mt-3 flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-60">
              <span className="text-gold-deep">
                <IconPeople />
              </span>
              {t('label')}
            </p>

            <p className="mt-6 flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-60">
              <span className="text-gold-deep">
                <IconTarget />
              </span>
              {t('goalLabel')}
            </p>
            <p className="mt-2 flex items-baseline gap-2 font-serif italic leading-none tabular-nums tracking-[-0.02em] text-gold-deep">
              <span className="text-[1.75rem]">{formatAmount(locale, goal)}</span>
              <span className="text-base">kr</span>
            </p>

            {/* Thicker and fully rounded, per the reference: on a phone the
               bar is the one graphic on the screen, and a 2.5px hairline
               reads as a rule rather than as a measure. */}
            <AnimatedProgress
              percent={pct}
              className="mt-5 h-3 rounded-full bg-paper ring-1 ring-rule"
              fillClassName="rounded-full bg-gradient-to-r from-gold to-gold-deep"
            />
            <div className="mt-2.5 flex items-baseline justify-between font-mono text-[0.625rem] uppercase tracking-[0.14em]">
              <span className="tabular-nums text-gold-deep">{pctInt} %</span>
              <span className="text-ink-60">{t('goalMark')}</span>
            </div>

            <GiveCTA
              label={t('give')}
              fullWidth
              leadingIcon={<IconHeart />}
              className="mt-6 min-h-14 text-base"
            />
          </div>

          {/* The two supporting figures, one card each. Mark and label on the
             first line, figure under it — the reference's order, and the one
             that lets a two-line label sit beside a 9px tile without
             pushing the figure off its own baseline. */}
          <dl className="mt-3 grid grid-cols-2 gap-3">
            {/* flex-col + mt-auto, because one label runs to two lines and
               the other to one: without it the two figures sit at different
               heights and the pair reads as a mistake. whitespace-nowrap on
               the figures for the same reason — "73 004 821 kr" is the
               longest string either card will ever hold, and it breaks
               after the last group if it is allowed to.

               Which means the size has to be fluid, or nowrap just moves the
               problem outside the card: measured, that string is 121px at
               20px type and a card is only 97px wide inside its padding at
               320. The clamp keeps it at 20px from 421px up and scales it
               down below, with 5px to spare on the narrowest screen. */}
            <div className="flex flex-col rounded-2xl bg-paper p-4 ring-1 ring-rule">
              <div className="flex items-start gap-2.5">
                <Tile>
                  <IconPeople />
                </Tile>
                <dt className="font-mono text-[0.5625rem] uppercase leading-[1.6] tracking-[0.1em] text-ink-60">
                  {t('lastMonthLabel')}
                </dt>
              </div>
              <dd className="mt-auto whitespace-nowrap pt-3 font-serif text-[clamp(0.95rem,4.75vw,1.25rem)] leading-none tabular-nums text-gold-deep">
                +{formatAmount(locale, CAMPAIGN.lastMonthNok)} <span className="text-[0.8em]">kr</span>
              </dd>
            </div>
            <div className="flex flex-col rounded-2xl bg-paper p-4 ring-1 ring-rule">
              <div className="flex items-start gap-2.5">
                <Tile>
                  <IconCalendar />
                </Tile>
                <dt className="font-mono text-[0.5625rem] uppercase leading-[1.6] tracking-[0.1em] text-ink-60">
                  {t('remainingLabel')}
                </dt>
              </div>
              <dd className="mt-auto whitespace-nowrap pt-3 font-serif text-[clamp(0.95rem,4.75vw,1.25rem)] leading-none tabular-nums text-ink">
                {formatAmount(locale, goal - raised)} <span className="text-[0.8em]">kr</span>
              </dd>
            </div>
          </dl>

          {/* The phase, full width, with somewhere to go. PhasePopover is
             switched off below 640px by design — it is a hover affordance —
             so on a phone the arrow leads to the page that holds the whole
             roadmap instead of floating a card that cannot be dismissed. */}
          <Link
            href={`/${locale}/moskeprosjektet/fremdrift`}
            className="mt-3 flex items-center gap-3 rounded-2xl bg-sage-soft p-4 ring-1 ring-sage-line transition-colors hover:bg-sage"
          >
            <Tile>
              <IconFoundation />
            </Tile>
            <span className="min-w-0 flex-1">
              <span className="block font-serif text-[1.0625rem] leading-snug text-ink">
                {t(`phaseNow.${phase?.key ?? 'fundament'}`)}
              </span>
              <span className="mt-1.5 flex items-center gap-2 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ink-60">
                <span className="pulse-dot text-gold-deep" aria-hidden />
                {t('updated', { date: formatDate(locale, CAMPAIGN.raisedAsOf) })}
              </span>
            </span>
            <span aria-hidden className="shrink-0 text-gold-deep rtl:rotate-180">
              <svg viewBox="0 0 24 24" className="h-4 w-4" {...stroke} strokeWidth={1.8}>
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
