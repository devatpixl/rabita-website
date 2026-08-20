'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Accent } from './accent';
import { Eyebrow } from './primitives';

// Four things the congregation already does, one photograph each: the street
// iftar on Groenland, the Saturday school, the spring bazaar on Youngstorget,
// and the site on Calmeyers gate the week it was cleared.
//
// Each chapter is a full-bleed photograph against a half of running copy. The
// photograph sits zoomed out when the chapter arrives and pushes in as the
// chapter passes, so the scroll does the work and nothing slides around the
// screen. Sides alternate down the section.
//
// Only `scale` animates, so every frame is composited. The global
// prefers-reduced-motion rule flattens it, and under 768px the chapter stacks
// to photograph over copy.

const GRADE = 'saturate(0.72) contrast(1.12) brightness(0.9)';

type Chapter = { key: string; src: string; flip: boolean };

const CHAPTERS: Chapter[] = [
  { key: 'iftar', src: '/photos/community/iftar-tables.webp', flip: false },
  { key: 'school', src: '/photos/community/quran-carpet.webp', flip: true },
  { key: 'bazaar', src: '/photos/community/bazaar-dress.webp', flip: false },
  { key: 'site', src: '/photos/community/site-cleared.webp', flip: true },
];

function ChapterRow({ chapter, index }: { chapter: Chapter; index: number }) {
  const t = useTranslations('communityGallery');
  const row = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: row,
    offset: ['start end', 'end start'],
  });

  // Zoomed out on arrival, pushed in by the time the chapter leaves.
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.24]);

  return (
    <div
      ref={row}
      className={`grid items-stretch md:grid-cols-2 ${
        chapter.flip ? 'md:[&>figure]:order-2' : ''
      }`}
    >
      <figure className="relative m-0 h-[52vh] overflow-hidden md:h-[74vh]">
        <motion.div className="absolute inset-0 will-change-transform" style={{ scale }}>
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

      <div className="flex items-center px-6 py-12 md:px-12 md:py-14 lg:px-20">
        <div className="max-w-[46ch]">
          <p className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-gold">
            {t(`chapters.${chapter.key}.eyebrow`)}
          </p>
          <h3 className="mt-4 font-serif text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.12] text-paper">
            {t(`chapters.${chapter.key}.title`)}
          </h3>
          <p className="mt-5 text-body leading-relaxed text-dusk-60">
            {t(`chapters.${chapter.key}.body`)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function CommunityGallery() {
  const t = useTranslations('communityGallery');

  return (
    <section id="fellesskapet" aria-labelledby="community-gallery-heading" className="bg-dusk">
      <div className="mx-auto max-w-6xl px-6 pb-10 pt-section-md md:pb-12">
        <Eyebrow tone="gold">{t('eyebrow')}</Eyebrow>
        <h2
          id="community-gallery-heading"
          className="mt-3 max-w-[22ch] text-balance font-serif text-section text-paper"
        >
          {t.rich('heading', { em: (c) => <Accent surface="dusk">{c}</Accent> })}
        </h2>
        <p className="mt-4 max-w-prose text-body text-dusk-60">{t('body')}</p>
      </div>

      {CHAPTERS.map((chapter, i) => (
        <ChapterRow key={chapter.key} chapter={chapter} index={i} />
      ))}
    </section>
  );
}
