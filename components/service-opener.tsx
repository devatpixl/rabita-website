import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { SectionBody } from './primitives';
import { Accent } from './accent';
import { cn } from '@/lib/cn';
import { CAMPAIGN } from '@/lib/campaign';
import { SERVICE_CONTACT, SERVICE_STORY, galleryOrientation, type ServiceKey } from '@/lib/services';

/**
 * The pilot opener (2026-09-28) — what components/service-hero.tsx becomes
 * once the client has approved it on nikah. See SERVICE_PILOT in
 * lib/services.ts for the gate.
 *
 * WHAT CHANGES, AND WHY. The 09-23 opener owned the whole first screen
 * (min-h 100vh − header) and carried five short strings in it: kicker,
 * title, one line, the offer heading and its lede. On a 1440×900 screen
 * that is ~120 words in 780px of height, and the one link in it — "Send
 * henvendelse" — sat at the foot of the column, under the cookie banner
 * on a first visit. The reference he sent (islamic.no/vigsel) opens on
 * title + one paragraph + the contact, and gets to the requirements within
 * one scroll.
 *
 * So: the opener is 62vh, capped, and holds the kicker, the title, the
 * one-line body and two actions. The offer heading and lede move down into
 * ServiceOverview, where they head the description that has never been on
 * the page. The photograph keeps its place on the end edge but loses the
 * top and bottom fades — it now meets the nav and the next section on a
 * clean edge, which is what makes it read as a picture rather than a wash.
 *
 * NOT ONE WORD OF THE FOUR STRINGS CHANGES. title / body still print here;
 * offerTitle / offerLede print in the section below. The two action labels
 * are detail.request (existing) and detail.write (new, three locales).
 *
 * Title rules, crop rules and the phone plate are the 09-23 opener's,
 * unchanged — see that file for the reasoning behind emLeads, object-top
 * on portraits and the ltr-only optical margin.
 */
export async function ServiceOpener({ s, crumb }: { s: ServiceKey; crumb: string }) {
  const t = await getTranslations('servicesIndex');
  const locale = await getLocale();
  const rtl = locale === 'ar';

  const story = SERVICE_STORY[s];
  const rawTitle = t.raw(`items.${s}.title`) as string;
  const plainTitle = rawTitle.replace(/<\/?em>/g, '');
  const shortTitle = plainTitle.split('(')[0]!.trim();
  const emLeads = /^\s*<em>/.test(rawTitle);

  const portrait = story ? galleryOrientation([story.src]) === 'portrait' : false;
  const objectClass =
    story && portrait && story.objectClass === 'object-center' ? 'object-top' : story?.objectClass ?? 'object-center';

  const email = SERVICE_CONTACT[s]?.email ?? CAMPAIGN.contactEmail;

  // Inner edge only. The 09-23 opener also faded the top (0.68) and the
  // foot (to zero) because the picture floated in a section taller than
  // itself; here the box is exactly the section, so both edges are real
  // edges and a fade on either would only cost contrast.
  const fade = `linear-gradient(${rtl ? 'to left' : 'to right'}, transparent 0%, rgba(0,0,0,0.4) 12%, #000 30%)`;

  return (
    <section className="relative md:flex md:min-h-[clamp(30rem,62vh,42rem)] md:items-center">
      {story && (
        <div aria-hidden className="pointer-events-none absolute inset-y-0 end-0 hidden w-[46vw] max-w-[46rem] md:block">
          <div
            className="relative h-full w-full"
            style={{
              WebkitMaskImage: fade,
              maskImage: fade,
            }}
          >
            <Image
              src={story.src}
              alt=""
              fill
              sizes="46vw"
              style={{ filter: 'saturate(0.94)' }}
              className={cn('object-cover', objectClass)}
            />
          </div>
        </div>
      )}

      <div className="w-full pt-10 md:py-14">
        <SectionBody>
          <div className={story ? 'md:w-[52%]' : ''}>
            <p className="flex items-center gap-2.5 font-mono text-[0.6875rem] uppercase leading-none tracking-[0.18em] text-gold-deep">
              {crumb}
              <span aria-hidden className="hidden h-px w-3 bg-gold-deep/45 md:inline-block" />
              <span className="hidden text-ink-40 md:inline">{shortTitle}</span>
            </p>

            <h1 className="mt-7 max-w-[18ch] break-words font-serif text-[clamp(2.25rem,5.5vw,4.25rem)] leading-[1.02] tracking-[-0.02em] text-balance text-ink md:[font-variation-settings:'opsz'_144] md:mt-5 md:max-w-[14ch] md:text-[clamp(2.5rem,4.6vw,4.25rem)] md:leading-[1.0] md:text-wrap">
              {t.rich(`items.${s}.title`, {
                em: (chunks) => (
                  <Accent surface="paper" className={emLeads ? 'md:block md:ltr:-ms-[0.03em]' : undefined}>
                    {chunks}
                  </Accent>
                ),
              })}
            </h1>

            <p className="mt-7 max-w-[56ch] text-[clamp(1rem,1.15vw,1.125rem)] leading-relaxed text-ink-60 md:mt-6 md:max-w-[42ch] md:text-[clamp(1.0625rem,1.2vw,1.2rem)] md:leading-[1.6]">
              {t(`items.${s}.body`)}
            </p>

            {/* Two ways in, weighted. The filled pill is the page's one
               action; the mail link is for the reader who would rather
               write than fill a form — the address islamic.no prints under
               its own form as "eller kontakt oss direkte". */}
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
              <a
                href="#enquiry"
                className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-gold-deep px-7 text-[15px] font-semibold text-paper transition-colors hover:bg-ink"
              >
                {t('detail.request')}
                <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">
                  &rarr;
                </span>
              </a>
              <a
                href={`mailto:${email}`}
                className="inline-flex min-h-11 items-center text-[15px] font-semibold text-ink underline decoration-gold underline-offset-4 transition-colors hover:text-gold-deep"
              >
                {t('detail.write')}
              </a>
            </div>
          </div>

          {/* Below md: the plate, as it was (client, 2026-09-23: "keep
             service pages on phone only, like before"). */}
          {story && (
            <div className={cn('relative mb-2 mt-10 md:hidden', portrait ? 'max-w-[24rem]' : 'max-w-none')}>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 translate-x-2 translate-y-2 rounded-3xl border border-gold-deep/25"
              />
              <div className={cn('relative w-full overflow-hidden rounded-3xl bg-paper-deep ring-1 ring-inset ring-ink/10', portrait ? 'aspect-[4/5]' : 'aspect-[4/3]')}>
                <Image
                  src={story.src}
                  alt={plainTitle}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  style={{ filter: 'grayscale(0.15) saturate(0.9) contrast(1.06)' }}
                />
              </div>
            </div>
          )}
        </SectionBody>
      </div>
    </section>
  );
}
