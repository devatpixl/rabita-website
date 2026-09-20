import type { BandMark, BandTone } from '@/components/page-band';

// The service list, in one place. Both the index (components/service-index.tsx)
// and the detail route (app/[locale]/tjenester/[subject]) read from here, so a
// service cannot exist in one and be missing from the other.

export const SERVICE_KEYS = [
  'nikah',
  'janaza',
  'shahada',
  'counselling',
  'hajj-umrah',
  'skole',
  'koran',
  'kurs',
  // Restored 2026-09-10 (client), after the 2026-09-05 trim to eight. All
  // five were already written in full — title, body, longBody, offerTitle,
  // offerLede and a four-item offer, in all three locales — so this is a
  // wiring job, not a writing one. See Tjenester.docx (client, 2026-09-07),
  // which describes thirteen services where the trim had left eight.
  'norsk',
  'veivisere',
  'ungdom',
  'barn-og-familie',
  'fosterhjem',
  // Added 2026-09-13 to complete the client's two lists. 'arabisk' is the
  // Arabic half of what used to be one 'koran' service; 'koran' keeps the key
  // and becomes Koranskolen alone. Facts for all four come from rabita.no,
  // read the same day — /undervisning for the three teaching courses,
  // /kurs-for-nye-muslimer for the convert course, and the site search for
  // "Id for alle".
  'id-for-alle',
  'kurs-islam',
  'kurs-konvertitter',
  'arabisk',
  // Added 2026-09-16 (client, Tjenester list point 1: "Legge til ny tjeneste:
  // Kvinnetreff").
  //
  // THE COPY IS PROVISIONAL AND DELIBERATELY UNSPECIFIC. Rabita has not sent
  // anything about this group yet — no schedule, no room, no contact, no
  // photograph — so the text describes the kind of thing a kvinnetreff is
  // and stops there. It names no day, no time and no place on purpose: an
  // invented "every Tuesday at 18:00" is the one kind of placeholder that
  // does real damage, because a reader would turn up. Replace wholesale when
  // the real details arrive.
  'kvinnetreff',
] as const;

export type ServiceKey = (typeof SERVICE_KEYS)[number];

