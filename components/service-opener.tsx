import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { PlateFoot } from './plate-foot';
import { SectionBody } from './primitives';
import { Accent } from './accent';
import { cn } from '@/lib/cn';
import { CAMPAIGN } from '@/lib/campaign';
import { SERVICE_CONTACT, SERVICE_IMAGE, SERVICE_STORY, type ServiceKey } from '@/lib/services';

/**
 * The pilot hero, second cut (2026-09-28, same evening).
 *
 * THE FIRST CUT WAS A SHORTER VERSION OF THE SAME THING: a type column on
 * cream with the photograph ghosted on the end edge, and then five more
 * cream bands under it, each an eyebrow over a heading over grey text.
 * Rejected in-house before the client saw it: "six bands, one voice". The
 * page had no moment.
 *
 * This is the moment. The photograph runs the full measure and most of
 * the first screen, the way islamic.no/hajj opens — the page he sent as
 * the reference — with the words standing on it in paper white and the
 * accent in the photo gold.
 *
 * SAME FOUR STRINGS. title / body print here; offerTitle / offerLede
 * print in ServiceOverview. The two action labels are detail.request and
 * detail.write.
 *
 * The scrim is two gradients: bottom-up so the strip and the lede sit on
 * near-solid dusk, and start-to-end so the title's column is dark while
 * the far side of the picture keeps its light. page-band.tsx uses the
 * same pair for the same reason. Accent surface="photo" — the brighter
 * gold, because the ground under the italic is a scrim, not flat dusk.
 *
 * The title rule from the 09-23 opener holds: <em> becomes a block only
 * when the title opens with it, decided per locale from the raw string.
 */
// ── WHERE A PORTRAIT IS CROPPED TO, IN THE WIDE HERO ─────────────────────
// Six page photographs are portrait (3:4 or 4:5). In a 1440-wide hero the
// box is roughly 2.2:1, so object-cover shows about a third of the frame's
// height, and the objectClass tuned for the old square plate put that band
// through the torsos — on janaza the heads were gone entirely (user,
// 2026-09-29, with a screenshot). Each value below is the band that keeps
// the subject, read off the source file:
//   janaza     rows of men, heads at 28–40% of the height       → 25%
//   shahada    the caller's face at 15–35%                        → 22%
//   hajj-umrah the Kaaba's body at 25–65%, skyline above it       → 45%
//   koran      the teacher at the board 10–45%, pupils below      → 35%
//   counselling hands and cups at 40–65%                          → 45%
// Landscape sources keep SERVICE_STORY's own objectClass. On a phone the box
// is portrait and shows most of the frame, so these barely move anything.
// Per-service vertical steer, for PORTRAIT sources only.
//
// ── WHY THREE ENTRIES LEFT ON 2026-09-30 ──────────────────────────────────
// Every number here was measured against a 4:5 file. In a wide box a tall
// source is cropped on its height, and these push the visible band up so the
// subject is not cut off at the chin.
//
// shahada, janaza and koran all became landscape on 2026-09-30, and a number
// tuned for a 0.8 source is actively wrong on a 1.33 one: 22% on the new
// shahada file put the band on the crown of his head, which is how the client
// saw it. They now fall through to their own objectClass, which is
// object-center, and centre is right for a landscape source in a wide box.
//
// skole lost its entry on 2026-09-29 for the same reason.
//
// What is left is the services still on portrait files. counselling has no
// landscape frame to move to; hajj-umrah was never changed.
const HERO_POSITION: Partial<Record<ServiceKey, string>> = {
  // hajj-umrah lost its entry on 2026-09-30 when its source became a 1.8
  // landscape — the same reason skole, shahada, janaza and koran lost theirs.
  counselling: '50% 45%',
};

