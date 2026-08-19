'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { openGiveSheet } from './giving-sheet';
import { Eyebrow, SectionBody, SectionHeading } from './primitives';
import { Accent } from './accent';

// Impact story — adapts the Innocents "Amir chapters" scroll device to
// Rabita. Left column is a sticky photo that cross-fades between four
// chapters; right column scrolls the chapter panels with mono eyebrow +
// serif title + body + gold-hairline tag pill. Chapter is activated
// when it dominates the middle band of the viewport (IntersectionObserver
// with -40% top/bottom margins).
//
// Reframes the previous "floor by floor" architectural device into a
// human/editorial statement: what Rabita already is. The architectural
// version still ships on /moskeprosjektet where floor-plan detail
// belongs.

type ChapterKey = 'family' | 'learning' | 'volunteer' | 'sadaqa';

const CHAPTERS: {
  key: ChapterKey;
  photo: string;
  photoAlt: string;
}[] = [
  {
    key: 'family',
    photo: '/photos/family-together.webp',
    photoAlt: 'Two young girls in traditional Palestinian dress holding a hand-painted sign at a community gathering in Oslo',
  },
  {
    key: 'learning',
    photo: '/photos/learning-lecture.webp',
    photoAlt: 'Audience at a Rabita lecture, speakers presenting at the front',
  },
  {
    key: 'volunteer',
    photo: '/photos/volunteer-megaphone.webp',
    photoAlt: 'A Rabita volunteer with a megaphone, high-vis vest reading RABITA',
  },
  {
    key: 'sadaqa',
    photo: '/photos/prayer-mat-underpass.webp',
    photoAlt:
      'Rabita worshippers bowing in prayer on a mat under the Grønland underpass, imam leading at the front',
  },
];

