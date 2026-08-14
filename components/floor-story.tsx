'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CAMPAIGN } from '@/lib/campaign';
import { RenderingPlaceholder } from './rendering-placeholder';
import { Eyebrow, SectionBody, SectionHeading } from './primitives';

// §4.04 rewritten as a story stage — sticky rendering on the left, floor
// panels on the right. Active panel triggers via IntersectionObserver;
// the sticky image cross-fades between per-floor placeholders. Adapts
// the Innocents Amir-chapters device to architecture. Falls back to a
// static list when prefers-reduced-motion is set.
type FloorKey = 'basements' | 'ground' | 'first' | 'second' | 'top';

const FLOORS: { key: FloorKey; label: string }[] = [
  { key: 'basements', label: '-02 / -01' },
  { key: 'ground', label: '00' },
  { key: 'first', label: '01' },
  { key: 'second', label: '02' },
  { key: 'top', label: '04 / 05' },
];

export function FloorStory() {
  const t = useTranslations('floors');
  const [active, setActive] = useState<FloorKey>('basements');
  const [reduced, setReduced] = useState(false);
  const panelsRef = useRef<Map<FloorKey, HTMLElement>>(new Map());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefers = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduced(prefers);
    if (prefers) return;

    const io = new IntersectionObserver(
      (entries) => {
        // Pick the panel that most overlaps the sticky rendering's
        // vertical band. First intersecting entry wins if multiple qualify.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          const key = visible[0].target.getAttribute('data-floor') as FloorKey | null;
          if (key) setActive(key);
        }
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    panelsRef.current.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="etasje-for-etasje" className="bg-paper-2 py-section-lg">
      <SectionBody>
        <div className="mb-16 max-w-3xl">
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <SectionHeading className="mt-4">{t('heading')}</SectionHeading>
          <p className="mt-6 text-body text-ink-60">
            {t('attribution', { architect: CAMPAIGN.architect })}
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-12">
          {/* Sticky rendering column */}
          <div className="md:col-span-7">
            <div className="md:sticky md:top-24">
              <div className="relative">
                {FLOORS.map((f) => (
                  <div
                    key={f.key}
                    aria-hidden={active !== f.key}
                    className={`transition-opacity duration-500 ${
                      active === f.key ? 'opacity-100' : 'opacity-0 absolute inset-0'
                    }`}
                  >
                    <RenderingPlaceholder
                      ratio="hero"
                      caption={`${f.label} · ${t(`items.${f.key}.title`)}`}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between font-mono text-[12px] uppercase tracking-[0.14em]">
                <span className="text-gold-deep tabular-nums">
                  {(FLOORS.findIndex((f) => f.key === active) + 1)
                    .toString()
                    .padStart(2, '0')}{' '}
                  / {FLOORS.length.toString().padStart(2, '0')}
                </span>
                <span className="text-ink-60">
                  {t('floorLabel', { floor: FLOORS.find((f) => f.key === active)!.label })}
                </span>
              </div>
            </div>
          </div>

          {/* Scrolling chapter panels */}
          <ol className="md:col-span-5 space-y-24 md:space-y-40 md:py-24">
            {FLOORS.map((f) => (
              <li
                key={f.key}
                ref={(el) => {
                  if (el) panelsRef.current.set(f.key, el);
                }}
                data-floor={f.key}
                className={`transition-opacity duration-500 ${
                  reduced || active === f.key ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-gold-deep tabular-nums">
                  {t('floorLabel', { floor: f.label })}
                </p>
                <h3 className="mt-3 font-serif text-section text-ink leading-[1.15]">
                  {t(`items.${f.key}.title`)}
                </h3>
                <p className="mt-4 text-body text-ink">{t(`items.${f.key}.body`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </SectionBody>
    </section>
  );
}
