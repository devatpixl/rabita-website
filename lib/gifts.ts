// The gift levels behind "Hver sum bygger noe ekte" on /moskeprosjektet.
//
// ── SIX LEVELS IN TWO SECTIONS, SINCE 2026-09-22 ──────────────────────────
// Client, Versjon 6: "Seksjon om de ulike doneringsalternativer, vi skal lage
// 4 alternativer:" followed by six, and then "DELE I 2 SEKSJONER".
//
//   100 000  stifter med eget signert dokument
//    50 000  Skoleplass (la en elev få mer i3lm på grunn av deg)
//    25 000  Bønneplass
//    10 000  Wudu plass
//     5 000  Vindu
//     2 000  Dør
//
// ("i3lm" is ilm — knowledge — written in the Arabic chat alphabet.)
//
// Nine levels became these six. 500, 1 000 and 15 000 are gone; 2 000, 5 000,
// 10 000, 25 000, 50 000 and 100 000 keep their amounts and take his names.
//
// The two sections fall out of his own list: the top three are a place or a
// standing that belongs to a PERSON — a founder's document, a pupil's seat, a
// worshipper's spot — and the bottom three are PARTS OF THE BUILDING you can
// point at. They are labelled that way rather than "big" and "small", which
// would be true and say nothing.
//
// ── THIS SETTLES A FLAG OPEN SINCE 2026-09-15 ─────────────────────────────
// He asked for "Bønneplassen" at 25 000 and "Grunnleggerne" at 100 000 then,
// and it was NOT applied: he had personally chosen the copy and the
// photographs for those two levels on 13 September, so his own earlier choice
// was kept and the rename was flagged back to him. Asking a second time is
// the answer to that flag.
//
// ── NO INVENTED COUNTS ────────────────────────────────────────────────────
// unitTotal/unitFunded are null on every level. The old ladder carried real
// denominators for four of its rows (48 facade panels, 120 desks) and null
// for the rest; none of those rows survived the rename with its meaning
// intact, and nobody has told us how many doors, windows or wudu places the
// building has. Inventing them on a mosque fundraising page is not
// acceptable. Fill them in when Rabita supplies the figures and the bar
// appears on its own.
// ── TWO COMPONENTS WENT WITH THE OLD KEYS ────────────────────────────────
// components/gift-ladder.tsx and components/inventory-bar.tsx were deleted
// in the same change. GiftLadder rendered on no page — it was superseded by
// GiftBuilds — and InventoryBar was used by nothing but GiftLadder. Both
// hardcoded the old nine keys, so keeping them would have meant rewriting
// two dead components around a level set nobody displays. They are in git at
// e9d6571 if the progress-bar treatment is ever wanted again.
export type GiftKey = 'founder' | 'schoolPlace' | 'prayerPlace' | 'wudu' | 'window' | 'door';

/** Which of the client's two sections a level belongs to. */
export type GiftSection = 'named' | 'parts';

export type Gift = {
  key: GiftKey;
  amountNok: number;
  section: GiftSection;
  /**
   * How many of the physical unit exist, or null when nobody has counted
   * them. Null renders no progress bar at all, which is the honest state —
   * see the note above.
   */
  unitTotal: number | null;
  /** How many are already funded. Null, not zero: zero is a claim. */
  unitFunded: number | null;
};

// HIS ORDER, largest first within each section — the order he wrote them in.
export const GIFTS: readonly Gift[] = [
  { key: 'founder',     amountNok: 100_000, section: 'named', unitTotal: null, unitFunded: null },
  { key: 'schoolPlace', amountNok:  50_000, section: 'named', unitTotal: null, unitFunded: null },
  { key: 'prayerPlace', amountNok:  25_000, section: 'named', unitTotal: null, unitFunded: null },
  { key: 'wudu',        amountNok:  10_000, section: 'parts', unitTotal: null, unitFunded: null },
  { key: 'window',      amountNok:   5_000, section: 'parts', unitTotal: null, unitFunded: null },
  { key: 'door',        amountNok:   2_000, section: 'parts', unitTotal: null, unitFunded: null },
];

/** The two sections, in the order they are shown. */
// PARTS FIRST, THEN THE NAMED PLACES (user, 2026-10-09: "swap the rows, then
// it would be in ascending order of prices").
//
// Answers the client's «Rekkefølgen på donasjonsboksene bør være intensjonell»
// as it reads on THIS section: with the named places on top it went 25 000 →
// 50 000 → 100 000 and then fell back to 2 000 → 5 000 → 10 000, which looks
// like an accident rather than an order. Swapped, the whole section climbs
// 2 000 → 100 000 and ends on Stifter.
//
// Only the section order moved. Each row was already ascending (giftsIn
// below), and each label travels with its own row.
export const GIFT_SECTIONS: readonly GiftSection[] = ['parts', 'named'];

// ASCENDING WITHIN A SECTION (user, 2026-09-28: "keep row order same, but in
// column use ascending order according to prices"). GIFTS above stays in
// his written order, largest first, because that is the order the list was
// agreed in; the rows on the page read 25 000 → 50 000 → 100 000 and
// 2 000 → 5 000 → 10 000, the cheapest way in first. Since 2026-10-09 the
// parts of the building come first and the named places second — see
// GIFT_SECTIONS above.
export function giftsIn(section: GiftSection): readonly Gift[] {
  return GIFTS.filter((g) => g.section === section).sort((a, b) => a.amountNok - b.amountNok);
}

export function fundedPercent(gift: Gift): number | null {
  if (
    typeof gift.unitFunded !== 'number' ||
    typeof gift.unitTotal !== 'number' ||
    gift.unitTotal <= 0
  ) {
    return null;
  }
  const pct = (gift.unitFunded / gift.unitTotal) * 100;
  return Math.max(0, Math.min(100, pct));
}
