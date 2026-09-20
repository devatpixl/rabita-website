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
// §13.2 — budget figures, RESOLVED 2026-09-01. There are two numbers and they
// were never meant to reconcile:
//
//   • TOTAL_BUILD_COST_NOK — what the building costs to put up, converted
//     from the euro per-phase breakdown in the client's fremdrift brochure
//     on 2026-09-18 at the client's instruction. See PROJECT_PHASES below.
//   • goalNok — the donation-funded SHARE of that, in kroner. This is what
//     the meter tracks. It is not the project budget.
//
// They are never mixed on screen and never converted into one another: no
// rate is stated anywhere, and one that ages silently would be worse than
// two honest figures side by side. The brochure now totals 24.53M EUR, not
// the 30M an earlier note here cited — the earlier figure predates the
// per-phase breakdown below and has been dropped.

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
  // 1 000, not 10 000. Client, Tekst (endelig) Sept 2026: "Besøkstallet er
  // endret fra «10 000 besøkende i uken» til «1 000+ besøkende i uken» —
  // det gamle tallet var fra et større, tidligere lokale og stemmer ikke
  // lenger." The congregation is in Sørligata while Calmeyers gate is a
  // building site, so the old figure described a building that no longer
  // exists. Rendered with a trailing "+" by the copy, not by this number.
  visitorsPerWeek: 1_000,
  nationalities: 50, // "mer enn 50 nasjonaliteter"
  pupils: 400, // "over 400 studenter/elever på Rabita"
  // Two separate counts, and they are not interchangeable. `pupils` is who
  // is enrolled at the weekend school — it is what "400+ pupils every
  // weekend" on the home page and /undervisning both mean.
  // `studentsPerYear` is everyone who sits in a class across a year, adults
  // and evening courses included (client, Hjem.pdf 2026-09-09: "over 5000
  // elever i året"). Note it collides numerically with
  // studentVisitorsPerYear below, which counts visiting school and
  // university GROUPS and is a third thing again.
  studentsPerYear: 5_000,
  newMembersLastYear: 184, // client, Hjem.pdf: "184 nye bare i fjor"
  studentVisitorsPerYear: 5_000, // school/university visits — not in the report; §10 brief
  teachers: 19,
  womensPrayerCapacityBefore: 100,
  womensPrayerCapacityAfter: 500,
  mensPrayerCapacityBefore: 500,
  mensPrayerCapacityAfter: 2_000,

  // Building — §10
  buildingM2: 5_745, // client, Hjem.pdf 2026-09-09 (was 6 762)
  floorsAbove: 6,
  // One basement, not two (client, Hjem.pdf 2026-09-09: "6 etasjer + U1").
  // It also settles a contradiction: the architect's floor drawings run
  // lower floor + six storeys = seven, which is the "sju etasjer" this site
  // has been claiming all along, and 6+2 would have made eight.
  floorsBelow: 1,
  rentalApartments: 15,
  // Name, comma, practice. The architect card splits on that comma and stacks
  // the second half under the first as a gold mono line.
  //
  // The history is worth keeping, because this value has been all three
  // things. It read "…, Norconsult" until Versjon 3, when the client said
  // "fjern Norconsult pa Havard" and it became the bare name. On 2026-09-14
  // he said "Bytt Norconsult til HLF Arkitekter", which named the firm on the
  // renders, and then "just add HLF below his name". So the earlier removal
  // was about the WRONG FIRM being there, not about the man standing alone.
  //
  // Written out as "HLF Arkitekter", not "HLF", so the card and the three
  // image captions say the same thing. The site naming one firm two ways
  // would read as two firms.
  // "Lindgard" here since the first import; Tekst (endelig) Sept 2026
  // prints it "Håvard Lindgård Fagernes — HLF Arkitekter". It is a
  // person's name, so the client's spelling wins.
  architect: 'Håvard Lindgård Fagernes, HLF Arkitekter',
  siteClearedRamadan: 2025,
  // constructionStart is UNREFERENCED since 2026-09-15: the key-figures row
  // that printed it was changed to the build DURATION at the client's request
  // ("Endre til «2 års byggetid» i stedet for byggestart"). Kept because the
  // date itself is still true and cheap to show again.
  constructionStart: '2026-Q1',
  /** Years of construction. Client, 2026-09-15: "2 års byggetid". */
  constructionYears: 2,
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
  //
  // TWO ADDRESSES, AND THEY ARE NOT INTERCHANGEABLE. Collapsing them back
  // into one is what put a building site in the footer.
  //
  //   visitAddress  where the congregation IS, today. The footer register,
  //                 /kontakt, the prayer calendar, prayer-visit and the
  //                 Besøk oss section on /om-oss. Somebody reads this and
  //                 walks there.
  //   address       what the campaign is BUILDING. The hero eyebrow, the
  //                 project pages, and 27 copy keys in each of three
  //                 locales. Somebody reads this and gives money to it.
  //
  // The plot at Calmeyers gate 8 was cleared in Ramadan 2025 (see
  // siteClearedRamadan below) and the mosque now rents premises at
  // Sørligata 8a in the meantime — Årsrapport 2024, in its own words:
  // "Vi endte til slutt [med en avtale] med Islamske Senter om å leie deres
  // lokale i Sørligata 8 til bruk som moské."
  //
  // Source for the value itself: the back cover of BOTH
  // public/dokumenter/rabita-arsrapport-2024.pdf and -2025.pdf, which print
  // "Det Islamske Forbundet - Rabita / Sørligata 8a, 0577 Oslo". The site
  // serves those PDFs from /givere, so a visitor could already read the
  // right address in a document the wrong address was sitting next to.
  //
  // NOT THE REGISTERED ADDRESS. The donation certificate (takk/attest) and
  // the data-controller clause in the privacy copy want whatever
  // Brønnøysund holds, which may be a third value again — both still print
  // `address` and are deliberately left alone pending the client's answer.
  visitAddress: 'Sørligata 8a, Oslo',
  visitPostal: '0577 Oslo',
  address: 'Calmeyers gate 8, Oslo',
  postalCity: '0183 Oslo',
  openingHours: 'Man til søn, 06:00 til 22:00', // TODO confirm; placeholder
  newsletterEmail: 'nyhetsbrev@rabita.no', // TODO confirm; placeholder
  contactEmail: 'post@rabita.no', // TODO confirm; placeholder
  // TODO CONFIRM — CONFLICT. Årsrapport 2024 and 2025 both print
  // "Tlf: 22 99 36 62" on the back cover, beside the Sørligata address.
  // This value is the one that was here, unsourced. One of the two is
  // stale and only the client knows which, so nothing is changed yet.
  // It is also what the footer's WhatsApp link dials (social-marks.tsx).
  contactPhone: '+47 22 20 80 88',
});

