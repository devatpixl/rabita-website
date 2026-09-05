// Line-drawn marks, for use as watermarks behind type.
//
// One drawing language, so that four different subjects read as one family
// at 5% ink: a single stroke weight, no fills, no gradients, everything on
// the same stage.
//
// The stage is 480x346 but every drawing is composed to 480x340, and the
// six units of slack at the foot are load-bearing: preserveAspectRatio
// scales the box to fit exactly, so a ground line drawn AT y=340 had half
// its stroke clipped by the viewport edge and every mark appeared to be
// standing on nothing. They are drawings of ideas, not illustrations —
// at the opacity these are used at, detail is noise.
//
// ElevationMark was a local function in app/[locale]/tjenester/[subject]/
// page.tsx until 2026-09-05 and moved here unchanged when the subject pages
// took the band hero, so that both the band and the page body can draw it.

type MarkProps = { className?: string; 'aria-hidden'?: boolean };

const COMMON = {
  viewBox: '0 0 480 346',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/* An elevation of the building, drawn as a single-weight outline for use as a
   watermark. Not a render and not to scale — a facade, an arcade and a dome,
   enough to read as architecture at 5% ink behind a column of text. */
export function ElevationMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 480 346" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      {/* dome and its finial */}
      <path d="M150 150c-26-30-20-58 14-82 16-11 28-20 32-33 4 13 16 22 32 33 34 24 40 52 14 82Z" />
      <path d="M194 33V16" />
      <circle cx="196" cy="10" r="6" />
      {/* drum */}
      <path d="M150 150h92v26h-92Z" />
      {/* facade and its storeys */}
      <path d="M96 176h200v164H96Z" />
      <path d="M96 220h200M96 264h200M96 308h200" />
      {/* the arcade along the ground floor */}
      <path d="M116 340v-24a12 12 0 0 1 24 0v24M160 340v-24a12 12 0 0 1 24 0v24M204 340v-24a12 12 0 0 1 24 0v24M248 340v-24a12 12 0 0 1 24 0v24" />
      {/* minaret */}
      <path d="M330 340V120h30v220Z" />
      <path d="M326 120c0-20 8-31 19-42 11 11 19 22 19 42Z" />
      <path d="M344 76V58" />
      <circle cx="345" cy="52" r="5" />
      <path d="M330 164h30M330 208h30M330 252h30" />
      {/* ground */}
      <path d="M60 340h360" />
    </svg>
  );
}

/* A mihrab: the niche a prayer hall faces, on two columns, with a lamp hung
   in it. The interior counterpart to the elevation — one is the building
   seen from the street, this is the room from inside. */
export function ArchMark({ className }: MarkProps) {
  return (
    <svg {...COMMON} className={className} aria-hidden>
      {/* the niche: a pointed arch on two jambs */}
      <path d="M150 340V190c0-49 40-89 90-89s90 40 90 89v150" />
      <path d="M186 340V196c0-30 24-54 54-54s54 24 54 54v144" />
      {/* the point of the arch, drawn as the two struck curves that make it */}
      <path d="M240 101V64" />
      {/* columns either side, with their capitals */}
      <path d="M110 340V168M370 340V168" />
      <path d="M98 168h24M358 168h24" />
      <path d="M98 158h24M358 158h24" />
      {/* the lamp on its chain */}
      <path d="M240 142v34" />
      <path d="M222 176h36l-8 30h-20Z" />
      <path d="M232 206h16" />
      {/* the step */}
      <path d="M60 340h360" />
    </svg>
  );
}

/* An eight-fold girih rosette on the construction circles it is struck from.
   Used on the teaching pages — the calligraphy-and-geometry course teaches
   exactly this construction, so on those pages the mark is a citation rather
   than an ornament. */
export function RosetteMark({ className }: MarkProps) {
  return (
    <svg {...COMMON} className={className} aria-hidden>
      {/* the construction circles, left visible: this is a drawing of a
         method, not of a finished tile */}
      <circle cx="240" cy="170" r="132" />
      <circle cx="240" cy="170" r="96" />
      <circle cx="240" cy="170" r="46" />
      {/* the two squares that set the eight points */}
      <path d="M144 74h192v192H144Z" />
      <path d="M240 38l96 132-96 132-96-132Z" />
      {/* the eight-pointed star, drawn as two overlaid squares rotated 45° */}
      <path d="M240 68l50 52 52 50-52 50-50 52-50-52-52-50 52-50Z" />
      <path d="M170 100l140 140M310 100L170 240" />
      {/* the radii that strike the points */}
      <path d="M240 38v264M108 170h264" />
    </svg>
  );
}

/* The Kaaba in the circles of tawaf. For hajj and umrah: a cube, and the
   path walked around it, which is the whole of what those pages are about. */
