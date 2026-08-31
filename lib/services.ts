// The service list, in one place. Both the index (components/service-index.tsx)
// and the detail route (app/[locale]/tjenester/[subject]) read from here, so a
// service cannot exist in one and be missing from the other.

export const SERVICE_KEYS = [
  'nikah',
  'janaza',
  'shahada',
  'counselling',
  'hajj-umrah',
  'megling',
  'barn-og-ungdom',
  'skole',
  'koran',
  'kurs',
  'veivisere',
] as const;

export type ServiceKey = (typeof SERVICE_KEYS)[number];

// One render per subject, so the pages are not the same picture repeated.
export const SERVICE_IMAGE: Record<ServiceKey, string> = {
  nikah: '/photos/subj-nikah.webp',
  janaza: '/photos/subj-janaza.webp',
  shahada: '/photos/subj-shahada.webp',
  counselling: '/photos/subj-counselling.webp',
  'hajj-umrah': '/photos/subj-hajj.webp',
  megling: '/photos/svc-counsel.webp',
  'barn-og-ungdom': '/photos/learn-classroom.webp',
  skole: '/photos/community/bazaar-child.webp',
  koran: '/photos/community/quran-carpet.webp',
  kurs: '/photos/event-lecture-hall.webp',
  veivisere: '/photos/event-school-visit.webp',
};

// What the index shows.
//
// Three keys are deliberately absent, and all three stay in SERVICE_KEYS so
// their routes keep resolving — links to them already exist in the wild, and
// components/congregation-today.tsx points at barn-og-ungdom directly:
//
//   • `megling` — mediation merged into counselling on 2026-08-31 (client):
//     one card, "Samtaler og megling", carrying both descriptions.
//   • `barn-og-ungdom` and `veivisere` — pulled from the index on 2026-08-31
//     (client), which retires the 'community' family and takes the list from
//     ten bands to eight. Nothing else changes: the pages are still there, and
//     the counter renumbers itself off this array.
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
