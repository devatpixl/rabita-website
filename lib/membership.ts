// Data source for the AGM notice section. The seat grid and caption are
// computed from these numbers; never hardcode a fill count downstream.
//
// If votingMembers is set to null, the seat grid and its caption are hidden
// entirely — the notice still frames without the ratio. Do that rather than
// ship a placeholder number the day of a board election.

export type Membership = {
  totalMembers: number;
  /**
   * How many members hold a vote — or null to hide the seat grid entirely.
   *
   * NULL SINCE 2026-09-16, and not as a placeholder: the client made every
   * membership free and gave every member a vote, so "voting members" is no
   * longer a subset of anything. A grid showing 4 200 of 4 200 filled seats
   * states nothing. The component already treats null as "hide the grid",
   * which is exactly the right behaviour now.
   */
  votingMembers: number | null;
  agm: {
    date: string; // ISO YYYY-MM-DD, formatted per locale at render time
    time: string; // HH:mm, 24h
    venue: string;
  };
};

export const membership: Membership = {
  // TODO: still disagrees with CAMPAIGN.members (4 344) and with
  // joinPage.members ("over 4 300"). Three totals, one organisation —
  // raised with the client 2026-09-16, unresolved.
  totalMembers: 4200,
  votingMembers: null,
  agm: {
    // TODO: confirm with Rabita before launch — this is a placeholder.
    date: '2027-03-14',
    time: '18:00',
    venue: 'Calmeyers gate 8',
  },
};
