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
];
