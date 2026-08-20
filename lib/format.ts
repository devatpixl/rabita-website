import type { AppLocale } from '@/i18n/routing';

// Numeric formatting is Norwegian across every locale. The currency is
// kroner; brand voice keeps the number reading as Norwegian even on the
// /en and /ar surfaces so "15 000 kr" doesn't turn into "15,000 kr" on
// English or split into a different grouping on Arabic. Intl emits either
// U+00A0 (NBSP) or U+202F (narrow NBSP) as the thousand separator for
// nb-NO depending on the ICU build.
//
// On the Latin locales both are normalised to a regular ASCII space, so a
// `whitespace-nowrap` numeral copies cleanly and reads identically to
// hand-typed copy like "25 000 kr" in the trust line.
//
// Arabic keeps the NBSP. An ASCII space is bidi class WS, which closes the
// number run, so "26 992 498" on an RTL page gets reordered group by group
// and shown as "498 992 26". NBSP is bidi class CS, which holds the groups
// together in one left-to-right run. It looks the same and it is the right
// figure.
const krFormatter = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 });

// U+00A0 no-break space and U+202F narrow no-break space, the two group
// separators nb-NO can emit, written as escapes so they stay visible in a diff.
const GROUP_SEPARATORS = /[\u00A0\u202F]/g;
const NBSP = '\u00A0';

export function formatAmount(locale: AppLocale, amount: number): string {
  return krFormatter.format(amount).replace(GROUP_SEPARATORS, locale === 'ar' ? NBSP : ' ');
}

// A percentage rendered as an integer, no decimal. Used on the meter: the
// "27%" reading is the one visitors screenshot, and anything more precise
// makes the total feel unstable.
export function formatPercent(locale: AppLocale, raised: number, goal: number): string {
  const pct = goal > 0 ? Math.floor((raised / goal) * 100) : 0;
  return new Intl.NumberFormat(locale === 'en' ? 'en-GB' : locale === 'ar' ? 'ar-EG' : 'nb-NO', {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(pct / 100);
}

export function formatDate(locale: AppLocale, iso: string): string {
  const tag = locale === 'en' ? 'en-GB' : locale === 'ar' ? 'ar-EG' : 'nb-NO';
  return new Intl.DateTimeFormat(tag, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}
