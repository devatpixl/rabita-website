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

export const FLOOR_MARKERS: Record<string, FloorMarker[]> = {
  lower: [
    { id: 'garderober', x: 41, y: 78, lx: 14, ly: 91, align: 'end' },
    { id: 'prayerMen', x: 52, y: 61, lx: 24, ly: 33, align: 'end' },
    { id: 'wuduMen', x: 73, y: 74, lx: 90, ly: 62, align: 'start' },
    { id: 'sportsHall', x: 66, y: 86, lx: 86, ly: 93, align: 'start' },
  ],
  first: [
    { id: 'prayerMain', x: 52, y: 50, lx: 27, ly: 15, align: 'end' },
    { id: 'cafe', x: 21, y: 65, lx: 5, ly: 53, align: 'end' },
    { id: 'residentsEntrance', x: 22, y: 73, lx: 7, ly: 90, align: 'end' },
    { id: 'foyer', x: 57, y: 79, lx: 74, ly: 95, align: 'start', my: 83 },
    { id: 'library', x: 77, y: 72, lx: 97, ly: 60, align: 'start' },
  ],
  second: [
    { id: 'prayerWomen', x: 48, y: 45, lx: 30, ly: 12, align: 'end' },
    { id: 'prayerScreened', x: 62, y: 34, lx: 85, ly: 18, align: 'start' },
    { id: 'commercial', x: 30, y: 72, lx: 12, ly: 92, align: 'end' },
    { id: 'wuduWomen', x: 77, y: 64, lx: 93, ly: 52, align: 'start', mx: 78, my: 57 },
    { id: 'childrensRoom', x: 64, y: 77, lx: 94, ly: 68, align: 'start', mx: 62, my: 70 },
    { id: 'imamOffice', x: 76, y: 83, lx: 95, ly: 92, align: 'start' },
  ],
  third: [
    { id: 'school', x: 50, y: 35, lx: 24, ly: 10, align: 'end' },
    { id: 'amphi', x: 65, y: 53, lx: 97, ly: 36, align: 'start' },
    { id: 'garden', x: 70, y: 64, lx: 99, ly: 66, align: 'start' },
    { id: 'conference', x: 28, y: 64, lx: 12, ly: 92, align: 'end' },
  ],
  fourth: [
    { id: 'meetingRooms', x: 44, y: 30, lx: 18, ly: 10, align: 'end' },
    { id: 'administration', x: 57, y: 33, lx: 93, ly: 22, align: 'start', my: 42 },
    { id: 'studio', x: 30, y: 42, lx: 5, ly: 32, align: 'end' },
    { id: 'youthClub', x: 28, y: 62, lx: 10, ly: 90, align: 'end' },
    { id: 'guestArea', x: 55, y: 68, lx: 97, ly: 80, align: 'start', my: 76 },
  ],
  fifth: [{ id: 'apartments', x: 45, y: 32, lx: 20, ly: 12, align: 'end' }],
  sixth: [{ id: 'apartments', x: 50, y: 24, lx: 22, ly: 8, align: 'end' }],
  whole: [
    { id: 'roofTerrace', x: 44, y: 22, lx: 72, ly: 8, align: 'start' },
    { id: 'dome', x: 31, y: 33, lx: 8, ly: 22, align: 'end' },
    { id: 'minaret', x: 55, y: 35, lx: 90, ly: 40, align: 'start' },
  ],
};
