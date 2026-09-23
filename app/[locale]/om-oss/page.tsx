import Link from 'next/link';
import { AnnualReports } from '@/components/annual-reports';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { VISIT_DIRECTIONS_URL } from '@/lib/location';
import { Section, SectionBody } from '@/components/primitives';
import { PageBand } from '@/components/page-band';
import { FigureIcon, type FigureIconName } from '@/components/figure-icons';
import { PartnerLogos } from '@/components/partner-logos';
import { HallBackdrop, HALL_HOST } from '@/components/hall-backdrop';
import { RequestForm } from '@/components/request-form';

// ─────────────────────────────────────────────────────────────────────────────
// /om-oss — THE ABOUT PAGE.
//
// This file WAS /om-oss-2, a sandbox built on 2026-09-17 so the client's
// simplification could be judged beside the page it replaced. He chose it on
// 2026-09-18 ("use omm os 2. remove om oss"), so it is the About page now and
// the sandbox route is gone.
//
// THE PAGE IT REPLACED is at git HEAD — `git show HEAD:'app/[locale]/om-oss/
// page.tsx'` — 569 lines, if any of it is ever wanted back.
//
// ── WHAT THE CLIENT ASKED FOR ────────────────────────────────────────────
// "Se på Islamic.no som har litt enklere og ryddigere om oss side" — look at
// islamic.no, their About page is simpler and tidier.
//
// Their page was read on 2026-09-17. What is good about it is the PACING, not
// the styling: four sections, each doing one thing, two or three sentences
// apiece. What is NOT good, and was not copied: no photography anywhere, a
// generic geometric sans, a centred 2x2 of rounded white cards for "Vision
// and values" — and "Placeholder Name" three times, live in production.
//
// ── REFERENCES LOOKED AT FIRST (21st.dev, 2026-09-17) ────────────────────
// - "Editorial Image Hero" — a full-width photograph that FADES at its lower
//   edge instead of ending on a hard rectangle.
// - "Bold Stats" — one headline figure huge, a hairline, the rest small.
// - "Team Showcase" — staggered photo grid plus a hoverable name list. Noted
//   and NOT used: it needs a portrait of every person, and we have none of
//   the three leaders.
//
// ── HOW THIS DIFFERS FROM THE PAGE IT REPLACED ───────────────────────────
// 1. THE STORY BLOCK WAS DOING FOUR THINGS AT ONCE — three paragraphs of
//    history, a four-figure ledger card, an arch photograph bleeding into the
//    margin AND a pull-quote, 911px of four elements competing. Split: the
//    history stands alone on the left, the arch and its quote hold the right.
// 2. THE QUOTE WAS PRINTED TWICE ON ONE SCREEN. «Et sted hvor tro og
//    medborgerskap går sammen» sat in the margin beside a paragraph that ENDS
//    with the same sentence. It now appears once, on the arch.
// 3. THE HISTORY IS TWO PARAGRAPHS, NOT THREE. p3 is the royal visit — a fine
//    fact, not the point of an About page. aboutPage.history.p3 is untouched
//    in all three locales.
// 4. BESØK OSS LOST ITS PHOTOGRAPH AND ITS PILL, and its facts became cards
//    with a Directions button. Client: "forenkle besøk oss som er lenger opp".
// 5. THE FIGURES BAND AND A FULL-BLEED PHOTOGRAPH were built here and cut on
//    the client's verdict the same day. See the note where they stood.
// 6. THE STORY IS TWO COLUMNS, not one. The first attempt ran it in a single
//    column and left the right half of the sage ground empty — "looks very
//    old school", and he was right: a big empty half does not read as air, it
//    reads as a layout that failed to load. Air needs something anchoring the
//    other side of it.
// ─────────────────────────────────────────────────────────────────────────────