// One render per subject, so the pages are not the same picture repeated.
export const SERVICE_IMAGE: Record<ServiceKey, string> = {
  // A RENDER, on purpose. There is no photograph of a kvinnetreff, and every
  // candidate in /photos misrepresents it: womens-circle is already
  // counselling's, mother-child is a woman and child at a political
  // demonstration (the same street set family-together comes from), and
  // svc-services is a mixed-gender hall. An architectural render of the
  // lattice claims nothing about who attends. Swap it the day a real
  // photograph arrives.
  kvinnetreff: '/photos/svc-wudu.webp',
  nikah: '/photos/subj-nikah.webp',
  janaza: '/photos/subj-janaza.webp',
  shahada: '/photos/subj-shahada.webp',
  // Matching the Conversations slide on the home page.
  // Client, Bildeplassering (2026-09-19). hvhj.png.
  counselling: '/photos/svc-samtaler-kontor.webp',
  'hajj-umrah': '/photos/subj-hajj.webp',
  // The certificate class, matching the Learning slide on the home page
  // (client, 2026-09-09). bazaar-child was a girl with face paint at a
  // bazaar — a nice photograph, but not a school.
  skole: '/photos/learning-class.webp',
  // Client, Bildeplassering (2026-09-19), 483523796 — the one file he names
  // TWICE, against both "Koran og arabisk" and "Koran skole". The carousel is
  // gone, so this card is where it lands.
  //
  // Kept at full width (720x900 at y=60) rather than cropped tighter. A
  // tighter frame put the children's faces and the mus'haf larger, but the
  // source is only 720px across and cropping to 600 leaves under 1.7x for a
  // 352px card — soft on any retina screen. Resolution wins over framing when
  // the margin is this thin.
  //
  // quran-carpet.webp is NOT deleted — membership-recognition.tsx and
  // community-gallery.tsx both still render it.
  koran: '/photos/svc-koranskolen.webp',
  // A calligrapher at work, client-supplied 2026-09-10. What stood here was
  // event-lecture-hall.webp — children singing on a stage — under a card
  // headed "Kalligrafi og geometri". The photograph is still in use on the
  // October open-house event, so this is a new file rather than an
  // overwrite.
  kurs: '/photos/subj-kurs-calligraphy.webp',
  // Still provisional for two of the five (client, 2026-09-10: "let me get
  // photos which i can, one by one we use"). `veivisere` has no photograph
  // of a school visit and `norsk` none of a language class; both are
  // stand-ins. The other three are the real thing.
  // ⚠ TEMPORARY — client, Bildeplassering (2026-09-19): "Nytt bilde kommer,
  // midlertidig bilde". A Pexels stock photo standing in until Rabita sends
  // its own. The -TEMP suffix is deliberate: grep it and every placeholder on
  // the site turns up at once, so none of these quietly becomes permanent.
  //
  // Cut from 5760x3840 at x=1000 — the window that keeps the laptop, the
  // sticky notes and the hand writing, which is what makes it read as study
  // rather than as a stock photo of a shoulder.
  norsk: '/photos/svc-norsk-studie-TEMP.webp',
  // Client, Bildeplassering (2026-09-19), "Design uten navn (22)" — a school
  // visit with the MUSLIMSKE VEIVISERE slide on the board, which is what this
  // service actually is. Cut 450px into a 1700x1000: the screen is on the
  // left and the presenter on the right, and a 4:5 card only fits one of
  // them unless the window sits between the two.
  //
  // cong-volunteers.webp stays on disk; it is referenced by name in the note
  // on core-activities' guides card.
  veivisere: '/photos/svc-veivisere-skolebesok.webp',
  // Client, Bildeplassering (2026-09-19), 348714864 — a NUM camp.
  ungdom: '/photos/svc-ungdom-leir.webp',
  // A grown-up crouching to a child's height to show him something on a
  // phone, which is what "barn og familie" actually looks like. It replaces
  // a street-iftar frame, and iftar is a season rather than the year-round
  // programme the page describes.
  // Client, Bildeplassering (2026-09-19). He listed 480770251 against "Barn
  // og familie" in the carousel this site no longer has, and its own
  // /tjenester card is the label's only surviving home.
  //
  // The source is a 1440 Instagram square and the card is 4:5, so it had to
  // lose width either way. Cropped tight (880x1100 at 120,60) rather than
  // taking the full height: the bottom third of the original is backs of
  // heads, and at card size that reads as clutter. This window puts the
  // mascots and the children in white at the size they deserve.
  //
  // Kept at its native crop size — the card renders ~352px wide, so 880 is
  // already 2.5x for a retina screen and upscaling would only invent pixels.
  // CORRECTED 2026-09-20. 484458877 is the file he names for this card
  // under "Tjenester:"; svc-barn-familie-eid (480770251) was his entry for
  // the REMOVED carousel and was routed here only because the right file had
  // not arrived. It stays on disk, now unused.
  'barn-og-familie': '/photos/svc-barn-familie-bobler.webp',
  // Rabita's own foster-care information meeting: the imam presenting
  // "Behovet i Oslo" to a room. The doc says Rabita's role here is to
  // inform and to be a bridge, and this is that, being done.
  // Client, Bildeplassering (2026-09-19). pexels-anete-lusina-5240516.
  fosterhjem: '/photos/svc-fosterhjem-barn.webp',
  // A child at the bazaar, face painted — the one genuinely festive frame in
  // the library, and Id for alle is a family day rather than a service desk.
  // Client, Bildeplassering (2026-09-19). 502971520 — the Eid festival on
  // Youngstorget. Square source, cut to 4:5.
  'id-for-alle': '/photos/svc-id-for-alle-fest.webp',
  // event-talk, not learn-classroom. That photograph is three-quarters
  // ceiling with its people in a thin strip along the very bottom — and on a
  // 4:5 card the whole height is already visible (a 1600x1000 source covers a
  // 352x440 box by matching HEIGHT and cropping width), so object-position
  // could not lift them. They were not cropped out; they were sitting under
  // the card's own text (client, 2026-09-14: "shows too much up, people not
  // seen"). This one puts the speakers and the room in the middle band, which
  // is the part of the card the scrim leaves alone.
  // Client, Bildeplassering (2026-09-19), "_DSC0200 (1) (1)" — he names it for
  // both the Undervisning card and the Kurs i Islam Hovedbilde, and only the
  // card exists, so it lands here. Cut 500px into a 1616x1080: that centres
  // the speaker between the minbar and the seated row.
  'kurs-islam': '/photos/svc-kurs-islam-moske.webp',
  'kurs-konvertitter': '/photos/community/welcome-embrace.webp',
  // A lecture hall, not the open Qur'an that was here: Koranskolen sits one
  // card away with a Qur'an on its face, and two of those in a row read as
  // one service split in half rather than two courses. This one is for
  // adults over 16.
  // Client, Bildeplassering (2026-09-19). "Arabisk klasse.png".
  arabisk: '/photos/svc-arabisk-klasse.webp',
};

