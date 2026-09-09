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
export type FloorMarker = {
  /** Indexes floorByFloor.rooms.<id> for the label text. */
  id: string;
  x: number;
  y: number;
  lx: number;
  ly: number;
  align: 'start' | 'end';
};

export const FLOOR_MARKERS: Record<string, FloorMarker[]> = {
  // Read off the drawing against a percentage grid, not estimated: the
  // prayer hall's green floor, the changing rooms on the west strip, the
  // ablution cubicles east of the hall, and the sports court in the south
  // wing.
  lower: [
    { id: 'garderober', x: 24, y: 67, lx: 6, ly: 57, align: 'end' },
    { id: 'prayerMen', x: 46, y: 55, lx: 24, ly: 33, align: 'end' },
    { id: 'wuduMen', x: 72, y: 72, lx: 88, ly: 61, align: 'start' },
    { id: 'sportsHall', x: 55, y: 80, lx: 80, ly: 91, align: 'start' },
  ],
  first: [],
  second: [],
  third: [],
  fourth: [],
  fifth: [],
  sixth: [],
  whole: [],
};
