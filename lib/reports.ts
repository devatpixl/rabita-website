// The annual reports, as files rather than a sentence promising them
// (client, 2026-09-13: "Legg inn årsrapporter, litt som bønnetabellene på
// bønnetider"). Until now /om-oss said only that the årsrapport was
// "available on request".
//
// The four PDFs are the client's own, downloaded from rabita.no on
// 2026-09-13 and renamed from their export filenames
// (110826_Rabita_Arsrapport_2025_Low.pdf and so on) to something a reader
// sees in their downloads folder and still understands a year later.
//
// `bytes` is measured, not estimated, and it is shown in the UI. Three of
// these are "Low" exports around 5MB; the 2022 one is a "Web_High" export at
// 31MB, which is a lot to hand someone on mobile data without warning. Worth
// asking the client whether a Low version of 2022 exists — every other year
// has one.

export type AnnualReport = {
  year: number;
  /** Under /public. */
  file: string;
  bytes: number;
};

export const ANNUAL_REPORTS: readonly AnnualReport[] = [
  { year: 2025, file: '/dokumenter/rabita-arsrapport-2025.pdf', bytes: 6_367_738 },
  { year: 2024, file: '/dokumenter/rabita-arsrapport-2024.pdf', bytes: 5_515_634 },
  { year: 2023, file: '/dokumenter/rabita-arsrapport-2023.pdf', bytes: 4_903_626 },
  { year: 2022, file: '/dokumenter/rabita-arsrapport-2022.pdf', bytes: 31_459_887 },
];

/** Megabytes to one decimal, in the reader's own number format. */
export function reportSizeMb(bytes: number, locale: string) {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : locale === 'en' ? 'en-GB' : 'nb-NO', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(bytes / 1_000_000);
}
