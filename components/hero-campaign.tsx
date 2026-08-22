'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { CAMPAIGN, SUB_CAMPAIGN } from '@/lib/campaign';
import { formatAmount, formatDate, formatPercent } from '@/lib/format';
import { AnimatedProgress } from './animated-progress';
import { Counter } from './counter';
import type { AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/cn';

// Campaign proof in the hero, under the CTAs.
//
// Replaces the "Fase 1 · Fundamentering pågår" caption that used to sit
// here. A caption stated a status; a figure and a bar answer the question
// point 1 actually asks — a building is going up, this much is raised,
// this much is left — at a glance and without scrolling fourteen screens
// to the meter.
//
// The amount and the percentage are BOTH always visible. They were nearly
// put behind the hover panel, which would have hidden the campaign's single
// strongest fact from every phone in the country: hover does not exist on
// touch. The panel carries genuinely secondary detail instead, and opens on
// hover, focus AND tap so a thumb and a keyboard both reach it.

export function HeroCampaign() {
  const t = useTranslations('hero');
  const tm = useTranslations('meter');
  const locale = useLocale() as AppLocale;
  const [open, setOpen] = useState(false);

  const { raisedNok: raised, goalNok: goal } = CAMPAIGN;
  const percent = (raised / goal) * 100;

  const rows: { label: string; value: string }[] = [
    { label: tm('of'), value: `${formatAmount(locale, goal)} kr` },
    {
      label: tm('sub.label'),
      value: `${SUB_CAMPAIGN.name} · ${formatAmount(locale, SUB_CAMPAIGN.raisedNok)} / ${formatAmount(locale, SUB_CAMPAIGN.goalNok)} kr`,
    },
    { label: '', value: tm('lastMonth', { amount: formatAmount(locale, CAMPAIGN.lastMonthNok) }) },
    { label: '', value: tm('updated', { date: formatDate(locale, CAMPAIGN.raisedAsOf) }) },
  ];

  return (
    <div className="relative mt-7 w-full max-w-[22rem]">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="hero-campaign-detail"
        aria-label={t('campaignToggle')}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="block w-full rounded-sm text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
      >
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
      </button>

      {/* Opens upward: this sits low in the hero column and the section
         clips its overflow. Always mounted so it can transition opacity
         and transform rather than popping in on mount. */}
      <div
        id="hero-campaign-detail"
        aria-hidden={!open}
        className={cn(
          'absolute bottom-full start-0 z-10 mb-3 w-[19rem] rounded-lg border border-rule bg-paper p-4 text-ink',
          'shadow-[0_10px_30px_-14px_rgba(0,0,0,0.5)]',
          'transition-[opacity,transform] duration-[180ms] ease-out motion-reduce:transition-none',
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-1.5 opacity-0',
        )}
      >
        <dl className="space-y-2.5">
          {rows.map((row, i) => (
            <div key={i} className="flex items-baseline justify-between gap-4 text-[13px]">
              {row.label ? (
                <>
                  <dt className="shrink-0 text-ink-60">{row.label}</dt>
                  <dd className="text-end tabular-nums text-ink">{row.value}</dd>
                </>
              ) : (
                <>
                  <dt className="sr-only">{row.value}</dt>
                  <dd className="tabular-nums text-ink-60">{row.value}</dd>
                </>
              )}
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
