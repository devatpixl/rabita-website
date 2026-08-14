import type { AppLocale } from '@/i18n/routing';

// Numeric formatting is Norwegian across every locale. The currency is
// kroner; brand voice keeps the number reading as Norwegian even on the
// /en and /ar surfaces so "15 000 kr" doesn't turn into "15,000 kr" on
// English or split into a different grouping on Arabic. Intl emits either
// U+00A0 (NBSP) or U+202F (narrow NBSP) as the thousand separator for
// nb-NO depending on the ICU build; both are normalised to a regular
// ASCII space so a `whitespace-nowrap` numeral copies cleanly and reads
// identically to hand-typed copy like "25 000 kr" in the trust line.
const krFormatter = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 });

export function formatAmount(_locale: AppLocale, amount: number): string {
  return krFormatter.format(amount).replace(/[  ]/g, ' ');
}

// A percentage rendered as an integer, no decimal. Used on the meter — the
// "27%" reading is the one visitors screenshot; anything more precise makes
// the total feel unstable.
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
