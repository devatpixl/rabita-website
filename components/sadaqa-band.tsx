'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Accent } from './accent';
import { Eyebrow, SectionBody } from './primitives';
import { GiveCTA } from './give-cta';
import { cn } from '@/lib/cn';

// Sadaqa jariya, the dedication ask, as its own section. Impact story already
// names it as chapter four, but naming a thing and asking for it are different
// jobs, and the ask had nowhere to live on the home page.
//
// Asymmetric on purpose: argument on one side, room on the other. Every
// section between the building and the footer is a heading over a full width
// block, so a two column split with the picture carrying one half reads
// differently without leaving the house style.
//
// Rooms are renders because these rooms do not exist yet, and all four are
// people free, which is the standing rule for render imagery here.
const GRADE = 'saturate(0.72) contrast(1.12) brightness(0.9)';

const ROOMS = [
  { key: 'mainHall', src: '/photos/room-main-hall.webp' },
  { key: 'womensHall', src: '/photos/room-womens-hall.webp' },
  { key: 'qibla', src: '/photos/room-qibla.webp' },
  { key: 'lowerHall', src: '/photos/room-lower-hall.webp' },
] as const;

export function SadaqaBand() {
  const t = useTranslations('sadaqaBand');
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const room = ROOMS[active];

  return (
    <section
      id="sadaqa-jariya"
      aria-labelledby="sadaqa-band-heading"
      className="bg-paper py-section-lg"
    >
      <SectionBody>
        <div className="grid items-center gap-12 md:grid-cols-12 md:gap-16">
          {/* The ask */}
          <div className="md:col-span-5">
            <Eyebrow tone="gold-deep">{t('eyebrow')}</Eyebrow>
            <h2
              id="sadaqa-band-heading"
              className="mt-4 font-serif text-section text-balance text-ink"
            >
              {t.rich('heading', {
                em: (chunks) => <Accent surface="paper">{chunks}</Accent>,
              })}
            </h2>
            <p className="mt-6 max-w-prose text-body text-ink-60">{t('body')}</p>
            <div className="mt-8">
              <GiveCTA label={t('cta')} />
            </div>
          </div>

          {/* The room */}
          <div className="md:col-span-7">
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-paper-2">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={room.key}
                  className="absolute inset-0"
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image
                    src={room.src}
                    alt={t(`rooms.${room.key}.alt`)}
                    fill
                    sizes="(min-width: 768px) 58vw, 90vw"
                    className="object-cover"
                    style={{ filter: GRADE }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Room picker. Each tab keeps its own rule, which is the tab as
               much as the label is, so the set reads as a strip of options. */}
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
              {ROOMS.map((r, i) => {
                const on = i === active;
                return (
                  <li key={r.key}>
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-pressed={on}
                      className="group block w-full text-start"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'block h-[2px] w-full transition-colors duration-300',
                          on ? 'bg-gold-deep' : 'bg-rule group-hover:bg-gold/60',
                        )}
                      />
                      <span
                        className={cn(
                          'mt-3 flex min-h-11 items-start text-[14px] transition-colors duration-200',
                          on ? 'font-semibold text-ink' : 'text-ink-60 group-hover:text-ink',
                        )}
                      >
                        {t(`rooms.${r.key}.label`)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <p className="mt-2 text-[14px] leading-relaxed text-ink-60" aria-live="polite">
              {t(`rooms.${room.key}.caption`)}
            </p>
          </div>
        </div>
      </SectionBody>
    </section>
  );
}
