'use client';

import { useLocale } from 'next-intl';
import { CAMPAIGN } from '@/lib/campaign';
import { formatPercent } from '@/lib/format';
import { AnimatedProgress } from './animated-progress';
import { Counter } from './counter';
import type { AppLocale } from '@/i18n/routing';

// Campaign proof in the hero, under the CTAs.
//
// Replaces the "Fase 1 · Fundamentering pågår" caption that used to sit
// here. A caption stated a status; a figure and a bar answer the question
// point 1 actually asks — a building is going up, this much is raised,
// this much is left — at a glance and without scrolling fourteen screens
// to the meter.
//
// The amount and the percentage are BOTH always visible, and since
// 2026-10-06 they are ALL there is.
//
// ── THE DETAIL PANEL IS GONE (client, Mobilversjon) ──────────────────────
// "Informasjon: Boksen er for mye og litt forvirrende informasjon. Enten
// fjerne den helt, både fra pc og mobilversjon, eller gjøre den mye
// enklere." The user chose removal.
//
// It opened on hover/focus/tap and carried four rows: the 100 000 000 goal,
// the Fundamentet sub-campaign at 4 320 000 / 12 000 000, last month's
// figure and an as-of date. He is right that it confused: it put TWO
// campaigns with TWO goals side by side in a box the width of a phone, with
// nothing explaining how 59 345 333 and 4 320 000 relate.
//
// It was also the wrong home for them. Hover does not exist on touch, so
// the panel needed a deliberate tap on a figure that does not look
// tappable — most phone visitors never opened it at all.
//
// THREE OF THE FOUR SURVIVE further down this same page, in the
// Innsamlingsstatus section (components/campaign-meter.tsx), with room to
// label each one properly: the 100 000 000 goal, "+1 097 454 kr siste
// måned" and "per 1. september 2026". For those this panel was a cramped
// duplicate.
//
// THE SUB-CAMPAIGN IS NOW NOWHERE ON THE SITE. Fundamentet at 4 320 000 /
// 12 000 000 lived only here. That is deliberate rather than an oversight:
// it is the half he called confusing, and his own Tekst (endelig) spec for
// this section lists five things — heading, 59 345 333, 59 %, +1 097 454,
// Mål 100 000 000 — and no sub-campaign. Flagged to the user on removal.
//
// SUB_CAMPAIGN in lib/campaign.ts now has no reader. It is left defined,
// with its real figures, so restoring this is an import rather than
// research.
//
// meter.* and hero.campaignToggle stay in all three locales, now unused by
// this file — the repo's convention for client copy that may come back.

export function HeroCampaign() {
  const locale = useLocale() as AppLocale;

  const { raisedNok: raised, goalNok: goal } = CAMPAIGN;
  const percent = (raised / goal) * 100;

  return (
    <div className="relative mt-7 w-full max-w-[22rem]">
      <div className="block w-full text-start">
        <span className="flex items-baseline justify-between gap-4">
          <span className="font-serif text-[1.5rem] leading-none tabular-nums text-paper">
            <Counter to={raised} locale={locale} />
            <span className="ms-1.5 text-[1rem] text-paper/60">kr</span>
          </span>
          <span className="text-[13px] tabular-nums text-paper/60">
            {formatPercent(locale, raised, goal)}
          </span>
        </span>

        <AnimatedProgress
          percent={percent}
          className="mt-3 h-[2px] w-full rounded-full bg-paper/20"
          fillClassName="bg-gold"
        />
      </div>

    </div>
  );
}
