'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { Accent } from './accent';
import { cn } from '@/lib/cn';

// §4.02 — zoom parallax after the hero, before Four chapters.
//
// Adapted from 21st.dev's ZoomParallax pattern (useScroll +
// useTransform, sticky container, 7 tiles at staggered scales).
// Explicitly does NOT use @studio-freight/lenis — Framer's useScroll
// works fine with native scroll, and the building section's pin is
// tuned to native behaviour. If the effect feels stiff, report it,
// don't add Lenis.
//
// Container height is 200vh (spec: not 300vh — three full screens
// before the second section is too much delay ahead of the ask).
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
    alt: 'Interior of the main prayer hall — mihrab in fretwork wood, diamond-panelled marble walls, worshippers on the green carpet',
    width: 2800,
    height: 1562,
  },
  {
    src: '/photos/zoom-facade.webp',
    alt: 'The Rabita facade at dusk — geometric lattice windows glowing over the wet Oslo street',
    width: 1600,
    height: 882,
  },
  {
    src: '/photos/zoom-minaret.webp',
    alt: 'The rooftop minaret at sunset — sculpted brass against a violet sky',
    width: 1600,
    height: 898,
  },
  {
    src: '/photos/zoom-imam.webp',
    alt: 'Imam meeting room — Qur’an on the table, a discussion in progress with a member',
    width: 1200,
    height: 673,
  },
  {
    src: '/photos/zoom-cafe.webp',
    alt: 'Rabita cafe interior — diamond-shaped windows in walnut framing, Moroccan tiled floor',
    width: 1400,
    height: 786,
  },
  {
    src: '/photos/zoom-garden.webp',
    alt: 'Rooftop garden and inner courtyard from above — fountain, planters, and the minaret at daylight',
    width: 1600,
    height: 898,
  },
  {
    src: '/photos/zoom-wudu.webp',
    alt: 'Ablution room — geometric wall panels in white and gold, marble floor',
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

  const skipAnim = reducedMotion === true || isNarrow;

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  // Scale ramps per the reference (scale4 for centre, higher for the
  // outer tiles so they punch through faster).
  const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
  const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
  const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
  const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
  const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);
  const scales = [scale4, scale5, scale6, scale5, scale6, scale8, scale9];

  // Payoff: dusk overlay finishes fading in BEFORE the statement
  // starts. Overlay ramps 0 → 0.90 across [0.44, 0.72] so by the time
  // the text begins at 0.72 the underlying image is already fully
  // muted (0.90, up from 0.86 — graffiti wall + winter sky still
  // fought white serif at 0.86). Motion under the text continues,
  // which is intended, but no bright pixel ever reaches the type.
  const overlayOpacity = useTransform(scrollYProgress, [0.44, 0.72], [0, 0.9]);
  const statementOpacity = useTransform(scrollYProgress, [0.72, 0.95], [0, 1]);
  const statementY = useTransform(scrollYProgress, [0.72, 0.95], [12, 0]);

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
              className="font-serif text-paper text-balance"
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
              className="font-serif text-balance"
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
      style={{ height: '200vh' }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {IMAGES.map((img, i) => {
          const scale = scales[i];
          return (
            <motion.div
              key={i}
              style={{ scale }}
              className={cn(
                'absolute top-0 flex h-full w-full items-center justify-center',
                i === 1 && '[&>div]:!-top-[30vh] [&>div]:!left-[5vw] [&>div]:!h-[30vh] [&>div]:!w-[35vw]',
                i === 2 && '[&>div]:!-top-[10vh] [&>div]:!-left-[25vw] [&>div]:!h-[45vh] [&>div]:!w-[20vw]',
                i === 3 && '[&>div]:!left-[27.5vw] [&>div]:!h-[25vh] [&>div]:!w-[25vw]',
                i === 4 && '[&>div]:!top-[27.5vh] [&>div]:!left-[5vw] [&>div]:!h-[25vh] [&>div]:!w-[20vw]',
                i === 5 && '[&>div]:!top-[27.5vh] [&>div]:!-left-[22.5vw] [&>div]:!h-[25vh] [&>div]:!w-[30vw]',
                i === 6 && '[&>div]:!top-[22.5vh] [&>div]:!left-[25vw] [&>div]:!h-[15vh] [&>div]:!w-[15vw]',
              )}
            >
              <div className="relative h-[25vh] w-[25vw] overflow-hidden">
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  priority={i === 0}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  sizes={i === 0 ? '100vw' : '(min-width: 768px) 40vw, 90vw'}
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
              className="font-serif text-paper text-balance"
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
              className="font-serif text-balance"
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
