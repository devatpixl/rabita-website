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
] as const;

export type ServiceKey = (typeof SERVICE_KEYS)[number];

// One render per subject, so the pages are not the same picture repeated.
export const SERVICE_IMAGE: Record<ServiceKey, string> = {
  nikah: '/photos/subj-nikah.webp',
  janaza: '/photos/subj-janaza.webp',
  shahada: '/photos/subj-shahada.webp',
  // Matching the Conversations slide on the home page.
  counselling: '/photos/community/speaker-mic.webp',
  'hajj-umrah': '/photos/subj-hajj.webp',
  // The certificate class, matching the Learning slide on the home page
  // (client, 2026-09-09). bazaar-child was a girl with face paint at a
  // bazaar — a nice photograph, but not a school.
  skole: '/photos/learning-class.webp',
  koran: '/photos/community/quran-carpet.webp',
  // A calligrapher at work, client-supplied 2026-09-10. What stood here was
  // event-lecture-hall.webp — children singing on a stage — under a card
  // headed "Kalligrafi og geometri". The photograph is still in use on the
  // October open-house event, so this is a new file rather than an
  // overwrite.
  kurs: '/photos/subj-kurs-calligraphy.webp',
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
  { key: 'teaching', items: ['skole', 'koran', 'kurs'] },
] as const satisfies ReadonlyArray<{ key: string; items: readonly ServiceKey[] }>;

// Where to hold the crop, for sources whose subject is not dead centre.
//
// Every frame in the index is the same landscape box — a band that is taller
// than its neighbours reads as a mistake, whatever the photograph wants. The
// one portrait source (the girl at the bazaar, 1125x1500) therefore loses the
// top and bottom of its frame, so the crop is pulled up to keep her face.
// Anything absent from here is centred.
export const SERVICE_FOCUS: Partial<Record<ServiceKey, string>> = {
  skole: '50% 32%',
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
  nikah: { objectClass: 'object-[50%_40%]', tone: 'warm', mark: 'elevation' },
  janaza: { objectClass: 'object-[50%_50%]', tone: 'solemn', mark: 'arch' },
  shahada: { objectClass: 'object-[50%_38%]', tone: 'warm', mark: 'arch' },
  // counselling draws nothing, on purpose: its copy in all three locales
  // promises a confidential conversation, so this is the page with nothing
  // written on the wall behind it.
  counselling: { objectClass: 'object-[50%_42%]', tone: 'calm', mark: 'none' },
  'hajj-umrah': { objectClass: 'object-[50%_45%]', tone: 'calm', mark: 'orbit' },
  // The one portrait source (the girl at the bazaar, 1125x1500) loses the
  // top and bottom of its frame in a landscape panel, so the crop is pulled
  // up to keep her face — the same reason SERVICE_FOCUS carries it.
  skole: { objectClass: 'object-[50%_26%] md:object-[50%_30%]', tone: 'calm', mark: 'rosette' },
  koran: { objectClass: 'object-[50%_45%]', tone: 'calm', mark: 'rosette' },
  // 1170x767 (1.53:1) in a ~1.7:1 panel loses about a tenth off the top and
  // bottom, and the hands and the sheet sit across the middle of the frame,
  // so this one is centred rather than pulled up like its neighbours.
  kurs: { objectClass: 'object-[50%_50%]', tone: 'calm', mark: 'rosette' },
};

// A SECOND photograph per service, for the body of the page.
//
// The section it fills held a large invented line-drawing until 2026-09-05
// — a mihrab, a mashrabiya, a rihal — and the client's verdict was that
// they look fake. They did: drawn artwork does not survive being set at
// full size a few hundred pixels under a photograph of real people. What
// replaced it was a centred paragraph on its own, and the verdict on that
// was "very basic", which was also fair.
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
//   kurs         the building's own brick geometry — the calligraphy and
//                geometry course teaches exactly this construction, so the
//                photograph is a citation rather than a decoration
export const SERVICE_STORY: Record<ServiceKey, { src: string; objectClass: string }> = {
  nikah: { src: '/photos/svc-prayer.webp', objectClass: 'object-center' },
  // The janaza prayer itself (client, 2026-09-10). The embrace that stood
  // here is a fine photograph, but a reader who lands on this page is
  // usually looking for what Rabita actually does when someone dies, and
  // the answer is this: the congregation in rows, facing the qibla wall.
  // 1086x1448 in a 3:2 frame shows half the height; 45% holds the bowed
  // heads and the top of the timber wall.
  janaza: { src: '/photos/svc-janaza-prayer.webp', objectClass: 'object-[50%_45%]' },
  shahada: { src: '/photos/svc-gathering.webp', objectClass: 'object-[50%_45%]' },
  counselling: { src: '/photos/community/womens-circle.webp', objectClass: 'object-[50%_45%]' },
  'hajj-umrah': { src: '/photos/prayer-congregation.webp', objectClass: 'object-[50%_55%]' },
  // The source was saved on its side and rendered on its side (client,
  // 2026-09-10: "why is this image rotated?"). The turn is baked into the
  // file now, so the news-events card that also uses it is fixed with it.
  // Landscape at 1200x675, so the frame keeps the full height and the Y in
  // the old crop no longer had anything to do.
  skole: { src: '/photos/event-workshop.webp', objectClass: 'object-center' },
  // Not learn-school.webp (client, 2026-09-10: "why zoomed"). That file is a
  // 2200x1000 panorama of the mushaf on its rihal; a 3:2 frame keeps 68% of
  // its width, which at 430px wide reads as a close-up of a book rather than
  // as a photograph. It was also the hero of /undervisning, so the same
  // picture appeared twice in the teaching pages. A room of people learning
  // suits a small landscape frame, and it is what the service is.
  koran: { src: '/photos/learning-lecture.webp', objectClass: 'object-[50%_45%]' },
  kurs: { src: '/photos/svc-wudu.webp', objectClass: 'object-center' },
};

// Which family a service belongs to, so the band can print a group label as
// the second half of its kicker. Same eight as SERVICE_GROUPS, but as a
// lookup rather than an ordering.
export const SERVICE_GROUP_OF: Record<ServiceKey, 'religious' | 'guidance' | 'teaching'> = {
  nikah: 'religious',
  janaza: 'religious',
  shahada: 'religious',
  'hajj-umrah': 'religious',
  counselling: 'guidance',
  skole: 'teaching',
  koran: 'teaching',
  kurs: 'teaching',
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