const FACT_ICONS: FigureIconName[] = ['pin', 'clock', 'route'];

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'aboutPage' });
  const ts = await getTranslations({ locale, namespace: 'storyPages' });
  const tpo = await getTranslations({ locale, namespace: 'projectOverview' });
  const tv = await getTranslations({ locale, namespace: 'visitPages' });
  const tvp = await getTranslations({ locale, namespace: 'visitPage' });
  // Only for findUs.directions — the footer's own label for the same link, so
  // the button says the same word in all three locales for no new strings.
  const tf = await getTranslations({ locale, namespace: 'footer' });
  const visitFacts = tv.raw('pages.visit.facts') as { term: string; detail: string }[];

  return (
    <main>
      {/* ══ 1. THE BAND ═══════════════════════════════════════════════════
         Unchanged from /om-oss. It is the one part of the page nobody has
         complained about, and it is the site's standard page opening. */}
      <PageBand
        kicker={ts('crumb')}
        kickerNote={ts('pages.about.eyebrow')}
        title={t('title')}
        lede={t('lede')}
        image="/photos/visit-entrance.webp"
        alt={ts('pages.about.captionIftar')}
        layout="over"
        mark="elevation"
        tone="warm"
        objectClass="object-[50%_45%]"
        padBottom="none"
      />
      {/* NO CAPTION UNDER THE BAND (client, 2026-09-17: "remove this shit").
         It read «Gateiftar på Grønland» in small mono under the photograph.
         PageBand only renders the children wrapper when there are children,
         so dropping it takes its mt-6/mt-8 with it and the story now follows
         the picture directly. The string is untouched at
         storyPages.pages.about.captionIftar and still does the band's alt
         text above, where it is doing real work. /om-oss still prints it. */}

      {/* ══ 2. THE STORY, AND NOTHING ELSE ════════════════════════════════
         One column, one subject, set at a reading measure and centred in the
         page rather than pushed into a 4-of-12 gutter beside a card.

         The measure is deliberate: the prose sits at 56ch. The old column
         was ~34ch, narrow enough that three paragraphs became a tall grey
         ribbon — part of why the block read as busy. At 56ch the same words
         take half the vertical space and look like an article.

         The ledger card is NOT here (client, 2026-09-17: "remove these
         cards"). The four figures it held get their own band below, where
         they can be a hierarchy instead of a 2x2 table. */}
      {/* ══ ONE ARCADE BEHIND THE STORY AND THE VISIT ═════════════════════
         Client, 2026-09-23: carry the background into the visit section too,
         "like we did in service pages", and fix the hard edge at the top.

         Both are one fix. What stood here was a hand-rolled copy of
         /aktuelt's treatment — an absolutely positioned Image, a
         bg-paper/55 wash and two `to-transparent` gradients — living inside
         the story section alone. Two faults:

           1. IT STOPPED AT THE STORY. The visit section below started on
              flat paper-2, so the page went arcade, then nothing, and the
              join read as two unrelated grounds.
           2. THE SEAMS DIRTIED. Tailwind's `to-transparent` is
              rgba(0,0,0,0), so a fade to it interpolates THROUGH GREY —
              which on a warm near-white ground is exactly the hard, muddy
              line in his screenshot. components/hall-backdrop.tsx documents
              this and fades to an explicit rgba of the ground instead.

         So this is HallBackdrop, the component the subject pages already
         use, spanning both sections — the pattern he pointed at. It brings
         the sticky parallax the hand-rolled version never had, and its seams
         are the explicit-rgba kind.

         `from` is paper-2 rather than the component's paper default, because
         that is the ground these two sections stand on. wash 55 matches
         /aktuelt; the subject pages run 62 because their prose is denser. */}
      {/* bg-paper-2 on the HOST, not on the sections. Both of them are
         transparent now so the one backdrop shows through, which means that
         if the photograph ever fails they would fall through to the page's
         own paper. Naming the ground here keeps it paper-2 either way. */}
      <div className={`${HALL_HOST} bg-paper-2`}>
        {/* THE GRADE IS NOT OPTIONAL HERE, and this cost a build to learn.
           HallBackdrop paints the photograph raw and washes it with
           rgba(250,248,244,wash). The file is a near-white cream wall, so at
           wash 62 the result was near-white on near-white: the sticky layer
           was present, loaded and covering the viewport, and NOTHING was
           visible — the contact section looked like plain paper.

           /aktuelt has always graded it: saturate(0.72) contrast(1.12)
           brightness(0.9). That is what makes the arch, the lantern and the
           olive branch read at all. Passed here, with the wash back to
           /aktuelt's 55. */}
        <HallBackdrop
          wash={55}
          from="rgb(242,238,231)"
          grade="saturate(0.72) contrast(1.12) brightness(0.9)"
        />

      <section className="relative">
        <div className="pb-14 pt-9 md:pb-24 md:pt-section-lg">
          <SectionBody>
            {/* ── TWO COLUMNS, 7 AND 5 ─────────────────────────────────
               First attempt ran the story in one column and left the right
               two thirds of the sage ground empty. The client, 2026-09-17:
               "i dont like it at all, looks very old school ... although this
               text and font looks good, but something should be on right".

               He is right, and the diagnosis is worth keeping: a big empty
               half does NOT read as air, it reads as a layout that failed to
               load. Air works when something anchors the other side of it.

               So the typography here stays exactly as it was — that is the
               part he approved — and the arch comes back beside it, carrying
               the quote, which is the composition /om-oss already had and he
               asked to keep: "maybe remove these cards in about us 1 and
               then keep this to keep it aesthetic". The cards are what went;
               the arch is what stayed. */}
            {/* ── NO ARCH, AND NO COLUMN FOR IT ────────────────────────
               Client, 2026-09-23: "just remove this then", pointing at the
               arch and its quote.

               It had been through two rounds. The first version of this
               section ran the story in one narrow column with the right side
               empty — "i dont like it at all, looks very old school ...
               something should be on right" — so the arch came back to
               anchor that side. Versjon 6 then asked for the text to be
               pulled out to the full section, which left the arch beside a
               heading rather than beside prose, and a gap above the columns
               that he did not like either.

               The arcade photograph behind the section does the job the arch
               was doing: it keeps the ground from reading as empty, and it
               does it across the whole width instead of in one column. With
               that there, the arch is a second decoration competing with it.

               WHAT WENT WITH IT: the 7/5 grid, /photos/arch-light.jpg (still
               in the project, used nowhere else), and aboutPage.quote in all
               three locales — the quote lived only on the arch. Putting it
               back means the aside, the grid, and the string.

               The heading now simply opens the section, and the story runs
               under it at full width. */}
            {/* THE SECTION MARKER (client, 2026-09-17: "can we have another
               proper heading here ... this line looks bad").

               It was a pill chip followed by a hairline stretching five
               hundred pixels to nowhere — two devices doing one job, and the
               rule in particular had nothing to join. What replaces it is
               two things this site already owns: a short gold rule and the
               gold mono label used as the eyebrow on every other section.
               His text is unchanged: still aboutPage.historyChip. */}
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
              <span aria-hidden className="mb-5 block h-px w-10 bg-gold-deep/50" />
              {t('historyChip')}
            </p>

            {/* Unchanged from the version he approved: the headline runs at
               display size on its own measure. It opens the section now
               rather than sharing a row with the arch. */}
            <h2 className="mt-7 max-w-[17ch] font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1.02] tracking-[-0.02em] text-balance text-ink">
              {t('historyHeading')}
            </h2>

            {/* ── THE STORY RUNS THE FULL SECTION, IN TWO COLUMNS ──────────
               Client, Versjon 6 (2026-09-22), under Om oss: "Dra teksten
               helt ut til en seksjon" — pull the text all the way out into a
               section. It was inside the 7-of-12 column above, capped at
               56ch, which on a 1920px screen is 621px of prose against a
               near-empty right half. His words are exactly that complaint.

               WHY TWO COLUMNS AND NOT ONE WIDE ONE. Pulled out and left as a
               single column, the measure would be ~104 characters, which is
               unreadable — and he has already rejected the other obvious
               answer: the first version of this section ran the story in one
               narrow column with the right side empty, and the verdict was
               "i dont like it at all, looks very old school ... something
               should be on right". Two columns at ~50ch each fill the
               section, keep a reading measure, and cannot leave a half of it
               empty, because there is no half.

               The arch stays where it is. He asked for it specifically
               ("keep this to keep it aesthetic") and it now sits with the
               heading rather than beside a column of prose.

               columns-2, not a two-column grid: the four paragraphs flow and
               balance themselves, so the block stays even when the copy
               changes length. break-inside-avoid keeps a paragraph whole,
               and the margins are per-paragraph because space-y collapses
               wrongly at a column break. */}
            <div className="mt-10 text-[clamp(1rem,1.15vw,1.125rem)] leading-relaxed text-ink-60 md:mt-14 lg:columns-2 lg:gap-14 [&>p]:mb-6 [&>p]:break-inside-avoid [&>p:last-child]:mb-0">
              {/* FOUR paragraphs. p3 (the royal visit) was cut here on
                 2026-09-17 as "a fine fact, not the point of an About page"
                 — OUR editorial call, not the client's — and Tekst (endelig)
                 Sept 2026 prints the section with the royal visit in it and a
                 fourth paragraph after it. His text is the text. */}
              <p>{t('history.p1')}</p>
              <p>{t('history.p2')}</p>
              <p>{t('history.p3')}</p>
              <p>{t('history.p4')}</p>
            </div>

            <Link
              href={`/${locale}/moskeprosjektet`}
              className="group mt-10 inline-flex min-h-11 items-center gap-3 border-t border-ink/15 pt-6 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-ink transition-colors hover:text-gold-deep"
            >
              {tpo('cta')}
              <span
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
              >
                &rarr;
              </span>
            </Link>
          </SectionBody>
        </div>
      </section>

      {/* ══ THE FIGURES AND THE CONGREGATION PHOTOGRAPH — BOTH CUT ══════
         Client, 2026-09-17, of all three redesigned blocks: "i dont like it
         at all, looks very old school", then removed both outright.

         WHAT WENT AND WHERE IT LIVES IF IT COMES BACK:

         1. THE FIGURES BAND — 4 344 at display size with founded /
            nationalities / visitors small on a rule under it, built off
            21st.dev's "Bold Stats". The four numbers are all still in
            lib/campaign.ts (foundedYear, members, nationalities,
            visitorsPerWeek) and their labels in aboutPage.facts.* /
            factNotes.* in all three locales, untouched. /om-oss still renders
            them in its own 2x2 ledger card, so nothing is lost from the site
            — only from this page.

            One consequence worth knowing: this page now states no numbers at
            all. The membership contradiction (CAMPAIGN.members 4 344 vs
            lib/membership.ts 4 200 vs joinPage.members "over 4 300") stops
            being urgent for /om-oss-2 — but it is still wrong elsewhere.

         2. THE FULL-BLEED PHOTOGRAPH — cong-hall.webp at 3:1 with a masked
            lower edge. public/photos/cong-hall.webp is untouched and still
            used as the story image for the 'veivisere' service.

         The page is five sections now: band, story, partners, visit,
         reports + chart. That is one fewer than /om-oss and one more than
         islamic.no, and every one of them does a single thing. */}


      {/* ══ 6. BESØK OSS, SIMPLIFIED ══════════════════════════════════════
         Client: "forenkle besøk oss som er lenger opp."
         
         WHAT WENT: the doorway photograph and the «Se hva som skjer» pill
         riding on it. That block was 4:3 of image plus an overlay gradient
         plus a floating button — the busiest single object in the section,
         sitting next to a form. The form is what the section is FOR; the
         photograph was competing with it for the same attention, and the pill
         pointed at /arrangementer, which the main navigation already does.
         
         WHAT STAYED: the address as the headline (nobody needs a heading that
         says "address" over an address), the three facts, the groups line,
         and the form. That is the whole job of the section.
         
         The columns rebalance 5/7 → 4/7-with-a-gap: with the photograph gone
         the left column is text only, and at 5 wide the facts list stretched
         into a short, wide shape that read as a leftover. Nothing else moved. */}
      <Section
        id="besok-oss"
        // The arcade above is this section's ground now.
        tone="none"
        pad="tight"
        /* ── ONE SCREEN ON A MACBOOK AIR ──────────────────────────
           Client, 2026-09-20: "vertically reduce it so it fits in one
           screen on mac air 12-15 inches also".

           The section was 935px. A 13" Air is 1440x900, which leaves
           about 813px of viewport once Chrome takes its chrome, and
           the header floats over the first ~90 of that — so the
           directions button fell off the bottom, which is what he
           photographed.

           MEASURED, not guessed: the left column is 815px and the
           form only 655, so the column drives the height, and 493 of
           those 815 are the five cards. The text PDF grew them from
           three to five — Kontor, E-post and Slik finner du fram are
           new — which is why a section that used to fit no longer
           does.

           Everything here trims padding and rhythm, never type size,
           and only under max-height:900 — the same query the form on
           this page already uses. Above that nothing changes.
           Verified in the browser: 935 -> 735, clearing a 13" Air
           with 78px spare for the floating header.

           !important throughout because lib/cn is plain clsx: it
           merges nothing, so both classes ship and the later-defined
           one does not reliably win. */
        className={"relative isolate scroll-mt-24 overflow-hidden [@media(min-width:768px)_and_(max-height:900px)]:!py-8"}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 end-[4%] -z-10 h-[34rem] w-[34rem] rounded-full bg-gold/[0.06] blur-3xl"
        />
        <div
          aria-hidden
          className="star-texture star-texture--light pointer-events-none absolute inset-0 -z-10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-paper to-paper-2 md:h-40"
        />
        <SectionBody>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            {/* 5/7, up from 4/8: the headline is 2.75rem now and an address
               is a run of short words that breaks badly in a narrow column. */}
            <div className="lg:col-span-5">
              {/* The same marker and the same headline face as the story
                 section above (client, 2026-09-18: "the same way font and
                 style in the above section"). The pill chip goes for the same
                 reason it went up there.

                 ONE STEP DOWN IN SIZE, deliberately: 2.75rem against the
                 story's 4rem. Same serif, same -0.02em tracking, same tight
                 leading — but a second headline set at the page headline's
                 size is not consistency, it is two pages fighting. The story
                 is what this page is about; this is where to find it. */}
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
                <span aria-hidden className="mb-5 block h-px w-10 bg-gold-deep/50" />
                {tvp('addressHeading')}
              </p>
              <h2 className="mt-6 font-serif text-[clamp(1.875rem,3.2vw,2.75rem)] leading-[1.05] tracking-[-0.02em] text-balance text-ink [@media(min-width:768px)_and_(max-height:900px)]:!mt-3">
                {CAMPAIGN.visitAddress}
              </h2>
              {/* The welcome line sits BETWEEN the headline and the cards
                 (client reference, 2026-09-18: "keep the text place like
                 here"), not after them.

                 It reads better there and it is the conventional order: the
                 headline says where, the sentence says who is welcome, and
                 the cards are the practical detail you scan afterwards. Left
                 at the foot it was a paragraph arriving after a button, which
                 reads as an afterthought — and a button is a thing a column
                 ends on. */}
              <p className="mt-6 max-w-[48ch] text-[clamp(1rem,1.15vw,1.125rem)] leading-relaxed text-ink-60 [@media(min-width:768px)_and_(max-height:900px)]:!mt-3">
                {tvp('groups')}
              </p>

              {/* ── THE FACTS AS CARDS ────────────────────────────────
                 Client reference, 2026-09-18: each fact in its own bordered
                 card, icon in a circle on the left, label over value.

                 They were three bare rows on a shared hairline, which made
                 the block read as one list rather than three separate things
                 you might want one of. As cards they are scannable.

                 NO ARROW ON THE CARDS, unlike the reference. An arrow says
                 "this goes somewhere" and none of these do — the address is
                 not a link, the opening hours are not a page. The reference's
                 arrows belong to cards that navigate; ours would be pointing
                 at nothing. The one thing here that DOES go somewhere is the
                 directions button below, and it has the arrow.

                 The reference also carries a third, smaller line per card
                 ("Norway", "Prayers & community activities"). Our facts are
                 {term, detail} — two lines, no third. Inventing a sub-line
                 per card would be writing copy nobody approved. */}
              <ul className="mt-7 space-y-3 [@media(min-width:768px)_and_(max-height:900px)]:!mt-4 [@media(min-width:768px)_and_(max-height:900px)]:[&>li+li]:!mt-2">
                {visitFacts.map((f, i) => (
                  <li
                    key={f.term}
                    className="flex items-center gap-4 rounded-2xl bg-paper p-4 ring-1 ring-ink/[0.08] transition-shadow duration-300 hover:ring-gold-deep/30 sm:p-5 [@media(min-width:768px)_and_(max-height:900px)]:!px-4 [@media(min-width:768px)_and_(max-height:900px)]:!py-3"
                  >
                    <span
                      aria-hidden
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-soft/40 text-gold-deep ring-1 ring-gold-deep/20 [@media(min-width:768px)_and_(max-height:900px)]:!h-[38px] [@media(min-width:768px)_and_(max-height:900px)]:!w-[38px]"
                    >
                      <FigureIcon name={FACT_ICONS[i] ?? 'pin'} className="h-[19px] w-[19px]" />
                    </span>
                    <span className="block min-w-0">
                      <span className="block font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-40">
                        {f.term}
                      </span>
                      {/* A detail that carries a " · " is SET AS LINES, not
                         as one run. Client, Versjon 6 (2026-09-22), under Om
                         oss: "Flytt teksten til under hverandre på slik
                         finner du fram."

                         Only one fact has a separator — "3 min fra Tøyen
                         T-bane · 5 min fra Grønland T-bane" — and on a card
                         this narrow it wrapped wherever it ran out of room,
                         which put the break in the middle of a station name
                         as often as between the two journeys. Two routes are
                         two facts; they get a line each and the middot goes.

                         Split rather than two message keys: the string stays
                         one editable sentence in all three locales, and a
                         fact with no separator renders exactly as before. */}
                      <span className="mt-1.5 block font-serif text-[1.0625rem] leading-snug text-ink">
                        {f.detail.split(' · ').map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              {/* ── GET DIRECTIONS ────────────────────────────────────────
                 Client: "add one cta of get direction and make that of what
                 we have in footer, should be correct url".

                 Same href the footer uses — VISIT_DIRECTIONS_URL from
                 lib/location.ts, which builds a Google Maps directions link
                 to VISIT.address (Sørligata 8a, 0577 Oslo, where the
                 congregation actually is) and NOT to MOSQUE.address, which is
                 the Calmeyers gate building site. That distinction is the
                 whole reason the two constants exist; see the note in
                 lib/campaign.ts. Same label too — footer.findUs.directions,
                 already translated three ways.

                 bg-gold-deep/text-paper is the primary button on a light
                 ground in this system (request-form's paper tone). The
                 footer's own is bg-gold/text-dusk because it sits on dusk. */}
              <a
                href={VISIT_DIRECTIONS_URL}
                target="_blank"
                rel="noreferrer"
                className="group mt-7 inline-flex min-h-11 items-center gap-2.5 rounded-full bg-gold-deep px-6 py-3 text-[15px] font-semibold text-paper transition-colors hover:bg-ink [@media(min-width:768px)_and_(max-height:900px)]:!mt-4"
              >
                {tf('findUs.directions')}
                <span
                  aria-hidden
                  className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                >
                  &rarr;
                </span>
              </a>

            </div>

            {/* ── THE FORM SHRINKS ON A SHORT SCREEN ────────────────────
               Client, 2026-09-18: "for desktops ok, but for macbook 13/14
               inches, make form smaller so fits, this is too big."

               KEYED TO VIEWPORT HEIGHT, NOT WIDTH. A 13" MacBook Air is
               1280x800 and a desktop monitor is 2560x1440 — they are miles
               apart in HEIGHT and can be identical in width once a browser
               window is resized. A `lg:` breakpoint would have shrunk the
               form on a wide-but-short window and left it tall on a narrow
               one, which is backwards. `@media (max-height: 900px)` asks the
               only question that matters: is there room?

               NOT RequestForm's own `compact` — that prop exists and it was
               the obvious reach, but it DELETES the optional "preferred time"
               field. Saving 80px by removing a field a visitor might want to
               fill in is not making the form smaller, it is making the form
               do less. Everything below is spacing.

               Roughly 100px back: card padding 32→20, the textarea's floor
               88→56, and the intro's own margin.

               These are descendant utilities on purpose — the sizes live
               inside RequestForm and this page should not reach in and edit a
               component five other pages share. `[&>form]` and `[&_textarea]`
               both out-specify the plain utility they override, so no
               `!important` is needed: lib/cn is clsx, which merges nothing,
               and a two-part descendant selector beats a one-class one. */}
            <div className="lg:col-span-7 lg:self-center [@media(max-height:900px)]:[&>form]:p-5 [@media(max-height:900px)]:[&_textarea]:min-h-[3.5rem]">
              <RequestForm
                subject="visit"
                card
                rule={false}
                intro={
                  <div className="mb-7 [@media(max-height:900px)]:mb-4">
                    <h2 className="font-serif text-[clamp(1.5rem,2.4vw,2rem)] leading-tight text-balance text-ink">
                      {tvp('formTitle')}
                    </h2>
                    <p className="mt-3 max-w-[44ch] text-[15px] leading-snug text-ink-60">
                      {tvp('formLede')}
                    </p>
                  </div>
                }
              />
            </div>
          </div>
        </SectionBody>
      </Section>
      </div>

      {/* ══ 7. ÅRSRAPPORTER + ORGANISASJONSKART ═══════════════════════════
         Unchanged and shared with /om-oss — the chart was already rebuilt to
         the client's three groups on 2026-09-17. It closes the page: the
         paperwork and the people belong after the invitation, not before it,
         if this page wins, the two files merge and only one survives. */}
      <AnnualReports locale={locale} />

      {/* ══ SAMARBEIDSPARTNERE, LAST ═══════════════════════════════════════
         Client, Tekst (endelig) Sept 2026: "Flytt hele
         samarbeidspartnere-seksjonen til helt nederst på siden, og la den
         ERSTATTE dagens «Besøk oss»-seksjon som i dag ligger nederst."

         A MOVE, NOT A DELETION, and his own document is what settles that:
         the section he calls "Besøk oss" is given NY TEKST two pages earlier
         under the heading "Kontakt oss" — address, prayer window, office
         hours, e-mail — so it cannot be the thing being removed. What he saw
         was partners sitting ABOVE it; "erstatte" is him describing the slot
         partners should end up in, which is the bottom.

         The page now runs in his content order exactly: Historie ->
         Kontakt oss -> Organisasjonen -> Samarbeidspartnere. */}
      <PartnerLogos locale={locale} />
    </main>
  );
}