// Prayer times: live from IRN's API via lib/irn.ts, with lib/prayer-times.ts
// as the offline fallback. Nothing prayer-related is hard-coded here any more.

// Named phase-1 sub-campaign so 100M doesn't feel unfinishable per §4.
export const SUB_CAMPAIGN = Object.freeze({
  name: 'Fundamentet',
  goalNok: 12_000_000,
  raisedNok: 4_320_000, // TODO wire to real feed
});

// The project in five funded phases, from the client's fremdrift brochure
// (2026-09-01). Two are already paid for and delivered; three are ahead.
//
// `nok` is that phase's share of the total build cost.
//
// ── CONVERTED FROM EURO 2026-09-18, ON THE CLIENT'S INSTRUCTION ──────────
// "Faser: Legge inn riktig valuta så kroner." The brochure figures are, and
// always were, genuine EURO — not kroner that had been mislabelled. The
// arithmetic settles it: 24.53M € over the building's 5 745 m² is about
// 50 000 NOK/m² at any plausible rate, which is ordinary Oslo commercial
// construction. Read as kroner the same figures give 4 270 NOK/m², roughly a
// tenth of what it costs to build anything here. So this is a conversion, not
// a correction of a labelling mistake.
//
// RATE: EUR_NOK below. A rate printed once starts ageing the moment it ships
// — which is exactly why the §13.2 note kept the two currencies apart until
// now — so it is ONE named constant with the date it was set, and the phase
// figures are derived from it rather than typed out. Changing the rate
// changes every figure on /moskeprosjektet, in one line.
//
// ROUNDED to the nearest 100 000 kr (client: "convert and use rounded"). At
// this scale a figure like 7 103 600 claims a precision a converted budget
// does not have; 7 100 000 is honest about being an approximation.
//
// IF RABITA HAS THE BUDGET IN KRONER — and a Norwegian building project
// almost certainly does, with the euro figures being the converted ones for
// the brochure — replace EUR_NOK and this derivation with their real numbers
// and the ageing problem disappears entirely. Worth asking.
//
// The last three keys are deliberately the SAME keys the campaign meter has
// always used, so this is one vocabulary rather than a second one: PHASES
// below is derived from this array, and components/campaign-meter.tsx and
// components/phase-popover.tsx keep working untouched. (There is already a
// third, unrelated set in lib/donor-wall.ts; a fourth would be the real
// mistake here.)
/** EUR→NOK, set 2026-09-18. The one number to change if the rate moves. */
const EUR_NOK = 11.8;

/** To the nearest 100 000 kr — see the rounding note above. */
const toNok = (eur: number) => Math.round((eur * EUR_NOK) / 100_000) * 100_000;