// What the index shows — and, since 2026-09-05, the whole of what exists.
//
// SERVICE_KEYS used to run ahead of this list, holding keys that had been
// pulled from the index but still resolved as routes. The client closed that
// gap: "we have 8 listed in main services page, keep those pages only".
// Three keys went, all three redirected in next.config.ts rather than
// 404'd, because links to them exist in the wild:
//
//   • `megling` — mediation merged into counselling on 2026-08-31 (client):
//     one card, "Samtaler og megling", carrying both descriptions. Its copy
//     went with the merge, so by 2026-09-05 the route was building a page
//     whose headline was the raw message key. -> /tjenester/counselling.
//   • `barn-og-ungdom` and `veivisere` — pulled from the index on 2026-08-31,
//     removed outright on 2026-09-05. Both were in the 'community' family,
//     which retires with them. -> /tjenester.
//
// The index is one band per service rather than a grid, so these counts drive
// no layout. The grouping survives because it still sets the ORDER, which
// keeps related services adjacent as you scroll.
export const SERVICE_GROUPS = [
  { key: 'religious', items: ['nikah', 'janaza', 'shahada', 'hajj-umrah'] },
  { key: 'guidance', items: ['counselling'] },
  { key: 'teaching', items: ['skole', 'koran', 'kurs-islam', 'arabisk', 'kurs', 'norsk', 'kurs-konvertitter'] },
  // The community family, reinstated with the pages that retired it.
  { key: 'community', items: ['veivisere', 'ungdom', 'barn-og-familie', 'fosterhjem', 'id-for-alle'] },
] as const satisfies ReadonlyArray<{ key: string; items: readonly ServiceKey[] }>;

// TWO INDEX PAGES (client, 2026-09-13): "Del opp i to sider" — Tjenester and
// Undervisning, each with its own list. The order below is HIS order from that
// message, not SERVICE_ORDER, because the list he wrote is the spec.
//
// Three entries on his lists have no service yet and are NOT invented here:
//   Tjenester   — "ID FOR ALLE". Ours only knows it as one clause inside
//                 barn-og-familie ("Id for alle og ramadanverksted"), i.e. the
//                 EID programme, not identity documents.
//   Undervisning— "Kurs i islam" (Usman's course; only his imam bio mentions
//                 it) and "Kurs for konvertitter" (on rabita.no, currently
//                 item 04 inside shahada).
// His "Koranskole" + "Kurs i arabisk" are one service here, 'koran' ("Koran og
// arabisk"); splitting it means writing two new ledes, so it stays whole until
// he says how to divide it.
//
// 'barn-og-familie' is on NEITHER of his lists. It is kept on Tjenester rather
// than retired: an absence is not an instruction, its copy is the only place
// "Id for alle" is described, and the question is still open with him. One
// line to remove once he answers.
export const SERVICE_PAGES = {
  tjenester: [
    // ── ORDER IS THE CLIENT'S ───────────────────────────────────────────
    // Tekst (endelig), Sept 2026: "Rekkefølgen på kortene er tematisk
    // gruppert (livshendelser → reise/feiring → barn/familie →
    // kunnskap/fellesskap) — følg akkurat denne rekkefølgen på siden."
    // Same eleven as before, resequenced. Nothing added, nothing dropped.
    //
    // Livshendelser
    'shahada',
    'nikah',
    'janaza',
    'counselling',
    // Reise og feiring
    'hajj-umrah',
    'veivisere',
    'id-for-alle',
    // Barn og familie
    'barn-og-familie',
    // Kunnskap og fellesskap
    'kvinnetreff',
    'ungdom',
    'fosterhjem',
  ],
  // Client, 2026-09-16 (Undervisning list): "Fjerne «Kurs for konvertitter»",
  // and Rabita skole + Koranskolen shown first and larger with the other
  // three beneath. The order here IS that layout — ServiceGrid takes the
  // first two as the featured row — so skole and koran must stay in front.
  //
  // kurs-konvertitter is removed from the list, NOT deleted: its page, its
  // photographs and its copy in all three locales are untouched and
  // /tjenester/kurs-konvertitter still renders. Putting the key back in this
  // array is the whole of restoring it.
  //
  // 'kurs' appended 2026-09-17 (client: "Kalligrafi og geometri under
  // undervisning"). A sixth entry is why /undervisning no longer runs a
  // featured row — see the note at its ServiceGrid call.
  undervisning: [
    // Order from Tekst (endelig), Sept 2026. Kalligrafi- og
    // geometriskolen moves to third — it belongs with the two schools
    // above it, not after the three "Kurs i …" that used to precede it.
    'skole',
    'koran',
    'kurs',
    'kurs-islam',
    'arabisk',
    'norsk',
  ],
} as const satisfies Record<string, readonly ServiceKey[]>;

