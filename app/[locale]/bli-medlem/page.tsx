import Image from 'next/image';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { Accent } from '@/components/accent';
import { MembershipSignup } from '@/components/membership-signup';
import { Section, SectionBody } from '@/components/primitives';
import { PageBand } from '@/components/page-band';
import { RosetteMark } from '@/components/marks';
import { FigureIcon, type FigureIconName } from '@/components/figure-icons';

// The join flow, on its own route.
//
// /medlemskap explains what membership IS; this is where someone actually
// signs. Splitting them means the page a "Become a member" button lands on
// is a form, not an essay — the meeting's complaint was that joining is too
// difficult, and the first thing a would-be member met was three tiers of
// prose.
//
// It used to open on a dusk split borrowed from the homepage hero: headline
// left, card right, both inside one dark section. That was the site's
// conversion shape at the time, but every other section page has since moved
// onto the band — photograph across the top carrying the headline, then the
// working part below it on its own ground (client, 2026-09-08). The content
// is unchanged; only the shape is.
//
// The three points, rewritten 2026-09-16 to the client's four asks: say it
// is free, say everyone can vote, say it supports the mosque project.
//
// They used to read updates / vote / renewal, which described a membership
// that had three prices and two kinds of vote. With one free membership that
// everyone votes in, the honest order is: what it costs (nothing), what it
// gives you (a vote), what it does (funds the building).
//
// `support` carries the argument the client's own reference makes — iman.no:
// "Du kan kun være medlem i ett trossamfunn … Gjør et bevisst valg i hvor du
// vil at statsstøtten skal gå." Norwegian trossamfunn draw state and
// municipal tilskudd per registered member and a person counts in exactly
// one, so a free membership still funds the building — per head, from the
// public purse rather than from the member. That is what makes "free" and
// "supports the project" one argument instead of two.
// FLAGGED: it is a claim about Rabita's funding. Confirm the wording.
//
// updates/renewal stay in the message files untouched — the service-page
// aside renders updates/vote/renewal and would break if they went.
// The client's four (Tekst (endelig) Sept 2026, «Hvorfor bli medlem?»):
// Gratis medlemskap, Din stemme teller, Du bidrar til fellesskapet,
// Tilgang til aktiviteter og tjenester. The old `updates` and `renewal`
// points are not on his list and were dropped from the message files with
// it — his four replace the set, they do not extend it.
// His four, in his order (Tekst (endelig), «Hvorfor bli medlem?»).
const POINTS = ['free', 'vote', 'support', 'access'] as const;
// Phones: «Din stemme teller» removed (user, 2026-10-10: "remove your vote
// counts from the bli medlem points in 1st section"). Laptop keeps POINTS —
// that page stays as it was unless asked.
const PHONE_POINTS = ['free', 'support', 'access'] as const;
// Laptop layout (the pre-redesign page) only.
const POINT_ICONS: FigureIconName[] = ['check', 'people', 'building'];

const UTMELDING_TOOL = 'https://utmelding.rabita.no';
// Brønnøysund's «Min side», where a person sees which faith community they
// are registered in — the page the client's own text sends people to
// (membershipHub.dual.p4: «Sjekk Min side hos Brønnøysundregistrene»). The
// old link went to brreg.no's front page.
const BRREG_MINSIDE = 'https://person.brreg.no/nb/minside';

