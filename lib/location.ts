// Where the mosque is, and what is near it.
//
// Coordinates are WGS84. Walking routes come from OpenStreetMap routing
// (Valhalla pedestrian costing), fetched once on 2026-08-30 and stored in
// walking-routes.json so the footer never calls an API at runtime. Each
// route carries its routed length and time; the map draws the real path.
// The street backdrop (streets.json) is OpenStreetMap too: roads and the
// river within the plate, simplified, stored in metres from the door.
// To refresh either file: re-run the fetch scripts and replace the JSON.

export const MOSQUE = {
  name: 'Rabita – Det Islamske Forbundet',
  address: 'Calmeyers gate 8, 0183 Oslo',
  lat: 59.916,
  lon: 10.7535,
} as const;

export type LandmarkKind = 'metro' | 'rail' | 'tram' | 'bus' | 'place';

export type Landmark = {
  key:
    | 'oslo-s'
    | 'gronland'
    | 'brugata'
    | 'stortinget'
    | 'oslo-city'
    | 'bussterminalen'
    | 'operahuset';
  kind: LandmarkKind;
  lat: number;
  lon: number;
  /** Only on the big map (apartments page) — the footer keeps the three stations. */
  extended?: boolean;
};

export const LANDMARKS: readonly Landmark[] = [
  { key: 'gronland', kind: 'metro', lat: 59.9127, lon: 10.762 },
  { key: 'oslo-s', kind: 'rail', lat: 59.9117, lon: 10.7508 },
  { key: 'brugata', kind: 'tram', lat: 59.9136, lon: 10.7578 },
  // The client's landmark set (2026-09-04). Routed like the stations —
  // real pedestrian paths, fetched once and stored, never straight lines.
  { key: 'stortinget', kind: 'place', lat: 59.9132, lon: 10.7403, extended: true },
  { key: 'oslo-city', kind: 'place', lat: 59.9123, lon: 10.7527, extended: true },
  { key: 'bussterminalen', kind: 'bus', lat: 59.9113, lon: 10.759, extended: true },
  { key: 'operahuset', kind: 'place', lat: 59.9075, lon: 10.7528, extended: true },
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

export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MOSQUE.address)}`;
export const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(MOSQUE.address)}&travelmode=walking`;
