'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Accent } from './accent';
import { Eyebrow } from './primitives';

// Photographs of the congregation from the last four years: the street iftar on
// Groenland, the spring bazaar on Youngstorget, the women's circles, and the
// site on Calmeyers gate the week it was cleared.
//
// The move, scrubbed by scroll across a 300vh container:
//   1. the twelve plates sit forward, close to the reader
//   2. they fall back into depth, and the line surfaces in the well they leave
//   3. they come back to the front, overshoot a little, and settle
//
// Real perspective rather than faked scale, because a plate near the edge of
// the frame should skew as it travels and a scaled one never does. Only `z` and
// `opacity` animate, so every frame is composited.
//
// Under 1024px, and for anyone who asked for less motion, this collapses to a
// plain grid: no pin, no depth, the same twelve photographs.

const GRADE = 'saturate(0.72) contrast(1.12) brightness(0.9)';

// Corners feathered into the dusk, matching the zoom band, so a plate has no
// cut edge against the ground.
const EDGE =
  'linear-gradient(to right, transparent 0, #000 4%, #000 96%, transparent 100%),' +
  ' linear-gradient(to bottom, transparent 0, #000 4%, #000 96%, transparent 100%)';
const FEATHER = {
  maskImage: EDGE,
  WebkitMaskImage: EDGE,
  maskComposite: 'intersect',
  WebkitMaskComposite: 'source-in',
} as const;

const PERSPECTIVE = 1400;
const BACK = -1750; // deepest point, in px of translateZ
const FRONT = 150; // the overshoot on the way back

type Plate = {
  key: string;
  src: string;
  w: number;
  h: number;
  x: number; // centre, % of viewport width
  y: number; // centre, % of viewport height
  vh: number; // plate height, in vh; width follows from the aspect ratio
  travel: number; // how far it sweeps along the diagonal, in vw
};

