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
// All twelve the client supplied, floors 5 and 6. Floor 6 runs 10cm taller
// throughout (2,65 general / 2,50 bath and hall against 2,55 / 2,40), which is
// the sheet's own figure, not a transcription slip.
//
// H506 is not here and is not missing: his list goes H505 -> H507, and the
// sales site marks H506 as SOLGT.

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

  {
    id: 'c3',
    unit: 'H503',
    priceNok: 7_600_000,
    floor: 5,
    braM2: 62,
    pRomM2: 62,
    balconyM2: 7,
    ceilingGeneralM: 2.55,
    ceilingBathM: 2.4,
    ceilingHallM: 2.4,
  },
  {
    id: 'c4',
    unit: 'H504',
    priceNok: 8_600_000,
    floor: 5,
    braM2: 74,
    pRomM2: 74,
    balconyM2: 7,
    ceilingGeneralM: 2.55,
    ceilingBathM: 2.4,
    ceilingHallM: 2.4,
  },
  {
    id: 'c5',
    unit: 'H505',
    priceNok: 7_500_000,
    floor: 5,
    braM2: 61,
    pRomM2: 61,
    balconyM2: 6,
    ceilingGeneralM: 2.55,
    ceilingBathM: 2.4,
    ceilingHallM: 2.4,
  },
  // H506 is absent from the client's list, not lost: the sales site shows it
  // as SOLGT.
  {
    id: 'c6',
    unit: 'H507',
    priceNok: 11_000_000,
    floor: 5,
    braM2: 98,
    pRomM2: 98,
    balconyM2: 6,
    ceilingGeneralM: 2.55,
    ceilingBathM: 2.4,
    ceilingHallM: 2.4,
  },
  {
    id: 'c7',
    unit: 'H601',
    priceNok: 6_200_000,
    floor: 6,
    braM2: 47,
    pRomM2: 47,
    balconyM2: 6,
    ceilingGeneralM: 2.65,
    ceilingBathM: 2.5,
    ceilingHallM: 2.5,
  },
  // His text reads "7 200 00 kr" - six digits, i.e. 720 000, which would be a
  // tenth of the price of the identical 55 m2 unit one floor down. Read as
  // 7 200 000 and FLAGGED to him; correct here if he says otherwise.
  {
    id: 'c8',
    unit: 'H602',
    priceNok: 7_200_000,
    floor: 6,
    braM2: 55,
    pRomM2: 55,
    balconyM2: 6,
    ceilingGeneralM: 2.65,
    ceilingBathM: 2.5,
    ceilingHallM: 2.5,
  },
  {
    id: 'c9',
    unit: 'H603',
    priceNok: 7_800_000,
    floor: 6,
    braM2: 62,
    pRomM2: 62,
    balconyM2: 7,
    ceilingGeneralM: 2.65,
    ceilingBathM: 2.5,
    ceilingHallM: 2.5,
  },
  {
    id: 'c10',
    unit: 'H604',
    priceNok: 8_800_000,
    floor: 6,
    braM2: 74,
    pRomM2: 74,
    balconyM2: 7,
    ceilingGeneralM: 2.65,
    ceilingBathM: 2.5,
    ceilingHallM: 2.5,
  },
  {
    id: 'c11',
    unit: 'H605',
    priceNok: 9_400_000,
    floor: 6,
    braM2: 82,
    pRomM2: 82,
    balconyM2: 10,
    ceilingGeneralM: 2.65,
    ceilingBathM: 2.5,
    ceilingHallM: 2.5,
  },
  {
    id: 'c12',
    unit: 'H606',
    priceNok: 9_200_000,
    floor: 6,
    braM2: 77,
    pRomM2: 77,
    balconyM2: 9,
    ceilingGeneralM: 2.65,
    ceilingBathM: 2.5,
    ceilingHallM: 2.5,
  },
];

export const unitFace = (id: string) => `/photos/apartments/${id}.webp`;
export const unitPlan = (id: string) => `/photos/apartments/${id}-plan.webp`;
