// Rabita's religious leadership. Names and roles from the client
// (2026-08-30); biographical facts from rabita.no ("Imamene i Rabita") and
// Årsrapport 2025 (pp. 18–19). Photos: none published yet — the section
// renders a monogram until `photo` is set. Portraits supplied by the client
// 2026-08-30, cropped square on the face so they sit right in the circle.
/**
 * Language KEYS, not display strings. They were Norwegian literals rendered
 * raw in all three locales until 2026-09-15, so the English card read
 * "Languages · Norsk · Arabisk". Survivable at two words; not at eight, which
 * is what the client just gave Usman.
 *
 * `arabicSimple` and `persianSome` carry his own qualifiers — "enkel arabisk",
 * "litt persisk". Flattening them to Arabic and Persian would claim more on an
 * imam's behalf than he claims for himself.
 *
 * They render as "Arabic (basic)" / "Persian (basic)", not "Simple Arabic" /
 * "Some Persian" (client, 2026-09-15: "a formal one, wtf is little and some?").
 * Norwegian uses "(basis)" rather than "(grunnleggende)": the line is set in
 * uppercase mono, where GRUNNLEGGENDE is 14 characters and pushed Usman's
 * eight languages to five lines while English sat at three. "Basis" is the
 * term Norwegian CVs use for the same level — basis / god / flytende — so it
 * is shorter without being less formal.
 * He was right: the direct translations read casually on a page where
 * everything around them is formal, and "Some Persian" is poor English. The
 * parenthetical is what a staff page or a CV uses — it keeps the language
 * itself level with French and Latin beside it, and leaves the qualifier to
 * do its work quietly.
 */
export type LangKey =
  | 'norwegian'
  | 'english'
  | 'arabic'
  | 'arabicSimple'
  | 'urdu'
  | 'persianSome'
  | 'italian'
  | 'french'
  | 'latin';

export type Imam = {
  key: 'amara' | 'andreas' | 'aldiri';
  name: string;
  /** Path under /public, or null for the monogram. */
  photo: string | null;
  /** Rendered through imams.lang.<key>, in this order. */
  languages: LangKey[];
};

export const IMAMS: readonly Imam[] = [
  {
    key: 'amara',
    name: 'Kamel Amara',
    photo: '/photos/imams/amara.webp',
    languages: ['norwegian', 'arabic', 'french', 'english'],
  },
  // Eight, in the client's own order (2026-09-15: "Språk (til Usman): norsk,
  // engelsk, enkel arabisk, urdu, litt persisk, italiensk, fransk, latin").
  // This closes a question open since 2026-08-30: the card said Norsk ·
  // Arabisk and nothing on file said where those two came from.
  {
    key: 'andreas',
    name: 'Usman Andreas',
    photo: '/photos/imams/usman.webp',
    languages: [
      'norwegian',
      'english',
      'arabicSimple',
      'urdu',
      'persianSome',
      'italian',
      'french',
      'latin',
    ],
  },
  { key: 'aldiri', name: 'Osama Aldiri', photo: '/photos/imams/aldiri.webp', languages: ['arabic', 'norwegian'] },
];
