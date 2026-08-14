// Building cross-section data — single source of truth for the drawing,
// the label column, and the left-panel per-floor content. Ordered
// bottom-to-top so `FLOORS[0]` is the deepest basement and
// `FLOORS[6]` is the top prayer hall. `active === index` means that
// floor is the one currently in focus during scroll.
//
// The i18n strings (headline, body, name, fact) live in
// messages/*.json under `building.floors.{key}`. Only the geometric
// facts + display labels live here so a translator can never break
// the coordinate math.

export type FloorKey =
  | 'p2'
  | 'p1'
  | 'entrance'
  | 'youth'
  | 'library'
  | 'school'
  | 'prayer';

export type Floor = {
  key: FloorKey;
  /** Signed level shown in the label column (-02 … 04). */
  levelLabel: string;
  /** True for the top two floors — draws lattice on exterior walls. */
  lattice?: boolean;
  /** True for the top floor — draws roofline + minaret on final step. */
  roofline?: boolean;
};

export const FLOORS: readonly Floor[] = Object.freeze([
  { key: 'p2', levelLabel: '−02' },
  { key: 'p1', levelLabel: '−01' },
  { key: 'entrance', levelLabel: '00' },
  { key: 'youth', levelLabel: '01' },
  { key: 'library', levelLabel: '02' },
  { key: 'school', levelLabel: '03', lattice: true },
  { key: 'prayer', levelLabel: '04', lattice: true, roofline: true },
]);

// 8 scroll steps total: step 0 = intro (cleared site), steps 1..7 = each
// floor lands. Counter reads 00 / 07 (intro) through 07 / 07 (all floors
// built).
export const STEP_COUNT = FLOORS.length + 1;

/** Given an active step index (0..STEP_COUNT-1), returns which floor is
 * currently active — or -1 during the intro step. */
export function activeFloorFromStep(step: number): number {
  return step - 1;
}

// --- Geometry ---
// All coordinates are in the SVG's viewBox space (see BUILDING_VIEWBOX).
// Bottom-up, matching FLOORS order.

// viewBox height trimmed from 800 → 700: the ~100px of empty bottom
// space was making the SVG portrait-heavy and pinning its horizontal
// size to a much smaller number than the column could hold. With
// a shorter viewBox the SVG scales to its container's height and
// arrives wider on screen. Building coordinates unchanged.
export const BUILDING_VIEWBOX = { w: 620, h: 700 } as const;
export const BUILDING_X = 40;
export const BUILDING_W = 320;
export const BUILDING_RIGHT = BUILDING_X + BUILDING_W; // 360
export const FLOOR_HEIGHT = 88;
export const BUILDING_BOTTOM = 696; // y of the base slab
export const BUILDING_TOP = BUILDING_BOTTOM - FLOOR_HEIGHT * FLOORS.length; // 80
export const GROUND_Y = BUILDING_BOTTOM - FLOOR_HEIGHT * 2; // top of floor "entrance" (00)

/** y coordinate of a floor's top edge (bottom-up index). */
export function floorTop(index: number): number {
  return BUILDING_BOTTOM - FLOOR_HEIGHT * (index + 1);
}
/** y coordinate of a floor's bottom edge. */
export function floorBottom(index: number): number {
  return BUILDING_BOTTOM - FLOOR_HEIGHT * index;
}
/** y coordinate at the vertical middle of a floor. */
export function floorMid(index: number): number {
  return floorBottom(index) - FLOOR_HEIGHT / 2;
}

// --- Label column layout (SVG coords) ---
export const TICK_START = BUILDING_RIGHT; // 360
export const TICK_END = 398;
export const LABEL_X = 406;
