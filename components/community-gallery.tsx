'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Accent } from './accent';
import { Eyebrow } from './primitives';

// Four things the congregation already does, one photograph each: the street
// iftar on Groenland, the Saturday school, the spring bazaar on Youngstorget,
// and the site on Calmeyers gate the week it was cleared.
//
// All four share one stage. The stage pins, and each chapter slides up over the
// one before it as you scroll, so the section costs four screens of scroll but
// only ever occupies one. The photograph inside each chapter pushes in while
// its chapter is on top.
//
// Only `y` and `scale` animate, so every frame is composited.
//
// Under 768px, and for anyone who asked for less motion, the stack unrolls into
// a plain list: no pin, no slide, the same four chapters.

const GRADE = 'saturate(0.72) contrast(1.12) brightness(0.9)';

type Chapter = { key: string; src: string; flip: boolean };

const CHAPTERS: Chapter[] = [
  { key: 'iftar', src: '/photos/community/iftar-tables.webp', flip: false },
  { key: 'school', src: '/photos/community/quran-carpet.webp', flip: true },
  { key: 'bazaar', src: '/photos/community/bazaar-dress.webp', flip: false },
  { key: 'site', src: '/photos/community/site-cleared.webp', flip: true },
];

const N = CHAPTERS.length;

// Each chapter slides in over the last 60% of the slice before its own, which
// leaves the rest of the slice as dwell time to read the copy.
const enterRange = (i: number): [number, number] => [i / N - 0.6 / N, i / N];

function ChapterPanel({
  chapter,
  index,
  progress,
  pinned,
}: {
  chapter: Chapter;
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  progress: any;
  pinned: boolean;
}) {
  const t = useTranslations('communityGallery');

  const [from, to] = enterRange(index);
  // The first chapter is already on the stage, so nothing to slide.
  const y = useTransform(progress, index === 0 ? [0, 1] : [from, to], index === 0 ? ['0%', '0%'] : ['100%', '0%']);

  // The photograph pushes in across the chapter's own slice.
  const scale = useTransform(progress, [index / N, (index + 1) / N], [1, 1.16]);

  const copy = (
    <div className="flex items-center px-6 py-10 md:px-10 md:py-12 lg:px-16">
      <div className="max-w-[42ch]">
        <p className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-gold">
          {t(`chapters.${chapter.key}.eyebrow`)}
        </p>
        <h3 className="mt-4 font-serif text-[clamp(1.75rem,3vw,2.4rem)] leading-[1.12] text-paper">
          {t(`chapters.${chapter.key}.title`)}
        </h3>
        <p className="mt-4 text-body leading-relaxed text-dusk-60">
          {t(`chapters.${chapter.key}.body`)}
        </p>
        <p className="mt-8 font-mono text-[0.75rem] tabular-nums tracking-[0.16em] text-dusk-60">
          {String(index + 1).padStart(2, '0')}
          <span className="mx-2 text-dusk-60/60">/</span>
          {String(N).padStart(2, '0')}
        </p>
      </div>
    </div>
  );

  const photo = (
    <figure className="relative m-0 h-[46vh] overflow-hidden md:h-full">
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={pinned ? { scale } : undefined}
      >
        <Image
          src={chapter.src}
          alt={t(`chapters.${chapter.key}.alt`)}
          fill
          loading={index === 0 ? undefined : 'lazy'}
          priority={index === 0}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
          style={{ filter: GRADE }}
        />
      </motion.div>
    </figure>
  );

  const grid = (
    <div className="grid h-full bg-dusk md:grid-cols-2">
      {chapter.flip ? (
        <>
          {copy}
          {photo}
        </>
      ) : (
        <>
          {photo}
          {copy}
        </>
      )}
    </div>
  );

  if (!pinned) return grid;

  return (
    <motion.div
      className="absolute inset-0 will-change-transform"
      style={{ y, zIndex: index + 1 }}
    >
      {grid}
    </motion.div>
  );
}

export function CommunityGallery() {
  const t = useTranslations('communityGallery');
  const reduced = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);

  // Narrow viewports unroll the stack. Decided on the client only, so the
  // server and the first paint always agree.
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsNarrow(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsNarrow(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const pinned = !(reduced === true || isNarrow);

  const { scrollYProgress } = useScroll({
    target: stage,
    offset: ['start start', 'end end'],
  });

  // Wheel deltas arrive in lumps; a stiff spring evens them out without
  // trailing the scroll.
  const progress = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 44,
    mass: 0.3,
    restDelta: 0.0005,
  });

  const intro = (
    <div className="mx-auto max-w-6xl px-6 pb-10 pt-section-md">
      <Eyebrow tone="gold">{t('eyebrow')}</Eyebrow>
      <h2
        id="community-gallery-heading"
        className="mt-3 max-w-[22ch] text-balance font-serif text-section text-paper"
      >
        {t.rich('heading', { em: (c) => <Accent surface="dusk">{c}</Accent> })}
      </h2>
      <p className="mt-4 max-w-prose text-body text-dusk-60">{t('body')}</p>
    </div>
  );

  if (!pinned) {
    return (
      <section id="fellesskapet" aria-labelledby="community-gallery-heading" className="bg-dusk">
        {intro}
        {CHAPTERS.map((chapter, i) => (
          <ChapterPanel
            key={chapter.key}
            chapter={chapter}
            index={i}
            progress={progress}
            pinned={false}
          />
        ))}
      </section>
    );
  }

  return (
    <section id="fellesskapet" aria-labelledby="community-gallery-heading" className="bg-dusk">
      {intro}
      <div ref={stage} style={{ height: `${N * 80}vh` }} className="relative">
        <div className="sticky top-0 h-screen overflow-hidden">
          {CHAPTERS.map((chapter, i) => (
            <ChapterPanel
              key={chapter.key}
              chapter={chapter}
              index={i}
              progress={progress}
              pinned
            />
          ))}
        </div>
      </div>
    </section>
  );
}
