// The organisation chart, as data.
//
// ── RESTRUCTURED 2026-09-17 (CLIENT) ──────────────────────────────────────
// "Endre organisasjonskart til:
//    Ledelse: Styreleder, nestleder, daglig leder (med navn og bilde)
//    Imamer: Med navn og bilde
//    Avdelinger: Uten navn og bilde, kun avdelingsnavn"
//
// That takes the chart from four tiers of twenty-eight people to three groups
// of six named people and ten department labels. It answers his own preceding
// question — "vurdere om man skal ha navn på organisasjonskartet eller ikke"
// — by keeping names at the top and dropping them at the bottom.
//
// WHAT CAME OFF, so it can be put back in one commit if he changes his mind:
// the Kontrollutvalg tier (Lena Larsen, Brahim Belkilani, Mohamed Melioui),
// the five ordinary styremedlemmer (Iman El Morabit, Sarah Selhi, Issa Mihesh,
// Nour Kanout, Sihem Atrous) and five of the administration (Djamel Selhi —
// senior rådgiver, Mariem Jeng — medieansvarlig, El Hosain ElMontasir —
// renholder, Nour Kanout — IT, and the department heads below). The separate
// board section came off this page on 2026-08-31, so the chart was the last
// place these thirteen appeared; they are now off the site. Flagged to him.
// Every one of them is still in git, and their role keys are all still
// translated in the three locales, so restoring is data, not work.
//
// ── THE IMAMS ARE NOT DUPLICATED HERE ─────────────────────────────────────
// They already exist, with photographs and in the client's own order, in
// lib/imams.ts, which /bonnetider renders in full with biographies and
// languages. Re-listing the same three men here would be two sources of truth
// for one fact — so the chart reads IMAMS and only adds what it needs that
// the imams file does not carry: which role key each man is titled with in
// the chart. If a fourth imam is appointed, he is added in one place.

import { IMAMS, type Imam } from './imams';

export type OrgPerson = {
  /** Message key under aboutPage.org.roles, or aboutPage.board.roles when
   *  `boardRole` is set. */
  role: string;
  boardRole?: boolean;
  name: string;
  /**
   * Path under /public. The file does NOT have to exist: OrgChart checks disk
   * at build time and falls back to a set monogram plate, exactly as
   * PartnerLogos does for a logo that has not arrived. The client, 2026-09-17:
   * "i can get photos if i find any" — so the page must be finished without
   * them and better with them, and dropping a file at the path below is the
   * whole of adding one. No code change, no deploy note.
   */
  photo: string;
};

/** Styreleder, nestleder, daglig leder — the three he named, in his order. */
export const LEADERSHIP: readonly OrgPerson[] = [
  { role: 'chair', boardRole: true, name: 'Hossam Belkilani', photo: '/photos/leadership/hossam-belkilani.webp' },
  { role: 'vice', boardRole: true, name: 'Basim Ghozlan', photo: '/photos/leadership/basim-ghozlan.webp' },
  { role: 'director', name: 'Imen Hasnaoui', photo: '/photos/leadership/imen-hasnaoui.webp' },
];

/**
 * The chart's title for each imam, keyed by the imam's own id in lib/imams.ts.
 * Same three role keys the old four-tier chart used for these men, so nothing
 * new had to be translated.
 */
export const IMAM_ROLES: Record<Imam['key'], string> = {
  amara: 'theologyLead',
  andreas: 'imam',
  aldiri: 'imamTheologian',
};

/** The imams as the chart wants them: the client's order, their photographs,
 *  and the role each is titled with here. */
export const IMAM_LEADERS = IMAMS.map((im) => ({
  key: im.key,
  // The honorific travels with the name so the chart addresses these three
  // exactly as /bonnetider does. Dropping it here was caught by the compiler
  // rather than by eye, which is the argument for mapping explicitly.
  title: im.title,
  name: im.name,
  photo: im.photo,
  role: IMAM_ROLES[im.key],
}));

/**
 * "Uten navn og bilde, kun avdelingsnavn." Message keys under
 * aboutPage.org.roles — the same keys the old chart used to title each
 * department head, which is why ten department names cost no new translation
 * in any of the three locales. The heads themselves are gone; the departments
 * are not.
 *
 * Order is the client's, off his own chart, and must not be sorted: it is not
 * alphabetical in any of the three languages and was not meant to be.
 */
export const DEPARTMENTS: readonly string[] = [
  'education',
  'knowledge',
  'women',
  'artsCulture',
  'buildingProject',
  'safety',
  'num',
  'strategy',
  'dialogue',
  'childrenFamily',
];
