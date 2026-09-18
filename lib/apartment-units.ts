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
  /** Null where the unit has none — H607 has no balcony, and a rendered
   *  "0 m²" row reads as a balcony of zero square metres rather than as no
   *  balcony at all. The component skips the row on null. */
  balconyM2: number | null;
  /** Ceiling heights, as the sheet gives them — approximate, in metres. */
  ceilingGeneralM: number;
  ceilingBathM: number;
  ceilingHallM: number;
  /**
   * Sold. Added 2026-09-18 with H506/H508/H607, which the client confirmed as
   * the three sold units and which is why they were missing from his original
   * c1..c12: he sent cards for what is FOR SALE. lib/apartments.ts carries the
   * same fact as `sold` on its own fifteen-row table; both are set, because
   * that table is the snapshot of cm8.no and this one is the card list, and
   * neither is derived from the other.
   */
  sold?: true;
};

  // ── ORDER: the sold flats are INTERLEAVED, not parked at the end ────────
  // Client, 2026-09-18: "mix the sold ones, like after first some show this
  // and then gap then 2nd sold and another at end".
  //
  // Four for sale, then one sold, three times over — so SOLGT lands at
  // positions 5, 10 and 15 of the rail. Clustered at the end they read as an
  // afterthought and a visitor who never scrolls that far never learns
  // anything is selling; spread out, the stamp recurs at a steady beat and
  // the rail reads as a live list rather than an inventory with a footnote.
  //
  // The twelve for-sale keep the client's own c1..c12 sequence between the
  // stamps — only the three sold are placed.
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
  // ── The three SOLD units ────────────────────────────────────────────────
  // Client, 2026-09-18, with full spec sheets for each. They were never
  // missing: his c1..c12 were the ones still for sale.
  //
  // IDs are unit-named, not c13..c15. The note at the top of this file
  // rejected unit naming because HE supplied the images as c1..c12 and a
  // unit-named file would have been a guess. That reasoning does not apply
  // here — he supplied these BY UNIT, so h506.webp is the honest name and it
  // documents itself.
  //
  // Both images come out of the one A4 sheet he sent per flat: the sheet IS
  // the plan at 1024x724, the exact size c1-plan.webp already uses, and the
  // face is the interior render lifted from its top-right corner. That render
  // exists at 436x245 and nowhere larger — ASK HIM FOR THE FULL-SIZE RENDERS
  // if these read soft beside the other twelve.
  {
    id: 'h506',
    unit: 'H506',
    priceNok: 9_500_000,
    floor: 5,
    braM2: 86,
    pRomM2: 86,
    balconyM2: 6,
    ceilingGeneralM: 2.55,
    ceilingBathM: 2.4,
    ceilingHallM: 2.4,
    sold: true,
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
  {
    id: 'h508',
    unit: 'H508',
    priceNok: 5_000_000,
    floor: 5,
    braM2: 37,
    pRomM2: 37,
    balconyM2: 6,
    ceilingGeneralM: 2.55,
    ceilingBathM: 2.4,
    ceilingHallM: 2.4,
    sold: true,
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
  {
    id: 'h607',
    unit: 'H607',
    priceNok: 2_800_000,
    floor: 6,
    braM2: 17,
    pRomM2: 17,
    // No balcony on this one — the sheet lists none, and floor 6 runs the
    // taller ceilings throughout.
    balconyM2: null,
    ceilingGeneralM: 2.65,
    ceilingBathM: 2.5,
    ceilingHallM: 2.5,
    sold: true,
  },
];

export const unitFace = (id: string) => `/photos/apartments/${id}.webp`;
export const unitPlan = (id: string) => `/photos/apartments/${id}-plan.webp`;
