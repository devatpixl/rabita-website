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
  /**
   * The honorific he is addressed by — "Sh.", "Dr.", "Ust." (client,
   * 2026-09-18, under Bønnetider: "Sh. Kamel Amara, Dr. Osamah Aldiri og
   * Ust. Usman Andreas i denne rekkefølgen").
   *
   * A FIELD OF ITS OWN, not folded into `name`, and that is load-bearing:
   * components/prayer-board.tsx builds a monogram from `name.charAt(0)` and
   * components/org-chart.tsx from the first and last words, so a name reading
   * "Sh. Kamel Amara" would render the initial "S" and the monogram "SA".
   * `name` stays the name; the title travels beside it.
   *
   * NOT TRANSLATED, for the same reason the names are not: these are how
   * three men are addressed, not labels. They stay in Latin script in the
   * Arabic build alongside the names they belong to.
   */
  title: string;
  name: string;
  /** Path under /public, or null for the monogram. */
  photo: string | null;
  /** Rendered through imams.lang.<key>, in this order. */
  languages: LangKey[];
};

// ── THE CLIENT'S ORDER, 2026-09-18 ────────────────────────────────────────
// "Sh. Kamel Amara, Dr. Osamah Aldiri og Ust. Usman Andreas i denne
// rekkefølgen" — IN THIS ORDER. Aldiri and Andreas swapped places; do not
// sort this array.
//
// The order is read by three components and the swap moves all three
// together, which is the point of one source of truth: the imam cards on
// /bonnetider, the Imamer group in the organisation chart, and IMAM_LEADERS
// in lib/org-chart.ts. Both card lists mark index 0 as the lead with a gold
// ring, and index 0 is still Kamel Amara, so that survives the reorder.
//
// SPELLING: "Osamah", with the h. It was "Osama" here until the client wrote
// it out himself on 2026-09-18. His spelling of his own imam's name wins.
export const IMAMS: readonly Imam[] = [
  {
    key: 'amara',
    title: 'Sh.',
    name: 'Kamel Amara',
    // Client, Bildeplassering (2026-09-19), IMG_0947. Cut square and tight
    // from a 5376x3809 — these render as CIRCLES, so the face has to fill the
    // middle or it floats in a ring of background. Also drops the
    // "© Muslimsk Dialognettverk" mark in the original's bottom-right.
    //
    // 800px, not the 400 these used to be: the /om-oss chart now draws them
    // at 160px, which needs 320 on a retina screen and left 400 with almost
    // nothing spare.
    photo: '/photos/imams/amara-dialog.webp',
    languages: ['norwegian', 'arabic', 'french', 'english'],
  },
  {
    key: 'aldiri',
    title: 'Dr.',
    name: 'Osamah Aldiri',
    photo: '/photos/imams/aldiri.webp',
    languages: ['arabic', 'norwegian'],
  },
  // Eight, in the client's own order (2026-09-15: "Språk (til Usman): norsk,
  // engelsk, enkel arabisk, urdu, litt persisk, italiensk, fransk, latin").
  // This closes a question open since 2026-08-30: the card said Norsk ·
  // Arabisk and nothing on file said where those two came from.
  {
    key: 'andreas',
    title: 'Ust.',
    name: 'Usman Andreas',
    // Client, Bildeplassering (2026-09-19), Usman.png. Same treatment: a
    // tight head-and-shoulders square at 800px.
    photo: '/photos/imams/usman-minbar.webp',
    // SIX, not eight. Client, Versjon 6 (2026-09-22), under Bønnetider:
    // "Fjern arabisk, persisk (basis)" — drop the two that carried the
    // qualifier. They rendered as "Arabisk (basis)" and "Persisk (basis)",
    // which is how he names them here.
    //
    // It also reads better. An imam's card listing basic Arabic invites the
    // wrong question in a mosque where two other imams speak it natively,
    // and the qualifier was doing the opposite of what a staff page should:
    // it made the longest list on the page the least confident one.
    //
    // His own list from 2026-09-15 is what is being trimmed, so this is him
    // revising himself, not us dropping something he gave us. The keys
    // 'arabicSimple' and 'persianSome' stay in LangKey and in all three
    // locales, now unused — putting either back is one line in this array.
    languages: ['norwegian', 'english', 'urdu', 'italian', 'french', 'latin'],
  },
];
