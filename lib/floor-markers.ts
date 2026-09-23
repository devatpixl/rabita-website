// Where each room sits on each floor drawing, and where its label goes.
//
// The architect's deck ships the drawings clean; the labels are ours to draw
// (client, 2026-09-09: "we will draw arrows at exact places and show the text
// ourselves"). The previous deck had them baked in as white boxes, which is
// what this replaces.
//
// Coordinates are PERCENTAGES of the drawing frame, not pixels, so they hold
// at every size the plate is rendered at. `x`/`y` is the point on the
// building the label is about; `lx`/`ly` is where the text sits, out on the
// dusk ground. A leader line joins the two.
//
// `align` says which side of the label the leader arrives on, so the text
// runs away from the building rather than back across it.
//
// `mx`/`my` are a phone-only override for `x`/`y`. On a phone the name sits
// ON the room rather than out on a leader, so two labels close together are
// two whole chips close together, not two dots. Where that makes a pair
// touch, the phone label moves a few percent and the desktop point does not
// — which is why the override exists rather than a change to `x`/`y`.
export type FloorMarker = {
  /** Indexes floorByFloor.rooms.<id> for the label text. */
  id: string;
  x: number;
  y: number;
  lx: number;
  ly: number;
  align: 'start' | 'end';
  /** Phone-only x, when the chip needs to clear a neighbour. */
  mx?: number;
  /** Phone-only y, when the chip needs to clear a neighbour. */
  my?: number;
};

// REMOVED 2026-09-15 (client: "Fjerne garderobe og beboerinngang på
// figurene"): `garderober` from `lower` and `residentsEntrance` from `first`.
//
// Both were in the group that had no photographs and no description — only a
// name — so a reader who found them got nothing for the click. Taking them out
// cuts that empty group from nine markers to seven.
//
// Note the direction of travel before restoring either: residentsEntrance
// carried an `mx: 20` added the day before, on 2026-09-14, to pull its phone
// chip back into frame at his request. That nudge goes with it.
//
// Their names stay in messages under floorByFloor.rooms.garderober and
// .residentsEntrance, unreferenced and translated in all three.
export const FLOOR_MARKERS: Record<string, FloorMarker[]> = {
  lower: [
    { id: 'prayerMen', x: 52, y: 61, lx: 24, ly: 33, align: 'end' },
    { id: 'wuduMen', x: 73, y: 74, lx: 90, ly: 62, align: 'start' },
    { id: 'sportsHall', x: 66, y: 86, lx: 86, ly: 93, align: 'start' },
  ],
  first: [
    { id: 'prayerMain', x: 52, y: 50, lx: 27, ly: 15, align: 'end' },
    { id: 'cafe', x: 26, y: 69, lx: 4, ly: 78, align: 'end', my: 73 },
    { id: 'foyer', x: 57, y: 83, lx: 74, ly: 95, align: 'start' },
    { id: 'library', x: 77, y: 72, lx: 97, ly: 60, align: 'start' },
  ],
  second: [
    { id: 'prayerWomen', x: 50, y: 44, lx: 30, ly: 12, align: 'end' },
    { id: 'prayerScreened', x: 65, y: 33, lx: 85, ly: 18, align: 'start' },
    { id: 'commercial', x: 40, y: 68, lx: 12, ly: 92, align: 'end', mx: 34, my: 76 },
    { id: 'wuduWomen', x: 76, y: 61, lx: 93, ly: 48, align: 'start', my: 57 },
    { id: 'childrensRoom', x: 68, y: 66, lx: 94, ly: 64, align: 'start' },
    { id: 'imamOffice', x: 71, y: 77, lx: 95, ly: 92, align: 'start' },
  ],
  third: [
    { id: 'school', x: 50, y: 35, lx: 24, ly: 10, align: 'end' },
    { id: 'amphi', x: 65, y: 53, lx: 97, ly: 36, align: 'start' },
    { id: 'garden', x: 70, y: 64, lx: 99, ly: 66, align: 'start' },
    // SPLIT INTO TWO, 2026-09-23. Client, Versjon 6: "Breake konferanse og
    // selskapslokaler."
    //
    // An earlier pass split only the TEXT and left one pin, on the reasoning
    // that two pins on one room would be a false statement on an architect's
    // drawing. That reasoning was right and the premise was wrong: there are
    // two rooms. The drawing shows two large open plates in the west corner
    // divided by a full-height wall, and the single pin it used to carry
    // (x:30 y:57) sat ON that dividing wall — which is why it read as one
    // room. Verified by plotting candidates on step-4.webp before moving
    // anything, not read off the percentages.
    //
    // Which is which is the one thing the drawing cannot tell us. The
    // conference room is the west plate here because the banquet room then
    // sits beside the roof garden and the amfi, which is where a wedding
    // party would spill out. If the client says otherwise it is a swap of
    // the two ids and nothing else — the coordinates stay.
    //
    // conference keeps conference-1.webp: that render is rows of chairs, two
    // projector screens and a presenter, so it is unambiguously the seminar
    // room. banquet has no photograph and does not need one to be clickable —
    // FloorMarkers.canOpen() opens a room on EITHER a photograph or a
    // roomDesc, and banquet has the second. He owes us the picture.
    //
    // Phone overrides on both. The rooms are adjacent — 14% apart across and
    // 10% down — so at CHIP_W the two name-plates would sit on top of each
    // other. The overrides pull them apart vertically, to the top of the west
    // plate and the bottom of the south one, where each still reads as
    // belonging to the room under it. mx on conference is 22 rather than its
    // true 20 so the chip's left edge clears the frame.
    { id: 'conference', x: 20, y: 52, lx: 4, ly: 36, align: 'end', mx: 22, my: 48 },
    { id: 'banquet', x: 34, y: 62, lx: 10, ly: 86, align: 'end', mx: 36, my: 66 },
  ],
  fourth: [
    { id: 'meetingRooms', x: 52, y: 25, lx: 18, ly: 8, align: 'end' },
    { id: 'administration', x: 68, y: 27, lx: 93, ly: 18, align: 'start', my: 38 },
    { id: 'studio', x: 34, y: 35, lx: 5, ly: 28, align: 'end' },
    { id: 'youthClub', x: 32, y: 56, lx: 6, ly: 74, align: 'end' },
    { id: 'guestArea', x: 55, y: 68, lx: 97, ly: 80, align: 'start', my: 76 },
  ],
  fifth: [{ id: 'apartments', x: 45, y: 32, lx: 20, ly: 12, align: 'end' }],
  sixth: [{ id: 'apartments', x: 50, y: 24, lx: 22, ly: 8, align: 'end' }],
  whole: [
    { id: 'roofTerrace', x: 44, y: 22, lx: 72, ly: 8, align: 'start' },
    // Nudged up onto the dome itself, 2026-09-22. It was x:31 y:33, which
    // on a 1258x1400 frame is pixel (390,462) — the grey roof SLAB of the
    // orange rooftop volume, about 60px below the thing it names. The dome
    // in this design is the small faceted lantern set into that slab, at
    // pixel (380,402): x:30 y:29.
    //
    // Found while checking the client's Versjon 6 line "Legg inn minraet
    // siste bildet på kuppel". The MINARET marker turned out to be exact —
    // x:55 y:35 lands in the middle of the perforated tower — so if
    // anything on that drawing was pointing at the wrong place, it was this
    // one.
    { id: 'dome', x: 30, y: 29, lx: 8, ly: 22, align: 'end' },
    { id: 'minaret', x: 55, y: 35, lx: 90, ly: 40, align: 'start' },
  ],
};

