'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Accent } from './accent';

// The building arriving: four rooms fall back as the facade comes forward out of them.
const GRADE = 'saturate(0.72) contrast(1.12) brightness(0.9)';

// Corners feathered into the dusk, so a plate has no cut edge against the ground.
const EDGE =
  'linear-gradient(to right, transparent 0, #000 4%, #000 96%, transparent 100%),' +
  ' linear-gradient(to bottom, transparent 0, #000 4%, #000 96%, transparent 100%)';
const FEATHER = {
  maskImage: EDGE,
  WebkitMaskImage: EDGE,
  maskComposite: 'intersect',
  WebkitMaskComposite: 'source-in',
} as const;

const ROOMS = [
  { src: '/photos/band-a.webp', at: '-translate-x-[30vw] -translate-y-[19vh]', size: 'h-[19vh] w-[26vh]' },
  { src: '/photos/band-b.webp', at: 'translate-x-[30vw] -translate-y-[17vh]', size: 'h-[17vh] w-[24vh]' },
  { src: '/photos/band-c.webp', at: '-translate-x-[28vw] translate-y-[20vh]', size: 'h-[16vh] w-[23vh]' },
  { src: '/photos/band-d.webp', at: 'translate-x-[29vw] translate-y-[19vh]', size: 'h-[18vh] w-[25vh]' },
] as const;

export function ZoomBand() {
  const t = useTranslations('zoomBand');
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const still = mounted && reduced === true;

  const band = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: band, offset: ['start end', 'end start'] });

  // The plate opens from a small frame to full bleed, and its picture pushes in as it goes.
  const plateW = useTransform(scrollYProgress, [0.1, 0.34], ['34vw', '104vw']);
  const plateH = useTransform(scrollYProgress, [0.1, 0.34], ['32vh', '104vh']);
  const radius = useTransform(scrollYProgress, [0.1, 0.34], [22, 0]);
  const push = useTransform(scrollYProgress, [0.18, 0.82], [1.24, 1]);

  // The rooms go back as it comes forward.
  const roomsOut = useTransform(scrollYProgress, [0.1, 0.28], [1, 0]);
  const roomsAway = useTransform(scrollYProgress, [0.1, 0.28], [1, 1.85]);

  const scrim = useTransform(scrollYProgress, [0.24, 0.36], [0, 0.82]);
  const lift = useTransform(scrollYProgress, [0.3, 0.42], [22, 0]);
  const show = useTransform(scrollYProgress, [0.3, 0.42], [0, 1]);

  return (
    <section
      ref={band}
      aria-labelledby="zoom-band-heading"
      className="relative h-[130svh] overflow-hidden bg-dusk"
    >
      {/* The rooms, falling back */}
      {ROOMS.map((r) => (
        <motion.div
          key={r.src}
          aria-hidden
          className="absolute inset-0 hidden items-center justify-center lg:flex"
          style={still ? { opacity: 0 } : { opacity: roomsOut, scale: roomsAway }}
        >
          <div className={`relative overflow-hidden rounded-xl ${r.size} ${r.at}`} style={FEATHER}>
            <Image src={r.src} alt="" fill sizes="26vw" className="object-cover" style={{ filter: GRADE }} />
          </div>
        </motion.div>
      ))}

      {/* The facade, coming forward */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative overflow-hidden will-change-transform"
          style={
            still
              ? { width: '104vw', height: '104vh', borderRadius: 0, ...FEATHER }
              : { width: plateW, height: plateH, borderRadius: radius, ...FEATHER }
          }
        >
          <motion.div className="absolute inset-0" style={still ? undefined : { scale: push }}>
            <Image
              src="/photos/band-facade.webp"
              alt={t('alt')}
              fill
              sizes="104vw"
              className="object-cover"
              style={{ filter: GRADE }}
            />
          </motion.div>
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-dusk"
            style={still ? { opacity: 0.82 } : { opacity: scrim }}
          />
        </motion.div>
      </div>

      {/* The line, once the facade has filled the frame */}
      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center"
        style={still ? { opacity: 1 } : { opacity: show, y: lift }}
      >
        <h2
          id="zoom-band-heading"
          className="max-w-[24ch] font-serif text-balance text-paper"
          style={{ fontSize: 'clamp(28px, 3.4vw, 52px)', lineHeight: 1.15, fontWeight: 600 }}
        >
          {t.rich('heading', { em: (chunks) => <Accent surface="dusk">{chunks}</Accent> })}
        </h2>
      </motion.div>
    </section>
  );
}
