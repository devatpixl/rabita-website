// Where the mosque is, and what is near it.
//
// Coordinates are WGS84. Walking routes come from OpenStreetMap routing
// (Valhalla pedestrian costing), fetched once on 2026-08-30 and stored in
// walking-routes.json so the footer never calls an API at runtime. Each
// route carries its routed length and time; the map draws the real path.
// The street backdrop (streets.json) is OpenStreetMap too: roads and the
// river within the plate, simplified, stored in metres from the door.
// To refresh either file: re-run the fetch scripts and replace the JSON.

// THE PLOT. Origin for streets.json and walking-routes.json, and the subject
// of the six-pin map on /leiligheter — a buyer there is weighing THIS
// location, because this is where the flat will stand. Do not move it to the
// temporary premises: every stored route is measured in metres from this
// point, and the landmark distances would silently become fiction.
export const MOSQUE = {
  name: 'Rabita – Det Islamske Forbundet',
  address: 'Calmeyers gate 8, 0183 Oslo',
  lat: 59.916,
  lon: 10.7535,
} as const;

// THE DOOR, while the plot above is a building site. Where a visitor actually
// goes: the footer's Veibeskrivelse and the directions link on the visit
// panel both point here, not at the hole in the ground.
//
// Address from the back cover of Årsrapport 2024 and 2025; see the note on
// CAMPAIGN.visitAddress for the full provenance. Coordinates geocoded from it
// via OSM Nominatim on 2026-09-16 — Enerhaugen, Gamle Oslo, about 900 m east
// of the plot.
//
// It gets no entry in walking-routes.json on purpose. Those routes feed the
// distance list, the distance list renders only in FindUsGoogle
// variant="full", and the only page using that variant is /leiligheter,
// which is measuring from MOSQUE. Nothing here needs re-fetching.
export const VISIT = {
  name: 'Rabita – Det Islamske Forbundet',
  address: 'Sørligata 8a, 0577 Oslo',
  lat: 59.913929,
  lon: 10.768639,
} as const;

export type LandmarkKind = 'metro' | 'rail' | 'tram' | 'bus' | 'place';

export type Landmark = {
  key:
    | 'oslo-s'
    | 'gronland'
    | 'brugata'
    | 'stortinget'
    | 'bussterminalen'
    | 'operahuset'
    | 'regjeringskvartalet';
  kind: LandmarkKind;
  lat: number;
  lon: number;
  /** Only on the big map (apartments page) — the footer keeps the three stations. */
  extended?: boolean;
};

// Oslo City came off on 2026-09-15 ("Fjerne Oslo City"). His list for this
// map is Regjeringen, Stortinget, Oslo S, Bussterminalen and Operaen — which
// is exactly what is left here, so the removal was the whole of that request.
// Its route came out of walking-routes.json with it — not for tidiness but
// because ROUTES is cast to Record<Landmark['key'], WalkingRoute>, and with
// the key gone from the union TypeScript stopped seeing enough overlap to
// allow the cast at all. The labels stay under footer.findUs.landmarks and
// apartmentsPage.facts.stations in all three locales. Putting it back means
// the key, the row, a LABEL_POS entry, and re-fetching the route.
export const LANDMARKS: readonly Landmark[] = [
  { key: 'gronland', kind: 'metro', lat: 59.9127, lon: 10.762 },
  { key: 'oslo-s', kind: 'rail', lat: 59.9117, lon: 10.7508 },
  { key: 'brugata', kind: 'tram', lat: 59.9136, lon: 10.7578 },
  // The client's landmark set (2026-09-04). Routed like the stations —
  // real pedestrian paths, fetched once and stored, never straight lines.
  { key: 'stortinget', kind: 'place', lat: 59.9132, lon: 10.7403, extended: true },
  { key: 'bussterminalen', kind: 'bus', lat: 59.9113, lon: 10.759, extended: true },
  { key: 'operahuset', kind: 'place', lat: 59.9075, lon: 10.7528, extended: true },
  // Regjeringskvartalet (client, 2026-09-13). Routed the same way as the
  // rest — routing.openstreetmap.de foot profile, which re-routes five of
  // the seven above to their stored metre exactly, so this one belongs to
  // the same set rather than being estimated beside it. 801 m on foot
  // against 615 m straight line.
  //
  // It needs no change to the plate: at 59.9152/10.7426 it falls inside the
  // bounds the existing routes already set, so nothing rescales.
  { key: 'regjeringskvartalet', kind: 'place', lat: 59.9152, lon: 10.7426, extended: true },
];

const R = 6_371_000;
const rad = (d: number) => (d * Math.PI) / 180;

/** Straight-line metres between two points. */
export function distanceM(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Compass bearing from a to b, degrees clockwise from north. */
export function bearingDeg(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const y = Math.sin(rad(b.lon - a.lon)) * Math.cos(rad(b.lat));
  const x =
    Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) -
    Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lon - a.lon));
  return (Math.atan2(y, x) * 180) / Math.PI + 360;
}

export function walkMinutes(metres: number): number {
  return Math.max(1, Math.round(metres / 80));
}

import routes from './walking-routes.json';

export type WalkingRoute = { metres: number; seconds: number; points: [number, number][] };
export const ROUTES = routes as Record<Landmark['key'], WalkingRoute>;

/** Routed walking minutes, rounded up so a 6.5-minute walk never says 6. */
export function routedMinutes(key: Landmark['key']): number {
  return Math.max(1, Math.ceil(ROUTES[key].seconds / 60));
}

// The plot — /leiligheter only.
export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MOSQUE.address)}`;
export const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(MOSQUE.address)}&travelmode=walking`;

// The door — everywhere a reader is being sent somewhere. Walking, because
// the premises are four minutes from Grønland T-bane and the old pair said
// walking too.
export const VISIT_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(VISIT.address)}`;
export const VISIT_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(VISIT.address)}&travelmode=walking`;
