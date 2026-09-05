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
  counselling: '/photos/subj-counselling.webp',
  'hajj-umrah': '/photos/subj-hajj.webp',
  skole: '/photos/community/bazaar-child.webp',
  koran: '/photos/community/quran-carpet.webp',
  kurs: '/photos/event-lecture-hall.webp',
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
  kurs: { objectClass: 'object-[50%_40%]', tone: 'calm', mark: 'rosette' },
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
// one the band above is already showing. Every frame here is a 4:5
// portrait, which is why the sources are chosen from the portrait and
// square-ish end of the library rather than the 16:9 hero crops.
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
  janaza: { src: '/photos/svc-services.webp', objectClass: 'object-[42%_38%]' },
  shahada: { src: '/photos/svc-gathering.webp', objectClass: 'object-[50%_45%]' },
  counselling: { src: '/photos/community/womens-circle.webp', objectClass: 'object-[50%_40%]' },
  'hajj-umrah': { src: '/photos/prayer-congregation.webp', objectClass: 'object-[50%_55%]' },
  skole: { src: '/photos/event-workshop.webp', objectClass: 'object-[50%_45%]' },
  koran: { src: '/photos/learn-school.webp', objectClass: 'object-[50%_60%]' },
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
