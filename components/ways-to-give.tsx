'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { CAMPAIGN } from '@/lib/campaign';
import { openGiveSheet } from './giving-sheet';
import { Section, SectionBody, SectionHeading } from './primitives';
import { cn } from '@/lib/cn';

// Four ways to give, each with a way to actually do it. Cards are
// typographic: tint plus a hairline top rule; on hover the tint deepens a
// step and the rule turns gold. Monthly is the one emphasised card (the
// copy says it gives the most), marked with a gold rule and a small badge.
// CTAs are text links whose underline draws in from the left; the company
// one is a mailto in gold with no rule, because it is a conversation.

const KEYS = ['once', 'monthly', 'sadaqa', 'company'] as const;

export function WaysToGive() {
  const t = useTranslations('projectPage.ways');
  const locale = useLocale();

  return (
    <Section tone="paper-2">
      <SectionBody>
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">{t('eyebrow')}</p>
        <SectionHeading className="mt-4">{t('heading')}</SectionHeading>
        <p className="mt-4 max-w-prose text-body text-ink-60">{t('intro')}</p>

        <ul className="mt-8 grid gap-4 md:mt-10 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {KEYS.map((k) => {
            const featured = k === 'monthly';
            const cardClass = cn(
              'group relative flex h-full flex-col border-t bg-paper p-5 pt-6 md:p-6 md:pt-7',
              'transition-colors duration-200 ease-out hover:bg-paper-deep motion-reduce:transition-none',
              featured ? 'border-gold-deep' : 'border-rule hover:border-gold-deep',
            );
            const body = (
              <>
                {featured && (
                  <span className="absolute -top-2.5 start-6 bg-paper-2 px-2 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-gold-deep">
                    {t('badge')}
                  </span>
                )}
                <h3 className="font-serif text-card text-ink">{t(`${k}.title`)}</h3>
                <p className="mt-2 text-body text-ink-60">{t(`${k}.body`)}</p>
              </>
            );
            const arrow = (
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none rtl:rotate-180 rtl:group-hover:-translate-x-1">
                &rarr;
              </span>
            );
            // Text link with an underline that draws in from the start edge.
            const cta =
              'relative mt-auto inline-flex min-h-11 items-center gap-2 self-start pt-6 text-[15px] font-semibold text-ink ' +
              "after:absolute after:bottom-2 after:start-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-[250ms] after:ease-out after:content-[''] group-hover:after:scale-x-100 motion-reduce:after:transition-none rtl:after:origin-right";

            if (k === 'company') {
              return (
                <li key={k}>
                  <a href={`mailto:${CAMPAIGN.contactEmail}`} className={cardClass}>
                    {body}
                    <span className="mt-auto inline-flex min-h-11 items-center gap-2 self-start pt-6 text-[15px] font-semibold text-gold-deep transition-colors group-hover:text-ink">
                      {t('ctaCompany')} {arrow}
                    </span>
                  </a>
                </li>
              );
            }
            if (k === 'sadaqa') {
              return (
                <li key={k}>
                  <Link href={`/${locale}/doner-en-bonneplass`} className={cardClass}>
                    {body}
                    <span className={cta}>{t('cta')} {arrow}</span>
                  </Link>
                </li>
              );
            }
            return (
              <li key={k}>
                <button type="button" onClick={() => openGiveSheet()} className={cn(cardClass, 'w-full text-start')}>
                  {body}
                  <span className={cta}>{t('cta')} {arrow}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </SectionBody>
    </Section>
  );
}
