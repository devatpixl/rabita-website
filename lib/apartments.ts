// The fifteen apartments, as published by the project's own sales site
// cm8.no (read 2026-09-02).
//
// This is a SNAPSHOT, and the page that renders it says so and links to
// cm8.no as the live source. Prices and availability move; a table copied
// into a second site and then forgotten is how a buyer ends up ringing about
// a flat that sold months ago.
//
// Sizes are the areas cm8 publishes per unit. Prices are NOK.
export const APARTMENTS_AS_OF = '2026-09-02';
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
 * This matters: cm8.no's own front page advertises "Startspris fra 2,8
 * millioner", which was the 17 m² studio H607 — and H607 is sold. Repeating
 * that figure here would be advertising a price nobody can buy at. The
 * cheapest available unit is what this returns, and it corrects itself as
 * the table is updated.
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
