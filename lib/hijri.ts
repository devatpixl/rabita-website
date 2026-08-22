// Hijri date, Umm al-Qura, via Intl. One copy, because two would drift.
//
// MUST be called with a date the caller obtained after mount. Pages here
// are statically generated, so a date read during render is the BUILD
// date — the Hijri line would freeze on whatever day the site was last
// deployed and never advance. Passing `now` in forces the caller to have
// a mounted, client-side date.
import { PRAYER_TIMES_TODAY } from './campaign';
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
    // Older engines without the Islamic calendar fall back to the static
    // approximation rather than showing nothing.
    return `${PRAYER_TIMES_TODAY.hijriDayApprox} ${PRAYER_TIMES_TODAY.hijriMonth}`;
  }
}
