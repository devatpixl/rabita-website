'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { CAMPAIGN } from '@/lib/campaign';
import { formatAmount } from '@/lib/format';
import type { AppLocale } from '@/i18n/routing';
import { SectionBody } from './primitives';
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
  /**
   * Where the phone crop should sit, below md only.
   *
   * The desktop frame is 4:5 and the sources are 4:5 or taller, so it shows
   * essentially the whole picture. The phone frame is 16/11, which of a 4:5
   * source keeps only 55% of the height — centred by default, and on a
   * portrait photograph of people standing up that band lands on their
   * chests. A per-photo value, because "where the faces are" is a fact about
   * each picture and not something one number can cover.
   */
  mobileCrop?: string;
}[] = [
  {
    key: 'history',
    // Client, Bildeplassering (2026-09-19). Cut from the 2048x1365 he sent,
    // held RIGHT rather than centred: centred gives a bookshelf and the backs
    // of heads, and the minbar only clips the edge. At x=880 the imam is
    // whole and the chapter has a subject.
    photo: '/photos/story-khutbah.webp',
    photoAlt:
      'The Friday sermon in the old prayer hall: an imam on the minbar, the congregation seated on the carpet below',
    // The 16/11 phone crop keeps 55% of the 1500px frame. The imam's head
    // sits at 9-24% down, so a centred band would start at 22.5% and take
    // it off at the shoulders. 10% holds him and still shows the rows.
    mobileCrop: 'max-md:[object-position:50%_10%]',
  },
  {
    key: 'family',
    // Client, Bildeplassering (2026-09-19) — his "Medlemskap" frame. Cut from
    // a 5313x3125 at x=1450: that is the only window where the face, the
    // embrace and the Det Islamske Forbundet vest all survive a 4:5. Further
    // left loses the vest, further right cuts the arm.
    //
    // family-together.webp is NOT deleted — gift-builds.tsx still renders it.
    photo: '/photos/members-embrace.webp',
    photoAlt: 'Two men embracing at a Rabita gathering, one wearing a Det Islamske Forbundet volunteer vest',
    // Faces sit in the top quarter here, so the phone band is pulled up
    // almost to the edge rather than centred.
    mobileCrop: 'max-md:[object-position:50%_5%]',
  },
  {
    key: 'learning',
    // Client, Bildeplassering (2026-09-19) — his "Skolen" frame. The source is
    // 1536x2048, and a full-width 4:5 of it is mostly ceiling and empty floor
    // with the children small in the middle. Cropped to 1300 wide at y=360
    // instead: the ceiling goes, every child stays in frame and the faces are
    // readable. A tighter 1150 read better still but clipped the boy on the
    // left, which is not a trade worth making on a photograph of children.
    //
    // learning-lecture.webp is NOT deleted — congregation-today.tsx and
    // lib/services.ts both still reference it.
    photo: '/photos/skolen-frokost.webp',
    photoAlt: 'Pupils at Rabita school around the tables at breakfast, their classroom posters on the wall behind',
    // Children sit across the middle band, a little above centre.
    mobileCrop: 'max-md:[object-position:50%_42%]',
  },
  {
    key: 'volunteer',
    // Client, Bildeplassering (2026-09-19), IMG_0512 — a HEIC off a phone,
    // converted and cut from 3024x4032. Held 800px down: at the top of the
    // frame the group sits small under a third of empty sky, and this is the
    // window where the FRIVILLIG lettering is still readable, which is the
    // whole point of the picture.
    //
    // volunteer-megaphone.webp is NOT deleted — congregation-today.tsx still
    // references it.
    photo: '/photos/frivillige-eid.webp',
    photoAlt: 'Rabita volunteers in blue FRIVILLIG vests at the outdoor Eid prayer',
    // The group sits low in this frame, so the 16/11 phone band drops rather
    // than centring — a centred band would cut them off at the knees.
    mobileCrop: 'max-md:[object-position:50%_70%]',
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
    family: {
      members: n(CAMPAIGN.members),
      nationalities: String(CAMPAIGN.nationalities),
      newMembers: n(CAMPAIGN.newMembersLastYear),
      // Added Sept 2026: the rewritten card names the standing volunteers
      // ("300 faste frivillige") where it used to name last year's joiners.
      // Interpolated rather than typed so it cannot drift from the same
      // figure on /om-oss. `newMembers` is left bound — the string no
      // longer asks for it, and an unused value is harmless — so that
      // restoring the old sentence needs no code change.
      volunteers: n(CAMPAIGN.volunteers),
    },
    // pupils, not studentsPerYear. The card said "over 5 000 elever i året"
    // (everyone who sits in a class across a year, evening courses
    // included); the client's Sept 2026 text says "Over 400 elever", which
    // is the weekend-school enrolment — the same figure /undervisning
    // prints. Both constants are still right; this card changed which one
    // it is about.
    learning: { students: n(CAMPAIGN.pupils) },
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

    // The trigger band has to sit where the CHAPTER is, never behind the
    // pinned photograph. On desktop the photo is in the other column, so the
    // middle 20% of the viewport is free.
    //
    // On a phone the photo moved from the top of the screen to the bottom on
    // 2026-09-29 (client: image down, text up), and the band had to move with
    // it. It was -62%/-20%, i.e. the slice between 62% and 80% of the
    // viewport — which is now exactly where the picture sits. Reading band and
    // picture had swapped places, so the chapter that lit the photo would have
    // been one the reader could not see.
    //
    // The photo now occupies roughly the lower 36% of an 844px screen, so the
    // free part is the top ~64% and the band sits in the middle of that.
    const narrow = window.matchMedia('(max-width: 767px)').matches;
    const rootMargin = narrow ? '-28% 0px -54% 0px' : '-40% 0px -40% 0px';

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
    /* pt-14 on phones: "Dette er Rabita" now ends on a full-bleed
       photograph that is cut off by the section boundary, and this section
       opens with a photograph of its own pinned at the very top — two
       pictures butted together with nothing between them (client,
       2026-09-10: "why is this breaking? the top"). Before the scroll ran on
       phones the band below that card supplied the gap. Desktop needs
       nothing: the story photo is centred in a 100svh column there, so it
       already has air above it. */
    <section id="menigheten-forteller" className="bg-paper-2 pt-14 pb-section-sm md:pt-0">
      <SectionBody>
        <div className="max-md:flex max-md:flex-col md:grid md:gap-10 md:grid-cols-12">
          {/* Sticky photo column */}
          {/* Pinned on the phone too, not only from md. innocents.no keeps its
             story photo sticky at every width, shortens the crop and widens
             the gaps between chapters; without the pin the sequence is just
             four paragraphs under one picture. top-[68px] clears the header
             (60px since the mobile capsule was tightened on 2026-08-30, plus
             8px of air; it was 84 for the old 77px bar),
             z-[1] keeps the chapters travelling behind the photograph rather
             than over it. */}
          {/* ── PINNED TO THE FOOT, NOT THE HEAD (client, 2026-09-29) ────
             "the image should be down and the text should be up". The
             mechanism is unchanged and so is the animation he likes: the
             photograph is still stuck to the viewport while four chapters
             scroll past it and cross-fade it. Only the edge it is stuck to
             has moved.

             top-auto + bottom-0 is what flips it. A sticky box with `bottom`
             set is held against the foot of the viewport for as long as its
             own natural position is below it — which, as the last child of a
             tall section, is the whole way through. order-2 puts it there
             visually; the DOM keeps the photo first so the desktop grid, where
             this is simply column one, is untouched. */}
          <div className="sticky top-[68px] z-[1] bg-paper-2 pb-4 max-md:order-2 max-md:top-auto max-md:bottom-0 max-md:pt-3 max-md:pb-20 md:static md:col-span-6 md:bg-transparent md:pb-0">
            {/* A 40px dissolve on the block's top edge, phones only. The
               chapter above scrolls up into the pinned photograph and was
               being sliced through the middle of a headline — a clean cut
               reads as a rendering fault rather than as depth. The gradient
               sits just outside the block (bottom-full) so the text fades
               into the same paper the block is painted in. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-full h-10 bg-gradient-to-t from-paper-2 to-transparent md:hidden"
            />
            <div className="max-md:flex max-md:flex-col md:sticky md:top-20 md:h-[calc(100svh-5rem)] md:flex md:flex-col md:justify-center">
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
                      className={`object-cover editorial-photo ${c.mobileCrop ?? ''}`}
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
              <div className="mx-auto mt-5 flex w-full items-center gap-4 font-mono text-label uppercase tracking-widest max-md:order-first max-md:mt-0 max-md:mb-2.5 md:max-w-[calc((100svh-10rem)*0.8)]">
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
          {/* max-md:pb-[26rem]: the runway now has to clear the pinned
             photograph as well as give the last chapter its scroll distance.
             The picture plus its counter is about 300px at 390 wide, so
             anything less would leave chapter four permanently behind it.

             THE LEAD-IN STAYS, at 18vh rather than 12. It used to clear a
             photo pinned at the top; it now buys chapter one its turn in the
             trigger band. Without it the first chapter sat above the band
             before the section had finished arriving, and the counter read
             02/04 three hundred pixels in. The 38vh between chapters is
             untouched — that spacing IS the pacing of the animation. */}
          <ol className="mt-[12vh] space-y-[38vh] pb-[16vh] max-md:order-1 max-md:mt-[18vh] max-md:pb-[26rem] md:col-span-6 md:mt-0 md:space-y-44 md:pt-[36vh] md:pb-[34vh]">
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
                {/* ── TWO LENGTHS (client, 2026-09-29) ──────────────────
                   Of this section he said the animation is good and to leave
                   it alone, and in the same breath, of the text: "you can see
                   here a lot of text". Both are true — the four chapters run
                   35, 38, 39 and 47 words, which on a 390px column is five to
                   seven lines each while a photograph is pinned above them.

                   So the layout, the sticky frame, the observer and the
                   spacing are untouched, and only the paragraph changes
                   length. Every figure the long copy interpolates survives in
                   the short one; what goes is the subordinate clause. */}
                <p className="mt-5 max-w-prose text-body text-ink md:hidden">
                  {t(`items.${c.key}.bodyShort`, values[c.key])}
                </p>
                <p className="mt-5 hidden max-w-prose text-body text-ink md:block">
                  {t(`items.${c.key}.body`, values[c.key])}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </SectionBody>
    </section>
  );
}
