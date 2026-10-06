// The fifteen apartments, as published by the project's own sales site
// cm8.no (read 2026-09-02).
//
// This is a SNAPSHOT, and the page that renders it says so and links to
// cm8.no as the live source. Prices and availability move; a table copied
// into a second site and then forgotten is how a buyer ends up ringing about
// a flat that sold months ago.
//
// Sizes are the areas cm8 publishes per unit. Prices are NOK.
export const APARTMENTS_AS_OF = '2026-09-07';
export const APARTMENTS_SOURCE = 'https://cm8.no';

export type Apartment = {
  /** Unit code as the sales site uses it, e.g. H501. */
  unit: string;
  floor: 5 | 6;
  rooms: number;
  m2: number;
  balconyM2: number | null;
  priceNok: number;
  sold: boolean;
};

export const APARTMENTS: readonly Apartment[] = [
  { unit: 'H501', floor: 5, rooms: 1, m2: 47, balconyM2: 6, priceNok: 6_000_000, sold: false },
  { unit: 'H502', floor: 5, rooms: 3, m2: 55, balconyM2: 7, priceNok: 7_200_000, sold: false },
  { unit: 'H503', floor: 5, rooms: 3, m2: 62, balconyM2: 7, priceNok: 7_600_000, sold: false },
  { unit: 'H504', floor: 5, rooms: 3, m2: 74, balconyM2: 7, priceNok: 8_600_000, sold: false },
  { unit: 'H505', floor: 5, rooms: 2, m2: 61, balconyM2: 6, priceNok: 7_500_000, sold: false },
  { unit: 'H506', floor: 5, rooms: 4, m2: 86, balconyM2: 6, priceNok: 9_500_000, sold: true },
  { unit: 'H507', floor: 5, rooms: 4, m2: 98, balconyM2: 6, priceNok: 11_000_000, sold: false },
  { unit: 'H508', floor: 5, rooms: 2, m2: 37, balconyM2: 6, priceNok: 5_000_000, sold: true },
  { unit: 'H601', floor: 6, rooms: 1, m2: 47, balconyM2: 6, priceNok: 6_200_000, sold: false },
  { unit: 'H602', floor: 6, rooms: 3, m2: 55, balconyM2: 6, priceNok: 7_200_000, sold: false },
  { unit: 'H603', floor: 6, rooms: 3, m2: 62, balconyM2: 7, priceNok: 7_800_000, sold: false },
  { unit: 'H604', floor: 6, rooms: 3, m2: 74, balconyM2: 7, priceNok: 8_800_000, sold: false },
  { unit: 'H605', floor: 6, rooms: 4, m2: 82, balconyM2: 10, priceNok: 9_400_000, sold: false },
  { unit: 'H606', floor: 6, rooms: 4, m2: 77, balconyM2: 9, priceNok: 9_200_000, sold: false },
  { unit: 'H607', floor: 6, rooms: 1, m2: 17, balconyM2: null, priceNok: 2_800_000, sold: true },
];

const available = () => APARTMENTS.filter((a) => !a.sold);

/**
 * The headline "from" price — computed from what is actually FOR SALE, not
 * from the whole table.
 *
 * ── H607 HAS FLIPPED FIVE TIMES. READ THIS BEFORE TOUCHING EITHER ───────
 * It is the 17 m² studio at 2 800 000, the only unit under 5 million, so its
 * `sold` flag used to BE the headline figure and the two chased each other:
 *
 *   2026-09-02  sold: true   — the first snapshot. Figure read 6 millioner.
 *   2026-09-07  sold: false  — client said the figure was wrong; cm8.no
 *                             listed all fifteen as available.
 *   2026-09-18  sold: true   — his own list of sold flats, which also marked
 *                             H506 and H508. Figure went back to 6.
 *   2026-09-30  sold: false  — client again: "lowest apartment is 2.8".
 *   2026-10-06  sold: true   — client: "3 appartments are sold out of 15",
 *                             confirming Mobilversjon's "3 av 15 er solgt"
 *                             and "12 igjen ikke 13".
 *
 * THE CHASING IS OVER, because the figure no longer depends on the flag.
 *
 * fromPriceNok now spans the WHOLE development rather than what is unsold —
 * which is what the numbers printed beside it have always done. minM2/maxM2
 * in apartmentStats read APARTMENTS, not available(), so "17-98 m²" has
 * always counted sold flats. "Fra 2,8 mill." next to it counting only unsold
 * ones was the odd one out, and that mismatch is what moved this flag four
 * times.
 *
 * It also makes his statements consistent rather than contradictory. He said
 * H607 was sold on 18 Sept, that the lowest is 2,8 on 30 Sept, and that three
 * of fifteen are sold on 6 Oct. Those conflict only if the figure means
 * "cheapest you can buy today"; as the development's price range beside its
 * size range, all three hold at once — and Tekst (endelig) lists it exactly
 * that way, "15 / 17-98 m² / 2,8 mill.", three facts about the project.
 *
 * WHAT TO WATCH: if it is ever meant as "cheapest available", this goes back
 * to available() and 2,8 becomes 6,0 the moment H607 is sold. The word "fra"
 * does not settle which is meant — the copy would have to.
 */
export function fromPriceNok(): number {
  return Math.min(...APARTMENTS.map((a) => a.priceNok));
}

export function apartmentStats() {
  const avail = available();
  const sizes = APARTMENTS.map((a) => a.m2);
  const rooms = APARTMENTS.map((a) => a.rooms);
  return {
    total: APARTMENTS.length,
    available: avail.length,
    sold: APARTMENTS.length - avail.length,
    fromNok: fromPriceNok(),
    toNok: Math.max(...avail.map((a) => a.priceNok)),
    minM2: Math.min(...sizes),
    maxM2: Math.max(...sizes),
    minRooms: Math.min(...rooms),
    maxRooms: Math.max(...rooms),
  };
}
