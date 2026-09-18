// Rabita's partner organisations, for the scrolling logo strip on /om-oss.
//
// Client, 2026-09-16 (Om oss list): "Legge til samarbeidspartnere med logo
// (med scrollefunksjon), i denne rekkefølgen" — partners with logos, with a
// scroll function, IN THIS ORDER. The order below is his, unchanged, and the
// strip must not sort it: for a mosque's partner list, sequence is a
// statement about the relationship.
//
// And: "Men trenger kun Logo til hver organisasjon og ikke en tekst under i
// tillegg" — logos only, no caption underneath. The name still travels with
// each logo as alt text, because a logo with no accessible name is a blank to
// a screen reader, but nothing is printed under it.
//
// ── TEN OF THE TWELVE ARRIVED 2026-09-16 ───────────────────────────────── Bydel Gamle Oslo and Bydel St.
// Hanshaugen are still missing; their entries stay here with the paths their
// files will take, and PartnerLogos simply skips them until the files exist.
//
// Formats are mixed and that is fine: one SVG, six PNG, two JPEG, one WebP.
// Only three carry real transparency, and six have a solid white box around
// them — which is NOT removed from the files. The strip blends them with
// mix-blend-mode: multiply instead, so white drops to the paper underneath
// while the artwork is untouched. Keying the white out pixel-by-pixel would
// have punched holes straight through Oslo's crest, Frivillighet's outlined
// heart and Sparebankstiftelsen's hollow ring, all of which are white on the
// inside. See components/partner-logos.tsx.

export type Partner = {
  /** Shown to screen readers and on hover. Never printed under the logo. */
  name: string;
  /** public/partners/<file>. Nothing renders until the file exists. */
  logo: string;
  /**
   * Shape class, from the file's MEASURED aspect ratio (sips, 2026-09-16).
   *
   * A logo row normalised purely on height is optically wrong: at one common
   * height a 3.2:1 wordmark like Studieförbundet covers five times the area of
   * a 1:1 roundel like Salto or Bufdir, so the round marks read as an
   * afterthought. Giving the square ones more height and the long ones less
   * evens out the AREA, which is what the eye actually compares.
   *
   *   wide   ratio > 2.4   — long wordmarks
   *   mid    1.5 - 2.4     — mark plus wordmark
   *   square ratio < 1.5   — roundels and badges
   */
  shape: 'wide' | 'mid' | 'square';
};

export const PARTNERS: readonly Partner[] = [
  { name: 'Oslo kommune', logo: '/partners/oslo-kommune.webp', shape: 'mid' },
  { name: 'Bydel Gamle Oslo', logo: '/partners/bydel-gamle-oslo.svg', shape: 'mid' },
  { name: 'Muslimsk Dialognettverk', logo: '/partners/muslimsk-dialognettverk.png', shape: 'square' },
  // The client's list shortened this one. The mark itself reads
  // "Samarbeidsrådet for tros- og livssynssamfunn" (STL), which is the
  // organisation's actual name, so that is what the alt text says.
  { name: 'Samarbeidsrådet for tros- og livssynssamfunn', logo: '/partners/stl.svg', shape: 'mid' },
  { name: 'Frivillighet Norge', logo: '/partners/frivillighet-norge.png', shape: 'mid' },
  { name: 'Bufdir', logo: '/partners/bufdir.png', shape: 'square' },
  { name: 'Kriminalomsorgen', logo: '/partners/kriminalomsorgen.png', shape: 'mid' },
  { name: 'Salto', logo: '/partners/salto.jpg', shape: 'square' },
  { name: 'Minotenk', logo: '/partners/minotenk.png', shape: 'square' },
  { name: 'Sparebankstiftelsen', logo: '/partners/sparebankstiftelsen.jpg', shape: 'square' },
  { name: 'Studieforbundet', logo: '/partners/studieforbundet.png', shape: 'wide' },
  { name: 'Bydel St. Hanshaugen', logo: '/partners/bydel-st-hanshaugen.svg', shape: 'mid' },
  // Client, 2026-09-17: "Få med innocents og kanskje NUM som
  // samarbeidspartnere". He gave no position for it, and the eleven above are
  // in HIS order from 2026-09-16, so this appends rather than guessing a rank
  // for him. Moving it is one line if he wants it higher.
  //
  //
  // The file was supplied as a 538x371 JPEG with the logo floating in a white
  // margin. Two things were done to it and neither touches the artwork: the
  // margin was trimmed to the ink (352x295), and the background — which JPEG
  // had left at 252-254, not 255 — was lifted to pure white on NEUTRAL pixels
  // only, so `multiply` maps it exactly onto the paper instead of printing a
  // faint grey rectangle. Neutral-only matters: the heart fades through light
  // pink, and pink has a wide channel spread, so the gradient is untouched.
  // Saved as PNG so nothing re-compresses. The white is NOT keyed to
  // transparency — that would punch a hole straight through the inside of the
  // heart, which is white by design.
  { name: 'Innocents', logo: '/partners/innocents.png', shape: 'square' },
  // NUM — Norges Unge Muslimer. Added 2026-09-18.
  //
  // It was held back for a round on the grounds that NUM already appears on
  // this page as one of the ten Avdelinger in the organisation chart, so
  // listing it here too puts one organisation on /om-oss twice. That was
  // overthought and the user said so. NUM is a separate national youth
  // organisation; a liaison for it inside Rabita's structure and a partner
  // logo in the strip are not the same claim, and plenty of organisations
  // carry both. The client's "kanskje" is mild hesitation, not a veto.
  //
  // The file arrived 2026-09-18 as a 957x957 JPEG — and 65% of that canvas
  // was empty white: 312px of margin above the mark and 310 below. Dropped in
  // untrimmed it would have rendered as a tiny wordmark floating in a tall
  // box, because the strip normalises on HEIGHT and most of that height was
  // air. Trimmed to the ink it is 673x344.
  //
  // `mid`, MEASURED at 1.96 — not the 'square' guessed before the artwork
  // existed. That guess would have given a 2:1 wordmark the height of a
  // roundel and made it tower over Bufdir and Salto beside it.
  //
  // The ground was already pure 255 in the corners, but the neutral lift ran
  // anyway and cleaned 103k JPEG-softened pixels back to white, so multiply
  // maps it exactly onto the paper with no grey rectangle. Green ink has a
  // wide channel spread and cannot be touched by a neutral-only lift.
  { name: 'Norges Unge Muslimer', logo: '/partners/num.png', shape: 'mid' },
];
