// The client's seven core activities (2026-09-17: "Endre til våre
// kjerneaktiviteter", with the ISNA.net services grid as the reference).
//
// This list is NOT the service list. lib/services.ts holds eighteen things a
// visitor can request or enrol in; this holds seven headings a visitor can
// understand in six seconds. Several of these are BUCKETS — `religious`
// covers nikah, janaza, shahada, hajj and samtaler; `teaching` covers all six
// courses — so the two files answer different questions and neither is
// derivable from the other. Keep them separate.
//
// ── The client asked for no links ────────────────────────────────────────
// "Tror ikke det er nødvendig med lenker." The plates are therefore inert,
// which is also what makes two of them possible at all: `religious` and
// `humanitarian` have no page to point at. One quiet link sits under the grid
// instead, so the homepage still reaches /tjenester.
//
// Because nothing is clickable there is deliberately NO hover affordance —
// no scale, no arrow, no cursor change. A plate that moves under the pointer
// promises a destination it does not have. The photograph warms and that is
// all.
//
// ── Row assignment is editorial, not arbitrary ───────────────────────────
// `row: 'lead'` are the three pillars and get a tall plate, a plate numeral
// and a sentence. `row: 'named'` are the four named programmes and get a
// square plate and a title only. Three plus four is seven exactly, which is
// why this grid has no empty cell — ISNA's four-across would have left one.

export type ActivityRow = 'lead' | 'named';

export type Activity = {
  key: string;
  row: ActivityRow;
  /** Absolute path under /public. `null` only while awaiting the client. */
  photo: string | null;
  /** object-position. Faces are not at the centre of most of these frames. */
  focus: string;
  /** Intrinsic size, so next/image reserves the right box and never guesses. */
  width: number;
  height: number;
  /**
   * Awaiting content from Rabita. Renders a deliberate typographic blank
   * rather than a broken card — see core-activities.tsx. Delete the flag and
   * fill `photo` to switch it on; nothing else has to change.
   */
  pending?: true;
};

// ── ORDER IS THE CLIENT'S ───────────────────────────────────────────────
// Tekst (endelig), Sept 2026 numbers all seven: 1 Tro og bønn, 2 Barn og
// ungdom, 3 Undervisning, 4 Id for alle, 5 Muslimske veivisere, 6 Humanitært
// arbeid, 7 Fosterhjem. `youth` and `teaching` swapped to match; they are
// both lead-row, so no plate changed shape and no photograph was recropped.
// His numbering also lands 1-3 on the lead row and 4-7 on the named row
// exactly, so the grid did not have to move either.

