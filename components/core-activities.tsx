import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { LEAD, NAMED, type Activity } from '@/lib/core-activities';
import { Accent } from './accent';
import { CEILING, CROWN, GRADE, LIGHT, SEAT_REST } from './photo-plate';
import { SectionBody } from './primitives';
import { Reveal } from './reveal';
import { LinkVT } from './link-vt';
import { cn } from '@/lib/cn';

// Replaces the "Våre tjenester" carousel (client, 2026-09-17: "To rader ...
// bestående av undervisning og aktiviteter ... se ISNA.com", then "Endre til
// våre kjerneaktiviteter"). congregation-today.tsx is KEPT, not deleted — it
// is 759 lines and three separate rounds of his own ordering, and if he wants
// the slider back it is one import in app/[locale]/page.tsx.
//
// ── What was wrong with the thing it replaces ────────────────────────────
// Thirteen cards, one row, moving sideways, on the page that has to answer
// "what is this mosque for" in six seconds. A carousel hides twelve of its
// thirteen answers behind a gesture most visitors never make, and the one
// they do see is whichever card happened to be first. The client is right to
// want it gone.
//
// ── Why this is not ISNA's grid ─────────────────────────────────────────
// He pointed at isna.net's "ISNA Services" block: four equal tiles, image,
// title, paragraph, Learn More. Three things are taken and three refused.
//
// TAKEN: photographs rather than icons; the name ON the plate; a still grid
// instead of a slider.
//
// REFUSED:
//   Four-across. His own list is seven, and 4+4 leaves a hole. 3+4 is seven
//   exactly, and the change of proportion between a tall row and a square row
//   is the hierarchy — the lead row reads as the pillars and the named row as
//   the programmes. A flat row of equal tiles says everything matters the
//   same, which is ISNA's actual weakness.
//
//   The paragraph on every tile. Seven paragraphs is a wall of grey. The
//   three lead plates carry a sentence; the four named plates carry a title
//   and nothing else, because their names already say what they are. "Id for
//   alle" does not need explaining to the people it is for.
//
//   The Learn More button. He asked for no links, and the buttons are the
//   part of ISNA's block that dates it hardest — four identical pills in a
//   row, each one a smaller, worse version of the plate above it.
//
// ── The plate numeral ───────────────────────────────────────────────────
// The lead plates carry 01/02/03 as a large mono numeral in the upper
// corner. It does three things at once: it fills the top half of a tall
// portrait frame, which the scrim leaves empty and the words never reach; it
// says "this is a set of seven" before you have read a word; and it puts the
// section in the register the rest of the site is already in — a numbered
// drawing set for a building under construction. The named plates keep the
// small inline index the service grid uses, so the two surfaces rhyme.
//
// Server component on purpose. Every state here is CSS — :hover on the
// group, nothing else — so there is no reason to ship a client bundle.

// The gold hairline that seats an index. Extends nowhere on hover: unlike the
// service grid's, these plates are not links, so there is no approach to
// answer.
function Rule({ className }: { className?: string }) {
  return <span aria-hidden className={cn('h-px bg-gold-soft/55', className)} />;
}

// The plate numeral. ONE definition for all seven, photographic and blank
// alike — the blank card is absolutely positioned like the others rather than
// flex-spaced off its own padding, so the seven numerals cannot drift apart
// when a padding value changes.
//
// ── These offsets are computed, not eyeballed ───────────────────────────
// The box is NOT the ink. Measured on the live page at 56px, JetBrains Mono:
//
//   vertical    half-leading -14.6px, font ascent 57px, ink ascent 41.4px
//               -> ink starts  0.96px below the box top
//   horizontal  digit side bearing
//               -> ink starts  4.48px inside the box's inline start
//
// So equal CSS offsets give visibly UNEQUAL optical ones. `start-3.5 top-0`
// measured 0.96px from the top and 18.48px from the left — the numeral read
// as hugging the ceiling while floating away from the wall. The values below
// are solved backwards from a target of ~8px of ink on BOTH axes.
//
// leading-[0.8] is load-bearing. The plate is overflow-hidden, so at
// leading-none the line box is 1em against the face's ~1.3em ascent+descent
// and no `top` value can recover that air. At 0.8 the box is roughly cap
// height and the digits fill it. Do not go below 0.8: half-leading turns
// negative enough to push the glyph above the box and the overflow crops it.
//
// ── The rounded corner is the real floor, not the overflow ──────────────
// rounded-2xl is a 16px radius and overflow-hidden clips to it, so the
// numeral's top-left ink has to sit OUTSIDE that arc. For an equal inset d
// the constraint is 2(16-d)^2 <= 16^2, i.e. d >= 4.69px. Anything tighter
// than that gets its corner shaved by the curve, not by the edge — which is
// why "just make it 2px" cannot work here. 8px clears it with room to spare.
function Numeral({ children, on }: { children: string; on: 'photo' | 'paper' }) {
  return (
    <span
      aria-hidden
      className={cn(
        'absolute start-1 top-[7px] z-40 font-mono text-[2.75rem] leading-[0.8] tabular-nums sm:text-[3.5rem]',
        on === 'photo' ? 'text-gold-soft/60' : 'text-gold-deep/25',
      )}
    >
      {children}
    </span>
  );
}