// Where to hold the crop, for sources whose subject is not dead centre.
//
// Every frame in the index is the same landscape box — a band that is taller
// than its neighbours reads as a mistake, whatever the photograph wants. The
// one portrait source (the girl at the bazaar, 1125x1500) therefore loses the
// top and bottom of its frame, so the crop is pulled up to keep her face.
// Anything absent from here is centred.
// Where to hold the crop in the GRID, which is a far tighter frame than the
// bands it replaced: ten of the thirteen sources are ~3:2 landscape and one
// card is 4:5, so a centred crop throws away nearly half the width and can
// behead the subject. Only `skole` was steered before, because the bands
// barely cropped at all.
//
// The vertical offsets are ported from SERVICE_BAND's objectClass below —
// they were tuned on the subject pages against the same photographs, so they
// are measured values, not guesses.
//
// fosterhjem is the exception and is steered HORIZONTALLY: it is a 1616x1080
// of the imam beside a lit projector screen, and that screen is both the
// brightest thing in the library (mean luminance 0.46 in the text zone
// against 0.02 for janaza) and the least interesting half of the frame.
// Pulling the crop toward the inline start keeps the man and drops the screen.
export const SERVICE_FOCUS: Partial<Record<ServiceKey, string>> = {
    nikah: '50% 40%',
    janaza: '50% 50%',
    shahada: '50% 38%',
    counselling: '50% 42%',
    'hajj-umrah': '50% 45%',
    skole: '50% 32%',
    // The mus'haf and the children sit above centre; the phone card is 4:3
    // and crops height.
    koran: '50% 40%',
    kurs: '50% 50%',
    // Hand and notebook sit high; the phone card is 4:3 and crops height.
    norsk: '50% 35%',
    // Slide and presenter sit high; the phone card is 4:3 and crops height.
    veivisere: '50% 38%',
    ungdom: '50% 45%',
    // Mascots and faces sit high; the phone card is 4:3 and crops height.
    'barn-og-familie': '50% 30%',
    fosterhjem: '38% 55%',
    'id-for-alle': '50% 40%',
    // Centre. Both this source and the card crop WIDTH, not height, so the
    // vertical value is inert here — it is kept at 50% so it stays correct if
    // the card's aspect ever changes.
    // Speaker sits above centre; the phone card is 4:3 and crops height.
    'kurs-islam': '50% 35%',
    'kurs-konvertitter': '50% 42%',
    arabisk: '50% 40%'
};
// Per-subject art direction for the band hero (components/page-band.tsx).
//
// SERVICE_FOCUS above is NOT reused: it steers the 4:3 frame on the index,
// this steers a ~1.7:1 panel in the band, and the same photograph does not
// want the same crop in both. Two maps is right here, not duplication.
//
// A total Record, so adding a service to SERVICE_KEYS without art-directing
// it is a type error rather than a page that quietly gets the default.
//
// Tone is restraint by default: eight of the ten are `calm`, which is the
// site's own grade. `solemn` belongs to janaza alone — one page being
// visibly quieter than the rest is the point, and three would be noise.
// `warm` is for the two pages that are the beginning of something.
//
// Tailwind scans lib/, so the object-* literals here are extracted.
export const SERVICE_BAND: Record<
  ServiceKey,
  { objectClass: string; tone: BandTone; mark: BandMark }
