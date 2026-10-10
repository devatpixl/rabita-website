import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { Accent } from '@/components/accent';
import { MembershipSignup } from '@/components/membership-signup';
import { Section, SectionBody } from '@/components/primitives';
import { PageBand } from '@/components/page-band';
import { RosetteMark } from '@/components/marks';

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
// Three of his four as cards; `free` is the fourth, set apart (see WHY).
const CARDS = ['vote', 'support', 'access'] as const;

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
      />

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
      <Section tone="paper" className="pt-12 md:pt-section-md">
        <SectionBody>
          <p className="flex items-center gap-3 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
            <span aria-hidden className="h-px w-6 shrink-0 bg-gold-deep/50" />
            {t('v2.whyEyebrow')}
          </p>
          <h2 className="mt-4 max-w-[20ch] font-serif text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.1] tracking-[-0.01em] text-balance text-ink">
            {t('headline')}
          </h2>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4 lg:gap-4">
            {CARDS.map((k) => (
              <li
                key={k}
                className="flex items-start gap-4 rounded-[1.25rem] border border-gold-deep/35 bg-paper px-5 py-6 shadow-[0_1px_0_rgba(155,127,74,0.06)] lg:flex-col lg:gap-5 lg:px-6 lg:py-7"
              >
                <span aria-hidden className="mt-[0.55rem] block h-2 w-2 shrink-0 rotate-45 bg-gold-deep lg:mt-0" />
                <span className="block min-w-0">
                  <span className="block font-serif text-[1.2rem] leading-snug text-ink">{t(`points.${k}.title`)}</span>
                  <span className="mt-1.5 block text-[15px] leading-relaxed text-ink-60">{t(`v2.cards.${k}`)}</span>
                </span>
              </li>
            ))}

            {/* The free card: the figure carries it. "0 kr" in the gold of
               the gift ladder's amounts, then the sentence, then the one
               place on the page that asks for more than a membership. */}
            <li className="flex flex-col rounded-[1.25rem] bg-paper-deep px-5 py-6 ring-1 ring-inset ring-gold-deep/20 lg:px-6 lg:py-7">
              {/* dir="ltr": an amount reads "0 kr" in every locale — in Arabic the
                 bidi algorithm otherwise flips it to "kr 0". self-start keeps
                 it on the reading side. */}
              <span dir="ltr" className="self-start font-serif text-[2.6rem] leading-none tabular-nums text-gold-deep">{t('v2.free.figure')}</span>
              <span className="mt-3 block font-serif text-[1.2rem] leading-snug text-ink">{t('v2.free.title')}</span>
              <span className="mt-1.5 block text-[15px] leading-relaxed text-ink-60">{t('v2.free.body')}</span>
              <span className="mt-4 block border-t border-gold-deep/20 pt-4 text-[14px] leading-snug text-ink">
                {t('v2.free.give')}{' '}
                <Link
                  href={`/${locale}/gi-en-gave`}
                  className="group inline-flex items-center gap-1.5 whitespace-nowrap font-semibold text-gold-deep underline decoration-gold-deep/40 underline-offset-4 hover:text-ink"
                >
                  {th('give.cta')}
                  <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180">&rarr;</span>
                </Link>
              </span>
            </li>
          </ul>
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
                <span aria-hidden className="ms-1.5 inline-block transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180">&rarr;</span>
              </a>
            </aside>
            <div className="lg:col-span-8">
              <MembershipSignup />
            </div>
          </div>
        </SectionBody>
      </Section>

      {/* ── AFTER: LEAVING, AND QUESTIONS ───────────────────────────────
         Two short cards in place of «Tre ting du kan trenge» (~150 words).
         Leaving keeps its own page, which carries the full explanation;
         donation moved up into the free card. */}
      <Section tone="paper" className="pt-10 pb-14 md:pt-14 md:pb-section-md">
        <SectionBody>
          <div className="grid gap-3 md:grid-cols-2 md:gap-4">
            <div className="flex flex-col rounded-[1.25rem] border border-gold-deep/35 bg-paper px-6 py-7 shadow-[0_1px_0_rgba(155,127,74,0.06)]">
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

            <div className="flex flex-col rounded-[1.25rem] bg-paper-deep px-6 py-7 ring-1 ring-inset ring-gold-deep/20">
              <p className="flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-gold-deep">
                <span aria-hidden className="block h-2 w-2 shrink-0 rotate-45 bg-gold-deep" />
                {CAMPAIGN.membershipEmail}
              </p>
              <h3 className="mt-4 font-serif text-[1.35rem] leading-snug text-ink">{t('v2.questions.title')}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-60">{t('v2.questions.body')}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                <Link
                  href={`/${locale}/kontakt`}
                  className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-[14px] font-semibold text-paper transition-colors hover:bg-gold-deep"
                >
                  {t('v2.questions.cta')}
                  <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180">&rarr;</span>
                </Link>
                <a
                  href={`mailto:${CAMPAIGN.membershipEmail}`}
                  className="text-[14px] font-medium text-ink underline decoration-ink/30 underline-offset-4 hover:text-gold-deep"
                >
                  {CAMPAIGN.membershipEmail}
                </a>
              </div>
            </div>
          </div>
        </SectionBody>
      </Section>
    </main>
  );
}
