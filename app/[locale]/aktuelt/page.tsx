import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
import { EventsCalendar } from '@/components/events-calendar';
import { PageBand } from '@/components/page-band';
import { Section, SectionBody, SectionHeading } from '@/components/primitives';
import { Eyebrow } from '@/components/primitives';
import { EVENT_PAGES } from '@/lib/event-pages';


export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'newsPage' });
  // Arrangementer moved in under Aktuelt on 2026-09-15 (client). Same two
  // namespaces /arrangementer renders from, so the cards say exactly what
  // they say there — one set of words, two places that show it.
  const te = await getTranslations({ locale, namespace: 'eventsPage' });
  const tev = await getTranslations({ locale, namespace: 'events' });
  const l = await getLocale();
  const fmt = new Intl.DateTimeFormat(l === 'en' ? 'en-GB' : l === 'ar' ? 'ar-EG' : 'nb-NO', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <main>
      {/* ── THE HEADER, REBUILT 2026-09-16 ─────────────────────────────
         Client: "this page is so bad ... literally worst page right now".

         THREE THINGS WERE WRONG, and the first was a bug. The page opened
         with StoryHero, whose `crumb` is storyPages.crumb — the string "Om
         oss". So the news index announced itself as ABOUT US. It also carried
         that series' "02", which means nothing here: Aktuelt is the first
         item in the navigation and the front door for news and events, not
         the second chapter of somebody else's set.

         And newsPage has had its own eyebrow, title and lede all along —
         "Aktuelt / Siste nytt fra Rabita." — written in all three locales and
         rendering NOWHERE, because the page borrowed the story copy instead.
         That is what is here now. No new strings.

         The 21:9 StoryPlate under it is gone too. It put a full screen of
         photograph between the headline and the first piece of news, its
         caption was about Ramadan in the street rather than about anything on
         the page, and /tjenester and /undervisning both lost the same device
         this week. There are three photographs below in the event cards. */}
      {/* The band the subject pages open on (client, 2026-09-16: "use the
         image at top section like in sub service pages"), so Aktuelt belongs
         to the same family as /tjenester/nikah and the rest.

         ── PHOTOGRAPH AND LAYOUT BOTH CHANGED 2026-09-16 ─────────────────
         Client: "maybe use better photo here". It opened on story-news.webp,
         and the problem was never the crop — it was the SUBJECT. That frame
         is a close-up of two hands holding a takeaway container and a piece
         of bread. A photograph of food, opening a page about the building,
         the annual meeting and what is happening at Rabita.

         visit-doorway-crowd.webp is the congregation arriving: a crowd under
         umbrellas outside the door, the Rabita sign above it, Oslo brick
         behind. It is journalism rather than still life, which is what a news
         index wants, and it is a real photograph — the other native
         band-ratio file, story-facade-night, is an HLF Arkitekter RENDER of
         the building that does not exist yet. SPEC §1: "Renderings for the
         future, photographs for the present." The present is what is news.

         `over` rather than `split`. Split gave the headline its own dusk
         panel with the photograph beside it, which is two objects doing one
         job; over runs the picture the full measure and sets the words into
         it. PageBand already lays an even veil and a directional gradient
         under the type, so the crowd cannot wash it out.

         tone="calm" is the site's own grade — the same
         saturate(0.72) contrast(1.12) brightness(0.9) the event cards below
         carry — so the band and the cards read as one system rather than two
         treatments of the same photograph stock. The old `warm` was for the
         food shot's colour and has nothing to grade here.

         mark="none": the elevation line-drawing sat over an empty dusk panel
         before. Over a street full of people it is clutter.

         ALT IS NEW, and deliberately does not name a street.
         visitPages.pages.visit.captionDoorway exists and reads "Inngangen i
         Calmeyers gate 8a" — but that string belongs to visit-doorway.webp,
         a different frame, and this building cannot be identified from the
         photograph. Calmeyers gate 8 came down in Ramadan 2025 and the
         congregation now rents Sørligata 8a; both are "8a". Naming the wrong
         one in alt text is worse than naming neither. FLAGGED for the client.

         padBottom="none" for the reason the services index used it: the
         section below opens on its own ground and carries the space. */}
      {/* No lede. Client, Tekst (endelig) Sept 2026: "Undertekst
         («Byggingen, arrangementene og saker som gjelder menigheten.») er
         fjernet — skal IKKE vises lenger." newsPage.lede is still written in
         all three locales; only the prop is gone. */}
      <PageBand
        kicker={t('eyebrow')}
        title={t('title')}
        image="/photos/visit-doorway-crowd.webp"
        alt={t('bandAlt')}
        objectClass="object-[50%_58%]"
        layout="over"
        tone="calm"
        mark="none"
        padBottom="none"
      />
      {/* ══ Arrangementer ═══════════════════════════════════════════════
         Client, 2026-09-15: "Flytte «Arrangementer» inn under «Aktuelt»".

         Given his own rule that only Tjenester and Undervisning keep a
         dropdown, "inn under" cannot mean a submenu — it means hierarchy.
         Aktuelt is the front door and the events sit inside it.

         This page had already claimed them, which is the tell: its own
         standfirst reads "Byggingen, ARRANGEMENTENE og saker som gjelder
         menigheten". News and events are the same kind of thing — what is
         happening at Rabita — and they were split across two places, one of
         which nothing on the site linked to.

         ABOVE THE NEWS, deliberately. Events are dated, so they go stale;
         and they are the half with somewhere to go — every card opens a real
         page at /arrangementer/[slug], while the news posts below have no
         article pages and are entries rather than links. Putting the live,
         clickable half first is the honest order.

         The card is /arrangementer's own, not a second dialect of it: same
         grade, same cut corner, same floating date pill, same slow scale,
         whole card as the target. /arrangementer keeps its page — it carries
         the practical facts and the RSVP context this summary does not. */}
      <Section tone="paper-2" className="relative isolate overflow-hidden">
        {/* The arcade behind the cards (client, 2026-09-16: "some image
           like used in services that same use in bg here"). This is
           service-grid.tsx's own device, lifted rather than reinvented:
           svc-hall-bg.webp full-bleed, the site's grade on it, and a paper
           wash light enough that the arcade still reads while the heading
           stays ink on top of it.

           NOT sticky, unlike the services original. There the photograph
           runs behind a long scrolling column and a sticky viewport-height
           box is what keeps it still; this section is one screen of cards,
           so a plain fill does the same job without the positioning
           gymnastics that file had to document.

           object-[70%_50%] from md for the same reason it does there: it
           keeps the arcade off the cards. On a phone the cards cover the
           middle, so the crop moves to the centre where there is something
           to see.

           The gold blur that stood here is gone. It existed to warm a flat
           paper-2 ground; the photograph does that now, and two soft
           treatments would only mud each other. .star-texture goes with it —
           the arcade is the texture. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <Image
            src="/photos/svc-hall-bg.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center md:object-[70%_50%]"
            style={{ filter: 'saturate(0.72) contrast(1.12) brightness(0.9)' }}
          />
          <div className="absolute inset-0 bg-paper/55" />
          {/* The seams. Without them the photograph starts and stops on two
             hard horizontal lines against the page's paper — the exact
             complaint service-grid records from 2026-09-13: "it is so sharp
             of transition from white to this". */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-paper to-transparent md:h-40" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-paper to-transparent md:h-32" />
        </div>
        <SectionBody>
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div>
              <Eyebrow tone="gold-deep">{te('eyebrow')}</Eyebrow>
              <SectionHeading className="mt-4">{te('title')}</SectionHeading>
            </div>
            {/* "Kalender →" (client, Sept 2026), replacing "Alle
               arrangementer". The destination moved with the label: it
               pointed at /arrangementer, which has no calendar on it — the
               calendar is the next section down this same page, so the
               button now scrolls there. A button that names a thing should
               land on that thing. */}
            <Link
              href="#kalender"
              className="group inline-flex min-h-12 shrink-0 items-center gap-2.5 rounded-full border border-ink px-6 py-3 text-[15px] font-semibold text-ink transition-colors hover:border-gold-deep hover:bg-gold-deep hover:text-paper"
            >
              {tev('calendar')}
              <span
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
              >
                &rarr;
              </span>
            </Link>
          </div>

          <ul className="mt-12 grid gap-8 md:grid-cols-3">
            {EVENT_PAGES.map((e) => (
              <li key={e.slug}>
                <Link
                  href={`/${locale}/arrangementer/${e.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] rounded-se-[3rem] bg-paper shadow-[0_1px_2px_rgba(26,26,24,0.04),0_18px_44px_-34px_rgba(26,26,24,0.3)] ring-1 ring-ink/5 transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(26,26,24,0.05),0_26px_60px_-34px_rgba(26,26,24,0.4)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-paper-deep">
                    <Image
                      src={e.image}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 33vw, calc(100vw - 3rem)"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                      style={{ filter: 'saturate(0.72) contrast(1.12) brightness(0.9)' }}
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-dusk/70 to-transparent"
                    />
                    <span className="absolute bottom-3.5 start-3.5 inline-flex items-center rounded-full bg-paper/95 px-3 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.16em] tabular-nums text-ink shadow-[0_2px_10px_-2px_rgba(26,26,24,0.35)] backdrop-blur-sm">
                      <bdi dir="ltr">{fmt.format(new Date(e.date))}</bdi>
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-serif text-card text-ink">{te(`items.${e.key}.title`)}</h3>
                    <p className="mt-2.5 text-[15px] leading-snug text-ink-60">
                      {te(`items.${e.key}.body`)}
                    </p>
                    <span className="mt-auto flex items-center gap-2.5 pt-6 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-ink transition-colors group-hover:text-gold-deep">
                      {te('rsvp')}
                      <span
                        aria-hidden
                        className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                      >
                        &rarr;
                      </span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </SectionBody>
      </Section>

      {/* The month calendar, under the cards it belongs to. It answers the
         question the three cards cannot — "what about the rest of the year"
         — and it is where the Islamic dates live, which the cards have no
         room for. Client-side: it needs a real "today" and these pages are
         statically generated. */}
      <EventsCalendar />

      {/* ── THE NUMBERED NEWS LIST CAME OFF HERE, 2026-09-16 ──────────
         Client: "remove this section". It was three rows — gold numeral,
         mono date, serif headline — carrying "Grunnsteinen er lagt", "Nytt
         bibliotekssamarbeid" and "Årsmøte 2026".

         It was already the weakest thing on the page and for a structural
         reason rather than a visual one: POSTS holds a slug, a date and a
         title and NOTHING ELSE. There are no article pages, so the rows
         could not be links, could not carry a summary without inventing one,
         and led nowhere. An index of three headlines you cannot open is a
         promise the site does not keep.

         What remains is the half that works: the event cards, every one of
         which opens a real page at /arrangementer/[slug].

         NOTHING IS DELETED BUT THE MARKUP. newsPage.items.* and its titles
         stay in all three message files, and POSTS is gone from this file
         only. When article pages exist — a CMS is the §13.5 phase-4 blocker
         — this section comes back as links, with the summaries it never had.

         NOTE FOR THE CLIENT: /aktuelt now shows events and no news. Given
         the news had no articles behind it that is arguably more honest, but
         it is a content decision and it is his. */}
      {/* StoryColophon — the "Til protokollen" ledger — came off this page
         on 2026-09-16. It is the block a journalist or an auditor wants:
         org number, opening hours, the formal record. That is an About or a
         Contact question, and it still closes /kontakt and
         /personvern-og-tilgjengelighet, which are the pages that exist to
         answer it. On a news index it was filler after the news. Its strings
         are untouched under storyPages.colophon. */}
    </main>
  );
}
