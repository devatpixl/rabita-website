// The individual apartments for sale, as cards that open a floor plan
// (client, 2026-09-13). This replaces the "sentral beliggenhet" section, which
// argued for the location in four claims; these argue for the homes with the
// actual homes.
//
// NUMBERS LIVE HERE, PROSE LIVES IN messages/. That is the split lib/apartments.ts
// already uses, and it matters more than usual here: every figure below is a
// measured fact off the architect's plan sheet and must read identically in
// all three locales, while the one-line description is written copy that has
// to be translated.
//
// `id` is the client's own card numbering (c1..c12) and is also the image file
// stem, so public/photos/apartments/c1.webp is the face and c1-plan.webp is
// the sheet behind it. Naming by unit (h501) was tempting and rejected: he
// supplied the images as c1..c12 and has not yet told us which unit c3 onward
// is, so a unit-named file would be a guess baked into a filename.
//
// ONLY c1 AND c2 ARE LISTED. The client supplied all twenty-four images at
// once but the copy for cards 3-12 is still coming ("texts ill paste after
// card 2 you build till then"). The images for those ten are already in the
// repo, converted and waiting; adding a unit is this entry plus its two
// message strings. Nothing here is invented to fill the grid out.

export type ApartmentUnit = {
  /** Client's card number, and the image stem under /photos/apartments. */
  id: string;
  /** The unit as the plan sheet names it, e.g. H501. */
  unit: string;
  priceNok: number;
  floor: number;
  /** Bruksareal. */
  braM2: number;
  /** Primærrom. */
  pRomM2: number;
  balconyM2: number;
  /** Ceiling heights, as the sheet gives them — approximate, in metres. */
  ceilingGeneralM: number;
  ceilingBathM: number;
  ceilingHallM: number;
};

export const APARTMENT_UNITS: readonly ApartmentUnit[] = [
  {
    id: 'c1',
    unit: 'H501',
    priceNok: 6_000_000,
    floor: 5,
    braM2: 47,
    pRomM2: 47,
    balconyM2: 6,
    ceilingGeneralM: 2.55,
    ceilingBathM: 2.4,
    ceilingHallM: 2.4,
  },
  {
    id: 'c2',
    unit: 'H502',
    priceNok: 7_200_000,
    floor: 5,
    braM2: 55,
    pRomM2: 55,
    balconyM2: 7,
    ceilingGeneralM: 2.55,
    ceilingBathM: 2.4,
    ceilingHallM: 2.4,
  },
];

export const unitFace = (id: string) => `/photos/apartments/${id}.webp`;
export const unitPlan = (id: string) => `/photos/apartments/${id}-plan.webp`;
