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
  { unit: 'H607', floor: 6, rooms: 1, m2: 17, balconyM2: null, priceNok: 2_800_000, sold: false },
];

const available = () => APARTMENTS.filter((a) => !a.sold);

/**
 * The headline "from" price — computed from what is actually FOR SALE, not
 * from the whole table.
 *
 * ── H607 HAS NOW FLIPPED THREE TIMES, SO READ THIS BEFORE TOUCHING IT ────
 * It is the 17 m² studio at 2 800 000, and it is the only unit that decides
 * the headline figure — every other apartment starts at 5 000 000 or more.
 * So its `sold` flag IS the from-price, and the two have chased each other:
 *
 *   2026-09-02  sold: true   — the first snapshot. Figure read 6 millioner.
 *   2026-09-07  sold: false  — client said the figure was wrong; cm8.no
 *                             listed all fifteen as available.
 *   2026-09-18  sold: true   — his own list of sold apartments, which also
 *                             marked H506 and H508. Figure went back to 6.
 *   2026-09-30  sold: false  — client again: "lowest apartment is 2.8".
 *
 * H506 and H508 are LEFT SOLD. They came from the same 18 September list and
 * nothing has been said about them; neither one can move the from-price
 * anyway, since both are above H501's 6 000 000.
 *
 * The derivation stays as it is, because it is what protects the number: if
 * H607 sells again, this stops advertising a price nobody can buy at, on its
 * own, without anyone having to remember to edit a figure somewhere else.
 */
export function fromPriceNok(): number {
  return Math.min(...available().map((a) => a.priceNok));
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
