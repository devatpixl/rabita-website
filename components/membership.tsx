import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { membership } from '@/lib/membership';
import type { AppLocale } from '@/i18n/routing';
import { Accent } from './accent';
import { DaysUntil } from './days-until';
import { SeatGrid } from './seat-grid';

// §4.10 (rebuilt). Membership as an AGM convening notice, not a pricing
// tier grid. Dusk plane, second and final dark section on the page
// (mirrors "Where the money goes").
//
// THE ARGUMENT CHANGED ON 2026-09-16. It used to be "one voting seat costs
// 1 000 kr, and roughly three-quarters of members don't have one" — the fee
// set at display size, a seat grid showing 1 040 of 4 200 filled, and a "Get
// a vote" button. The client removed the tiers, made membership free and
// gave every member a vote, which deletes that argument entirely: there is
// no seat to buy and no minority to join.
//
// What replaces it is the same shape making the true claim — the word FREE
// where the price stood, one vote per member beside it, one button. The seat
// grid switches itself off through votingMembers: null in lib/membership.ts,
// which the component already supported.

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

  const { totalMembers, votingMembers, agm } = membership;
  const showGrid = votingMembers !== null;

  const { dayMonth, year } = formatAgmDateParts(locale, agm.date);
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
            <h2 className="font-serif text-[clamp(1.75rem,3.2vw,1.95rem)] leading-[1.18] text-paper text-balance">
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

            {/* Where "1 000" stood. Same slot, same scale — the number was
               the loudest thing in this column and the word that replaces it
               should be too, because "free" is now the offer. No
               tabular-nums: it is a word. */}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-serif text-[34px] leading-none text-paper md:text-[40px]">
                {t('freeWord')}
              </span>
              <span className="text-[13.5px] text-dusk-60">
                {t('freeNote')}
              </span>
            </div>

            <div className="mt-7 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6 md:mt-8">
              {/* ONE button now, to /bli-medlem. The pair it replaces was
                 "Get a vote" (the paid tier, via ?tier=voting) beside "Free
                 membership" (the unpaid one) — two buttons that existed only
                 to split a choice that no longer exists. Both pointed at
                 /medlemskap, the tier picker; the join flow is the right
                 destination. membership.ctaSecondary is left in the message
                 files, unused, rather than deleted from three locales for a
                 button that may come back. */}
              <Link
                href={`/${locale}/bli-medlem`}
                className="inline-flex min-h-11 items-center rounded-full bg-gold px-5 text-[14px] font-semibold text-dusk hover:bg-gold-deep hover:text-paper transition-colors"
              >
                {t('ctaPrimary')}
              </Link>
            </div>
          </div>

          {/* Right column — the notice card */}
          <aside className="rounded-lg bg-[#1C2E3A] p-5 md:p-[1.3rem]">
            <p className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-gold-deep">
              {t('venueLabel')}
            </p>
            <p className="mt-2 font-serif text-[24px] leading-[1.05] text-paper tabular-nums md:text-[34px]">
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
                <p className="mt-5 text-[12px] leading-[1.5] text-dusk-60 md:mt-[30px]">
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