export const ACTIVITIES: readonly Activity[] = [
  // ── Lead row ───────────────────────────────────────────────────────────
  {
    // "Religiøse aktiviteter (finn et bedre navn)" — he asked us for the name.
    //
    // It is "Tro". One word, and the only one that covers all five things in
    // this bucket: a nikah, a janaza, a shahada, a hajj and a conversation
    // with an imam are every one of them faith. "Seremonier" drops the
    // conversations, "Livsriter" drops hajj, and his own "aktiviteter" would
    // repeat the section heading — "Våre kjerneaktiviteter", two lines above
    // it — as well as being the mismatch that bothered him in the first
    // place: these are requested at need, not attended on a timetable.
    //
    // It also pairs with card 02, "Undervisning". Those are the two
    // single-word cards, both fully accented, sitting together at the front
    // of the lead row.
    //
    // Nothing is lost to the brevity. The body underneath still reads
    // "Nikah, janaza, shahada, hajj og umra — og samtaler med imam når livet
    // krever det." The title names the category; the sentence does the
    // telling.
    //
    // Two longer attempts were pulled the same day: "Seremonier og
    // veiledning" drifted too far from what he wrote, and "Religiøse
    // tjenester" was accurate but spent `tjenester`, which is already the nav
    // label for a different page.
    key: 'religious',
    row: 'lead',
    // The portrait crop, not SERVICE_IMAGE.nikah. Written when that was
    // subj-nikah.webp at 1086x724 — a 3:2 landscape source in a 4:5 plate
    // throws away 47% of its width. SERVICE_IMAGE.nikah is portrait as of
    // 2026-09-23, but it is now rings on silk: a still life, which is right
    // on a service card and wrong on a section plate this size.
    // congregation-today.tsx already commissioned portrait variants for its
    // 3:4 cards and this section inherits them.
    photo: '/photos/svc-nikah-ceremony.webp',
    focus: '50% 40%',
    width: 1086,
    height: 1448,
  },
  {
    key: 'youth',
    row: 'lead',
    // Client, Bildeplassering (2026-09-19), DSC_0385. He listed it against
    // "Barn og ungdom" in the carousel this grid replaced, so the label it
    // was chosen for is the label it still lands on.
    //
    // The source is 6016x4000 landscape and this plate is 4:5, so 47% of the
    // width has to go and two of the four boys go with it. Held at x=1200
    // rather than centred: that keeps the boy in the beanie as the anchor
    // with a face either side of him, so it still reads as a group. Further
    // right gives two clean portraits but stops looking like friends.
    photo: '/photos/community/youth-friends.webp',
    // Faces sit high. The short-laptop variant flattens this plate to 20:21,
    // which is WIDER than 4:5 and therefore crops height — so the focus is
    // pulled up, or the 20:21 takes them off at the chin.
    focus: '50% 35%',
    width: 1200,
    height: 1500,
  },
  {
    // "undervisning eller kunnskap" — he offered both words. "Undervisning"
    // wins because it is already the nav item, the page slug and the heading
    // on /undervisning; introducing "Kunnskap" as a fourth name for the same
    // thing would cost more than it buys. The accent carries his second word.
    key: 'teaching',
    row: 'lead',
    photo: '/photos/learning-class.webp',
    focus: '50% 32%',
    width: 1200,
    height: 1600,
  },
  // ── Named row ──────────────────────────────────────────────────────────
  {
    key: 'eid',
    row: 'named',
    photo: '/photos/community/bazaar-child.webp',
    focus: '50% 40%',
    width: 1125,
    height: 1500,
  },
  {
    key: 'guides',
    row: 'named',
    // NOT SERVICE_IMAGE.veivisere (cong-volunteers.webp) — that is a group in
    // winter coats on a street, which says "volunteers" and not "school
    // visit". This frame is the one lib/services.ts used as the veivisere
    // BAND photo before the grid rewrite, and the service is defined as
    // "skolebesøk der unge muslimer møter elever ansikt til ansikt".
    // Client, Bildeplassering (2026-09-19), 626282677 — the file he named for
    // "Muslimske Veivisere" in the carousel this grid replaced, so the label
    // it was chosen for is the label it lands on.
    //
    // Cut SQUARE, not 4:5: this is the `named` row, which renders
    // aspect-square at lg (and 6:5 on a short laptop), not the lead row's
    // 4:5. A 4:5 file here would be cropped top and bottom.
    photo: '/photos/svc-veivisere-taler.webp',
    focus: '50% 40%',
    width: 1600,
    height: 1000,
  },
  {
    // Still no PAGE and no written copy for this — grep "humanit" and you get
    // this comment. What it no longer needs is either: the named row is
    // title-only, so a photograph is the whole of the card.
    //
    // This frame is Rabita's own volunteers handing out food in the street at
    // a gateiftar. It is the one picture in /photos that shows the mosque
    // giving something to people who came for it, which is what "humanitært
    // arbeid" means to a reader — and it claims nothing beyond what it
    // literally depicts, which matters for a card with no sentence under it
    // to qualify the image.
    //
    // Swap freely when the client sends his own. If he says the work is
    // something else entirely, put `pending: true` back and drop `photo` to
    // null — the blank plate in core-activities.tsx is still wired.
    key: 'humanitarian',
    row: 'named',
    photo: '/photos/community/iftar-serving.webp',
    // 844x1500 is a TALL portrait in a square frame, so a centred crop keeps
    // only the middle 56% of its height. 42% holds the serving hands and the
    // trays rather than drifting up into the hi-vis backs above them.
    focus: '50% 42%',
    width: 844,
    height: 1500,
  },
  {
    key: 'foster',
    row: 'named',
    // 38% horizontal, not centred: the two figures sit left of centre in this
    // frame and a square crop of a 3:2 source is unforgiving.
    photo: '/photos/svc-fosterhjem-meeting.webp',
    focus: '38% 55%',
    width: 1616,
    height: 1080,
  },
];

export const LEAD = ACTIVITIES.filter((a) => a.row === 'lead');
export const NAMED = ACTIVITIES.filter((a) => a.row === 'named');
