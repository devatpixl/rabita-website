'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { Accent } from './accent';

// §4.02 — zoom parallax after the hero, before Four chapters.
//
// Adapted from 21st.dev's ZoomParallax pattern (useScroll +
// useTransform, sticky container, 7 tiles at staggered scales).
// Explicitly does NOT use @studio-freight/lenis — Framer's useScroll
// works fine with native scroll, and the building section's pin is
// tuned to native behaviour. If the effect feels stiff, report it,
// don't add Lenis.
//
// Container height is 200vh. All three settings have now been looked at:
//   100vh — the tiles scale across the container's scroll distance, so
//           halving it doubles the speed and the zoom reads rushed.
//   300vh — the 21st.dev original. Genuinely slow: it is 50% more wheel
//           for the same zoom, and because the payoff starts at 44% of
//           progress the wait before anything happens grows with it.
//   200vh — kept. The zoom stays legible and the wash arrives at ~88vh.
// This is a pacing choice, not a performance one. The spring below is
// stiff and does not trail the scroll.
//
// Payoff: as scroll approaches the end, a dusk overlay fades in over
// the zoomed centre image and a serif statement + attribution appear.
//
// Reduced motion and viewports <768px collapse to a static single-
// image + overlay + statement view (no pin, no animation), so:
//   • motion-sensitive readers aren't pinned
//   • phones aren't asked to composite 7 zooming layers
//
// Colour treatment on every image: filter: saturate(0.72) contrast(1.12)
// brightness(0.9) — same as the hero, so the images belong to this
// site rather than looking like unfiltered library shots.

const GRADE = 'saturate(0.72) contrast(1.12) brightness(0.9)';

// Tiles are rounded, not feathered.
//
// There used to be a mask fading the outer 3% of each tile to transparent
// so it dissolved into the dusk. It was applied to the UNSCALED box and the
// element is then transform-scaled 4-9x, which magnifies the mask with
// everything else: a 14px fade at rest became ~130px at 9x and read as the
// photograph being out of focus.
//
// A corner radius has the same trap, so it is set small deliberately. The
// transform multiplies it:
//     6px at rest  ->  24px at the centre's 4x  ->  54px at the outer 9x
// 24px is `rounded-3xl`, the radius this site uses on every other image
// block — so the centre tile matches the rest of the site at exactly the
// moment it fills the frame. Anything larger balloons into a pill.
const TILE_RADIUS = 6;

type Img = { src: string; alt: string; width: number; height: number };

// Centre first (index 0, scale 4, fills the screen). Then six tiles
// arranged around it.
//
// All seven are Norconsult architectural renders from the
// Markedsføring set (2736–2784px native, sized down here for the web).
// The earlier "no renders" rule was scoped to an older 1030px batch —
// these are ~2.7× that width. At the centre's 4× on 1440 viewport,
// the 2800px source super-samples on standard displays and hits ~1:1
// on retina. Reads crisp.
//
// Editorially this section is the ONE place the building shows up as
// the star. The community-photo mix lives in the sections around it
// (Impact Story chapters, Congregation Today photo band). Here it's
// architecture serving the "Alhambra × Norwegian building tradition"
// statement — the mihrab wall + geometric fretwork in the centre is
// the payoff frame.
const IMAGES: Img[] = [
  {
    src: '/photos/zoom-mihrab.webp',
    alt: 'Interior of the main prayer hall, mihrab in fretwork wood, diamond-panelled marble walls, worshippers on the green carpet',
    width: 2800,
    height: 1562,
  },
  {
    src: '/photos/zoom-facade.webp',
    alt: 'The Rabita facade at dusk, geometric lattice windows glowing over the wet Oslo street',
    width: 1600,
    height: 882,
  },
  {
    src: '/photos/zoom-minaret.webp',
    alt: 'The rooftop minaret at sunset, sculpted brass against a violet sky',
    width: 1600,
    height: 898,
  },
  {
    src: '/photos/zoom-qibla-wall.webp',
    alt: 'The qibla wall, fretwork mihrab in wood and gold against diamond lit marble',
    width: 1800,
    height: 1011,
  },
  {
    src: '/photos/zoom-prayer-hall.webp',
    alt: 'The main prayer hall, green carpet and slim columns under a ringed light',
    width: 1800,
    height: 1011,
  },
  {
    src: '/photos/zoom-garden.webp',
    alt: 'Rooftop garden and inner courtyard from above, fountain, planters, and the minaret at daylight',
    width: 1600,
    height: 898,
  },
  {
    src: '/photos/zoom-wudu.webp',
    alt: 'Ablution room, geometric wall panels in white and gold, marble floor',
    width: 1400,
    height: 786,
  },
];

