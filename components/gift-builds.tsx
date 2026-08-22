'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { GIFTS } from '@/lib/gifts';
import { formatAmount } from '@/lib/format';
import type { AppLocale } from '@/i18n/routing';
import { Accent } from './accent';
import { SectionBody } from './primitives';
import { openGiveSheet } from './giving-sheet';

// What your gift builds. Same costed items as the ladder, shown as photographs, on dusk to break the run of paper sections.
const GRADE = 'saturate(0.72) contrast(1.12) brightness(0.9)';
const CURVE = [0.16, 1, 0.3, 1] as const;

const SHOTS: Record<string, string> = {
  prayer: '/photos/gift-prayer.webp',
  shelf: '/photos/gift-library.webp',
  desk: '/photos/gift-school.webp',
  panel: '/photos/gift-facade.webp',
};

/** Runs a figure up once its card is on screen, and back to nothing on the way out. */
function Amount({
  to,
  live,
  still,
  delay,
  locale,
}: {
  to: number;
  live: boolean;
  still: boolean;
  delay: number;
  locale: AppLocale;
}) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!live) {
      setShown(0);
      return;
    }
    if (still) {
      setShown(to);
      return;
    }
    let raf = 0;
    let start = 0;
    const run = (now: number) => {
      if (!start) start = now;
      const k = Math.min(1, (now - start - delay) / 900);
      if (k > 0) setShown(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [live, still, to, delay]);

  return <>{formatAmount(locale, shown)}</>;
}

export function GiftBuilds() {
  const t = useTranslations('giftLadder');
  const locale = useLocale() as AppLocale;
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const still = mounted && reduced === true;

  const root = useRef<HTMLDivElement>(null);
  const live = useInView(root, { margin: '-15% 0px' });
  const [focused, setFocused] = useState<number | null>(null);

  return (
    <section
      id="hva-din-gave-bygger"
      aria-labelledby="gift-builds-heading"
      className="bg-dusk py-section-lg text-paper"
    >
      <SectionBody>
        <div className="max-w-3xl">
          <h2
            id="gift-builds-heading"
            className="font-serif text-section text-balance text-paper"
          >
            {t.rich('heading', {
              em: (chunks) => <Accent surface="dusk">{chunks}</Accent>,
            })}
          </h2>
        </div>

        <div ref={root} className="mt-10">
          {/* The spine, drawn once the cards are in place */}
          <div className="relative mb-10 hidden h-px w-full bg-paper/15 lg:block">
            <motion.span
              className="absolute inset-y-0 start-0 block bg-gold"
              initial={{ width: still ? '100%' : 0 }}
              animate={{ width: live ? '100%' : 0 }}
              transition={{ duration: still ? 0 : 1.1, ease: CURVE, delay: 0.15 }}
            />
          </div>

          <ul className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {GIFTS.map((g, i) => {
              const dimmed = focused !== null && focused !== i;
              return (
                <li key={g.key}>
                  <motion.button
                    type="button"
                    onClick={() => openGiveSheet(g.amountNok)}
                    onMouseEnter={() => setFocused(i)}
                    onMouseLeave={() => setFocused(null)}
                    onFocus={() => setFocused(i)}
                    onBlur={() => setFocused(null)}
                    aria-label={`${formatAmount(locale, g.amountNok)} kr · ${t(`items.${g.key}.title`)}`}
                    className="group relative block w-full text-start"
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: live ? 1 : 0, y: live ? 0 : 26 }}
                    transition={{
                      duration: still ? 0 : 0.7,
                      ease: CURVE,
                      delay: still ? 0 : 0.2 + i * 0.09,
                    }}
                  >
                    {/* Pulling the others back lives on its own element, so it never fights the entrance transform above it. */}
                    <span
                      className="block"
                      style={{
                        opacity: dimmed && !still ? 0.42 : 1,
                        filter: dimmed && !still ? 'blur(1.5px)' : 'none',
                        transition: 'opacity 320ms ease-out, filter 320ms ease-out',
                      }}
                    >
                      <span className="mb-4 flex items-center gap-3">
                        <span
                          aria-hidden
                          className={`h-2 w-2 rotate-45 transition-colors duration-300 ${
                            focused === i ? 'bg-gold' : 'bg-paper/30'
                          }`}
                        />
                        <span className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-gold">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </span>

                      <span className="relative block aspect-[1/1] overflow-hidden rounded-lg bg-dusk">
                        <motion.span
                          className="absolute inset-0 block"
                          initial={{ clipPath: still ? 'inset(0% 0 0 0)' : 'inset(100% 0 0 0)' }}
                          animate={{
                            clipPath: live ? 'inset(0% 0 0 0)' : 'inset(100% 0 0 0)',
                          }}
                          transition={{
                            duration: still ? 0 : 1,
                            ease: CURVE,
                            delay: still ? 0 : 0.25 + i * 0.09,
                          }}
                        >
                          <Image
                            src={SHOTS[g.key]}
                            alt={t(`alt.${g.key}`)}
                            fill
                            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                            loading="eager"
                            className="object-cover transition-transform duration-[1.1s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                            style={{ filter: GRADE }}
                          />
                        </motion.span>

                        {/* The ask, only once you are on this one */}
                        <span
                          className={`absolute inset-x-0 bottom-0 flex items-center justify-between bg-ink/85 px-4 py-3 text-[0.85rem] font-medium text-paper transition-all duration-300 ${
                            focused === i ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                          }`}
                        >
                          {t('cta')}
                          <span aria-hidden className="rtl:-scale-x-100">
                            &rarr;
                          </span>
                        </span>
                      </span>

                      <span className="mt-5 block font-serif text-[clamp(1.6rem,2.4vw,2.1rem)] leading-none tabular-nums text-gold">
                        <Amount
                          to={g.amountNok}
                          live={live}
                          still={still}
                          delay={i * 90}
                          locale={locale}
                        />{' '}
                        <span className="text-[0.55em] text-dusk-60">kr</span>
                      </span>

                      <span className="mt-3 block font-serif text-card text-paper">
                        {t(`items.${g.key}.title`)}
                      </span>
                      <span className="mt-2 block text-[14px] leading-relaxed text-dusk-60">
                        {t(`items.${g.key}.meta`)}
                      </span>
                    </span>
                  </motion.button>
                </li>
              );
            })}
          </ul>

          <p className="mt-9 text-[13.5px] text-dusk-60">{t('footnote')}</p>
        </div>
      </SectionBody>
    </section>
  );
}
