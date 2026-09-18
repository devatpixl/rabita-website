// One glyph per department, for the organisation chart's Avdelinger group.
//
// ── WHY THIS FILE EXISTS ──────────────────────────────────────────────────
// Client reference, 2026-09-18: each department card carries its own icon.
// The first attempt put the card's NUMERAL in the chip instead, on the
// grounds that inventing iconography had been rejected on this site before —
// the service pages once carried a large invented line-drawing per service
// and the verdict was "looks fake". That was the wrong precedent to reach
// for, and the client said so: "so basic and bland, no taste".
//
// It IS the wrong precedent. What failed there was a big illustrative drawing
// standing in for a photograph. These are small conventional UI glyphs — a
// book, a shield, a target, a speech bubble — which are not invented at all;
// they are the shared vocabulary every interface uses, and a department list
// without them is a list of words.
//
// ── ONE DRAWING LANGUAGE ──────────────────────────────────────────────────
// 24x24, no fills, stroke 1.5, round caps and joins — identical to
// components/figure-icons.tsx, so a department chip and a visit-card chip
// read as the same system. Nothing here is heavier or more detailed than
// anything there: at 20px, detail is noise.
//
// The four that figure-icons already had honest matches for (book, building,
// person, people) are NOT imported from it. They are redrawn here to sit on
// the same optical size as their six new siblings — the existing set is
// composed for an 18-19px chip on a fact row, and mixing the two at 20px
// left the borrowed ones visibly lighter.

import type { ReactNode } from 'react';

const COMMON = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

/** Keyed by the message key each department is named with in
 *  aboutPage.org.roles — the same strings lib/org-chart.ts lists. */
const PATHS: Record<string, ReactNode> = {
  // UTDANNING — a graduation cap. The school, rather than the act of reading,
  // which is what Kunnskap below gets.
  education: (
    <>
      <path d="M12 4 2.5 8.5 12 13l9.5-4.5L12 4Z" />
      <path d="M6.5 10.8V15c0 1.6 2.5 2.9 5.5 2.9s5.5-1.3 5.5-2.9v-4.2" />
      <path d="M21.5 8.5v5" />
    </>
  ),
  // KUNNSKAP — an open book.
  knowledge: (
    <>
      <path d="M12 7.2v12" />
      <path d="M12 7.2C10.4 5.7 7.8 5.1 4 5.6v11.8c3.8-.5 6.4.1 8 1.6" />
      <path d="M12 7.2c1.6-1.5 4.2-2.1 8-1.6v11.8c-3.8-.5-6.4.1-8 1.6" />
    </>
  ),
  // KVINNER — one figure, headscarf drawn as the line the scarf makes across
  // the brow and down past the shoulders. No face: at this size a face is
  // three dots and reads as a smiley.
  women: (
    <>
      <path d="M12 3.8a3.8 3.8 0 0 1 3.8 3.8v2.2a3.8 3.8 0 0 1-7.6 0V7.6A3.8 3.8 0 0 1 12 3.8Z" />
      <path d="M8.6 7.4a4.4 4.4 0 0 1 6.8 0" />
      <path d="M6.8 20.4v-1.6c0-2.9 2.3-5.2 5.2-5.2s5.2 2.3 5.2 5.2v1.6" />
    </>
  ),
  // KUNST OG KULTUR — a painter's palette.
  artsCulture: (
    <>
      <path d="M12 3.2a8.8 8.8 0 0 0 0 17.6 1.9 1.9 0 0 0 1.9-1.9c0-.5-.2-1-.5-1.3a1.9 1.9 0 0 1 1.4-3.2h1.9a4.1 4.1 0 0 0 4.1-4.1c0-3.9-3.9-7.1-8.8-7.1Z" />
      <path d="M7.7 11.6h.01M9.9 8.2h.01M14.1 8.2h.01M16.4 11.2h.01" />
    </>
  ),
  // BYGGEPROSJEKTET — the mosque itself: dome, base, door, finial. This is
  // the one department whose subject the site can draw literally.
  buildingProject: (
    <>
      <path d="M6 12.4a6 6 0 0 1 12 0" />
      <path d="M6 12.4V20.5M18 12.4V20.5" />
      <path d="M3.2 20.5h17.6" />
      <path d="M12 6.4V4.2" />
      <path d="M10 20.5v-3.2a2 2 0 0 1 4 0v3.2" />
    </>
  ),
  // ORDEN OG SIKKERHET — a shield, checked.
  safety: (
    <>
      <path d="M12 3.2 19 6v5.4c0 4.2-2.9 8.1-7 9.4-4.1-1.3-7-5.2-7-9.4V6l7-2.8Z" />
      <path d="m9.2 11.8 2 2 3.6-3.8" />
    </>
  ),
  // NUM — Norges Unge Muslimer: three together, the youngest in front.
  num: (
    <>
      <circle cx="12" cy="8.6" r="2.6" />
      <path d="M7.4 20.4v-1.2a4.6 4.6 0 0 1 9.2 0v1.2" />
      <path d="M4.6 18.6v-.7a4.2 4.2 0 0 1 2.3-3.7M19.4 18.6v-.7a4.2 4.2 0 0 0-2.3-3.7" />
    </>
  ),
  // STRATEGI — a target, struck.
  strategy: (
    <>
      <circle cx="11.4" cy="12.6" r="7.8" />
      <circle cx="11.4" cy="12.6" r="4.1" />
      <path d="M11.4 12.6 19 5" />
      <path d="M15.6 5h3.6v3.6" />
    </>
  ),
  // DIALOG — two, talking. The second bubble is drawn behind and to the
  // right, so it reads as a reply rather than as one bubble with an ear.
  dialogue: (
    <>
      <path d="M14.6 5.4H8.2A4.7 4.7 0 0 0 3.5 10v2.2a4.7 4.7 0 0 0 3.2 4.4v3l3.3-2.5h4.6a4.7 4.7 0 0 0 4.7-4.7V10a4.7 4.7 0 0 0-4.7-4.6Z" />
      <path d="M8.3 10.8h7M8.3 13.6h4.4" />
    </>
  ),
  // BARN- OG FAMILIE — an adult and a child, hand in hand.
  childrenFamily: (
    <>
      <circle cx="8.4" cy="7.2" r="2.6" />
      <circle cx="16.4" cy="10.4" r="1.9" />
      <path d="M4.2 20.6v-2.4a4.2 4.2 0 0 1 8.4 0v2.4" />
      <path d="M13.4 20.6v-1.8a3 3 0 0 1 6 0v1.8" />
    </>
  ),
};

export function DepartmentIcon({ name, className }: { name: string; className?: string }) {
  const paths = PATHS[name];
  // A department with no glyph renders nothing rather than a placeholder
  // box — if lib/org-chart.ts ever grows an eleventh key, the card still
  // works and the gap is obvious in review.
  if (!paths) return null;
  return (
    <svg {...COMMON} className={className}>
      {paths}
    </svg>
  );
}