// Four across, three down, sized large enough to read a face. Neighbours are
// allowed to overlap: they sit at different depths, so the overlap reads as
// layering rather than as a collision.
const PLATES: Plate[] = [
  { key: 'serving', src: '/photos/community/iftar-serving.webp', w: 844, h: 1500, x: 12, y: 26, vh: 30, travel: 20 },
  { key: 'tables', src: '/photos/community/iftar-tables.webp', w: 1500, h: 1002, x: 37, y: 24, vh: 26, travel: 13 },
  { key: 'child', src: '/photos/community/bazaar-child.webp', w: 1125, h: 1500, x: 63, y: 27, vh: 29, travel: 22 },
  { key: 'volunteers', src: '/photos/community/volunteers-two.webp', w: 1500, h: 1002, x: 85, y: 24, vh: 26, travel: 15 },
  { key: 'circle', src: '/photos/community/womens-circle.webp', w: 1125, h: 1500, x: 10, y: 52, vh: 29, travel: 11 },
  { key: 'quran', src: '/photos/community/quran-carpet.webp', w: 1500, h: 1125, x: 36, y: 51, vh: 28, travel: 24 },
  { key: 'street', src: '/photos/community/volunteers-street.webp', w: 1125, h: 1500, x: 62, y: 52, vh: 29, travel: 14 },
  { key: 'cakes', src: '/photos/community/bazaar-cakes.webp', w: 1125, h: 1500, x: 87, y: 51, vh: 27, travel: 21 },
  { key: 'sweets', src: '/photos/community/iftar-sweets.webp', w: 1500, h: 1002, x: 15, y: 77, vh: 26, travel: 23 },
  { key: 'site', src: '/photos/community/site-cleared.webp', w: 1125, h: 1500, x: 40, y: 76, vh: 29, travel: 12 },
  { key: 'embrace', src: '/photos/community/welcome-embrace.webp', w: 888, h: 1500, x: 63, y: 78, vh: 28, travel: 19 },
  { key: 'dress', src: '/photos/community/bazaar-dress.webp', w: 1125, h: 1500, x: 87, y: 76, vh: 29, travel: 16 },
];
function DepthPlate({
  plate,
  index,
  progress,
  alt,
}: {
  plate: Plate;
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  progress: any;
  alt: string;
}) {
  // Each plate leaves and returns a beat after the one before it, so the field
  // breathes instead of moving as one slab.
  const lag = index * 0.012;
  const stops = [0 + lag, 0.46 + lag, 0.84 + lag, 1];

  const z = useTransform(progress, stops, [0, BACK, FRONT, 0]);
  const opacity = useTransform(progress, stops, [1, 0.45, 1, 1]);

  // The whole field also sweeps up and to the left across the section, each
  // plate at its own rate. Deeper travel on the plates that go furthest back,
  // so the diagonal reads as parallax rather than as a slide.
  const dx = plate.travel;
  const dy = plate.travel * 0.62;
  const driftX = useTransform(progress, (p: number) =>
    `calc(-50% + ${((0.5 - p) * dx).toFixed(3)}vw)`,
  );
  const driftY = useTransform(progress, (p: number) =>
    `calc(-50% + ${((p - 0.5) * dy).toFixed(3)}vh)`,
  );

  return (
    <motion.div
      className="absolute will-change-transform"
      style={{
        left: `${plate.x}%`,
        top: `${plate.y}%`,
        height: `${plate.vh}vh`,
        aspectRatio: `${plate.w} / ${plate.h}`,
        x: driftX,
        y: driftY,
        z,
        opacity,
      }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-xl" style={FEATHER}>
        <Image
          src={plate.src}
          alt={alt}
          fill
          sizes="30vw"
          className="object-cover"
          style={{ filter: GRADE }}
        />
      </div>
    </motion.div>
  );
}

export function CommunityGallery() {
  const t = useTranslations('communityGallery');
  const reduced = useReducedMotion();
  const container = useRef<HTMLElement | null>(null);

  // Narrow viewports get the static grid. Decided on the client only, so the
  // server and the first paint always agree.
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    setIsNarrow(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsNarrow(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const skipAnim = reduced === true || isNarrow;

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  // Wheel deltas arrive in lumps; a stiff spring evens them out without trailing.
  const progress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 44,
    mass: 0.3,
    restDelta: 0.0005,
  });

  // The line surfaces in the well the plates leave behind, and is gone by the
  // time they come back through it.
  const lineOpacity = useTransform(progress, [0.32, 0.44, 0.62], [0, 1, 0]);
  const lineY = useTransform(progress, [0.32, 0.44], [16, 0]);

  // A dusk scrim comes up under the line, so the type never has to compete with
  // a photograph passing behind it. It is gone before the plates return.
  const scrimOpacity = useTransform(progress, [0.26, 0.42, 0.52, 0.66], [0, 0.9, 0.9, 0]);

  const heading = (
    <h2
      id="community-gallery-heading"
      className="max-w-[22ch] text-balance font-serif text-section text-paper"
    >
      {t.rich('heading', { em: (c) => <Accent surface="dusk">{c}</Accent> })}
    </h2>
  );

  if (skipAnim) {
    return (
      <section
        id="fellesskapet"
        aria-labelledby="community-gallery-heading"
        className="bg-dusk py-section-sm"
      >
        <div className="mx-auto max-w-6xl px-6">
          <Eyebrow tone="gold">{t('eyebrow')}</Eyebrow>
          <div className="mt-3">{heading}</div>
          <p className="mt-5 max-w-prose text-body text-dusk-60">{t('body')}</p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {PLATES.map((p) => (
              <div
                key={p.key}
                className="relative overflow-hidden rounded-lg"
                style={{ aspectRatio: '3 / 4' }}
              >
                <Image
                  src={p.src}
                  alt={t(`alts.${p.key}`)}
                  fill
                  loading="lazy"
                  sizes="(min-width: 640px) 30vw, 45vw"
                  className="object-cover"
                  style={{ filter: GRADE }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={container}
      id="fellesskapet"
      aria-labelledby="community-gallery-heading"
      className="relative bg-dusk"
      style={{ height: '220vh' }}
    >
      <div
        className="sticky top-0 h-screen overflow-hidden"
        style={{ perspective: `${PERSPECTIVE}px`, perspectiveOrigin: '50% 50%' }}
      >
        {PLATES.map((p, i) => (
          <DepthPlate
            key={p.key}
            plate={p}
            index={i}
            progress={progress}
            alt={t(`alts.${p.key}`)}
          />
        ))}

        {/* Ground for the line */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-dusk"
          style={{ opacity: scrimOpacity }}
        />

        {/* The line, in the well the plates leave behind */}
        <motion.div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          style={{ opacity: lineOpacity, y: lineY }}
        >
          <Eyebrow tone="gold" className="mb-5">
            {t('eyebrow')}
          </Eyebrow>
          {heading}
          <p className="mt-5 max-w-[46ch] text-body text-dusk-60">{t('body')}</p>
        </motion.div>
      </div>
    </section>
  );
}