> = {
    kvinnetreff: {
        objectClass: 'object-center',
        tone: 'warm',
        mark: 'arch'
    },
    nikah: {
        objectClass: 'object-[50%_40%]',
        tone: 'warm',
        mark: 'elevation'
    },
    janaza: {
        objectClass: 'object-[50%_50%]',
        tone: 'solemn',
        mark: 'arch'
    },
    shahada: {
        objectClass: 'object-[50%_38%]',
        tone: 'warm',
        mark: 'arch'
    },
    // counselling draws nothing, on purpose: its copy in all three locales
    // promises a confidential conversation, so this is the page with nothing
    // written on the wall behind it.
    counselling: {
        objectClass: 'object-[50%_42%]',
        tone: 'calm',
        mark: 'none'
    },
    'hajj-umrah': {
        objectClass: 'object-[50%_45%]',
        tone: 'calm',
        mark: 'orbit'
    },
    // The one portrait source (the girl at the bazaar, 1125x1500) loses the
    // top and bottom of its frame in a landscape panel, so the crop is pulled
    // up to keep her face — the same reason SERVICE_FOCUS carries it.
    skole: {
        objectClass: 'object-[50%_26%] md:object-[50%_30%]',
        tone: 'calm',
        mark: 'rosette'
    },
    koran: {
        objectClass: 'object-[50%_45%]',
        tone: 'calm',
        mark: 'rosette'
    },
    // 1170x767 (1.53:1) in a ~1.7:1 panel loses about a tenth off the top and
    // bottom, and the hands and the sheet sit across the middle of the frame,
    // so this one is centred rather than pulled up like its neighbours.
    kurs: {
        objectClass: 'object-[50%_50%]',
        tone: 'calm',
        mark: 'rosette'
    },
    norsk: {
        objectClass: 'object-[50%_40%]',
        tone: 'calm',
        mark: 'rosette'
    },
    veivisere: {
        objectClass: 'object-[50%_42%]',
        tone: 'warm',
        mark: 'arch'
    },
    ungdom: {
        objectClass: 'object-[50%_45%]',
        tone: 'warm',
        mark: 'orbit'
    },
    'barn-og-familie': {
        objectClass: 'object-[50%_42%]',
        tone: 'warm',
        mark: 'rosette'
    },
    // mark: 'none' and tone: 'calm', the pair counselling carries. A page
    // about taking someone else's child into your home is not a page to
    // decorate.
    fosterhjem: {
        objectClass: 'object-[50%_45%]',
        tone: 'calm',
        mark: 'none'
    },
    'id-for-alle': {
        objectClass: 'object-[50%_40%]',
        tone: 'warm',
        mark: 'rosette'
    },
    'kurs-islam': {
        objectClass: 'object-[50%_50%]',
        tone: 'calm',
        mark: 'rosette'
    },
    'kurs-konvertitter': {
        objectClass: 'object-[50%_42%]',
        tone: 'warm',
        mark: 'arch'
    },
    arabisk: {
        objectClass: 'object-[50%_40%]',
        tone: 'calm',
        mark: 'rosette'
    }
};
// A SECOND photograph per service, for the body of the page.
//
// The section it fills held a large invented line-drawing until 2026-09-05
// — a mihrab, a mashrabiya, a rihal — and the client's verdict was that
// they look fake. They did: drawn artwork does not survive being set at
// full size a few hundred pixels under a photograph of real people. What
// replaced it was a centred paragraph on its own, and the verdict on that
// was \"very basic\", which was also fair.
//
// So: another real photograph, from the mosque's own library, never the
// one the band above is already showing. The sources are chosen from the
// portrait and square-ish end of the library rather than the 16:9 hero
// crops.
//
// The FRAME is 3:2, at the foot of the enquiry rail. It was a 4:5 portrait
// beside the copy until 2026-09-06, when the numbered offer list took that
// column; these positions were retuned for the new shape. A 3:2 crop of a
// 1400x2365 portrait keeps a thin horizontal band, so the y value moved a
// long way on janaza — 38% was the ceiling of the room, 62% is the
// embrace.
//
// The pairings are meant, not filled in:
//   nikah        the room a nikah is actually held in
//   janaza       an embrace — the consolation, not the funeral
//   shahada      a welcome, which is what taking shahada is met with
//   counselling  the women's circle; the copy promises a female counsellor
//   hajj-umrah   a full congregation, the nearest thing here to the crowd
//   skole        children at the mosque, not an empty room. learn-classroom
//                was the obvious pick and it is a 1600x1000 lecture hall: in
//                a 4:5 frame it crops to ceiling.
//   koran        the mushaf open on its rihal
//   kurs         the qalam on the practice sheet. It was the building's own
//                brick lattice — a citation of the geometry the course
//                teaches — until the client supplied two calligraphy
//                photographs on 2026-09-10 and the page could stop
//                borrowing the architecture
/**
 * Extra frames for the one-screen spread, beyond the band and story images.
 *
 * PARTIAL ON PURPOSE. A photo audit on 2026-09-15 found the library cannot
 * support a gallery for most services, and the gaps are not fixable in code:
 *
 *   • janaza has ONE photograph. subj-janaza and svc-janaza-prayer are the
 *     same frame at two crops, so a gallery there shows the same picture
 *     twice.
 *   • nikah, shahada and hajj-umrah each pair a real photograph with a CGI
 *     render or a synthetic image. Eight hundred pixels apart on a scroll
 *     that passes; side by side at the same size it does not.
 *   • norsk, veivisere, arabisk, kurs, kurs-islam and kurs-konvertitter have
 *     no on-subject unused frames at all — and norsk and veivisere are
 *     already running stand-ins.
 *
 * So services listed here get a gallery and the rest get a single
 * photograph, which the spread renders as a full-height plate rather than as
 * a gallery of one. Add a key here the day real photographs arrive; nothing
 * else has to change.
 *
 * id-for-alle is the first because it is the one service whose extra frames
 * are real, unused and plainly the same event — the bazaar and the iftar.
 */
export const SERVICE_GALLERY: Partial<Record<ServiceKey, readonly string[]>> = {
    'id-for-alle': [
        '/photos/community/bazaar-child.webp',
        '/photos/community/bazaar-stand.webp',
        '/photos/community/bazaar-cakes.webp',
        '/photos/community/iftar-serving.webp'
    ]
};

/**
 * The second photograph, shown as the plate in section 2 of a subject page.
 *
 * PARTIAL since 2026-09-16: kvinnetreff has no photograph of its own, and the
 * page would rather show nothing than show the wrong people. A service with no
 * entry here renders section 2 as type across the full measure, and the plate
 * returns on its own the moment a real frame is added.
 */
export const SERVICE_STORY: Partial<
  Record<ServiceKey, { src: string; objectClass: string }>
