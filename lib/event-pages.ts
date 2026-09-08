// The three events the two /arrangementer pages render.
//
// NOT lib/events.ts. That file holds a richer, four-record model (date,
// time, location, capacity, rsvpCount) written against a "replace with the
// Prisma Event model" plan, and its only consumer — components/
// events-schedule.tsx — is not rendered by any page. The two datasets
// disagree on almost everything: different slugs (iftar-ramadan-2027 vs
// ramadan-iftar-2026), different key names, three records against four, and
// two separate copy namespaces (eventsPage.items vs events.items).
//
// Picking a winner is a content decision, not a layout one, so this change
// does not make it. What it does fix is the smaller duplication inside the
// pages themselves: the list lived in the index while the per-event
// photograph and a second slug->key map lived in the detail page, which is
// how an event gets a picture on one page and none on the other.
//
// TODO: reconcile with lib/events.ts once someone decides whether there are
// three events or four, and which copy namespace survives.
export type EventKey = 'ramadan' | 'lecture' | 'school';

export type EventPageEntry = {
  slug: string;
  /** ISO. Formatted per locale at render, never stored formatted. */
  date: string;
  /** Indexes eventsPage.items.<key>. */
  key: EventKey;
  /** From the mosque's own archive. */
  image: string;
};

const RAW: EventPageEntry[] = [
  { slug: 'ramadan-iftar-2026', date: '2026-02-18', key: 'ramadan', image: '/photos/event-iftar-tables.webp' },
  { slug: 'aabent-hus-oktober', date: '2026-10-05', key: 'lecture', image: '/photos/event-lecture-hall.webp' },
  { slug: 'skolebesok-host', date: '2026-09-12', key: 'school', image: '/photos/event-school-visit.webp' },
];

// Sorted, not hand-ordered: the section is headed "upcoming events" and the
// authored order ran February, October, September.
export const EVENT_PAGES: EventPageEntry[] = [...RAW].sort((a, b) => a.date.localeCompare(b.date));

export const EVENT_PAGE_BY_SLUG: Record<string, EventPageEntry> = Object.fromEntries(
  EVENT_PAGES.map((e) => [e.slug, e]),
);