// One photograph under the shared scrim stack. `isolate` is load-bearing —
// CEILING is mix-blend-mode: darken and blends against the page without it.
function Plate({
  activity,
  index,
  sizes,
  className,
  children,
}: {
  activity: Activity;
  index: string;
  sizes: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'group/plate relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-ink',
        className,
      )}
    >
      {activity.photo && (
        <span aria-hidden className="absolute inset-0 z-0">
          <Image
            src={activity.photo}
            alt=""
            fill
            sizes={sizes}
            // The only thing that moves. A filter IS interpolable, so the
            // grade can cross-fade toward full colour; a transform would
            // read as "clickable" and these plates go nowhere.
            style={{ filter: GRADE, objectPosition: activity.focus }}
            className="rv-zoom object-cover transition-[filter] duration-[640ms] ease-out group-hover/plate:![filter:saturate(1)_contrast(1.04)_brightness(0.97)]"
          />
        </span>
      )}
      <span aria-hidden className="pointer-events-none absolute inset-0 z-10" style={LIGHT} />
      <span aria-hidden className="pointer-events-none absolute inset-0 z-20" style={CEILING} />
      {/* The crown, so the plate numeral holds on a bright frame. Painted
         after the ceiling and also `darken`, so it cannot lift luminance. */}
      <span aria-hidden className="pointer-events-none absolute inset-0 z-20" style={CROWN} />
      <span aria-hidden className="pointer-events-none absolute inset-0 z-30" style={SEAT_REST} />
      {/* Sized off the plate, not the viewport: at 1104px these are 352px
         wide and a 56px numeral is 16% of that, which reads as a drawing mark
         rather than a headline competing with the title below it. */}
      <Numeral on="photo">{index}</Numeral>
      {children}
    </div>
  );
}