> = {
  // Client, Bildeplassering (2026-09-19). pexels-hugo-martinez — signing the contract.
  nikah: { src: '/photos/subj-nikah-kontrakt.webp', objectClass: 'object-center' },
  // The janaza prayer itself (client, 2026-09-10). The embrace that stood
  // here is a fine photograph, but a reader who lands on this page is
  // usually looking for what Rabita actually does when someone dies, and
  // the answer is this: the congregation in rows, facing the qibla wall.
  // 1086x1448 in a 3:2 frame shows half the height; 45% holds the bowed
  // heads and the top of the timber wall.
  janaza: { src: '/photos/svc-janaza-prayer.webp', objectClass: 'object-[50%_45%]' },
  // Client, Bildeplassering (2026-09-19), IMG_8833 — his Seksjonsbilde for
  // Shahada. Cut 400px down from a 3648x5472: that window puts the face
  // larger and sets the lit crescent beside his head rather than crowding the
  // top edge, and it drops the "Muslimsk Dialognettverk" watermark that sits
  // in the bottom-left of the original.
  //
  // object-center, not a tuned position: the file is cut to exactly 4:5 and
  // the frame is 4:5, so there is no overflow left to steer.
  shahada: { src: '/photos/svc-shahada-adhan.webp', objectClass: 'object-center' },
  // Was womens-circle until 2026-09-16. That frame is six women together in a
  // room at the mosque — it is a kvinnetreff photograph in everything but
  // name, and kvinnetreff had none, so it moved there. subj-counselling has
  // been sitting unused in /photos since the start and is named for this
  // page: a welcome on the square, which is the front door of the service
  // rather than the confidential conversation itself. Nothing is duplicated.
  // ⚠ TEMPORARY — client, Bildeplassering (2026-09-19): "Nytt bilde kommer,
  // midlertidig bilde". His Seksjonsbilde for Samtaler og megling.
  //
  // Cut 376px down from a 1284x1981: the top half of the original is bare
  // timber wall, and at y=376 the circle fills the frame — the man on the
  // chair and the young men around him all read.
  //
  // subj-counselling.webp is NOT deleted; it is what this reverts to.
  counselling: { src: '/photos/subj-samtaler-krets-TEMP.webp', objectClass: 'object-center' },
  // The real photograph the client asked for (2026-09-16: "use some photo
  // here man of women gathering"). Portrait, 1125x1500, so it renders as a
  // portrait plate. The BAND above it keeps the neutral lattice render —
  // running this frame twice on one page would be worse than either.
  // Client, Bildeplassering (2026-09-19). 7-_DSC0317.
  kvinnetreff: { src: '/photos/subj-kvinnetreff-samling.webp', objectClass: 'object-[50%_45%]' },
  // Client, Bildeplassering (2026-09-19). pexels-tahir-osman — tawaf at the Kaaba.
  // PORTRAIT, so it is registered in PORTRAIT_PHOTOS below or the frame
  // renders 4:3 and crops the Kaaba out of its own picture.
  'hajj-umrah': { src: '/photos/subj-hajj-kaaba.webp', objectClass: 'object-[50%_55%]' },
  // The source was saved on its side and rendered on its side (client,
  // 2026-09-10: "why is this image rotated?"). The turn is baked into the
  // file now, so the news-events card that also uses it is fixed with it.
  // Landscape at 1200x675, so the frame keeps the full height and the Y in
  // the old crop no longer had anything to do.
  // Client, Bildeplassering (2026-09-19), 711828319 — the class photograph.
  // PORTRAIT (2048x2730), so it is registered in PORTRAIT_PHOTOS below;
  // without that the frame renders 4:3 and takes the children's feet and
  // the top of the room off.
  //
  // This also settles 4.png, which he listed as Rabita skolen's Hovedbilde
  // (a slot that no longer exists). His intended file arrived, so it is
  // used and 4.png stays unplaced.
  skole: { src: '/photos/subj-skole-klassebilde.webp', objectClass: 'object-center' },
  // Not learn-school.webp (client, 2026-09-10: "why zoomed"). That file is a
  // 2200x1000 panorama of the mushaf on its rihal; a 3:2 frame keeps 68% of
  // its width, which at 430px wide reads as a close-up of a book rather than
  // as a photograph. It was also the hero of /undervisning, so the same
  // picture appeared twice in the teaching pages. A room of people learning
  // suits a small landscape frame, and it is what the service is.
  // A Quran class in the round on the mosque carpet (client, 2026-09-10).
  // The band is the mushaf on its rihal, so the page now shows the book and
  // then the class rather than the book twice or a lecture that could be
  // about anything.
  // Client, Bildeplassering (2026-09-19), "Koran undervisning.png" — his
  // Seksjonsbilde for Koran skole. Delivered at 1122x1402, which is 0.800:
  // exactly the 4:5 this frame wants, so it ships uncropped.
  koran: { src: '/photos/subj-koran-klasse.webp', objectClass: 'object-center' },
  // A second calligraphy photograph (client, 2026-09-10), so the page no
  // longer has to borrow the building for its illustration: the band leads
  // on the calligrapher at her desk, this one is the qalam on the practice
  // sheet. 1170x767 is 1.53:1 in a 3:2 frame, so it keeps nearly all of the
  // picture and only needs centring.
  // Client, Bildeplassering (2026-09-19), 20230211_150626 — a geometric
  // construction being drawn with ruler and compass, which is literally what
  // "Kalligrafi og geometri" teaches. Cut at x=350 of a 4032x2268: the whole
  // circle stays in frame, which a tighter window loses.
  kurs: { src: '/photos/subj-kalligrafi-geometri.webp', objectClass: 'object-center' },
  // Client, Bildeplassering (2026-09-19). "Design uten navn (24).png".
  norsk: { src: '/photos/subj-norsk-skriving.webp', objectClass: 'object-center' },
  // NOT learn-classroom (client, 2026-09-10: "its to up, bring a bit down").
  // The crop could not be brought down, because it was doing nothing: that
  // file is 1600x1000, wider than this 3:2 frame, so object-cover fills the
  // height and shows ALL of it — and four-fifths of it is ceiling. The Y in
  // an object-position only bites when the source is TALLER than its frame.
  // learning-lecture is a room of people at 1200x1600, which is both about
  // the right thing and croppable.
  // Client, Bildeplassering (2026-09-19), "1Q6A0379 (2)" — a school class
  // sitting in the prayer hall, which is the service itself.
  veivisere: { src: '/photos/subj-veivisere-skoleklasse.webp', objectClass: 'object-[50%_45%]' },
  // Four boys, plainly the 11-15 the youth pages name. The client offered
  // this for barn-og-familie; it is here because that page is about
  // families with small children and this is Gutter i fokus. One line to
  // move it back.
  // Client, Bildeplassering (2026-09-19), 14_12_2024_Rabita_Ummah_Konferanse17.
  ungdom: { src: '/photos/subj-ungdom-konferanse.webp', objectClass: 'object-center' },
  // Client, Bildeplassering (2026-09-19), 486873681.
  'barn-og-familie': { src: '/photos/subj-barn-familie-perler.webp', objectClass: 'object-center' },
  // The fosterhjem.no stand Rabita staffs at an outdoor event: "Har du rom
  // til en til?" on the banner, and two of the people who answer questions
  // at it. 1200x1600 in a 3:2 frame keeps half the height, and 55% holds
  // the banner's question and both faces.
  // Client, Bildeplassering (2026-09-19), "pexels-kampus-6299265 (1)".
  fosterhjem: { src: '/photos/subj-fosterhjem-lek.webp', objectClass: 'object-[50%_55%]' },
  // Client, Bildeplassering (2026-09-19), 502460715.
  'id-for-alle': { src: '/photos/subj-id-for-alle-ballong.webp', objectClass: 'object-center' },
  // Client, Bildeplassering (2026-09-19). 14_12_2024_Rabita_Ummah_Konferanse3.
  'kurs-islam': { src: '/photos/subj-kurs-islam-foredrag.webp', objectClass: 'object-[50%_75%]' },
  // They eat together, which is the part of the course people remember.
  'kurs-konvertitter': { src: '/photos/community/iftar-table-set.webp', objectClass: 'object-center' },
  // Client, Bildeplassering (2026-09-19). "Arabisk klasse.png" again — he names the one file for both the
  // card and the section, so this is a second, wider crop of it.
  arabisk: { src: '/photos/subj-arabisk-bok.webp', objectClass: 'object-center' },
};