// ── WHAT THE BUILDING CONTAINS, COUNTED FROM THE MARKERS ──────────────────
// The FASILITETER card on /moskeprosjektet prints "N rom · M etasjer". Both
// numbers are derived here rather than typed into the copy, so adding a room
// to a floor above updates the card and the walkthrough together. A count in
// a sentence that disagrees with the thing it counts is the classic way a
// figure like this goes quietly wrong.
//
// `whole` is excluded from the floor tally: the roof terrace, dome and
// minaret are the building seen from outside, not a storey you stand on.
// Rooms are counted UNIQUE — apartments carry a marker on both the fifth and
// the sixth floor and are one facility, not two.

const FLOOR_KEYS = ['lower', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth'] as const;

export const FLOOR_COUNT = FLOOR_KEYS.length;

export const FLOOR_ROOM_COUNT = new Set(
  Object.entries(FLOOR_MARKERS)
    .flatMap(([, markers]) => markers.map((m) => m.id)),
).size;

/**
 * The FASILITETER card's four lines, in the client's own order and wording
 * (Tekst (endelig), Sept 2026):
 *
 *   Bønnerom fordelt over tre etasjer
 *   Klasserom for 1.-7. trinn
 *   Bibliotek, kafé og restaurant
 *   Ungdomsklubb, flerbrukshall og hage
 *
 * GROUPS, NOT ROOMS. The card used to list six individual rooms and read
 * their labels straight from floorByFloor.rooms. His list groups them — one
 * line covers three prayer halls, another covers the youth club, the
 * multi-purpose hall and the garden together — so the text now lives in
 * projectPage.facts.facilityLines and these keys only choose the glyph.
 *
 * It is the same instruction that removed "Kapasitet: 2 500 personer" from
 * the key figures: "erstattet med fasilitetslisten".
 */
export const FACILITIES = [
  { key: 'prayer', glyph: 'prayerMain' },
  { key: 'school', glyph: 'school' },
  { key: 'library', glyph: 'library' },
  { key: 'youth', glyph: 'sportsHall' },
] as const;