export function ZoomParallax() {
  const t = useTranslations('zoomParallax');
  const locale = useLocale();
  const container = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  // Small-viewport detection — set on client mount only. During SSR
  // and first paint we render the animated tree; the client swaps to
  // the static layout if the viewport is <768. Brief FOUC possible on
  // narrow viewports; acceptable given the alternative is heavier.
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsNarrow(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsNarrow(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Reduced motion still gets the still frame. A narrow viewport no longer
  // does: it gets the narrow composition above instead.
  const skipAnim = reducedMotion === true;

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  // Wheel deltas arrive in lumps, so a stiff spring evens them out without trailing the scroll.
  const progress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 44,
    mass: 0.3,
    restDelta: 0.0005,
  });

  // Scale ramps per the reference (scale4 for centre, higher for the
  // outer tiles so they punch through faster).
  // Tile geometry, per orientation. It used to live in a stack of
  // `[&>div]:!-top-[30vh]` overrides, which cannot express two compositions.
  //
  // The wide set is built for 16:9. On a 390x760 phone it bunches: tiles laid
  // out along the horizontal axis have no room, and seven of them scaling to
  // 9x is a lot of compositing for a phone. The narrow set is a cross —
  // centre, above, below, one either side — and stops at five tiles.
  //
  // The centre tile DID need a special case. 25vw x 25vh is 97 x 190 on that
  // screen — a 1:2 sliver, and the client's note was exactly that ("bildet i
  // midten er veldig avlangt"). Filling the phone exactly at the end of the
  // zoom forces the tile to carry the phone's own 0.51 aspect at rest, which
  // is the whole problem. So the tile is now WIDER than it needs to be and
  // object-cover crops the surplus: 36vw x 25vh reads 140 x 190 (0.74) at
  // rest and still covers 390 x 760 at scale 4 (562 x 760). The two side
  // tiles were slivers for the same reason and got the same treatment.
  const scale4 = useTransform(progress, [0, 1], [1, 4]);
  const scale5 = useTransform(progress, [0, 1], [1, 5]);
  const scale6 = useTransform(progress, [0, 1], [1, 6]);
  const scale8 = useTransform(progress, [0, 1], [1, 8]);
  const scale9 = useTransform(progress, [0, 1], [1, 9]);
  const scalesWide = [scale4, scale5, scale6, scale5, scale6, scale8, scale9];
  const scalesNarrow = [scale4, scale5, scale6, scale6, scale5];
  const scales = isNarrow ? scalesNarrow : scalesWide;

  const TILES_WIDE = [
    { top: '0', left: '0', h: '25vh', w: '25vw' },
    { top: '-30vh', left: '5vw', h: '30vh', w: '35vw' },
    { top: '-10vh', left: '-25vw', h: '45vh', w: '20vw' },
    { top: '0', left: '27.5vw', h: '25vh', w: '25vw' },
    { top: '27.5vh', left: '5vw', h: '25vh', w: '20vw' },
    { top: '27.5vh', left: '-22.5vw', h: '25vh', w: '30vw' },
    { top: '22.5vh', left: '25vw', h: '15vh', w: '15vw' },
  ];
  const TILES_NARROW = [
    { top: '0', left: '0', h: '25vh', w: '36vw' },
    { top: '-30vh', left: '0', h: '20vh', w: '44vw' },
    { top: '-8vh', left: '-33vw', h: '18vh', w: '26vw' },
    { top: '-8vh', left: '33vw', h: '18vh', w: '26vw' },
    { top: '30vh', left: '0', h: '20vh', w: '40vw' },
  ];
  const tiles = isNarrow ? TILES_NARROW : TILES_WIDE;

  // Payoff: dusk overlay finishes fading in BEFORE the statement
  // starts. Overlay ramps 0 → 0.90 across [0.44, 0.72] so by the time
  // the text begins at 0.72 the underlying image is already fully
  // muted (0.90, up from 0.86 — graffiti wall + winter sky still
  // fought white serif at 0.86). Motion under the text continues,
  // which is intended, but no bright pixel ever reaches the type.
  const overlayOpacity = useTransform(progress, [0.44, 0.72], [0, 0.9]);

  // The tiles now recede as the wash arrives instead of just being covered
  // by it. The side tiles go all the way out; the centre one — the frame the
  // statement sits on — only drops back, so the ending still has a picture
  // behind it rather than a flat colour field.
  const sideOpacity = useTransform(progress, [0.44, 0.70], [1, 0]);
  const centreOpacity = useTransform(progress, [0.44, 0.72], [1, 0.55]);
  const statementOpacity = useTransform(progress, [0.72, 0.95], [0, 1]);
  const statementY = useTransform(progress, [0.72, 0.95], [12, 0]);

  const stmtBefore = t('statement.before');
  const stmtAccent = t('statement.accent');
  const stmtAfter = t('statement.after');
  const sectionLabel = t('sectionLabel');

  // Locale-aware accent renderer. Latin locales use the site-wide
  // <Accent> (serif italic gold). Arabic doesn't italicise — the
  // equivalent emphasis is IBM Plex Sans Arabic at weight 700 in gold.
  // Single span either way; the accent is the whole second sentence,
  // never built by splitting on spaces.
  const renderAccent = (text: string) =>
    locale === 'ar' ? (
      <span
        className="font-sans"
        style={{ color: '#C0A165', fontWeight: 700, fontStyle: 'normal' }}
      >
        {text}
      </span>
    ) : (
      <Accent surface="dusk">{text}</Accent>
    );

  // Static layout for reduced motion + narrow viewports.
  if (skipAnim) {
    return (
      <section
        aria-label={sectionLabel}
        className="relative bg-dusk overflow-hidden"
        style={{ minHeight: '100svh' }}
      >
        <div className="absolute inset-0">
          <Image
            src={IMAGES[0].src}
            alt={IMAGES[0].alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ filter: GRADE }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(22, 36, 46, 0.86)' }}
          />
        </div>

        <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
          <div
            className="flex flex-col items-center"
            style={{ rowGap: '0.75em' }}
          >
            <p
              className="display-opsz font-serif text-paper text-balance"
              style={{
                fontSize: 'clamp(28px, 3.4vw, 52px)',
                lineHeight: 1.15,
                fontWeight: 600,
                maxWidth: '26ch',
              }}
            >
              {stmtBefore.trim()}
            </p>
            <p
              className="display-opsz font-serif text-balance"
              style={{
                fontSize: 'clamp(28px, 3.4vw, 52px)',
                lineHeight: 1.15,
                fontWeight: 600,
                maxWidth: '26ch',
              }}
            >
              {renderAccent(stmtAccent)}
              {stmtAfter}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Animated (default) layout — 200vh container with a sticky viewport.
  return (
    <section
      ref={container}
      aria-label={sectionLabel}
      className="relative bg-dusk"
      style={{ height: '200svh' }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {IMAGES.slice(0, tiles.length).map((img, i) => {
          const scale = scales[i];
          const tile = tiles[i];
          return (
            <motion.div
              key={i}
              style={{ scale, opacity: i === 0 ? centreOpacity : sideOpacity, willChange: 'transform, opacity' }}
              className="absolute top-0 flex h-full w-full items-center justify-center"
            >
              <div
                className="relative overflow-hidden"
                style={{
                  top: tile.top,
                  left: tile.left,
                  height: tile.h,
                  width: tile.w,
                  borderRadius: TILE_RADIUS,
                }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  priority={i === 0}
                  // Every tile asks for the largest variant, not just the
                  // centre one. `sizes` has to describe the size a tile ends
                  // up at, and these are transform-scaled 4–9× after layout:
                  // a 25vw box at 9× occupies 225vw of screen. The old
                  // "60vw" made next/image serve a ~1150px file that the
                  // browser then stretched past 2400px — the source was
                  // already too small, and this halved it again first.
                  sizes="100vw"
                  quality={90}
                  className="h-full w-full object-cover"
                  style={{ filter: GRADE }}
                />
              </div>
            </motion.div>
          );
        })}

        {/* Payoff — dusk overlay fades in over the zoomed centre. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundColor: '#16242E', opacity: overlayOpacity }}
        />

        {/* Statement — fades and rises into place. Attribution has
           been removed: the new statement isn't a quote from the
           architect, so there's nothing to attribute. */}
        <motion.div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          style={{ opacity: statementOpacity, y: statementY }}
        >
          <div
            className="flex flex-col items-center"
            style={{ rowGap: '0.75em' }}
          >
            <p
              className="display-opsz font-serif text-paper text-balance"
              style={{
                fontSize: 'clamp(28px, 3.4vw, 52px)',
                lineHeight: 1.15,
                fontWeight: 600,
                maxWidth: '26ch',
              }}
            >
              {stmtBefore.trim()}
            </p>
            <p
              className="display-opsz font-serif text-balance"
              style={{
                fontSize: 'clamp(28px, 3.4vw, 52px)',
                lineHeight: 1.15,
                fontWeight: 600,
                maxWidth: '26ch',
              }}
            >
              {renderAccent(stmtAccent)}
              {stmtAfter}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
