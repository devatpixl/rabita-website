// Great-circle initial bearing from a point on Earth to the Kaaba in Mecca.
// Returns a bearing in degrees, 0 = north, clockwise. Pure function — no
// runtime dependencies.

const MECCA_LAT = 21.4225;
const MECCA_LON = 39.8262;
const OSLO_LAT = 59.9139;
const OSLO_LON = 10.7522;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function qiblaBearing(latDeg: number, lonDeg: number): number {
  const phi1 = toRad(latDeg);
  const phi2 = toRad(MECCA_LAT);
  const dLambda = toRad(MECCA_LON - lonDeg);
  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);
  const brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
}

export const OSLO_QIBLA_BEARING = qiblaBearing(OSLO_LAT, OSLO_LON);