// YEARS ONLY ON WHAT HAS HAPPENED (client, Tekst (endelig) Sept 2026).
// Phases 1 and 2 are finished and keep their dates; 3, 4 and 5 carry `null`,
// because construction has no fixed start and the document is explicit that
// no year may be promised: "Årstall på fase 4 og 5 er fjernet (sto tidligere
// som «2027» og «2028») siden byggestart for disse fasene ikke er fastsatt",
// and phase 3 is listed with a status and no year at all.
//
// null rather than deleting the fields: projectPhaseState() reads them to
// decide done / current / next, and a phase with no dates is simply one that
// has not been scheduled. Restoring a year is one value per row.
// `eur` IS THE SOURCE, `nok` is derived. Both are carried because the site
// prints different ones in different languages (client, Tekst (endelig) Sept
// 2026): "Alle beløp er endret fra euro (€) til norske kroner (kr) — valutaen
// som står på siden i dag er feil. I den engelske og arabiske versjonen bør
// det står i euro."
//
// So Norwegian reads the kroner, English and Arabic read the euro the
// brochure was actually budgeted in — and the euro figures are the originals,
// not a conversion back, so no rounding error accumulates in either direction.
export const PROJECT_PHASES = Object.freeze([
  { n: 1, from: 2019, to: 2024, key: 'planning' as const, eur: 602_000, nok: toNok(602_000) },
  { n: 2, from: 2025, to: 2025, key: 'demolition' as const, eur: 946_000, nok: toNok(946_000) },
  { n: 3, from: null, to: null, key: 'fundament' as const, eur: 9_632_000, nok: toNok(9_632_000) },
  { n: 4, from: null, to: null, key: 'interior' as const, eur: 6_450_000, nok: toNok(6_450_000) },
  { n: 5, from: null, to: null, key: 'ferdigstillelse' as const, eur: 6_900_000, nok: toNok(6_900_000) },
]);

/** The same sum in the currency it was budgeted in. Summed, never typed. */
export const TOTAL_BUILD_COST_EUR = PROJECT_PHASES.reduce((a, p) => a + p.eur, 0);
export type ProjectPhaseKey = (typeof PROJECT_PHASES)[number]['key'];

// Summed, never typed twice: a total that can disagree with its own parts is
// the classic way a figure like this goes stale.
export const TOTAL_BUILD_COST_NOK = PROJECT_PHASES.reduce((sum, p) => sum + p.nok, 0);

// Where each phase stands relative to a given date. The brochure's own
// framing — "the first two phases have been completed" — falls out of the
// years rather than being asserted separately.
export function projectPhaseState(
  phase: (typeof PROJECT_PHASES)[number],
  now: Date = new Date(),
): 'done' | 'current' | 'next' {
  const y = now.getFullYear();
  // Phases 3-5 carry no dates since Sept 2026 (see PROJECT_PHASES). An
  // undated phase is one nobody has scheduled, so it is what comes NEXT —
  // never 'done', and never 'current', which would claim a start date the
  // client says does not exist. The one exception is the phase the campaign
  // itself says it is in: CAMPAIGN.phase is the single source for that, and
  // it is set by hand rather than inferred from a calendar.
  if (phase.from == null || phase.to == null) {
    return CAMPAIGN.phase === 'foundations' && phase.key === 'fundament' ? 'current' : 'next';
  }
  if (y > phase.to) return 'done';
  if (y >= phase.from) return 'current';
  return 'next';
}

// Segmented phase timeline for the CampaignMeter — the three BUILD phases.
// Derived from PROJECT_PHASES so the meter and the fremdrift page can never
// drift apart. `key` is the i18n slot.
//
// Selected by having NO dates rather than by `from >= 2026`: since Sept 2026
// the undated phases ARE the ones still ahead (see PROJECT_PHASES), and the
// year test could not survive their years being removed. `year` is kept on
// the shape, null where there is none, so a consumer that wants to print one
// can — and none does today, which is the point.
export const PHASES = Object.freeze(
  PROJECT_PHASES.filter((p) => p.from == null).map((p) => ({ year: p.from, key: p.key })),
);
export type PhaseKey = 'fundament' | 'interior' | 'ferdigstillelse';

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
//
// Lowered 2026-09-17 (client: "Vurdere om summene bør være lavere som
// innocents"). innocents.no runs [150, 300, 500, 1000]; this takes its floor
// and not its ceiling. The entry rung is what decides whether a first-time
// giver clicks at all, so 200 → 150 matches him there — but Rabita is asking
// for 100 000 000 kr, and a 1 000 kr top rung caps the average gift with
// nothing gained, so the fourth box is 1 500 rather than his 1 000.
//
// 500 stays RECOMMENDED and DEFAULT: it is the third rung in the new ladder
// instead of the second, which makes the highlighted box an upsell from the
// two beneath it rather than the midpoint. That is deliberate.
export const AMOUNT_PRESETS = [150, 300, 500, 1_500] as const;
export const RECOMMENDED_AMOUNT: (typeof AMOUNT_PRESETS)[number] = 500;
export const DEFAULT_AMOUNT: (typeof AMOUNT_PRESETS)[number] = 500;
export const DEFAULT_FREQUENCY: 'monthly' | 'once' = 'monthly';

export type Frequency = 'monthly' | 'once';
