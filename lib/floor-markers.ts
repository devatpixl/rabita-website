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
  // Every position below was read off the drawing against a percentage grid
  // rendered over it, floor by floor — not estimated from the old deck,
  // whose building sits at a slightly different scale.
  //
  // Labels may sit outside 0-100: the drawing is letterboxed inside a wider
  // container, so there is real room either side, and the overlay does not
  // clip. That margin is what makes the upper floors possible at all — by
  // the sixth the building fills nearly the whole frame.
  lower: [
    { id: 'garderober', x: 24, y: 67, lx: 6, ly: 57, align: 'end' },
    { id: 'prayerMen', x: 46, y: 55, lx: 24, ly: 33, align: 'end' },
    { id: 'wuduMen', x: 72, y: 72, lx: 88, ly: 61, align: 'start' },
    { id: 'sportsHall', x: 55, y: 80, lx: 80, ly: 91, align: 'start' },
  ],
  first: [
    { id: 'prayerMain', x: 50, y: 42, lx: 27, ly: 15, align: 'end' },
    { id: 'cafe', x: 25, y: 63, lx: 8, ly: 45, align: 'end' },
    { id: 'residentsEntrance', x: 24, y: 80, lx: 11, ly: 93, align: 'end' },
    { id: 'foyer', x: 55, y: 80, lx: 72, ly: 95, align: 'start' },
    { id: 'library', x: 74, y: 71, lx: 97, ly: 60, align: 'start' },
  ],
  second: [
    { id: 'prayerWomen', x: 44, y: 40, lx: 30, ly: 12, align: 'end' },
    { id: 'prayerScreened', x: 62, y: 27, lx: 85, ly: 18, align: 'start' },
    { id: 'commercial', x: 20, y: 65, lx: 26, ly: 95, align: 'end' },
    { id: 'wuduWomen', x: 73, y: 62, lx: 89, ly: 48, align: 'start' },
    { id: 'childrensRoom', x: 62, y: 74, lx: 93, ly: 68, align: 'start' },
    { id: 'imamOffice', x: 68, y: 82, lx: 94, ly: 88, align: 'start' },
  ],
  third: [
    { id: 'school', x: 42, y: 28, lx: 24, ly: 10, align: 'end' },
    { id: 'amphi', x: 59, y: 46, lx: 97, ly: 34, align: 'start' },
    { id: 'garden', x: 66, y: 58, lx: 99, ly: 62, align: 'start' },
    { id: 'conference', x: 25, y: 60, lx: 32, ly: 96, align: 'end' },
  ],
  fourth: [
    { id: 'meetingRooms', x: 36, y: 24, lx: 17, ly: 8, align: 'end' },
    { id: 'administration', x: 48, y: 33, lx: 93, ly: 22, align: 'start' },
    { id: 'studio', x: 25, y: 45, lx: 5, ly: 33, align: 'end' },
    { id: 'youthClub', x: 22, y: 62, lx: 34, ly: 96, align: 'end' },
    { id: 'guestArea', x: 52, y: 68, lx: 98, ly: 78, align: 'start' },
  ],
  fifth: [{ id: 'apartments', x: 38, y: 24, lx: 19, ly: 10, align: 'end' }],
  sixth: [{ id: 'apartments', x: 42, y: 18, lx: 23, ly: 8, align: 'end' }],
  whole: [
    { id: 'roofTerrace', x: 40, y: 20, lx: 72, ly: 8, align: 'start' },
    { id: 'dome', x: 22, y: 33, lx: 6, ly: 22, align: 'end' },
    { id: 'minaret', x: 56, y: 38, lx: 90, ly: 40, align: 'start' },
  ],
};