// The order the thirteen are shown in, on /tjenester and on the home
// carousel (client, 2026-09-10: "as order on home page, use same on main
// services page"). It is NOT the grouping order: the client's sequence puts
// the school first and the two religious ceremonies late, which scatters the
// families. That costs nothing on the index, where the grouping has not
// printed since 2026-09-06 and only ever set the sequence — and the group
// label still reaches each service page through SERVICE_GROUP_OF below.
//
// Anything missing from this list is appended by the index rather than
// dropped, so adding a service to SERVICE_KEYS and forgetting this one
// leaves it last instead of leaving it out.
export const SERVICE_ORDER = [
  'skole',
  'counselling',
  'hajj-umrah',
  'shahada',
  'ungdom',
  'nikah',
  'janaza',
  'koran',
  'kurs',
  'norsk',
  'veivisere',
  'barn-og-familie',
  'fosterhjem',
  'id-for-alle',
  'kurs-islam',
  'arabisk',
  'kurs-konvertitter',
] as const satisfies readonly ServiceKey[];

// Which family a service belongs to, so the band can print a group label as
// the second half of its kicker. Same eight as SERVICE_GROUPS, but as a
// lookup rather than an ordering.
export const SERVICE_GROUP_OF: Record<
  ServiceKey,
  'religious' | 'guidance' | 'teaching' | 'community'
> = {
  nikah: 'religious',
  janaza: 'religious',
  shahada: 'religious',
  'hajj-umrah': 'religious',
  counselling: 'guidance',
  skole: 'teaching',
  koran: 'teaching',
  kurs: 'teaching',
  norsk: 'teaching',
  veivisere: 'community',
  ungdom: 'community',
  'barn-og-familie': 'community',
  fosterhjem: 'community',
  'id-for-alle': 'community',
  kvinnetreff: 'community',
  'kurs-islam': 'teaching',
  'kurs-konvertitter': 'teaching',
  arabisk: 'teaching',
};