export async function CoreActivities({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'coreActivities' });

  // ── FITS ONE 13"/14" SCREEN, AT FULL MEASURE ────────────────────────
  // Client, 2026-09-18: "looked good in desktop but in mac goes out of screen
  // ... make a little small but not soo much". At full size the section ran
  // about 1024px tall against a 13" Air's ~800px of viewport.
  //
  // FIRST FIX, NOW REPLACED: the container was capped at max-w-[984px]. That
  // worked — the cards are sized by the CONTAINER, so a narrower container
  // shrinks them — but it left 148px of empty gutter either side on a 1280px
  // screen while every other section on the page runs the full measure. The
  // user, 2026-09-18: "the space empty on right and left loooks a bit odd".
  //
  // WHY YOU CANNOT SIMPLY WIDEN IT BACK. These are aspect-ratio boxes, so
  // width and height move together: taking the container from 984 to 1104
  // makes the lead cards 40px wider AND 51px taller, and the section goes
  // from 786px to ~867px — straight back out of the screen.
  //
  // SO THE RATIOS FLATTEN INSTEAD. Full measure returns, and on this same
  // short-screen query the cards give up height rather than the page giving
  // up width:
  //
  //   lead   4:5  → 20:21    299x373 → 355x373   (+56 wide, same height)
  //   named  1:1  →  6:5     219x219 → 261x218   (+42 wide, 1px shorter)
  //
  // Same ~786px section, cards ~19% wider, gutters 148px → 64px.
  //
  // The ratios are solved against SectionBody's real max — max-w-6xl, 1152px,
  // NOT the 1104 assumed at first. 1152 - 48 of padding = 1104 of content;
  // three leads across a 20px gap is (1104-40)/3 = 355, and four named is
  // (1104-60)/4 = 261. 10:11 and 8:7 were right for a 1104px container and
  // came out 17px and 10px too tall against the real one — measured, not
  // assumed, is the only way these two numbers stay honest.
  //
  // Everything is scoped to (min-width:768px and max-height:900px), so the
  // desktop layout the client approved and the phone stack are both untouched
  // — a tall monitor still gets 4:5 leads and square named cards.
  return (
    <section id="kjerneaktiviteter" className="bg-paper-2 py-section-md [@media(min-width:768px)_and_(max-height:900px)]:!py-7">
      <SectionBody>
        {/* Section head.
           
           There was a mono "07" and a hairline out at the end of this row,
           mirroring the plate numerals at section scale. Removed 2026-09-17:
           numbering the plates describes the layout, but printing a TOTAL is a
           claim about Rabita, and the client never gave a number — seven is
           just what his list came to when counted. If Kvinnetreff comes back
           it is eight, and a stated total is the one thing that would have
           been wrong on the page rather than merely out of date. */}
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-5">
          <div>
            {/* NO EYEBROW. It read "KJERNEAKTIVITETER" directly above a
               heading saying "Våre tjenester." — two different words for the
               same thing, stacked two lines apart, which reads as an editing
               mistake rather than as a hierarchy. The carousel this section
               replaced had no eyebrow either: at 64px the heading carries the
               section on its own and does not need announcing first.
               
               coreActivities.eyebrow stays in all three message files,
               unreferenced, so restoring it is this one element. */}
            {/* NOT text-section (clamp 1.65-2.75rem, so 44px at the top).
               
               This is the same heading the carousel carried, and it is
               already been through this once: the client asked for it bigger
               on 2026-09-09 (Hjem.pdf) precisely because 44px "read as a
               label rather than as a section" next to the project overview's
               "Sju etasjer på én adresse." directly below it. The expression
               below is that one, 36 -> 64px, and it is deliberately NOT the
               text-section token — matching the neighbour is the whole point.
               
               display-opsz drives Fraunces' optical-size axis to 144, which
               swaps the text cut for the display cut: higher stroke contrast
               and tighter joins. Without it a 64px heading is just big text.
               The 600 weight and -0.015em tracking come with it. */}
            <h2
              className="display-opsz mt-4 max-w-[22ch] font-serif text-balance text-ink [@media(min-width:768px)_and_(max-height:900px)]:!text-[clamp(2rem,4vw,3.25rem)]"
              style={{
                fontSize: 'clamp(2.25rem, 5vw, 4rem)',
                lineHeight: 1.12,
                fontWeight: 600,
                letterSpacing: '-0.015em',
                margin: 0,
              }}
            >
              {t.rich('heading', { em: (c) => <Accent surface="paper">{c}</Accent> })}
            </h2>
          </div>

          {/* TOP RIGHT, level with the heading (client, 2026-09-18: "this cta
             will look better at top right, just above these, the 3rd card").
             
             It sat under the grid, which is where a "see everything" link
             normally goes — but under a grid that ENDS in a row of four cards
             it read as a stray eighth item on a new line. Up here it is a
             section control instead: the heading says what this is, the pill
             says where the rest lives, and it aligns over the third lead
             card's outer edge.
             
             Also the same arrangement as the sold-apartments band two
             sections down — heading left, pill right — so the two sections he
             asked for on the same day read as a pair.
             
             items-end sets it on the heading's foot rather than its cap;
             flex-wrap drops it below the heading on a narrow screen instead
             of crushing it. A PILL, matching the "Gi en gave" button in the
             bar: same shape, same gold-deep, same hover-to-ink, same min-h-11
             tap target — only the mono type is kept, as he asked. */}
          <LinkVT
            href={`/${locale}/tjenester`}
            className="group/all inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-full bg-gold-deep px-5 py-2.5 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-paper transition-colors duration-200 ease-out hover:bg-ink active:scale-[0.99]"
          >
            {t('all')}
            <span
              aria-hidden
              className="inline-block transition-transform duration-200 group-hover/all:translate-x-0.5 rtl:rotate-180 rtl:group-hover/all:-translate-x-0.5"
            >
              →
            </span>
          </LinkVT>
        </div>

        {/* THE GRID. Twelve columns, because twelve divides by both three and
           four: the lead row takes four columns each and the named row three
           each, so both rows end flush on the same outer edges. A six-column
           grid — what the service grid uses — cannot seat a row of four. */}
        <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-12 lg:gap-6 md:mt-14 [@media(min-width:768px)_and_(max-height:900px)]:!mt-6 [@media(min-width:768px)_and_(max-height:900px)]:!gap-5">
          {LEAD.map((a, i) => (
            <Reveal
              as="li"
              key={a.key}
              delay={i * 0.08}
              className="lg:col-span-4"
            >
              {/* 4:5 from lg — a tall plate. Below that the phone gets 4:3,
                 because a 4:5 card at 390px is 430px tall and three of them
                 is a scroll with nothing else in it. */}
              <Plate
                activity={a}
                index={String(i + 1).padStart(2, '0')}
                sizes="(min-width: 1024px) 32vw, (min-width: 640px) 46vw, 92vw"
                className="aspect-[4/3] lg:aspect-[4/5] [@media(min-width:768px)_and_(max-height:900px)]:!aspect-[20/21]"
              >
                <div className="z-40 p-5 text-start sm:p-6">
                  <h3 className="font-serif text-[clamp(1.35rem,1.7vw+0.9rem,1.85rem)] leading-[1.14] text-balance text-paper">
                    {t.rich(`items.${a.key}.title`, {
                      em: (c) => <Accent surface="photo">{c}</Accent>,
                    })}
                  </h3>
                  {/* The sentence the named row does not get. paper/80 rather
                     than a token: on a clamped photograph full paper-white
                     body type competes with the title for the same weight. */}
                  <p className="mt-2.5 max-w-[34ch] text-[0.9375rem] leading-[1.5] text-paper/80">
                    {t(`items.${a.key}.body`)}
                  </p>
                </div>
              </Plate>
            </Reveal>
          ))}

          {NAMED.map((a, i) => {
            const index = String(LEAD.length + i + 1).padStart(2, '0');
            return (
              <Reveal
                as="li"
                key={a.key}
                delay={i * 0.08}
                className="lg:col-span-3"
              >
                {a.pending ? (
                  // The marked blank. A plate with no photograph, on
                  // paper-deep with a gold hairline frame, saying in the
                  // site's own mono voice that the content is owed. It is
                  // deliberately not a grey box and deliberately not invented
                  // copy: the client reads this as the ask it is.
                  <div className="relative flex aspect-[4/3] flex-col justify-end rounded-2xl border border-gold-deep/25 bg-paper-deep p-5 text-start lg:aspect-square sm:p-6 [@media(min-width:768px)_and_(max-height:900px)]:!aspect-[6/5]">
                    <Numeral on="paper">{index}</Numeral>
                    <div>
                      <h3 className="font-serif text-[clamp(1.15rem,1.1vw+0.85rem,1.45rem)] leading-[1.16] text-balance text-ink">
                        {t.rich(`items.${a.key}.title`, {
                          em: (c) => <Accent surface="paper">{c}</Accent>,
                        })}
                      </h3>
                      <div className="mt-3 flex items-center gap-2.5">
                        <Rule className="w-6 !bg-gold-deep/40" />
                        <span className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-40">
                          {t('pending')}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Plate
                    activity={a}
                    index={index}
                    sizes="(min-width: 1024px) 24vw, (min-width: 640px) 46vw, 92vw"
                    className="aspect-[4/3] lg:aspect-square [@media(min-width:768px)_and_(max-height:900px)]:!aspect-[6/5]"
                  >
                    <div className="z-40 p-5 text-start sm:p-6">
                      {/* Title only. The four names in this row say what they
                         are without help. */}
                      <h3 className="font-serif text-[clamp(1.15rem,1.1vw+0.85rem,1.45rem)] leading-[1.16] text-balance text-paper">
                        {t.rich(`items.${a.key}.title`, {
                          em: (c) => <Accent surface="photo">{c}</Accent>,
                        })}
                      </h3>
                    </div>
                  </Plate>
                )}
              </Reveal>
            );
          })}
        </ol>

        {/* The one link. He said the plates do not need them and they do not
           have them — but without this the homepage has NO route into
           /tjenester or /undervisning at all, which it had before via thirteen
           carousel cards. One line costs nothing and keeps both pages
           reachable. */}
      </SectionBody>
    </section>
  );
}