export async function ServiceOpener({ s, crumb }: { s: ServiceKey; crumb: string }) {
  const t = await getTranslations('servicesIndex');
  const locale = await getLocale();
  const rtl = locale === 'ar';

  // SERVICE_STORY is Partial; every service has an index card image, so a
  // service added before its page photograph arrives still gets a picture.
  const story = SERVICE_STORY[s] ?? { src: SERVICE_IMAGE[s], objectClass: 'object-center' };
  const rawTitle = t.raw(`items.${s}.title`) as string;
  const plainTitle = rawTitle.replace(/<\/?em>/g, '');
  const shortTitle = plainTitle.split('(')[0]!.trim();
  const emLeads = /^\s*<em>/.test(rawTitle);
  const email = SERVICE_CONTACT[s]?.email ?? CAMPAIGN.contactEmail;

  return (
    <section className="relative isolate overflow-hidden bg-dusk text-paper">
      {story && (
        <div aria-hidden className="absolute inset-0">
          {/* Two sources where a service has one (see SERVICE_STORY.srcPhone).
             The wide file is hidden AND unlabelled on phones so a screen
             reader is offered one picture, not two. */}
          {story.srcPhone && (
            <Image
              src={story.srcPhone}
              alt=""
              fill
              priority
              sizes="100vw"
              className={cn('object-cover md:hidden', story.objectClassPhone ?? story.objectClass)}
              style={{ filter: 'saturate(0.8) contrast(1.05) brightness(0.82)' }}
            />
          )}
          <Image
            src={story.src}
            alt=""
            fill
            priority
            sizes="100vw"
            // A shade darker and quieter than the plate treatment: white
            // type has to hold on it, and a wedding photograph at full
            // saturation under a dusk scrim goes muddy rather than warm.
            style={{
              filter: 'saturate(0.8) contrast(1.05) brightness(0.82)',
              ...(HERO_POSITION[s] ? { objectPosition: HERO_POSITION[s] } : {}),
            }}
            className={cn('object-cover', !HERO_POSITION[s] && story.objectClass, story.srcPhone && 'hidden md:block')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dusk via-dusk/55 to-dusk/10" />
          <div
            className={cn(
              'absolute inset-0 hidden md:block',
              rtl ? 'bg-gradient-to-l from-dusk/85 via-dusk/35 to-transparent' : 'bg-gradient-to-r from-dusk/85 via-dusk/35 to-transparent',
            )}
          />
        </div>
      )}

      <div className="relative flex min-h-[clamp(30rem,70svh,48rem)] flex-col justify-end md:min-h-[clamp(36rem,80vh,50rem)]">
        <SectionBody className="w-full pb-14 pt-28 md:pb-20 md:pt-36">
          <div className="max-w-[40rem]">
            <p className="flex items-center gap-2.5 font-mono text-[0.6875rem] uppercase leading-none tracking-[0.18em] text-gold">
              {crumb}
              <span aria-hidden className="hidden h-px w-3 bg-gold/50 md:inline-block" />
              <span className="hidden text-paper/60 md:inline">{shortTitle}</span>
            </p>

            <h1 className="mt-6 max-w-[16ch] break-words font-serif text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.0] tracking-[-0.02em] text-balance text-paper md:[font-variation-settings:'opsz'_144] md:mt-5 md:text-wrap">
              {t.rich(`items.${s}.title`, {
                em: (chunks) => (
                  <Accent surface="photo" className={emLeads ? 'md:block md:ltr:-ms-[0.03em]' : undefined}>
                    {chunks}
                  </Accent>
                ),
              })}
            </h1>

            <p className="mt-6 max-w-[44ch] text-[clamp(1.0625rem,1.2vw,1.25rem)] leading-[1.55] text-paper/85">
              {t(`items.${s}.body`)}
            </p>

            {/* ── THE MEMBER BENEFITS, IN THE TEXT ─────────────────────
               Client via the user, 2026-09-28: remove the "Bli medlem"
               block and instead say, in the opening text, what becoming a
               member actually gets you — "real benefits". The four named
               here are the four the site already claims on /bli-medlem
               and in the membership tiers (joinPage.points, membership
               .tiers): priority access, newsletter and invitations, the
               vote at the annual meeting, and that ordinary membership is
               free. "Mulighet for stemmerett" rather than "stemmerett",
               because the tiers page ties the vote to the voting tier
               while /bli-medlem gives it to every member — the site
               contradicts itself and this sentence is true under both.
               The link is text, not a button: the page keeps one action. */}
            {/* ── AND SHORTER ON A PHONE (client, 2026-09-30) ───────────
               Four benefits and a link is five lines at 390px, under a
               headline and a lede that have already asked for four more. He
               was right that it is too much there: the hero stops being an
               opening and becomes a paragraph.
               
               The phone line carries two benefits and the link. It named
               "gratis" until 2026-09-30, when the client asked for that out
               of the phone copy and for a benefit back in its place — so the
               newsletter and the invitations return and the price claim goes.
               The vote is the one clause still only on md and up, and on
               /bli-medlem, which is where the link goes. Same sentence,
               fewer clauses — not a different offer. */}
            {(() => {
              const linkFmt = {
                link: (chunks: React.ReactNode) => (
                  <a
                    href={`/${locale}/bli-medlem`}
                    className="font-semibold text-paper underline decoration-gold/70 underline-offset-4 transition-colors hover:text-gold"
                  >
                    {chunks}
                  </a>
                ),
              };
              const cls =
                'mt-4 max-w-[50ch] text-[clamp(0.9375rem,1.05vw,1.0625rem)] leading-[1.55] text-paper/70';
              return (
                <>
                  <p className={cn(cls, 'md:hidden')}>
                    {t.rich('detail.memberNoteShort', linkFmt)}
                  </p>
                  <p className={cn(cls, 'hidden md:block')}>
                    {t.rich('detail.memberNote', linkFmt)}
                  </p>
                </>
              );
            })()}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#enquiry"
                className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-gold px-7 text-[15px] font-semibold text-dusk transition-colors hover:bg-paper"
              >
                {t('detail.request')}
                <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">
                  &rarr;
                </span>
              </a>
              {/* ── ONE ACTION ON A PHONE (client, 2026-09-30) ──────────
                 "1 cta enough which is Send an enquiry". Stacked at 390px
                 the two buttons read as a choice to make before the reader
                 has been told anything, and the second one leaves the site
                 for a mail client. The address is not lost: it is under the
                 form on this same page, in the footer, and behind the
                 floating contact button. From md they sit side by side,
                 where a secondary action costs nothing. */}
              <a
                href={`mailto:${email}`}
                className="inline-flex min-h-12 items-center rounded-full border border-paper/45 px-6 text-[15px] font-semibold text-paper transition-colors hover:border-paper hover:bg-paper/10 max-md:hidden"
              >
                {t('detail.write')}
              </a>
            </div>
          </div>

          {/* The contact strip that ran along the foot here (e-mail,
             address, office hours, requirement) was removed on the user's
             call the same evening. ServiceFacts is kept in the tree; the
             address and mail still reach the reader through the "Skriv til
             oss" action, the line under the form and the footer. */}
        </SectionBody>
      </div>

      {/* ── THE HERO HANDS OVER ON A CURVE, PHONES ONLY ──────────────────
         Client, 2026-09-30, asking whether the wave the other pages use
         would suit the service heroes too. It would, and for the reason it
         suits them: on a phone this is a dark photographic plate meeting a
         cream section on a dead-straight line, which is the one condition
         the curve was drawn for. The mosque project, /aktuelt, the
         apartments and /om-oss all already end this way.

         The fill is the tone of what comes NEXT, not this section's own —
         #FAF8F4 is `paper`, which is ServiceOverviewPhone's first section.

         Absolutely positioned in the bottom 48px, which is empty: the words
         above carry pb-14, so the button clears the curve's highest point.
         Nothing above moves.

         ── AND ON LAPTOPS TOO, TALLER (client, 2026-09-30) ──────────────
         It shipped md:hidden. He asked whether it would suit a wide screen;
         it does, but only if the height grows with the width. 48px across
         390 is a 1:8 arc and reads as a shape; the same 48px across 1920 is
         1:40 and reads as a wobbly edge. 56px is the number: every hero on
         the site clears its lowest element by at least 60px at 1280, 1440
         and 1920, so 56 fits under all of them with room to spare, and 96
         was measured touching the buttons. */}
      <PlateFoot
        fill="#FAF8F4"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] block h-12 w-full md:h-14"
      />
    </section>
  );
}