export function ImpactStory() {
  const t = useTranslations('impactStory');
  const ts = useTranslations('sadaqa');
  const locale = useLocale();
  const [active, setActive] = useState<ChapterKey>('family');
  const [reduced, setReduced] = useState(false);
  const panelsRef = useRef<Map<ChapterKey, HTMLElement>>(new Map());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefers = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduced(prefers);
    if (prefers) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          const key = visible[0].target.getAttribute('data-chapter') as ChapterKey | null;
          if (key) setActive(key);
        }
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    panelsRef.current.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const activeIndex = CHAPTERS.findIndex((c) => c.key === active);

  return (
    <section id="menigheten-forteller" className="bg-paper-2 pt-section-sm pb-section-sm">
      <SectionBody>
        <div className="mb-16 max-w-3xl">
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <SectionHeading reveal className="mt-4 text-balance">
            {t.rich('heading', {
              em: (chunks) => <Accent surface="paper">{chunks}</Accent>,
            })}
          </SectionHeading>
          <p className="mt-6 text-body text-ink-60 max-w-prose">{t('lede')}</p>
        </div>

        <div className="grid gap-10 md:grid-cols-12">
          {/* Sticky photo column */}
          <div className="md:col-span-6">
            <div className="md:sticky md:top-20 md:h-[calc(100svh-5rem)] md:flex md:flex-col md:justify-center">
              {/* Capped so the whole photo is on screen at 100% zoom. The column is
                     wide enough for a 665px tall 4:5 crop, which is taller than a
                     laptop viewport once the sticky offset is taken off. The width
                     is capped instead of the height so the crop stays 4:5. */}
              <div className="relative mx-auto aspect-[4/5] w-full overflow-hidden rounded-2xl bg-paper shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] md:max-w-[calc((100svh-10rem)*0.8)]">
                {CHAPTERS.map((c) => (
                  <div
                    key={c.key}
                    aria-hidden={active !== c.key}
                    className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                      active === c.key ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <Image
                      src={c.photo}
                      alt={c.photoAlt}
                      fill
                      sizes="(min-width: 768px) 50vw, 90vw"
                      className="object-cover editorial-photo"
                    />
                  </div>
                ))}
                {/* Corner brackets — the Innocents signature frame gesture,
                   in Rabita brand gold. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-4 left-4 h-10 w-10 border-t-2 border-s-2 border-gold"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-4 right-4 h-10 w-10 border-b-2 border-e-2 border-gold"
                />
              </div>

              {/* Chapter counter under photo — mirrors the mono treatment
                 used elsewhere for tabular figures. */}
              <div className="mx-auto mt-5 flex w-full items-center gap-4 font-mono text-label uppercase tracking-widest md:max-w-[calc((100svh-10rem)*0.8)]">
                <span className="shrink-0 text-gold-deep tabular-nums">
                  {(activeIndex + 1).toString().padStart(2, '0')} / {CHAPTERS.length.toString().padStart(2, '0')}
                </span>
                <span aria-hidden className="h-px flex-1 bg-rule" />
                <span className="shrink-0 text-ink-60">{t(`items.${active}.tag`)}</span>
              </div>
            </div>
          </div>

          {/* Scrolling chapter panels */}
          <ol className="md:col-span-6 space-y-24 md:space-y-32 md:py-16">
            {CHAPTERS.map((c, i) => (
              <li
                key={c.key}
                ref={(el) => {
                  if (el) panelsRef.current.set(c.key, el);
                }}
                data-chapter={c.key}
                className={`transition-opacity duration-500 ${
                  reduced || active === c.key ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <p className="font-mono text-label uppercase tracking-widest text-gold-deep">
                  {t('chapterLabel', { n: (i + 1).toString().padStart(2, '0') })} · {t(`items.${c.key}.time`)}
                </p>
                <h3 className="mt-4 font-serif text-section text-ink leading-[1.1] text-balance">
                  {t.rich(`items.${c.key}.title`, {
                    em: (chunks) => <Accent surface="paper">{chunks}</Accent>,
                  })}
                </h3>
                <p className="mt-5 text-body text-ink max-w-prose">{t(`items.${c.key}.body`)}</p>

                {/* Chapter 04 (sadaqa) absorbs the deleted standalone
                   sadaqa section: gold-hairline mono mark, the three-
                   item acknowledgement list, and the stacked CTAs. The
                   chapter is deliberately visually heavier than 01–03
                   because it carries the ask. */}
                {c.key === 'sadaqa' && (
                  <>
                    <div className="mt-6 flex items-center gap-3">
                      <span aria-hidden className="block h-px w-16 bg-gold" />
                      <span className="font-mono text-label uppercase tracking-widest text-gold-deep">
                        {ts('mark')}
                      </span>
                    </div>
                    <ul className="mt-6 space-y-3 text-body text-ink-60 max-w-prose">
                      <li className="flex items-baseline gap-3">
                        <span aria-hidden className="h-px w-4 bg-gold mt-2 shrink-0" />
                        <span>{ts('bullets.family')}</span>
                      </li>
                      <li className="flex items-baseline gap-3">
                        <span aria-hidden className="h-px w-4 bg-gold mt-2 shrink-0" />
                        <span>{ts('bullets.certificate')}</span>
                      </li>
                      <li className="flex items-baseline gap-3">
                        <span aria-hidden className="h-px w-4 bg-gold mt-2 shrink-0" />
                        <span>{ts('bullets.transparent')}</span>
                      </li>
                    </ul>
                    <div className="mt-8 flex flex-col items-start gap-3">
                      <Link
                        href={`/${locale}/doner-en-bonneplass`}
                        className="inline-flex items-center gap-2 min-h-12 rounded-btn bg-gold-deep text-paper px-6 py-3 text-[15px] font-semibold transition-colors duration-200 ease-out hover:bg-ink active:scale-[0.99]"
                      >
                        {ts('primary')}
                        <ArrowIcon className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => openGiveSheet()}
                        className="inline-flex items-center min-h-12 rounded-btn border border-ink px-6 py-3 text-[15px] font-semibold text-ink hover:bg-ink hover:text-paper transition-colors"
                      >
                        {ts('secondary')}
                      </button>
                    </div>
                  </>
                )}

                <span className="mt-6 inline-flex items-center rounded-btn border border-gold/60 bg-paper px-3 py-1 text-[13px] text-gold-deep">
                  {t(`items.${c.key}.tag`)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </SectionBody>
    </section>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
