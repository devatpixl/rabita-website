'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

// The building floor by floor, from the architect's own labelled cutaways
// (Fasiliteter.pdf, client 2026-09-03), shown bottom to top: the lower-floor
// mosque first, then each storey in turn, ending on the finished exterior
// with the dome and minaret.
//
// The deck's own page order is top-down (exterior first), so the frames were
// reversed at export: step-1.webp is the deck's page 8.
//
// Why the cross-fade is honest here and not a cheat: every page of the deck
// draws the building at the SAME position on the same 960x540 sheet, and all
// eight frames were cut with ONE identical crop box at render time
// (pdftoppm -x/-y/-W/-H), never per-image. Nothing can shift between frames,
// so fading one into the next reads as the building growing. The previous
// attempt at this idea cropped each drawing to its own bounding box, which
// let the plates wander a few pixels between steps — that alignment is the
// entire effect, and it is now guaranteed by construction rather than by
// eyeballing.
//
// Exactly one frame is lit at a time: each drawing already contains the
// storeys below it in grey, so stacking opacities under multiply would
// compound into a muddy x-ray.

const STEPS = 8;
const KEYS = [
  'lower',
  'first',
  'second',
  'third',
  'fourth',
  'fifth',
  'sixth',
  'whole',
] as const;

export function FloorByFloor() {
  const t = useTranslations('floorByFloor');
  const track = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (reduced) {
      setStep(STEPS - 1);
      return;
    }
    let frame = 0;
    const read = () => {
      frame = 0;
      const el = track.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      // How far through the track we are, 0-1; the sticky pane is one
      // viewport tall, so the travel is the track minus that.
      const travel = r.height - window.innerHeight;
      const p = travel <= 0 ? 0 : Math.min(1, Math.max(0, -r.top / travel));
      // Every step gets an equal share, the last one included, so the
      // finished building is actually looked at rather than flashing past.
      setStep(Math.min(STEPS - 1, Math.floor(p * STEPS)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reduced]);

  return (
    <section
      ref={track}
      aria-labelledby="floor-by-floor-heading"
      className={cn('relative bg-dusk', reduced ? '' : 'h-[480vh] md:h-[640vh]')}
    >
      <div
        className={cn(
          'flex flex-col bg-dusk',
          reduced ? 'py-section-md' : 'sticky top-0 h-[100svh] overflow-hidden',
        )}
      >
        <header className="shrink-0 px-6 pt-24 md:pt-28">
          <div className="mx-auto flex max-w-6xl items-start justify-between gap-8">
            <div>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold">
                {t('eyebrow')}
              </p>
              <h2
                id="floor-by-floor-heading"
                className="mt-3 max-w-xl font-serif text-[clamp(1.35rem,3vw,2.25rem)] leading-[1.1] text-paper"
              >
                {t('heading')}
              </h2>
            </div>
            {!reduced && (
              <p className="shrink-0 pt-1 font-mono text-[0.6875rem] tabular-nums tracking-[0.14em] text-paper/55">
                <span className="text-paper">{String(step + 1).padStart(2, '0')}</span> / {String(STEPS).padStart(2, '0')}
              </p>
            )}
          </div>
        </header>

        {/* The drawings. All eight stacked in one frame; only opacity changes,
           so the browser never re-lays anything out mid-scroll. */}
        <div className="relative mt-2 min-h-0 flex-1 px-6 pb-8 md:mt-4">
          {/* No plate and no blend trick: the frames carry real alpha. The
             sheet was cut out of the images themselves — a flood fill from
             the borders, so only white CONNECTED to the outside went; the
             building's own white walls and the label boxes are enclosed by
             linework and survive. A 2px dilate eats the anti-aliased rim
             that would otherwise halo pale against the dark ground. */}
          <div className="relative mx-auto h-full w-full max-w-3xl">
            {Array.from({ length: STEPS }).map((_, i) => (
              <Image
                key={i}
                src={`/photos/floors/step-${i + 1}.webp`}
                alt={i === STEPS - 1 ? t('altFinal') : ''}
                aria-hidden={i !== STEPS - 1}
                fill
                // The first frame is what a cold visitor sees, and the last
                // is what everyone ends on; the middle six can wait.
                priority={i === 0}
                sizes="(min-width: 768px) 48rem, 92vw"
                className={cn(
                  'object-contain object-bottom transition-opacity duration-500 ease-out motion-reduce:transition-none',
                  i === step ? 'opacity-100' : 'opacity-0',
                )}
              />
            ))}
          </div>
        </div>

        {/* Which floor this is, and the progress rail under it. The label is
           keyed so it cross-fades in step with the drawing above it. */}
        {!reduced && (
          <div className="shrink-0 px-6 pb-14 pt-4 md:pb-20">
            <div className="mx-auto max-w-6xl">
              {/* Fixed height, because the labels stack absolutely for the
                 cross-fade — but the longest label runs two lines on a
                 phone, so the box is two lines tall until sm. */}
              <p className="relative h-8 overflow-hidden sm:h-5">
                {KEYS.map((k, i) => (
                  <span
                    key={k}
                    aria-hidden={i !== step}
                    className={cn(
                      'absolute inset-x-0 top-0 text-center font-mono text-[0.625rem] uppercase leading-snug tracking-[0.16em] transition-opacity duration-500 sm:text-start',
                      i === step ? 'text-paper opacity-100' : 'opacity-0',
                    )}
                  >
                    {t(`floors.${k}`)}
                  </span>
                ))}
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                {Array.from({ length: STEPS }).map((_, i) => (
                  <span
                    key={i}
                    aria-hidden
                    className={cn(
                      'h-px flex-1 transition-colors duration-500',
                      i <= step ? 'bg-gold' : 'bg-paper/20',
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