// ─────────────────────────────────────────────────────────────────────────
// DORMANT SERVICES — written, translated, and switched off.
//
// The client's Tjenester.docx (2026-09-07) describes five services this site
// has no page for. Two of them, veivisere and barn-og-ungdom, WERE pages
// until 2026-09-05, when the instruction was "keep those 8 pages only". The
// instruction now is: write all of them, show the eight, "and if needed
// later, we will just uncomment those".
//
// So the copy is already in messages/{no,en,ar}.json under
// servicesIndex.items.<key> — title, body, longBody, offerTitle, offerLede
// and four offer items each, in all three languages — plus a
// requestForm.notes.<key> line so the enquiry form has its hint. None of it
// renders: every consumer reads SERVICE_KEYS or SERVICE_GROUPS, and neither
// mentions these. Nothing iterates the message file.
//
// TO TURN ONE ON, four edits:
//   1. add the key to SERVICE_KEYS below, and its entries to the four total
//      Records (the compiler will name every one you miss);
//   2. add it to a SERVICE_GROUPS family so it appears on the index, and
//      give that family a label under servicesIndex.groups if it is new —
//      'community' was removed with these two and would need restoring;
//   3. add a { label, blurb, href } entry to nav.menu.services in all three
//      message files (the mega-menu is an array, not derived);
//   4. for veivisere ONLY, delete its 308 in next.config.ts, or the route
//      will redirect to /tjenester before it ever renders.
//
// The photographs below are picked from the unused end of the library and
// are suggestions, not commitments — check the crop in the band and the 3:2
// rail before shipping, the way SERVICE_STORY documents.
//
// 'veivisere'        band /photos/event-school-visit.webp   story /photos/cong-hall.webp
// 'norsk'            band /photos/learn-classroom.webp      story /photos/community/volunteers-two.webp
// 'ungdom'           band /photos/community/volunteers-street.webp  story /photos/svc-friday.webp
// 'barn-og-familie'  band /photos/community/bazaar-stand.webp story /photos/hero-iftar.webp
// 'fosterhjem'       band /photos/community/welcome-embrace.webp story /photos/cong-prayer.webp
//
// A note on barn-og-ungdom: the old key was 'barn-og-ungdom' and the doc
// splits that subject in two — Ungdomsarbeid (NUM, 11-15 and up) and
// Barn- og familieaktiviteter. They are written as two services, 'ungdom'
// and 'barn-og-familie', not one. The old /tjenester/barn-og-ungdom
// redirect can point at whichever of the two is turned on.
// ─────────────────────────────────────────────────────────────────────────

/**
 * Every photograph in this file that is TALLER than it is wide, measured from
 * the actual files with sips on 2026-09-15 — not assumed.
 *
 * This matters because the service photo set is mixed: 13 portrait to 23
 * landscape. There is no single frame that fits them all, so ServiceSpread
 * picks its plate ratio per service instead of locking one globally. Getting
 * this wrong is expensive rather than cosmetic — the full-bleed version of
 * that page cover-fitted 3:4 sources into a 1.43:1 box and discarded 48% of
 * every frame.
 *
 * If you add a photograph, measure it and put it here if it is portrait:
 *   sips -g pixelWidth -g pixelHeight public/photos/whatever.webp
 */
const PORTRAIT_PHOTOS: ReadonlySet<string> = new Set([
  // Added 2026-09-20. galleryOrientation() reads THIS SET, never the file on
  // disk — a portrait photograph missing from here is handed a 4:3 frame and
  // loses its top and bottom. The first two were my own omission on 09-19.
  '/photos/svc-shahada-adhan.webp',
  '/photos/subj-samtaler-krets-TEMP.webp',
  '/photos/subj-hajj-kaaba.webp',
  '/photos/subj-koran-klasse.webp',
  '/photos/subj-skole-klassebilde.webp',
  '/photos/community/bazaar-cakes.webp',
  '/photos/community/bazaar-child.webp',
  '/photos/community/bazaar-stand.webp',
  '/photos/community/iftar-serving.webp',
  '/photos/community/speaker-mic.webp',
  '/photos/community/welcome-embrace.webp',
  '/photos/community/womens-circle.webp',
  '/photos/community/youth-table.webp',
  '/photos/learning-class.webp',
  '/photos/learning-lecture.webp',
  '/photos/svc-fosterhjem-stand.webp',
  '/photos/svc-gathering.webp',
  '/photos/svc-janaza-prayer.webp',
]);

/** Portrait only when EVERY frame in the set is portrait — one landscape
 *  frame in a portrait plate is a worse crop than the reverse. */
export function galleryOrientation(srcs: readonly string[]): 'portrait' | 'landscape' {
  return srcs.length > 0 && srcs.every((s) => PORTRAIT_PHOTOS.has(s)) ? 'portrait' : 'landscape';
}
