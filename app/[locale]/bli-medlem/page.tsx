import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { Accent } from '@/components/accent';
import { MembershipSignup } from '@/components/membership-signup';
import { Section, SectionBody } from '@/components/primitives';
import { PageBand } from '@/components/page-band';
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
const POINTS = ['free', 'vote', 'support', 'access'] as const;
const POINT_ICONS: FigureIconName[] = ['check', 'people', 'building'];

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

  // The three signposts, in his own order from the 2026-09-18 ticket:
  // "1. Utmelding, 2. Dobbelt medlemskap, 3. Donasjon."
  const UTMELDING_TOOL = 'https://utmelding.rabita.no';
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
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-60">
          {ts('pages.membership.caption')}
        </p>
      </PageBand>

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
      <Section id="meld-inn" tone="paper-2" className="relative isolate overflow-hidden !bg-transparent">
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
    </main>
  );
}
