import Image from 'next/image';
import Link from 'next/link';
import { AnnualReports } from '@/components/annual-reports';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { VISIT_DIRECTIONS_URL } from '@/lib/location';
import { Section, SectionBody } from '@/components/primitives';
import { PageBand } from '@/components/page-band';
import { FigureIcon, type FigureIconName } from '@/components/figure-icons';
import { PartnerLogos } from '@/components/partner-logos';
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
      <section className="relative isolate overflow-hidden bg-sage">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 end-[4%] -z-10 h-[34rem] w-[34rem] rounded-full bg-gold/[0.07] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-paper to-sage md:h-40"
        />
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
            <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-14">
              {/* ── the story ──────────────────────────────────────── */}
              <div className="lg:col-span-7">
                {/* THE SECTION MARKER (client, 2026-09-17: "can we have
                   another proper heading here ... this line looks bad").

                   It was a pill chip followed by a hairline stretching five
                   hundred pixels to nowhere — two devices doing one job, and
                   the rule in particular had nothing to join. A rule that
                   ends in empty space is a rule that is only there to fill
                   it, which is the same fault as the empty column was.

                   What replaces it is two things this site already owns: a
                   short gold rule, exactly the one set above the quote in the
                   arch beside this, and the gold mono label used as the
                   eyebrow on every other section of the site
                   (annual-reports, the partner strip, the imams on
                   /bonnetider). Stacked, they are also precisely how
                   islamic.no marks its sections — the one detail of theirs
                   worth taking.

                   His text is unchanged: still aboutPage.historyChip. */}
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
                  <span aria-hidden className="mb-5 block h-px w-10 bg-gold-deep/50" />
                  {t('historyChip')}
                </p>

                {/* Unchanged from the version he approved: the headline runs
                   at display size on its own measure, the prose keeps a
                   reading measure under it. */}
                <h2 className="mt-7 max-w-[17ch] font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1.02] tracking-[-0.02em] text-balance text-ink">
                  {t('historyHeading')}
                </h2>

                <div className="mt-9 max-w-[56ch] space-y-6 text-[clamp(1rem,1.15vw,1.125rem)] leading-relaxed text-ink-60">
                  {/* FOUR paragraphs again. p3 (the royal visit) was cut
                     here on 2026-09-17 as "a fine fact, not the point of an
                     About page" — OUR editorial call, not the client's — and
                     Tekst (endelig) Sept 2026 prints the section with the
                     royal visit in it and a fourth paragraph after it. His
                     text is the text. */}
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
              </div>

              {/* ── the arch, carrying the quote ───────────────────────
                 Lifted from /om-oss with its treatment intact — same source,
                 same 45% opacity, same sepia grade, same paper veil over it,
                 same masked foot so the shape dissolves instead of ending on
                 an edge. It is faint by design: it is a ground for the quote,
                 not a photograph competing with one.

                 WHAT IS DIFFERENT HERE: on /om-oss the arch is absolutely
                 positioned at -z-10 behind a stats card, with the quote in a
                 13rem column beside it — machinery that exists because it has
                 to dodge the card. With the card gone the arch can simply BE
                 the column, and the quote can sit on it where it belongs.
                 Fewer parts, same picture.

                 Hidden below lg: at phone width a 19rem arch under the prose
                 is a tall pale rectangle doing nothing, and the quote reads
                 perfectly well as a plain pull quote — which is what it
                 becomes there. */}
              {/* CENTRED AGAINST THE STORY, not pinned to its top.
                 The grid is items-start, so the arch used to begin level
                 with the heading — fine when the story was two paragraphs.
                 Tekst (endelig) took it to four, and the column grew to
                 886px against the arch's 544, leaving 342px of empty sage
                 under it and the picture stranded at the top.

                 self-center rather than a typed margin: it splits whatever
                 slack there is, so the balance survives the next time the
                 copy changes length. */}
              <aside className="lg:col-span-5 lg:self-center">
                <div className="relative ms-auto hidden w-full max-w-[23rem] lg:block">
                  <div
                    aria-hidden
                    className="relative h-[34rem] w-full overflow-hidden rounded-t-[11rem] border border-gold-deep/20"
                    style={{
                      maskImage:
                        'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 52%, rgba(0,0,0,0) 100%)',
                      WebkitMaskImage:
                        'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 52%, rgba(0,0,0,0) 100%)',
                    }}
                  >
                    <Image
                      src="/photos/arch-light.jpg"
                      alt=""
                      fill
                      sizes="304px"
                      className="object-cover opacity-[0.78]"
                      style={{ filter: 'saturate(0.38) sepia(0.32) contrast(1.08) brightness(1.0)' }}
                    />
                    <span aria-hidden className="absolute inset-0 bg-paper-2/10" />
                  </div>

                  {/* On the arch, in its upper third — where the photograph
                     is brightest and before the mask starts taking it away. */}
                  <figure className="absolute inset-x-0 top-[6.5rem] m-0 px-11">
                    <span aria-hidden className="block h-px w-10 bg-gold-deep/40" />
                    <blockquote className="mt-5 font-serif text-[1.15rem] italic leading-relaxed text-ink">
                      {`«${t('quote')}»`}
                    </blockquote>
                  </figure>
                </div>

                {/* Phone and tablet: the quote alone, as a pull quote. */}
                <figure className="m-0 lg:hidden">
                  <span aria-hidden className="block h-px w-10 bg-gold-deep/40" />
                  <blockquote className="mt-5 font-serif text-[1.05rem] italic leading-relaxed text-ink-60">
                    {`«${t('quote')}»`}
                  </blockquote>
                </figure>
              </aside>
            </div>
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
        tone="paper-2"
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
                      <span className="mt-1.5 block font-serif text-[1.0625rem] leading-snug text-ink">
                        {f.detail}
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
