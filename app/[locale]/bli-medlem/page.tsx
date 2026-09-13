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
// updates first, vote second. Two of the three memberships on this page
// carry no vote at all, so leading on the ballot mis-sold the free tiers to
// every reader who is here to join rather than to govern.
const POINTS = ['updates', 'vote', 'renewal'] as const;
const POINT_ICONS: FigureIconName[] = ['book', 'check', 'calendar'];

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
           the mosque interior     proj-main-hall.webp, the Norconsult
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
                      <span className="mt-1.5 block text-[15px] leading-snug text-ink">
                        {t(`points.${k}.body`)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-10 flex items-center gap-4 text-[13px] text-ink-60">
                <span aria-hidden className="h-px w-10 shrink-0 bg-gold-deep/40" />
                {t('members', { count: CAMPAIGN.members.toLocaleString('nb-NO') })}
              </p>
            </div>

            <div className="order-1 lg:order-2 lg:col-span-8 lg:self-center">
              <MembershipSignup />
            </div>
          </div>
        </SectionBody>
      </Section>

      {/* The three memberships, unchanged. */}
      <Section tone="paper">
        <SectionBody>
          <div className="grid gap-10 md:grid-cols-12 md:gap-16">
            <h2 className="font-serif text-section text-balance text-ink md:col-span-5">
              {t('explain.heading')}
            </h2>
            <div className="md:col-span-7">
              <dl className="border-t border-rule">
                {/* Name and price share a line on a phone, with the sentence
                   under them. Stacked in three separate rows it took three
                   times the height and stopped reading as a comparison, which
                   is the only reason this table exists. */}
                {(['ordinary', 'voting', 'youth'] as const).map((k) => (
                  <div
                    key={k}
                    className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-b border-rule py-4 md:grid-cols-12 md:items-baseline md:gap-2 md:py-5"
                  >
                    <dt className="col-start-1 row-start-1 font-serif text-[1.05rem] text-ink md:col-span-3 md:text-[1.15rem]">
                      {t(`tiers.${k}.name`)}
                    </dt>
                    <dd className="col-start-2 row-start-1 text-end font-serif text-[1rem] tabular-nums text-gold-deep md:col-span-3 md:col-start-10 md:text-[1.05rem]">
                      {t(`tiers.${k}.price`)}
                    </dd>
                    <dd className="col-span-2 row-start-2 text-[0.9rem] leading-snug text-ink-60 md:col-span-6 md:col-start-4 md:row-start-1 md:text-body md:leading-normal">
                      {t(`tiers.${k}.body`)}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 max-w-prose text-[13px] text-ink-60">{t('explain.note')}</p>
            </div>
          </div>
        </SectionBody>
      </Section>
    </main>
  );
}
