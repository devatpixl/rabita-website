// Foundation-Stone Wall data.
//
// Intentionally empty until real, GDPR-consented donor records are wired
// through Prisma in Phase 3. Placeholder names were removed on
// 2026-08-14 — the /givere page is unlinked from the homepage until
// Rabita has consented records at a scale that reads as proof of
// support (see the comment at the top of app/[locale]/givere/page.tsx
// for the full rationale).
//
// TODO (pre-launch): every record on this wall must carry an explicit
// `consentToPublishName: true` flag on the donor record. Do NOT render
// a name here without one — silence is not consent, and Norwegian
// charitable convention treats anonymous giving as the default.
//
// Ordering rule: sort by `receivedAt` ascending at render time. Never
// sort alphabetically — the chronology is part of the story.

export type Phase = 'fundament' | 'reisning' | 'ferdigstillelse';

// a: 10 000 – 25 000
// b: 25 000 – 100 000
// c: 100 000 – 500 000
// d: 500 000 +
export type AmountBand = 'a' | 'b' | 'c' | 'd';

const BAND_MIDPOINT_NOK: Record<AmountBand, number> = {
  a: 17_500,
  b: 60_000,
  c: 250_000,
  d: 750_000,
};

export type DonorEntry = {
  name: string;
  qualifier?: string;
  phase: Phase;
  anonymous?: boolean;
  amountBand: AmountBand;
  receivedAt: string; // ISO YYYY-MM-DD
};

export const DONOR_WALL: readonly DonorEntry[] = Object.freeze([]);

// Cap on the homepage section. Overflow goes to the full /givere page.
export const DONOR_WALL_HOMEPAGE_CAP = 40;

export const PHASE_ORDER: readonly Phase[] = ['fundament', 'reisning', 'ferdigstillelse'];

export function donorWallTotals(entries: readonly DonorEntry[]) {
  let nokSum = 0;
  for (const e of entries) nokSum += BAND_MIDPOINT_NOK[e.amountBand];
  return { count: entries.length, nokSum };
}

// Slugify a name for a stable deep-link anchor. Norwegian character
// folding first, then ASCII lowercase, then hyphens for any non-alnum
// run. Anonymous entries have no name, so callers must skip them.
export function donorSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
