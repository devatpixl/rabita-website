// Gift Ladder inventory data.
//
// Each tier has a fixed unit total (rooms, shelves, desks, panels the
// building physically has) and a running count of how many are already
// funded. The Gift Ladder shows both plus a thin progress bar so a
// visitor can see honest scarcity — e.g. "48 facade panels exist, 3
// are taken" — without any photography being needed.
//
// TODO(rabita): these unitFunded counts must come from real designation
// tracking. Rabita needs to record, per gift, which physical unit the
// donor's contribution is earmarked for. Until that pipeline is in
// place, set `unitFunded: null` for the row and the UI falls back to
// showing the denominator only ("1 200 m² totalt", no bar). Inventing
// numbers on a mosque fundraising page is not acceptable.
// Five levels added 2026-09-15 (client: "Legge til flere betalingskategorier
// under «Budsjettet er kostet rom for rom»"). His list had seven; two of them
// name amounts this ladder already occupies — 25 000 is "En pult i skolen"
// and 100 000 is "Et panel i fasaden", both with copy and photographs he
// supplied on 2026-09-13 — so those two keep what he chose then, and his
// names for them (Bønneplassen, Grunnleggerne) are NOT applied. Flagged to
// him; renaming is two strings if he confirms.
export type GiftKey =
  | 'self'
  | 'family'
  | 'block'
  | 'quran'
  | 'prayer'
  | 'shelf'
  | 'desk'
  | 'friends'
  | 'panel';

export type Gift = {
  key: GiftKey;
  amountNok: number;
  /**
   * How many of the physical unit exist. `null` for the levels that are not
   * an inventory of anything — "For deg selv" is a sum, not a countable
   * thing, and giving it a made-up total would be exactly the invention the
   * note above forbids.
   *
   * Only GiftLadder ever read this, and GiftLadder renders nowhere. The
   * component on the page, GiftBuilds, shows `items.<key>.meta` instead.
   */
  unitTotal: number | null;
  /**
   * Number of units already funded. Set to `null` (not zero) when the
   * data is unavailable. `null` renders the denominator-only fallback;
   * `0` would render a real zero-progress bar and imply we know the
   * count is zero, which we may not.
   */
  unitFunded: number | null;
};

// Ordered small → large so the ladder reads bottom-up.
export const GIFTS: readonly Gift[] = [
  { key: 'prayer',  amountNok: 500,     unitTotal: 1200, unitFunded: 412  },
  { key: 'self',    amountNok: 1_000,   unitTotal: null, unitFunded: null },
  { key: 'family',  amountNok: 2_000,   unitTotal: null, unitFunded: null },
  { key: 'block',   amountNok: 5_000,   unitTotal: null, unitFunded: null },
  { key: 'quran',   amountNok: 10_000,  unitTotal: null, unitFunded: null },
  { key: 'shelf',   amountNok: 15_000,  unitTotal: 60,   unitFunded: 18   },
  { key: 'desk',    amountNok: 25_000,  unitTotal: 120,  unitFunded: 9    },
  { key: 'friends', amountNok: 50_000,  unitTotal: null, unitFunded: null },
  { key: 'panel',   amountNok: 100_000, unitTotal: 48,   unitFunded: 3    },
];

export function fundedPercent(gift: Gift): number | null {
  // unitTotal is nullable since 2026-09-15: a level like "For deg selv" is a
  // sum, not an inventory, so there is no denominator to be a percentage of.
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
