import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { membership } from '@/lib/membership';
import type { AppLocale } from '@/i18n/routing';
import { Accent } from './accent';
import { DaysUntil } from './days-until';
import { SeatGrid } from './seat-grid';

// §4.10 (rebuilt). Membership as an AGM convening notice, not a pricing
// tier grid. Dusk plane, second and final dark section on the page
// (mirrors "Where the money goes"). Argument shape: one voting seat costs
// 1 000 kr, and roughly three-quarters of members don't have one.

const NBSP = / | /g;

// Format a number with Norwegian space separators for Latin locales and
// Arabic-Indic digits with the Arabic thousands separator for ar. The
// site-wide formatAmount helper currently emits commas on en (bug on the
// other session's surface); we intentionally do the formatting locally
// here to sidestep that until it's fixed.
function formatCount(locale: AppLocale, n: number): string {
  if (locale === 'ar') {
    return new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(n);
  }
  return new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 })
    .format(n)
    .replace(NBSP, ' ');
}

// Split the AGM date into (day + month) on one line and year on the next
// so it reads like a poster date rather than a sentence date.
function formatAgmDateParts(locale: AppLocale, iso: string) {
  const tag = locale === 'en' ? 'en-GB' : locale === 'ar' ? 'ar-EG' : 'nb-NO';
  const date = new Date(iso);
  const dayMonth = new Intl.DateTimeFormat(tag, {
    day: 'numeric',
    month: 'long',
  }).format(date);
  const year = new Intl.DateTimeFormat(tag, { year: 'numeric' }).format(date);
  return { dayMonth, year };
}

export async function Membership() {
  const t = await getTranslations('membership');
  const locale = (await getLocale()) as AppLocale;

  const { totalMembers, votingMembers, votingFeeNok, agm } = membership;
  const showGrid = votingMembers !== null;

  const { dayMonth, year } = formatAgmDateParts(locale, agm.date);
  const fee = formatCount(locale, votingFeeNok);
  const nStr = showGrid ? formatCount(locale, votingMembers as number) : '';
  const totalStr = formatCount(locale, totalMembers);
  const ariaLabel = showGrid
    ? t('gridAria', { n: nStr, total: totalStr })
    : '';

  return (
    <section
      id="medlemskap"
      className="bg-dusk text-paper py-16 md:py-20"
    >
      <div className="mx-auto max-w-6xl px-6">

        <div className="grid grid-cols-1 items-stretch gap-10 md:grid-cols-[1fr_0.82fr]">
          {/* Left column — the argument */}
          <div>
            <h2 className="font-serif text-[clamp(1.65rem,3.2vw,1.95rem)] leading-[1.18] text-paper text-balance">
              {t.rich('headline', {
                em: (chunks) =>
                  locale === 'ar' ? (
                    <strong className="font-bold not-italic text-gold">
                      {chunks}
                    </strong>
                  ) : (
                    <Accent surface="dusk">{chunks}</Accent>
                  ),
              })}
            </h2>

            <p className="mt-6 max-w-[46ch] text-[14px] leading-[1.6] text-dusk-60">
              {t('body')}
            </p>

            <div className="mt-8 h-px w-full bg-[#2A3A44]" />

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-serif text-[40px] leading-none text-paper tabular-nums">
                {fee}
              </span>
              <span className="text-[13.5px] text-dusk-60">
                {t('priceNote')}
              </span>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Link
                href={`/${locale}/medlemskap?tier=voting`}
                className="inline-flex min-h-11 items-center rounded-full bg-gold px-5 text-[14px] font-semibold text-dusk hover:bg-gold-deep hover:text-paper transition-colors"
              >
                {t('ctaPrimary')}
              </Link>
              <Link
                href={`/${locale}/medlemskap`}
                className="inline-flex min-h-11 items-center text-[14px] text-paper underline decoration-gold decoration-1 underline-offset-4"
              >
                {t('ctaSecondary')}
              </Link>
            </div>
          </div>

          {/* Right column — the notice card */}
          <aside className="rounded-lg bg-[#1C2E3A] p-[1.3rem]">
            <p className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-gold-deep">
              {t('venueLabel')}
            </p>
            <p className="mt-2 font-serif text-[34px] leading-[1.05] text-paper tabular-nums">
              {dayMonth}
              <br />
              {year}
            </p>
            <p className="mt-3 font-mono text-[12px] uppercase tracking-[0.14em] text-dusk-60">
              {t('venueLine', { venue: agm.venue, time: agm.time })}
            </p>
            <DaysUntil iso={agm.date} />

            <div className="mt-5 h-px w-full bg-[#2A3A44]" />

            <p className="mt-5 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-gold-deep">
              {t('gridLabel')}
            </p>

            {showGrid && (
              <>
                <div className="mt-3">
                  <SeatGrid
                    voting={votingMembers as number}
                    total={totalMembers}
                    ariaLabel={ariaLabel}
                  />
                </div>
                <p className="mt-[30px] text-[12px] leading-[1.5] text-dusk-60">
                  <span className="text-paper tabular-nums">{nStr}</span>{' '}
                  {t('captionAfterN', { total: totalStr })}
                </p>
              </>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
