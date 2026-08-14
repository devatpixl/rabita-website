// Events data. Placeholder records until wired through Prisma's Event
// model in Phase 3. Every event must capture a signup — the section is
// there to grow the contact list, not to be a blog feed.
//
// Ordering: date ascending. Past events are hidden at render time,
// never deleted from source — the archive matters. If `capacity` is
// null, the capacity line and progress bar are hidden entirely rather
// than showing a fake number.

export type EventRecord = {
  slug: string;
  titleKey: 'iftar' | 'openHouse' | 'schoolVisit' | 'lecture';
  date: string; // ISO YYYY-MM-DD
  time: string; // HH:mm 24h, Europe/Oslo
  location: string;
  capacity: number | null;
  rsvpCount: number;
};

// TODO: replace with database rows once the Prisma Event model is
// wired. Keep the shape: slug, titleKey (for translated title/body),
// date, time, location, capacity, rsvpCount.
export const EVENTS: readonly EventRecord[] = Object.freeze([
  {
    slug: 'iftar-ramadan-2027',
    titleKey: 'iftar',
    date: '2027-02-18',
    time: '18:00',
    location: 'Calmeyers gate 8',
    capacity: 250,
    rsvpCount: 142,
  },
  {
    slug: 'skolebesok-host-2026',
    titleKey: 'schoolVisit',
    date: '2026-09-12',
    time: '10:00',
    location: 'Calmeyers gate 8',
    capacity: 60,
    rsvpCount: 41,
  },
  {
    slug: 'aabent-hus-oktober-2026',
    titleKey: 'openHouse',
    date: '2026-10-05',
    time: '18:00',
    location: 'Calmeyers gate 8',
    capacity: 120,
    rsvpCount: 67,
  },
  {
    slug: 'foredrag-november-2026',
    titleKey: 'lecture',
    date: '2026-11-14',
    time: '19:30',
    location: 'Calmeyers gate 8',
    capacity: null, // open capacity — bar/line hidden
    rsvpCount: 0,
  },
]);

// Anything strictly before today (Europe/Oslo, midnight) is past.
// Comparison in ISO YYYY-MM-DD lexical order is safe because both
// operands share the same format and locale-independent ordering.
function todayIso(): string {
  // Server-side, the process TZ matters. In practice Vercel runs UTC,
  // so drop UTC's date part — a Europe/Oslo cutoff would only differ
  // for the ~1-2 hour window around midnight, and past-event drift by
  // one day at that boundary is not worth the timezone plumbing here.
  return new Date().toISOString().slice(0, 10);
}

export function upcomingEvents(): EventRecord[] {
  const today = todayIso();
  return EVENTS.filter((e) => e.date >= today)
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

export function isFull(e: EventRecord): boolean {
  return e.capacity !== null && e.rsvpCount >= e.capacity;
}
