// Hijri date, Umm al-Qura, via Intl. One copy, because two would drift.
//
// MUST be called with a date the caller obtained after mount. Pages here
// are statically generated, so a date read during render is the BUILD
// date — the Hijri line would freeze on whatever day the site was last
// deployed and never advance. Passing `now` in forces the caller to have
// a mounted, client-side date.
import type { AppLocale } from '@/i18n/routing';

const CALENDAR_TAG: Record<AppLocale, string> = {
  ar: 'ar-SA-u-ca-islamic-umalqura',
  en: 'en-GB-u-ca-islamic-umalqura',
  no: 'nb-NO-u-ca-islamic-umalqura',
};

export function hijriDate(locale: AppLocale, now: Date): string {
  try {
    return new Intl.DateTimeFormat(CALENDAR_TAG[locale] ?? CALENDAR_TAG.no, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(now);
  } catch {
    // Older engines without the Islamic calendar show nothing rather than
    // a wrong date.
    return '';
  }
}

// ── Hijri as NUMBERS, for the calendar grid ───────────────────────────────
// hijriDate() above formats a whole date for display. A calendar cell needs
// the day on its own, and the month/day pair is what decides whether a
// square is Eid.
//
// Forced through 'en-u-ca-islamic-umalqura' rather than the reader's locale:
// month: 'numeric' is only reliably a number there. Arabic returns
// Arabic-Indic digits, which parseInt does not read. The NAME the reader
// sees still comes from hijriDate(), in their own locale.
//
// Noon UTC, not midnight: a date built at local midnight can land on the
// previous day once the formatter applies its own offset, which would shift
// every cell in the grid by one.
const HIJRI_PARTS = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
});

export type HijriParts = { day: number; month: number; year: number };

export function hijriParts(d: Date): HijriParts | null {
  try {
    const at = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12));
    const p = Object.fromEntries(
      HIJRI_PARTS.formatToParts(at)
        .filter((x) => x.type !== 'literal')
        .map((x) => [x.type, x.value]),
    );
    const day = Number(p.day);
    const month = Number(p.month);
    const year = Number(p.year);
    if (!day || !month || !year) return null;
    return { day, month, year };
  } catch {
    return null;
  }
}

// The dates the congregation's year actually turns on, as (hijri month, day).
// Computed rather than listed: a hardcoded table of Gregorian dates goes
// stale every year and silently, which on a mosque's calendar is the worst
// kind of wrong. These pairs are fixed in the Hijri calendar and always will
// be, so the Gregorian date falls out of the conversion for any year.
//
// Umm al-Qura is an ASTRONOMICAL calendar. Rabita — like most mosques —
// may announce Eid a day either side of it on local sighting, so these are
// marked as expected dates, and the copy says so.
export const ISLAMIC_DATES = [
  { key: 'newYear', month: 1, day: 1 },
  { key: 'ashura', month: 1, day: 10 },
  { key: 'mawlid', month: 3, day: 12 },
  { key: 'ramadan', month: 9, day: 1 },
  { key: 'laylatAlQadr', month: 9, day: 27 },
  { key: 'eidFitr', month: 10, day: 1 },
  { key: 'eidAdha', month: 12, day: 10 },
] as const;

export type IslamicDateKey = (typeof ISLAMIC_DATES)[number]['key'];

/** Which observance, if any, falls on this Gregorian day. */
export function islamicDateOn(d: Date): IslamicDateKey | null {
  const h = hijriParts(d);
  if (!h) return null;
  return ISLAMIC_DATES.find((x) => x.month === h.month && x.day === h.day)?.key ?? null;
}
