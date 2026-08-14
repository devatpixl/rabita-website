// Data source for the AGM notice section. The seat grid and caption are
// computed from these numbers; never hardcode a fill count downstream.
//
// If votingMembers is set to null, the seat grid and its caption are hidden
// entirely — the notice still frames without the ratio. Do that rather than
// ship a placeholder number the day of a board election.

export type Membership = {
  totalMembers: number;
  votingMembers: number | null;
  votingFeeNok: number;
  agm: {
    date: string; // ISO YYYY-MM-DD, formatted per locale at render time
    time: string; // HH:mm, 24h
    venue: string;
  };
};

export const membership: Membership = {
  totalMembers: 4200,
  // TODO: confirm with Rabita before launch — this is a placeholder.
  votingMembers: 1040,
  votingFeeNok: 1000,
  agm: {
    // TODO: confirm with Rabita before launch — this is a placeholder.
    date: '2027-03-14',
    time: '18:00',
    venue: 'Calmeyers gate 8',
  },
};
