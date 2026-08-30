// Rabita's religious leadership. Names and roles from the client
// (2026-08-30); biographical facts from rabita.no ("Imamene i Rabita") and
// Årsrapport 2025 (pp. 18–19). Photos: none published yet — the section
// renders a monogram until `photo` is set. Portraits supplied by the client
// 2026-08-30, cropped square on the face so they sit right in the circle.
export type Imam = {
  key: 'amara' | 'andreas' | 'aldiri';
  name: string;
  /** Path under /public, or null for the monogram. */
  photo: string | null;
  languages: string[];
};

export const IMAMS: readonly Imam[] = [
  { key: 'amara', name: 'Kamel Amara', photo: '/photos/imams/amara.webp', languages: ['Norsk', 'Arabisk', 'Fransk', 'Engelsk'] },
  { key: 'andreas', name: 'Usman Andreas', photo: '/photos/imams/usman.webp', languages: ['Norsk', 'Arabisk'] },
  { key: 'aldiri', name: 'Osama Aldiri', photo: '/photos/imams/aldiri.webp', languages: ['Arabisk', 'Norsk'] },
];
