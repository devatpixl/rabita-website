'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { CAMPAIGN } from '@/lib/campaign';
import { formatAmount } from '@/lib/format';
import type { AppLocale } from '@/i18n/routing';
import { SectionBody, SectionHeading } from './primitives';
import { Accent } from './accent';

// "Om Rabita" — adapts the Innocents "Amir chapters" scroll device.
// Left column is a sticky photo that cross-fades between four chapters;
// right column scrolls the chapter panels. Each panel opens on the key
// figure(s) for that part of Rabita, then the part's name and one short
// paragraph (client request 2026-08-30: name each part, carry the numbers
// confirmed in Årsrapport 2025). Chapter is activated when it dominates
// the middle band of the viewport.

type ChapterKey = 'family' | 'learning' | 'volunteer' | 'history';

const CHAPTERS: {
  key: ChapterKey;
  photo: string;
  photoAlt: string;
}[] = [
  {
    key: 'history',
    photo: '/photos/prayer-mat-underpass.webp',
    photoAlt:
      'Rabita worshippers bowing in prayer on a mat under the Grønland underpass, imam leading at the front',
  },
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

];

export function ImpactStory() {
  const t = useTranslations('impactStory');
  const locale = useLocale() as AppLocale;

  // The one figure each part leads with, interpolated into its headline
  // (the site's gold-italic accent), plus the secondary figure the body
  // sentence mentions. All from lib/campaign.ts.
  const n = (v: number) => formatAmount(locale, v);
  const values: Record<ChapterKey, Record<string, string>> = {
    history: { year: String(CAMPAIGN.foundedYear) },
    family: { members: n(CAMPAIGN.members), nationalities: String(CAMPAIGN.nationalities) },
    learning: { pupils: n(CAMPAIGN.pupils) },
    volunteer: { volunteers: n(CAMPAIGN.volunteers), visitors: n(CAMPAIGN.visitorsPerWeek) },
  };

  const [active, setActive] = useState<ChapterKey>('history');
  const [reduced, setReduced] = useState(false);
  const panelsRef = useRef<Map<ChapterKey, HTMLElement>>(new Map());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefers = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduced(prefers);
    if (prefers) return;

    // The trigger band has to sit BELOW the pinned photograph, not behind it.
    // On desktop the photo is in the other column so the middle 20% of the
    // viewport is free; on a phone the photo is pinned at the top and covers
    // roughly 84-394px of a 760px screen, so a centred band would switch the
    // picture for a chapter the reader cannot see yet. Below md the band moves
    // into the lower third, which is the only part of the screen where a
    // chapter is actually legible.
    const narrow = window.matchMedia('(max-width: 767px)').matches;
    const rootMargin = narrow ? '-62% 0px -20% 0px' : '-40% 0px -40% 0px';

    // The observer only reports the panels whose intersection CHANGED, so
    // deciding from `entries` alone handed the picture to the next chapter
    // the moment its first line touched the band — while the chapter being
    // read still filled most of it. Keep the latest ratio for every panel
    // and pick the one that occupies the band most; on a tie, the earlier
    // one, so a chapter is never taken away before its successor has
    // clearly arrived.
    const ratios = new Map<ChapterKey, number>();
    const order = CHAPTERS.map((c) => c.key);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const key = e.target.getAttribute('data-chapter') as ChapterKey | null;
          if (key) ratios.set(key, e.isIntersecting ? e.intersectionRatio : 0);
        }
        let best: ChapterKey | null = null;
        let bestRatio = 0;
        for (const key of order) {
          const r = ratios.get(key) ?? 0;
          if (r > bestRatio + 0.05) {
            best = key;
            bestRatio = r;
          }
        }
        if (best) setActive(best);
      },
      { rootMargin, threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] },
    );
    panelsRef.current.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const activeIndex = CHAPTERS.findIndex((c) => c.key === active);

  return (
    <section id="menigheten-forteller" className="bg-paper-2 pt-section-sm pb-section-sm">
      <SectionBody>
        <div className="mb-16 max-w-3xl">
          <p className="mb-4 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-gold-deep">
            {t('eyebrow')}
          </p>
          <SectionHeading reveal className="text-balance">
            {t.rich('heading', {
              em: (chunks) => <Accent surface="paper">{chunks}</Accent>,
            })}
          </SectionHeading>
        </div>

        <div className="md:grid md:gap-10 md:grid-cols-12">
          {/* Sticky photo column */}
          {/* Pinned on the phone too, not only from md. innocents.no keeps its
             story photo sticky at every width, shortens the crop and widens
             the gaps between chapters; without the pin the sequence is just
             four paragraphs under one picture. top-[68px] clears the header
             (60px since the mobile capsule was tightened on 2026-08-30, plus
             8px of air; it was 84 for the old 77px bar),
             z-[1] keeps the chapters travelling behind the photograph rather
             than over it. */}
          <div className="sticky top-[68px] z-[1] bg-paper-2 pb-4 md:static md:col-span-6 md:bg-transparent md:pb-0">
            <div className="md:sticky md:top-20 md:h-[calc(100svh-5rem)] md:flex md:flex-col md:justify-center">
              {/* Capped so the whole photo is on screen at 100% zoom. The column is
                     wide enough for a 665px tall 4:5 crop, which is taller than a
                     laptop viewport once the sticky offset is taken off. The width
                     is capped instead of the height so the crop stays 4:5. */}
              {/* 16/11 on a phone, 4/5 from md. A 4:5 crop pinned under the
                 header leaves almost nothing of the viewport for the text it
                 is illustrating. Same ratio innocents.no switches to. */}
              <div className="relative mx-auto aspect-[16/11] w-full overflow-hidden rounded-2xl bg-paper shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] md:aspect-[4/5] md:max-w-[calc((100svh-10rem)*0.8)]">
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
                <span className="shrink-0 text-ink-60">{t(`items.${active}.name`)}</span>
              </div>
            </div>
          </div>

          {/* Scrolling chapter panels. The bottom padding is the last
             chapter's runway: without it the section ends the moment the
             fourth chapter is reached, the photo un-pins and the reader
             gets a fraction of the time the other three had. */}
          {/* Each chapter needs scroll distance of its own, otherwise two of
             them cross the observer's trigger band in the same flick and the
             pinned photo skips a frame. 38vh between panels on mobile is the
             innocents.no measure, give or take. */}
          <ol className="mt-8 space-y-[38vh] pb-[16vh] md:col-span-6 md:mt-0 md:space-y-44 md:pt-20 md:pb-[34vh]">
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
                {/* Headline carries the part's figure in the gold italic
                   accent the rest of the site uses; body carries any
                   secondary figure in prose; the pill names the part. */}
                <h3 className="font-serif text-section text-ink leading-[1.1] text-balance">
                  {t.rich(`items.${c.key}.title`, {
                    ...values[c.key],
                    em: (chunks) => <Accent surface="paper">{chunks}</Accent>,
                  })}
                </h3>
                <p className="mt-5 max-w-prose text-body text-ink">
                  {t(`items.${c.key}.body`, values[c.key])}
                </p>
                <span className="mt-6 inline-flex items-center rounded-btn border border-gold/60 bg-paper px-3 py-1 text-[13px] text-gold-deep">
                  {t(`items.${c.key}.name`)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </SectionBody>
    </section>
  );
}
