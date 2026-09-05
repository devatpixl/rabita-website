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

// Four marks, and four is the whole set. There were eight for one day: a
// mashrabiya, an open door, a rihal and a lawh, drawn so the service pages
// could carry one each as a FEATURE — a ~380px drawing on a lit plate
// beside the copy. The client's verdict on seeing them was that they look
// fake, and they were right: invented artwork does not survive being set
// at full size a few hundred pixels under a photograph of real people.
//
// The four that remain are only ever watermarks, at about 6% behind a
// headline on a photograph, where they are texture and not a picture.
// That is the only job these are good at, and it is the only job they
// still have.
