// The renders behind each room on the floor figure.
//
// Client, 2026-09-13: clicking a marker should open the photographs of that
// place, with arrows where there is more than one, and a line of description.
// The files came named by room ("9. Skole korridor", "5. Restaurant kjøkken"),
// which is what this map is: the architect's naming, resolved onto the room
// ids the markers already use.
//
// A room that is not in here has no photographs and stays a plain marker —
// fourteen of the twenty-nine do. That is the honest state of the set, not a
// gap to paper over: the drawings show rooms nobody has rendered yet.
//
// Ordered as the deck ordered them: the overview first where one exists, then
// the closer views.
export const FLOOR_PHOTOS: Record<string, readonly string[]> = {
  // The prayer halls and the ablutions are NOT in the client's room folder —
  // it has no bonnerom and no wudu file. They were already on the site
  // though, in the HLF Arkitekter sets the gallery and the zoom section draw
  // from, and they are the same building: the green carpet with its gold
  // prayer rows, the white columns, the curved balustrade, the rosette
  // rings. So they are pulled from /photos rather than /photos/rooms.
  //
  // NOT room-main-hall.webp, which sits in the sadaqa band: that one is a
  // different mosque entirely — marble and gold arches, no green carpet.
  // Fine as an atmosphere plate, wrong as "this is the hall you are
  // pointing at".
  //
  // lower
  prayerMen: ['/photos/room-lower-hall.webp'],
  wuduMen: ['/photos/zoom-wudu.webp'],
  sportsHall: ['/photos/rooms/sportsHall-1.webp'],
  // first
  prayerMain: ['/photos/proj-main-hall.webp'],
  foyer: ['/photos/rooms/foyer-1.webp'],
  cafe: ['/photos/rooms/cafe-1.webp'],
  library: ['/photos/rooms/library-1.webp'],
  // second
  prayerWomen: ['/photos/room-womens-hall.webp'],
  commercial: [
    '/photos/rooms/commercial-1.webp',
    '/photos/rooms/commercial-2.webp',
    '/photos/rooms/commercial-3.webp',
    '/photos/rooms/commercial-4.webp',
  ],
  childrensRoom: ['/photos/rooms/childrensRoom-1.webp', '/photos/rooms/childrensRoom-2.webp'],
  imamOffice: [
    '/photos/rooms/imamOffice-1.webp',
    '/photos/rooms/imamOffice-2.webp',
    '/photos/rooms/imamOffice-3.webp',
  ],
  // third
  garden: ['/photos/rooms/garden-1.webp'],
  school: [
    '/photos/rooms/school-1.webp',
    '/photos/rooms/school-2.webp',
    '/photos/rooms/school-3.webp',
    '/photos/rooms/school-4.webp',
  ],
  conference: ['/photos/rooms/conference-1.webp'],
  // fourth
  meetingRooms: ['/photos/rooms/meetingRooms-1.webp'],
  youthClub: ['/photos/rooms/youthClub-1.webp'],
  // fifth and sixth
  apartments: ['/photos/rooms/apartments-1.webp', '/photos/rooms/apartments-2.webp'],
  // whole
  roofTerrace: ['/photos/rooms/roofTerrace-1.webp', '/photos/rooms/roofTerrace-2.webp'],
  // Client, 2026-09-23 ("9. Minaret skrå.jpg"): the minaret from the
  // courtyard, looking up — the perforated lantern lit, the spiral stair
  // wrapped round the shaft, people on the balconies and the roof garden.
  // Replaces minaret-1 (the rooftop from above), which stays on disk unused;
  // the dome marker has its own dusk render now, so nothing else needs it.
  minaret: ['/photos/rooms/minaret-2.webp'],
  // Client, 2026-09-23 ("Minaret ny.jpeg"): the rooftop at dusk — the
  // lattice-clad dome volume lit from inside, the perforated minaret beside
  // it, the terrace in use. The first render that actually has the dome in
  // it. Versjon 6 ("Legg inn minaret siste bildet på kuppel") had this
  // marker borrowing minaret-1 as a stand-in; that file stays on the
  // minaret marker above, where it belongs.
  dome: ['/photos/rooms/dome-1.webp'],
};

export function photosFor(roomId: string): readonly string[] {
  return FLOOR_PHOTOS[roomId] ?? [];
}