export default async function JoinPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'joinPage' });
  const tm = await getTranslations({ locale, namespace: 'membership' });
  const ts = await getTranslations({ locale, namespace: 'storyPages' });
  // membershipHub — the copy that used to live on /tjenester/medlemskap,
  // which now redirects here. `tm` is already the `membership` namespace.
  const th = await getTranslations({ locale, namespace: 'membershipHub' });

  // ── LAPTOP ONLY from here: the pre-redesign page's three signposts. ──
  // The three signposts, in his own order from the 2026-09-18 ticket:
  // "1. Utmelding, 2. Dobbelt medlemskap, 3. Donasjon."
  const BRREG = 'https://www.brreg.no/';
  const ROWS: {
    key: 'leave' | 'dual' | 'give';
    heading: string;
    body: string;
    links: { label: string; href: string; external?: boolean }[];
  }[] = [
    {
      key: 'leave',
      heading: th('leave.heading'),
      body: th('leave.body'),
      links: [{ label: th('leave.cta'), href: `/${locale}/utmelding` }],
    },
    {
      key: 'dual',
      heading: th('dual.heading'),
      // p1 only. p2/p3/p4 are 81 words on how the grant is split; /utmelding
      // carries that in full and the first link below goes there.
      body: th('dual.p1'),
      links: [
        { label: th('dual.toolCta'), href: UTMELDING_TOOL, external: true },
        { label: th('dual.checkCta'), href: BRREG, external: true },
      ],
    },
    {
      key: 'give',
      heading: th('give.heading'),
      body: th('give.body'),
      links: [{ label: th('give.cta'), href: `/${locale}/gi-en-gave` }],
    },
  ];


  return (
    <main>
      {/* story-members.webp is 2000x860 — natively band-shaped at 2.33:1, so
         the 4.6:1 crop takes half its height rather than a third, and 1.81
         source pixels per CSS pixel across a 1104px plate is exactly the
         density the prayer band was calibrated against. It is the one
         photograph in the library that is literally of members; /medlemskap
         carries the same frame, which is right for a pair of pages that are
         the explainer and the sign-up for one thing.

         30%, not centre: at 4.6:1 a centred crop takes the row of faces
         across their chins. The headline keeps membership.headline with its
         gold accent, and the band's lede is ledeShort — the phone-length
         line that was already written for exactly this job. The full lede
         moves down beside the card. No new copy. */}
      <PageBand
        kicker={ts('pages.membership.eyebrow')}
        title={tm.rich('headline', {
          em: (chunks) => <Accent surface="dusk">{chunks}</Accent>,
        })}
        lede={t('ledeShort')}
        // ── PHONES: A BIGGER HEADLINE AND ONE LINE (user, 2026-10-10:
        // "make the heading better, remove sub text of you get a vote, and
        // make heading and the one line text bigger and better and eye
        // catching"). The headline is the client's own («NY TEKST: Din
        // stemme former fremtiden vår.», Tekst (endelig)), so only its size
        // changes. The line under it is ALSO his — the last sentence of his
        // own hero copy, «Det er gratis å bli medlem, og det tar bare ett
        // minutt.» — replacing ledeShort, which led with the vote. md: arms
        // restate the band's defaults, so laptops are unchanged.
        ledePhone={t('v2.heroLine')}
        // «BLI MEDLEM» over «MEDLEMSKAP» on phones, and larger (user,
        // 2026-10-10: "bli-medlem better? and also make it larger, so it also
        // stands out and rest heading a little smaller maybe so well placed 3
        // things"). The label says what the page is FOR; the headline steps
        // down 2.55 → 2.2rem so label, headline and line read as three.
        // The caption below is laptop-only; hide its wrapper too, or its
        // 24px margin sits empty between the curve and the first section.
        childrenClass="max-md:hidden"
        kickerPhone={t('formEyebrow')}
        kickerClass="max-md:text-[0.9375rem] max-md:font-medium max-md:tracking-[0.2em]"
        titleClass="max-md:mt-3 max-md:text-[2.2rem] max-md:leading-[1.04] max-md:tracking-[-0.02em] md:text-[clamp(1.65rem,3vw,2.3rem)]"
        ledeClass="max-md:mt-4 max-md:text-[1.0625rem] max-md:font-medium max-md:text-paper/90"
        image="/photos/story-members.webp"
        alt={ts('pages.membership.caption')}
        layout="over"
        mark="rosette"
        tone="warm"
        objectClass="object-[50%_30%]"
        padBottom="none"
        // Phones: the plate hands over on the site's curve, into the paper
        // directly beneath it (sampled #FAF8F4 under the plate at 390).
        footCurve="#FAF8F4"
      >
        {/* The photo caption under the band — laptop only; the phone
           redesign removed it (it floated between the band and the form). */}
        <p className="hidden font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-60 md:block">
          {ts('pages.membership.caption')}
        </p>
      </PageBand>

      {/* ── PHONES: THE REDESIGN · LAPTOP: THE PAGE AS IT WAS ─────────────
         User, 2026-10-10: the redesign below was asked for on phones
         (against islamic.no's phone page); it had been extended to laptop
         without anyone asking, and the user said "Revert laptop". So below
         md the redesign renders, and from md the page renders exactly as it
         stood at d012317 — same markup, same copy. One exception, on
         purpose: the form card's ring stays gold. It was ring-gold-deep/12,
         which Tailwind does not generate, so it fell back to the default
         blue — a bug, not a design. Two trees, as ServiceOverviewPhone
         already does for the service pages. */}
      <div className="md:hidden">
      {/* ════════════════════════════════════════════════════════════════
         THE REDESIGN (user, 2026-10-10, against islamic.no/blimedlem: "when
         we made ours shorter, it isn't making much sense … I want a proper
         redesign which also makes sense … very modern cards and points, like
         in service pages").

         What was wrong, measured on a phone: the form came BEFORE the
         reasons to join; the four reasons had been cut to bare labels; a
         photo caption floated between the band and the form; "gratis" was
         said four times; and the longest text on the page (~150 words,
         «Tre ting du kan trenge») was for people who are already members.

         The order now answers the questions in the order a visitor has
         them:  why → what it costs → am I already a member somewhere? →
         the form → leaving → questions. Every sentence is the client's own
         or a shortening of it; the cards use the service pages' language
         (ruled gold-hairline cards, the rotated-square bullet).
         ════════════════════════════════════════════════════════════════ */}

      {/* ── WHY ─────────────────────────────────────────────────────────
         His four reasons (Tekst (endelig), «Hvorfor bli medlem?»), three as
         cards and the fourth — Gratis medlemskap — as the card that ends
         the row, set apart, because "what does it cost" is the one a reader
         checks first. Each card is a title and one line. */}
      <Section tone="paper" className="pt-4">
        <SectionBody>
          <p className="flex items-center gap-3 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
            <span aria-hidden className="h-px w-6 shrink-0 bg-gold-deep/50" />
            {t('v2.whyEyebrow')}
          </p>
          <h2 className="mt-4 max-w-[20ch] font-serif text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.1] tracking-[-0.01em] text-balance text-ink">
            {t('headline')}
          </h2>

          {/* POINTS, NOT CARDS (user, 2026-10-10: "at start where small
             points, I don't think cards needed there — it shows too much
             usage of cards"). The service pages' "Hva vi tilbyr" register:
             the rotated gold square, a serif title, one line — no box. His
             four, in his order (Tekst (endelig), «Hvorfor bli medlem?»).
             Hairlines between them on a phone so four short items still
             read as a list; four across from lg. */}
          <ul className="mt-7 divide-y divide-rule border-y border-rule sm:grid sm:grid-cols-2 sm:gap-x-10 sm:divide-y-0 sm:border-0 lg:mt-10 lg:grid-cols-4 lg:gap-x-8">
            {PHONE_POINTS.map((k) => (
              <li key={k} className="flex items-start gap-3.5 py-5 sm:py-4">
                <span aria-hidden className="mt-[0.6rem] block h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-deep" />
                <span className="block min-w-0">
                  <span className="block font-serif text-[1.2rem] leading-snug text-ink">{t(`points.${k}.title`)}</span>
                  <span className="mt-1 block text-[15px] leading-relaxed text-ink-60">{t(`v2.cards.${k}`)}</span>
                </span>
              </li>
            ))}
          </ul>

          {/* The «Vil du gi mer? … Gi en gave →» line that stood here is
             removed (user, 2026-10-10: "remove this also"). The site-wide
             Doner button stays in the header. */}
        </SectionBody>
      </Section>

      {/* ── JOIN ────────────────────────────────────────────────────────
         The card the user picked out on islamic.no — «Member elsewhere?» —
         sits BESIDE the form on a laptop and above it on a phone, because
         it is a question to settle before signing: a person counts in one
         faith community, and someone listed twice funds neither (the
         client's own ticket, 2026-09-18, «dobbelt medlemskap»). */}
      <Section id="meld-inn" tone="paper-2" className="relative isolate overflow-hidden">
        <div aria-hidden className="star-texture star-texture--light pointer-events-none absolute inset-0 -z-10" />
        <SectionBody>
          <div className="grid items-start gap-5 lg:grid-cols-12 lg:gap-8">
            {/* Form FIRST, the dual-membership card under it (user,
               2026-10-10: "bring form up in place of this card"). */}
            <div className="lg:col-span-8">
              <MembershipSignup />
            </div>
            <aside className="relative isolate overflow-hidden rounded-[1.75rem] bg-dusk p-7 text-paper sm:p-8 lg:col-span-4">
              <RosetteMark
                aria-hidden
                className="pointer-events-none absolute -bottom-12 -end-12 -z-10 h-56 w-56 text-paper/[0.06]"
              />
              <p className="flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-gold">
                <span aria-hidden className="h-px w-5 shrink-0 bg-gold/60" />
                {th('dual.eyebrow')}
              </p>
              <h3 className="mt-4 font-serif text-[1.55rem] leading-[1.15] text-paper">{t('v2.elsewhere.title')}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-paper/75">{t('v2.elsewhere.body')}</p>
              <a
                href={BRREG_MINSIDE}
                target="_blank"
                rel="noreferrer"
                className="group mt-6 flex min-h-12 items-center justify-between gap-3 rounded-full bg-gold px-5 text-[15px] font-semibold text-dusk transition-colors hover:bg-paper"
              >
                {t('v2.elsewhere.check')}
                <span aria-hidden className="text-[1.05rem] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100">&#8599;</span>
              </a>
              <a
                href={UTMELDING_TOOL}
                target="_blank"
                rel="noreferrer"
                className="group mt-4 inline-block text-[14px] font-medium leading-snug text-paper/85 underline decoration-paper/30 underline-offset-4 hover:text-gold"
              >
                {th('dual.toolCta')}
                {/* A plain inline span opened by a no-break space, so the
                   arrow can never wrap onto a line of its own. */}
                <span aria-hidden>&nbsp;{locale === 'ar' ? '\u2190' : '\u2192'}</span>
              </a>
            </aside>
          </div>
        </SectionBody>
      </Section>

      {/* ── AFTER: LEAVING, AND QUESTIONS ───────────────────────────────
         Two short cards in place of «Tre ting du kan trenge» (~150 words).
         Leaving keeps its own page, which carries the full explanation;
         donation moved up into the free card. */}
      <Section tone="paper" className="pt-10 pb-14 md:pt-14 md:pb-section-md">
        <SectionBody>
          {/* Plain text, no card (user, 2026-10-10: "don't keep this in card,
             the leaving part"). The change of ground from the section above
             is the separation; no rule needed. */}
          <div>
            <div className="flex flex-col">
              <p className="flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-gold-deep">
                <span aria-hidden className="block h-2 w-2 shrink-0 rotate-45 bg-gold-deep" />
                {th('leave.eyebrow')}
              </p>
              <h3 className="mt-4 font-serif text-[1.35rem] leading-snug text-ink">{th('leave.heading')}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-60">{t('v2.leave.body')}</p>
              <Link
                href={`/${locale}/utmelding`}
                className="group mt-5 inline-flex w-fit items-center gap-2 text-[15px] font-semibold text-gold-deep underline decoration-gold-deep/40 underline-offset-4 hover:text-ink"
              >
                {th('leave.cta')}
                <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180">&rarr;</span>
              </Link>
            </div>

            {/* The «Har du spørsmål?» card that stood here is removed (user,
               2026-10-10: "remove this"). */}
          </div>
        </SectionBody>
      </Section>
      </div>

      <div className="hidden md:block">
      {/* The working part, rebuilt to the client's reference (2026-09-13:
         "warm ivory background, subtle Islamic geometric texture, soft
         architectural imagery, elegant spacing, refined typography").
         The band above is untouched, as asked.

         The three files that came with the brief are REFERENCES, not
         assets: the mosque interior is 255px wide and the texture 109px —
         crops out of the mockup itself, which would be mush at the size
         either is used. So the language is rebuilt from what the site
         already owns and what is actually of this building:

           the geometric texture   .star-texture, the Rabita rosette tiled
                                   at 220px and 1.5% — already the site's
                                   own, and already on this section
           the mosque interior     proj-main-hall.webp, the HLF Arkitekter
                                   render of the real prayer hall, at 2000px

         The interior appears twice: once very faintly behind the whole
         section, once properly inside the panel. */}
      <Section tone="paper-2" className="relative isolate overflow-hidden !bg-transparent">
        {/* The client's mosque interior, as the section's own ground
           (2026-09-13). Full-bleed, cover, centred — so it CROPS at every
           width rather than stretching, and never exposes an edge.

           object-position is not centre but 60% across: the photograph is
           composed with its light on the left and its architecture on the
           right, and 60% keeps the windows and the mihrab in frame on a
           phone, where a centre crop would show a wall.

           Over it, an ivory scrim that is heaviest where the words are.
           Left-to-right on a wide screen, because the column of type is on
           the left and the panel — which carries its own paper — is on the
           right. Top-to-bottom on a phone, where the two stack. Without it
           the heading sits on a photograph of a window. */}
        <Image
          src="/photos/membership-bg.webp"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          loading="eager"
          className="-z-20 select-none object-cover object-[60%_50%]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20 md:hidden"
          style={{ background: 'linear-gradient(180deg, rgba(247,244,238,0.93) 0%, rgba(247,244,238,0.88) 55%, rgba(247,244,238,0.95) 100%)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20 hidden md:block"
          style={{ background: 'linear-gradient(90deg, rgba(247,244,238,0.96) 0%, rgba(247,244,238,0.9) 34%, rgba(247,244,238,0.72) 62%, rgba(247,244,238,0.66) 100%)' }}
        />
        {/* The gold blur that used to warm this section is gone: it existed
           because the ground was a flat paper-2, and the photograph does
           that job now. It was also the one thing on the page wider than a
           phone — 544px of it on a 379px screen, clipped but pointless. */}
        {/* Its own childless layer: .star-texture sets `> * { position:
           relative }` and would drop any absolutely positioned sibling into
           the flow. */}
        <div
          aria-hidden
          className="star-texture star-texture--light pointer-events-none absolute inset-0 -z-10"
        />
        {/* The seam at each end. This used to run paper -> paper-2, two
           opaque colours, which painted a solid block over the top of the
           photograph and left a hard horizontal edge where it stopped. Both
           now fade to TRANSPARENT, so the picture arrives out of the section
           above it and leaves into the one below instead of starting and
           stopping. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-paper to-transparent md:h-40"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-paper to-transparent md:h-32"
        />
        <SectionBody>
          {/* The card is still first in DOM order on a phone — that was the
             fix for "joining is too difficult", and it survives the reshape.
             On desktop it moves to the right and the argument sits beside
             it. */}
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="order-2 lg:order-1 lg:col-span-4 lg:self-center">
              <p className="flex items-center gap-3 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
                <span aria-hidden className="h-px w-6 shrink-0 bg-gold-deep/50" />
                {ts('pages.membership.eyebrow')}
              </p>
              {/* One sentence, and nothing under it (client, 2026-09-13:
                 "reduce some text, not so overly written" — on a phone this
                 column ran eight lines of heading before anything else).
                 
                 What came out was duplication, not content. The heading's
                 second sentence was "it brings the newsletter and
                 invitations to what happens in the building"; the first
                 point below it reads "the newsletter, and word of what is
                 happening in the building". The paragraph under it said a
                 voting membership elects the board; the second point says
                 voting members elect the board. The column now states the
                 claim once and lets the three points carry the detail. */}
              <h2 className="mt-5 max-w-[16ch] font-serif text-[clamp(1.8rem,3.4vw,2.6rem)] leading-[1.12] text-balance text-ink">
                {t('headline')}
              </h2>

              <ul className="mt-9 grid gap-x-8 gap-y-7 sm:grid-cols-3 lg:grid-cols-1">
                {POINTS.map((k, i) => (
                  <li key={k} className="flex items-start gap-4">
                    <span
                      aria-hidden
                      className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-deep/[0.09] text-gold-deep ring-1 ring-gold-deep/15"
                    >
                      <FigureIcon name={POINT_ICONS[i] ?? 'check'} className="h-5 w-5" />
                    </span>
                    <span className="block min-w-0">
                      <span className="block font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-60">
                        {t(`points.${k}.title`)}
                      </span>
                      {/* The body is md-and-up (client, Mobilversjon
                         2026-10-06: "det er veldig mye tekst, spesielt på
                         mobilversjonen"). The four titles — Gratis
                         medlemskap, Din stemme teller, Du bidrar til
                         fellesskapet, Tilgang til aktiviteter og tjenester —
                         are each a complete reason on their own, and 62
                         words of qualification under them is the single
                         largest block of prose between a reader and the
                         form. Nothing is deleted: it returns at md, where
                         there is a column for it. */}
                      <span className="mt-1.5 hidden text-[15px] leading-snug text-ink md:block">
                        {t(`points.${k}.body`)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-10 flex items-center gap-4 text-[13px] text-ink-60">
                <span aria-hidden className="h-px w-10 shrink-0 bg-gold-deep/40" />
                {t('members', {
                  // members + 1: "become member number X" is the NEXT number,
                  // not the current count. Derived so it cannot drift from
                  // the 4 344 the carousel and the Om oss figures print.
                  count: (CAMPAIGN.members + 1).toLocaleString(locale === 'ar' ? 'ar-EG' : locale === 'en' ? 'en-GB' : 'nb-NO'),
                })}
              </p>
            </div>

            <div className="order-1 lg:order-2 lg:col-span-8 lg:self-center">
              <MembershipSignup />
            </div>
          </div>
        </SectionBody>
      </Section>

      {/* Dobbelt medlemskap (client, ticket "Nettside medlemskap",
         2026-09-18): "Når det gjelder 'bli medlem' fanen. Så ønsker jeg litt
         info om dobbelt medlemsskap. Og at det er viktig at de melder seg ut
         av annet tross samfunn også. Link gjerne til utmelding.rabita.no."

         One short block, below the form and above the closing section, in
         the register's own voice: the grant counts a person once, so a new
         member who is still on another community's list has to leave it
         too. The first link is the tool that does exactly that
         (utmelding.rabita.no — leaving OTHER communities, not Rabita); the
         second is the longer explanation on the membership page. "Litt
         info", so it is a paragraph, not a section with a picture. */}
      {/* ── THE DUAL-MEMBERSHIP SECTION IS GONE (client, Mobilversjon
         2026-10-06: "Finnes nå to forskjellige sider. Bør bare være en. OG
         det er veldig mye tekst") ──────────────────────────────────────

         It said the same thing as membershipHub.dual on
         /tjenester/medlemskap, which is now folded into this page as row 02
         of "Allerede medlem?" below — better, because that version carries
         both actions (the utmelding tool and the Brønnøysund check) where
         this one carried a 41-word paragraph and two links.

         joinPage.dual.* stays in all three locales, unused. */}

      {/* ── ALLEREDE MEDLEM? — THE THREE SIGNPOSTS, FOLDED IN ───────────
         Client, Mobilversjon 2026-10-06: "Finnes nå to forskjellige sider.
         Bør bare være en."

         /tjenester/medlemskap was three blocks — utmelding, dobbelt
         medlemskap, donasjon — on a full service-page template with its own
         hero, offer heading and lede. That page now redirects here and its
         three blocks arrive as this one compact register.

         WHY IT SITS BELOW THE FORM. All three are for people who are
         ALREADY members: leaving, being registered twice, giving on top.
         Above the form they would answer questions a non-member has not
         asked yet, in front of the one thing the page exists to do.

         WHAT CAME ACROSS AND WHAT DID NOT. Each row keeps its number, label,
         heading and actions. dual.p2/p3/p4 did not — 81 words explaining how
         the state grant is split, which /utmelding carries in full and row
         02 links to. dual.p1 stays because it is the fact that makes the row
         make sense at all.

         The hub's own hero, offerTitle and offerLede are not here either:
         they introduced a page that no longer exists. membershipHub.* stays
         whole in all three locales. */}
      <Section pad="tight" tone="paper">
        <SectionBody>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
            {th('offerTitle')}
          </p>
          <ul className="mt-6 divide-y divide-rule border-y border-rule">
            {ROWS.map(({ key, heading, body, links }) => (
              <li key={key} className="py-6 md:grid md:grid-cols-12 md:gap-8">
                <p className="font-mono text-[0.75rem] tabular-nums tracking-[0.14em] text-gold-deep md:col-span-2">
                  {th(`${key}.index`)}
                </p>
                <div className="mt-2 md:col-span-10 md:mt-0">
                  <h2 className="font-serif text-[1.3rem] leading-tight text-ink">{heading}</h2>
                  <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-ink-60">{body}</p>
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                    {links.map((l) => (
                      <a
                        key={l.label}
                        href={l.href}
                        {...(l.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                        className="group inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold text-gold-deep"
                      >
                        <span className="border-b border-gold-deep/50 pb-1">{l.label}</span>
                        <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">
                          &rarr;
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[14px] text-ink-60">
            {th.rich('contact.cta', {
              a: (c) => (
                <a href={`mailto:${CAMPAIGN.membershipEmail}`} className="font-semibold text-ink underline decoration-gold/70 underline-offset-4">
                  {c}
                </a>
              ),
              email: CAMPAIGN.membershipEmail,
            })}
          </p>
        </SectionBody>
      </Section>

      {/* ── "KJENNER DU DEG IGJEN?" IS GONE (same note) ──────────────────
         Four rhetorical questions — ro til bønn, barnas tilhørighet, et
         fellesskap som inspirerer, lære mer om troen — plus a lede and a
         closing line. Ninety-six words that restate the four reasons above
         as questions, after the reader has already been given them and
         walked past the form.

         It is the one block on this page that argues rather than informs,
         which is what makes it the right thing to lose when he says there is
         too much text. joinPage.recognition.* and the component both stay. */}
      </div>
    </main>
  );
}
