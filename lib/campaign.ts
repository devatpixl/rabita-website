// Single source of truth for every campaign figure, contact detail and date
// used anywhere on the site. Nothing in components or pages should hardcode a
// number that lives here. If a figure appears twice on screen (meter + footer,
// giving card + trust band) it is read from this module twice, not duplicated.
//
// TODO (§13.1) — completion date conflict: project page says April 2027,
// phase budgets say 2028, the video says ~2.5 years. Do not surface a
// completion date in the UI until the customer picks one. `completionDate`
// stays null and any component that needs it must render a "TBD" state.
//
// TODO (§13.2) — budget figure conflict: 286M NOK (phase totals) vs
// 30M EUR ≈ 330M NOK (brochure) vs 100M NOK (this campaign — donation-funded
// share only). `goalNok` below is the campaign goal, not the total project
// budget. If a page needs the total build cost, wire it in as a separate
// exported constant here first.

export const CAMPAIGN = Object.freeze({
  // Money — §10
  goalNok: 100_000_000,
  raisedNok: 26_995_179,
  lastMonthNok: 1_759_653,
  raisedAsOf: '2026-08-01', // last snapshot date; replace when live feed lands
  phase: 'foundations' as const,

  // Community — figures confirmed in Rabita Årsrapport 2025 (p. 1 & 9)
  members: 4_344, // ordinære medlemmer
  volunteers: 300, // "over 300 frivillige per år"
  visitorsPerWeek: 10_000, // "10.000 besøkende i uken"
  nationalities: 50, // "mer enn 50 nasjonaliteter"
  pupils: 400, // "over 400 studenter/elever på Rabita"
  studentVisitorsPerYear: 5_000, // school/university visits — not in the report; §10 brief
  teachers: 19,
  womensPrayerCapacityBefore: 100,
  womensPrayerCapacityAfter: 500,
  mensPrayerCapacityBefore: 500,
  mensPrayerCapacityAfter: 2_000,

  // Building — §10
  buildingM2: 6_762,
  floorsAbove: 6,
  floorsBelow: 2,
  rentalApartments: 15,
  architect: 'Håvard Lindgard Fagernes, Norconsult',
  siteClearedRamadan: 2025,
  constructionStart: '2026-Q1',
  completionDate: null as string | null, // TODO §13.1

  // Legal — §10
  orgNr: '983 228 364',
  foundedYear: 1987,
  taxDeductionCapNok: 25_000,

  // Payment endpoints — §10
  vippsNumber: '29656',
  bankAccount: '1503.35.60386',
  iban: 'NO42 1503 3560 386',
  swift: 'DNBANOKK',

  // Location — §10
  address: 'Calmeyers gate 8, Oslo',
  postalCity: '0183 Oslo',
  openingHours: 'Man til søn, 06:00 til 22:00', // TODO confirm; placeholder
  newsletterEmail: 'nyhetsbrev@rabita.no', // TODO confirm; placeholder
  contactEmail: 'post@rabita.no', // TODO confirm; placeholder
  contactPhone: '+47 22 20 80 88', // TODO confirm; placeholder
});

// Prayer times: live from IRN's API via lib/irn.ts, with lib/prayer-times.ts
// as the offline fallback. Nothing prayer-related is hard-coded here any more.

// Named phase-1 sub-campaign so 100M doesn't feel unfinishable per §4.
export const SUB_CAMPAIGN = Object.freeze({
  name: 'Fundamentet',
  goalNok: 12_000_000,
  raisedNok: 4_320_000, // TODO wire to real feed
});

// Segmented phase timeline for the CampaignMeter — three equal segments
// (three build years). `key` is the i18n slot; the current phase is the
// one whose year matches "now" (or the last one if we're past 2028).
export const PHASES = Object.freeze([
  { year: 2026, key: 'fundament' as const },
  { year: 2027, key: 'interior' as const },
  { year: 2028, key: 'ferdigstillelse' as const },
]);
export type PhaseKey = (typeof PHASES)[number]['key'];

export function currentPhaseKey(now: Date = new Date()): PhaseKey {
  const y = now.getFullYear();
  if (y <= 2026) return 'fundament';
  if (y <= 2027) return 'interior';
  return 'ferdigstillelse';
}

// Foundation-Stone Wall threshold. Gifts at or above this amount earn
// a permanent name on the wall (§Pass 3D). Swap for a real donor query
// when Prisma is wired.
export const FOUNDATION_WALL_THRESHOLD_NOK = 10_000;

// Preset amount ladder, laid out 2×2 with a recommended box and an
// always-open "other amount" row — the innocents.no pattern the client
// asked for (2026-08-30).
export const AMOUNT_PRESETS = [200, 500, 1_000, 2_500] as const;
export const RECOMMENDED_AMOUNT: (typeof AMOUNT_PRESETS)[number] = 500;
export const DEFAULT_AMOUNT: (typeof AMOUNT_PRESETS)[number] = 500;
export const DEFAULT_FREQUENCY: 'monthly' | 'once' = 'monthly';

export type Frequency = 'monthly' | 'once';
