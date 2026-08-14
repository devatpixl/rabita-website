import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import {
  DONOR_WALL,
  DONOR_WALL_HOMEPAGE_CAP,
  PHASE_ORDER,
  donorWallTotals,
  type DonorEntry,
  type Phase,
} from '@/lib/donor-wall';
import { formatAmount } from '@/lib/format';
import type { AppLocale } from '@/i18n/routing';
import { Accent } from './accent';
import { DonorWallBlocks } from './donor-wall-blocks';
import { GiveCTA } from './give-cta';
import { Eyebrow, Section, SectionBody, SectionHeading } from './primitives';

// The wall is a masonry of stones, not a list of names. It's here to do
// three jobs: (1) be shareable — each block has a stable anchor; (2)
// route the "gift in someone's name" impulse into the sadaqa flow; (3)
// print the aggregate as proof of length.
//
// Until Rabita has real, GDPR-consented donor records, the data source
// is empty and the section renders an honest empty state instead of a
// fabricated wall. See lib/donor-wall.ts and the /givere page-file
// comment for the reasoning.

export async function FoundationWall() {
  const t = await getTranslations('foundationWall');
  const locale = (await getLocale()) as AppLocale;

  const capped = DONOR_WALL.slice(0, DONOR_WALL_HOMEPAGE_CAP);

  if (capped.length === 0) {
    return (
      <Section id="fundamentsteiner" tone="paper-deep">
        <SectionBody>
          <div className="max-w-3xl">
            <Eyebrow tone="gold-deep">{t('eyebrowEmpty')}</Eyebrow>
            <SectionHeading reveal={false} className="mt-4">
              {t.rich('headline', {
                em: (chunks) => <Accent surface="paper">{chunks}</Accent>,
              })}
            </SectionHeading>
            <p className="mt-6 max-w-prose text-body text-ink-60">
              {t('emptyState')}
            </p>
          </div>
        </SectionBody>
      </Section>
    );
  }

  const { count, nokSum } = donorWallTotals(capped);
  const totalNok = formatAmount(locale, nokSum);

  // Group into phase courses, preserving each entry's absolute
  // index (chronological across the whole wall) so the client-side
  // stagger reads left-to-right as one continuous laying.
  const byPhase = PHASE_ORDER.map((phase) => ({
    phase,
    label: t('phaseLabel', {
      name: t(`phases.${phase}`),
      count: capped.filter((e) => e.phase === phase).length,
    }),
    entries: capped
      .map((entry, i) => ({ entry, absoluteIndex: i }))
      .filter(({ entry }) => entry.phase === phase),
  })).filter((c) => c.entries.length > 0);

  const allNamesHref = `/${locale}/givere`;

  return (
    <Section id="fundamentsteiner" tone="paper-deep">
      <SectionBody>
        <div className="mb-10 max-w-3xl">
          <Eyebrow tone="gold-deep">{t('eyebrow', { count })}</Eyebrow>
          <SectionHeading reveal={false} className="mt-4">
            {t.rich('headline', {
              em: (chunks) => <Accent surface="paper">{chunks}</Accent>,
            })}
          </SectionHeading>
          <p className="mt-6 max-w-prose text-body text-ink-60">
            {t('body')}
          </p>
        </div>

        {/* Counter row — the number is the argument. */}
        <div className="mb-10 flex flex-wrap items-baseline gap-x-3 border-b border-rule pb-6">
          <p className="font-serif text-[clamp(1.6rem,3vw,2rem)] leading-none text-ink tabular-nums">
            {t('counter', { count, nok: totalNok })}
          </p>
        </div>

        <DonorWallBlocks
          courses={byPhase}
          searchPlaceholder={t('search')}
          searchAriaLabel={t('searchAria')}
          anonymousAriaLabel={t('anonymousBlockAria')}
        />

        <div className="mt-14 flex flex-wrap items-center gap-6 border-t border-rule pt-8">
          <GiveCTA label={t('ctaPrimary')} />
          <Link
            href={allNamesHref}
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-ink underline decoration-gold decoration-1 underline-offset-4"
          >
            {t('ctaSecondary')} →
          </Link>
        </div>
      </SectionBody>
    </Section>
  );
}

// Retained for external consumers that import the type.
export type { DonorEntry, Phase };
