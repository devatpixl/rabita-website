// The organisation chart, as data.
//
// Client, 2026-09-16 (Om oss list): "Gjøre organisasjonskart til en integrert
// del av nettsiden" — make the org chart an integrated part of the site.
// Until now /om-oss carried it as a single 1024x724 webp: the names were
// ~10px of baked-in pixels, unreadable on a phone, unselectable, invisible to
// a screen reader and untranslatable. This is the same chart as real markup.
//
// ── TRANSCRIBED FROM THE CLIENT'S OWN FILE ────────────────────────────────
// Every name and role below is read off public/photos/organisasjonskart.webp,
// tier by tier, at 1.5x magnification. Nothing here is inferred and nothing is
// filled in: 3 + 7 + 8 + 10 = 28 people, which is what the image shows.
//
// NAMES ARE COPIED EXACTLY, including "Iman sayyah", whose surname is
// lowercase in the source. That looks like a typo in the client's file, but a
// person's name is not something to silently correct — flagged for Rabita
// rather than fixed here.
//
// ── NO PORTRAITS ──────────────────────────────────────────────────────────
// The image has a face for each person, but they live inside that one file at
// roughly 51px across. Cropping 28 of those out would give thumbnails too
// small to use at any honest size, so this renders as type. The original
// image stays linked underneath for anyone who wants the version with faces;
// individual portrait files would be needed to put them back.
//
// ── ROLE KEYS, NOT ROLE TEXT ──────────────────────────────────────────────
// `role` is a message key, so the chart translates with the rest of the site.
// chair / vice / member already existed under aboutPage.board.roles in all
// three locales and are reused; the rest are new under aboutPage.org.roles.

export type OrgPerson = {
  /** Message key under aboutPage.org.roles, or aboutPage.board.roles for the
   *  three that already existed. */
  role: string;
  /** From aboutPage.board.roles rather than the new set. */
  boardRole?: boolean;
  name: string;
};

export type OrgTier = {
  /** Message key under aboutPage.org.tiers. */
  key: string;
  people: readonly OrgPerson[];
};

export const ORG_CHART: readonly OrgTier[] = [
  {
    key: 'oversight',
    people: [
      { role: 'oversight', name: 'Lena Larsen' },
      { role: 'oversight', name: 'Brahim Belkilani' },
      { role: 'oversight', name: 'Mohamed Melioui' },
    ],
  },
  {
    key: 'board',
    people: [
      { role: 'chair', boardRole: true, name: 'Hossam Belkilani' },
      { role: 'vice', boardRole: true, name: 'Basim Ghozlan' },
      { role: 'member', boardRole: true, name: 'Iman El Morabit' },
      { role: 'member', boardRole: true, name: 'Sarah Selhi' },
      { role: 'member', boardRole: true, name: 'Issa Mihesh' },
      { role: 'member', boardRole: true, name: 'Nour Kanout' },
      { role: 'member', boardRole: true, name: 'Sihem Atrous' },
    ],
  },
  {
    key: 'admin',
    people: [
      { role: 'director', name: 'Imen Hasnaoui' },
      { role: 'seniorAdviser', name: 'Djamel Selhi' },
      { role: 'media', name: 'Mariem Jeng' },
      { role: 'facilities', name: 'El Hosain ElMontasir' },
      { role: 'it', name: 'Nour Kanout' },
      { role: 'theologyLead', name: 'Kamel Amara' },
      { role: 'imam', name: 'Usman Andreas' },
      { role: 'imamTheologian', name: 'Osama Aldiri' },
    ],
  },
  {
    key: 'departments',
    people: [
      { role: 'education', name: 'Sihem Atrous' },
      { role: 'knowledge', name: 'Abdel Rahman Ashraf' },
      { role: 'women', name: 'Mona Said' },
      { role: 'artsCulture', name: 'Lena Larsen' },
      { role: 'buildingProject', name: 'Kamel Amara' },
      { role: 'safety', name: 'Khalid Banouni' },
      // NUM is Norges Unge Muslimer, an organisation name rather than a
      // Norwegian word, so it stays NUM in all three locales. "Yasmin" is a
      // first name only in the source — not shortened here.
      { role: 'num', name: 'Yasmin' },
      { role: 'strategy', name: 'Jonas Selhi' },
      { role: 'dialogue', name: 'Basim Ghozlan' },
      { role: 'childrenFamily', name: 'Iman sayyah' },
    ],
  },
];