export function OrbitMark({ className }: MarkProps) {
  return (
    <svg {...COMMON} className={className} aria-hidden>
      {/* the circling, as three concentric paths */}
      <ellipse cx="240" cy="196" rx="196" ry="112" />
      <ellipse cx="240" cy="196" rx="146" ry="82" />
      <ellipse cx="240" cy="196" rx="96" ry="52" />
      {/* the cube, in a light axonometric */}
      <path d="M198 216V142l42-22 42 22v74l-42 22Z" />
      <path d="M198 142l42 22 42-22" />
      <path d="M240 164v74" />
      {/* the band around it */}
      <path d="M198 166l42 22 42-22" />
    </svg>
  );
}

/* A mashrabiya: the pierced screen. The one piece of this architecture whose
   whole purpose is that you can see out and nobody sees in — so on the
   counselling page, where the copy promises a confidential conversation, it
   is a citation rather than an ornament.

   Note the band on that page still draws NOTHING; that decision stands. This
   is a different surface answering a different question. */
export function LatticeMark({ className }: MarkProps) {
  // The screen itself: a diamond lattice, struck as two families of 45deg
  // lines and clipped to the frame.
  //
  // The first attempt drew verticals crossed by zigzags, which at feature
  // size read as a roof truss rather than as a pierced screen. Diagonals on
  // a single pitch are what the eye actually recognises as mashrabiya.
  const diagonals: string[] = [];
  for (let c = -300; c <= 240; c += 42) {
    diagonals.push(`M60 ${60 + c}L420 ${420 + c}`); // one family
    diagonals.push(`M60 ${420 + c}L420 ${60 + c}`); // and its mirror
  }
  return (
    <svg {...COMMON} className={className} aria-hidden>
      <defs>
        <clipPath id="rabita-mark-lattice">
          <path d="M120 340V150c0-44 54-74 120-74s120 30 120 74v190Z" />
        </clipPath>
      </defs>
      {/* the frame, with a shallow arched head */}
      <path d="M120 340V150c0-44 54-74 120-74s120 30 120 74v190" />
      <g clipPath="url(#rabita-mark-lattice)">
        {diagonals.map((d) => (
          <path key={d} d={d} />
        ))}
        {/* the rail that divides the screen, and the head it springs from */}
        <path d="M120 150h240M120 244h240" />
      </g>
      {/* the sill */}
      <path d="M96 340h288" />
      {/* the pull */}
      <circle cx="240" cy="244" r="5" />
    </svg>
  );
}

/* A doorway with one leaf standing open, and the light it throws on the
   floor. Not the mihrab — ArchMark is a niche you face; this is an opening
   you walk through, which is what taking shahada is. */
export function ThresholdMark({ className }: MarkProps) {
  return (
    <svg {...COMMON} className={className} aria-hidden>
      {/* the opening */}
      <path d="M150 316V152c0-50 40-90 90-90s90 40 90 90v164" />
      <path d="M178 316V156c0-34 28-62 62-62s62 28 62 62v160" />
      {/* the leaf, swung in */}
      <path d="M302 316V116l56-26v226" />
      <path d="M302 140l56-24" />
      <circle cx="312" cy="216" r="4" />
      {/* the step, and the light across it */}
      <path d="M120 316h240" />
      <path d="M96 340h288" />
      <path d="M178 340l-34-24M240 340l-30-24M302 340l-26-24" />
    </svg>
  );
}

/* A rihal — the folding stand a mushaf rests on — with the book open on it.
   For the Qur'an and Arabic teaching. */
export function LecternMark({ className }: MarkProps) {
  return (
    <svg {...COMMON} className={className} aria-hidden>
      {/* the two crossed leaves */}
      <path d="M156 340l124-176M324 340L200 164" />
      <path d="M186 258h108" />
      {/* the book, two leaves and the spine between them */}
      <path d="M240 150c-26-18-54-26-84-24v104c30-2 58 6 84 24" />
      <path d="M240 150c26-18 54-26 84-24v104c-30-2-58 6-84 24" />
      <path d="M240 150v104" />
      {/* the floor */}
      <path d="M120 340h240" />
    </svg>
  );
}

/* A lawh — the wooden tablet children learn to write on, hung on its peg,
   with the ruled lines still on it. For the school. */
export function SlateMark({ className }: MarkProps) {
  return (
    <svg {...COMMON} className={className} aria-hidden>
      {/* the peg and its cord */}
      <circle cx="240" cy="44" r="7" />
      <path d="M240 51v29" />
      {/* the handle, and the tablet hanging from it */}
      <path d="M212 80h56a12 12 0 0 1 0 24h-56a12 12 0 0 1 0-24Z" />
      <path d="M148 104h184v212H148Z" />
      <path d="M164 120h152v180H164Z" />
      {/* the ruled lines */}
      <path d="M180 156h120M180 192h120M180 228h120M180 264h86" />
      {/* the ground */}
      <path d="M108 340h264" />
    </svg>
  );
}

// One map, imported by both the band and the service body, so the two
// cannot drift apart.
export const MARK_COMPONENTS = {
  elevation: ElevationMark,
  arch: ArchMark,
  rosette: RosetteMark,
  orbit: OrbitMark,
  lattice: LatticeMark,
  threshold: ThresholdMark,
  lectern: LecternMark,
  slate: SlateMark,
} as const;

export type MarkName = keyof typeof MARK_COMPONENTS;
