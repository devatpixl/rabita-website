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
export type GiftKey = 'prayer' | 'shelf' | 'desk' | 'panel';

export type Gift = {
  key: GiftKey;
  amountNok: number;
  unitTotal: number;
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
  { key: 'prayer', amountNok: 500,     unitTotal: 1200, unitFunded: 412 },
  { key: 'shelf',  amountNok: 15_000,  unitTotal: 60,   unitFunded: 18  },
  { key: 'desk',   amountNok: 25_000,  unitTotal: 120,  unitFunded: 9   },
  { key: 'panel',  amountNok: 100_000, unitTotal: 48,   unitFunded: 3   },
];

export function fundedPercent(gift: Gift): number | null {
  if (typeof gift.unitFunded !== 'number' || gift.unitTotal <= 0) return null;
  const pct = (gift.unitFunded / gift.unitTotal) * 100;
  return Math.max(0, Math.min(100, pct));
}
