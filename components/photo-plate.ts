// The photograph-on-plate layer stack, shared.
//
// These five constants were tuned in service-grid.tsx against the real
// photographs in this repo and MUST NOT be forked. They moved here on
// 2026-09-17 when core-activities.tsx needed the same guarantee: two copies
// of a tuned scrim is two things to re-tune the next time the client swaps an
// image, and he swaps them one at a time.
//
// ── Why a ceiling and not a wash ─────────────────────────────────────────
// White type has to survive photographs nobody art-directed. Measured
// luminance in the text zone, inside the real crop: svc-fosterhjem-meeting
// reads 0.46 mean / 0.87 max — effectively white paper behind the title —
// while subj-janaza reads 0.019. A 24x spread. A flat bg-black/50 tuned for
// one of those ruins the other.
//
// So the guarantee comes from a LUMINANCE CEILING: a solid colour painted
// with mix-blend-mode: darken, which is min(base, C) per channel. Bright
// pixels are clamped to C; pixels already darker than C are returned
// untouched. The cost falls entirely on the photographs that can afford it
// and is exactly zero for janaza. Every layer painted after the ceiling can
// only subtract luminance, so the clamp is airtight by construction rather
// than by tuning.
//
// ── Two traps, both real, both verified in this repo ─────────────────────
// 1. globals.css is unlayered and sits ~400 lines after `@tailwind
//    utilities`, so at equal specificity `.rv-zoom { transition: transform
//    1.5s }` BEATS any duration utility on the same element. Keep hover
//    transforms on a WRAPPER and leave .rv-zoom on the image itself: one
//    element per transform.
// 2. mix-blend-mode blends against whatever is behind it, so the card root
//    MUST carry `isolate`. Without it the ceiling blends against the page
//    and produces garbage. `isolate` is load-bearing, not decoration.

// Unifies many white balances into one register. Same family as
// project-gallery's GRADE, plus a warm swing: sepia pulls to flat amber and
// the negative hue-rotate swings it back off yellow toward the brand gold.
export const GRADE =
  'saturate(0.82) contrast(1.07) brightness(0.94) sepia(0.14) hue-rotate(-6deg)';

// Light falling into the frame. soft-light, so it is photograph-ADAPTIVE:
// it lifts janaza's black coats slightly and deepens a whiteboard, rather
// than doing the same thing to both. The radial's peak sits off the top edge
// at -14% so its hottest point never lands on the picture, and it is centred
// rather than cornered, which makes it RTL-neutral.
export const LIGHT: React.CSSProperties = {
  background:
    'radial-gradient(115% 78% at 50% -14%, rgba(192,161,101,0.50) 0%, rgba(192,161,101,0.18) 38%, rgba(192,161,101,0) 66%),' +
    'linear-gradient(180deg, rgba(22,36,46,0) 40%, rgba(22,36,46,0.45) 72%, rgba(22,36,46,0.75) 100%)',
  mixBlendMode: 'soft-light',
};

// The ceiling. #2B2A26 is a warm charcoal one step off `ink`, NOT dusk: a
// cool clamp takes R down hard and leaves B alone, which turns warm shadows
// cyan. Neutral-warm clamps all three channels together, so there is no cast.
// The ramp reaches 0.86 by 55%, which is where the words begin.
export const CEILING: React.CSSProperties = {
  background:
    'linear-gradient(180deg,' +
    'rgba(43,42,38,0) 0%,' +
    // 0.06 -> 0.04 and 0.40 -> 0.30 (client, 2026-09-18: the upper half read
    // as too heavy). ONLY these two stops moved. Everything from 55% down —
    // where the words actually sit — is unchanged, so the luminance clamp
    // under the type is exactly what it was and no title lost contrast.
    'rgba(43,42,38,0.04) 20%,' +
    'rgba(43,42,38,0.30) 40%,' +
    'rgba(43,42,38,0.86) 55%,' +
    'rgba(43,42,38,0.96) 74%,' +
    'rgba(43,42,38,0.98) 100%)',
  mixBlendMode: 'darken',
};

// The crown. The ceiling above guarantees the BOTTOM of a plate, where the
// words are, and deliberately leaves the top alone — nothing used to be
// painted there. core-activities.tsx puts a plate numeral in the upper corner,
// which promptly vanished on learning-class (a bright classroom) and
// svc-fosterhjem-meeting (a whiteboard) while surviving on the darker frames.
//
// Same instrument as the ceiling for the same reason: darken, so it can only
// ever subtract luminance and the contrast guarantee stays structural rather
// than tuned. A linear from the top edge rather than a corner radial, because
// a corner has a physical side and this site runs RTL in Arabic — a
// `at 0% 0%` radial would put the wash on the wrong side of the plate.
//
// Fades out by 34%, well clear of the 40% mark where the ceiling's own ramp
// starts, so the two never stack into a muddy band across the middle.
// Lightened 2026-09-18 (client: "the tint of dark colour is too much up and
// till middle of images"). 0.55 -> 0.40 at the top edge and clear by 30%
// instead of 34%. The numeral still has a ground — it needs far less than the
// original value gave it, which was set for the worst case and applied to all.
export const CROWN: React.CSSProperties = {
  background:
    'linear-gradient(180deg,' +
    'rgba(43,42,38,0.40) 0%,' +
    'rgba(43,42,38,0.21) 13%,' +
    'rgba(43,42,38,0.06) 22%,' +
    'rgba(43,42,38,0) 30%)',
  mixBlendMode: 'darken',
};

// The seat under the words, as a two-state cross-fade rather than an alpha
// bump — background-image is not interpolable, so one gradient cannot
// transition its own stops. Normal blend on dusk: it can only ever lower
// luminance, which keeps the ceiling's guarantee intact.
export const SEAT_REST: React.CSSProperties = {
  background:
    'linear-gradient(180deg, rgba(22,36,46,0) 44%, rgba(22,36,46,0.18) 70%, rgba(22,36,46,0.34) 100%)',
};
// On approach a gold glow rises from below the foot: the light warms when
// you reach for it. This is the only layer that can raise luminance, and
// 0.30 is the alpha at which the worst-case title still holds ~9:1.
export const SEAT_HOVER: React.CSSProperties = {
  background:
    'radial-gradient(120% 72% at 50% 114%, rgba(155,127,74,0.30) 0%, rgba(155,127,74,0) 68%),' +
    'linear-gradient(180deg, rgba(22,36,46,0.05) 20%, rgba(22,36,46,0.30) 62%, rgba(22,36,46,0.52) 100%)',
};
