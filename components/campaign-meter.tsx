import Image from 'next/image';
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

        {/* ── tablet and up ───────────────────────────────────────────
           ONE figure on this baseline: what has come in. The goal used to
           stand beside it in gold (italic until 2026-09-15), and the client
           moved it down into
           the stats row (Versjon 3: "flytte 100 000 000,- til der det star
           73 millioner,-"), leaving nothing in its place. Two nine-figure
           numbers on one line were competing, and the goal was also being
           said twice — the stats row carried "remaining", which is only
           this number minus the one on the left. The button closes the
           row. */}
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
          {/* THE YEAR IS GONE (client, Tekst (endelig) Sept 2026): "Fjern
             teksten «2028 – dørene åpnes» som i dag står ved siden av
             prosentandelen (59 %). Byggestart er ikke fastsatt, så et fast
             årstall skal ikke loves." It sat at both ends of this row, here
             and in the compact variant below. meter.goalMark stays written
             in all three locales, unreferenced.

             The percentage keeps the row to itself rather than being
             re-centred: it is what the bar under it measures, and it reads
             as a label on the track's start. */}
          <div className="mb-2 flex items-baseline pe-8 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-60">
            <span className="tabular-nums text-gold-deep">{pctInt} %</span>
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
            {/* The goal. UPRIGHT since 2026-09-15 ("Fjerne kursiv på
               «100 000 000»"); the gold stays, which he confirmed.
               Worth knowing what the italic was doing, in case this ever
               reads flat: it and the label were what separated this figure
               from the ink one above it — "what we are reaching for" against
               "what we have" — two nine-figure numbers a few lines apart.
               Colour and the label carry that distinction alone now. */}
            <dd className="font-serif text-[clamp(1.6rem,2.6vw,2.25rem)] leading-none tabular-nums tracking-[-0.02em] text-gold-deep">
              {formatAmount(locale, goal)} kr
            </dd>
            <dt className="mt-2 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-60">
              {t('goalLabel')}
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

            {/* Thicker and fully rounded, per the reference: on a phone the
               bar is the one graphic on the screen, and a 2.5px hairline
               reads as a rule rather than as a measure.

               mt-7, not the mt-5 it had: this used to follow the goal
               figure, which is now down in the cards, so the bar sits
               under the 10px "samlet inn" label instead. At mt-5 it
               crowded it — the gap has to read as a break between the
               headline figure and its measure, and 20px under a caption
               reads as part of the caption. */}
            <AnimatedProgress
              percent={pct}
              className="mt-7 h-3 rounded-full bg-paper ring-1 ring-rule"
              fillClassName="rounded-full bg-gradient-to-r from-gold to-gold-deep"
            />
            <div className="mt-2.5 flex items-baseline font-mono text-[0.625rem] uppercase tracking-[0.14em]">
              <span className="tabular-nums text-gold-deep">{pctInt} %</span>
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
            {/* flex-col + mt-auto, because the labels can run to different
               numbers of lines: without it the two figures sit at different
               heights and the pair reads as a mistake. whitespace-nowrap on
               the figures for the same reason — these numbers break after a
               digit group if they are allowed to.

               Which means the size has to be fluid, or nowrap just moves
               the problem outside the card — and the longest string in the
               pair got longer when the goal moved in here: "100 000 000 kr"
               against the "73 004 821 kr" this card used to hold.

               ONE clamp across both cards, not one each. Sizing them
               separately so each just fits its own string is what a
               per-card measurement leads to, and it looks like a bug: two
               figures side by side in identical cards, set 2px apart.

               Re-measured in the browser at 320/360/390/430 rather than
               scaled off the old numbers: the figure runs 6.87px of width
               per 1px of type, and a card is 96px inside its padding at
               320. So 0.84rem is the floor, which leaves about 4px there,
               and 4.2vw reaches it at 320 and the 20px ceiling at 477. */}
            <div className="flex flex-col rounded-2xl bg-paper p-4 ring-1 ring-rule">
              <div className="flex items-start gap-2.5">
                <Tile>
                  <IconPeople />
                </Tile>
                <dt className="font-mono text-[0.5625rem] uppercase leading-[1.6] tracking-[0.1em] text-ink-60">
                  {t('lastMonthLabel')}
                </dt>
              </div>
              <dd className="mt-auto whitespace-nowrap pt-3 font-serif text-[clamp(0.84rem,4.2vw,1.25rem)] leading-none tabular-nums text-gold-deep">
                +{formatAmount(locale, CAMPAIGN.lastMonthNok)} <span className="text-[0.8em]">kr</span>
              </dd>
            </div>
            <div className="flex flex-col rounded-2xl bg-paper p-4 ring-1 ring-rule">
              <div className="flex items-start gap-2.5">
                <Tile>
                  <IconTarget />
                </Tile>
                <dt className="font-mono text-[0.5625rem] uppercase leading-[1.6] tracking-[0.1em] text-ink-60">
                  {t('goalLabel')}
                </dt>
              </div>
              {/* Upright here too. The same figure is set twice on this
                 page — ledger above, phone card here — and a number that
                 goes upright on one screen and stays italic on the other is
                 a bug you only see on the device you were not testing on. */}
              <dd className="mt-auto whitespace-nowrap pt-3 font-serif text-[clamp(0.84rem,4.2vw,1.25rem)] leading-none tabular-nums tracking-[-0.02em] text-gold-deep">
                {formatAmount(locale, goal)} <span className="text-[0.8em]">kr</span>
              </dd>
            </div>
          </dl>

          {/* The phase, full width. This was a link to the fremdrift page
             until 2026-09-15, when the client hid it. It is a plain card now
             — and the arrow went with the link, because an arrow that leads
             nowhere promises a page that no longer answers.
             What that costs, stated plainly: PhasePopover is switched off
             below 640px by design (it is a hover affordance), so a phone
             reader now gets the current phase as a statement with no way to
             read the whole roadmap. Restoring the link restores it. */}
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-sage-soft p-4 ring-1 ring-sage-line">
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
          </div>
        </div>
      </div>
    </section>
  );
}
