import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Section, SectionBody, SectionHeading } from '@/components/primitives';
import { RequestForm, type RequestSubject } from '@/components/request-form';
import { PageBand } from '@/components/page-band';
import { Accent } from '@/components/accent';
import { CAMPAIGN } from '@/lib/campaign';
import { cn } from '@/lib/cn';
import {
  SERVICE_BAND,
  SERVICE_GROUP_OF,
  SERVICE_IMAGE,
  SERVICE_KEYS,
  SERVICE_STORY,
  type ServiceKey,
} from '@/lib/services';

const VALID = SERVICE_KEYS;

type Subject = ServiceKey;

export function generateStaticParams() {
  return VALID.flatMap((subject) =>
    ['no', 'en', 'ar'].map((locale) => ({ locale, subject })),
  );
}

export default async function ServiceDetail({
  params,
}: {
  params: Promise<{ locale: string; subject: string }>;
}) {
  const { locale, subject } = await params;
  if (!(VALID as readonly string[]).includes(subject)) notFound();
  setRequestLocale(locale);
  const s = subject as Subject;
  const t = await getTranslations({ locale, namespace: 'servicesIndex' });
  const tp = await getTranslations({ locale, namespace: 'servicePages' });

  // The service titles carry <em> for the gold-italic accent. next-intl's
  // plain t() cannot render markup — it bails and prints the key itself, which
  // is why every one of these pages showed "servicesIndex.items.<key>.title"
  // as its headline. The heading goes through t.rich; anything that needs a
  // real string (alt text, and any future <title>) gets the tags stripped.
  const plainTitle = (t.raw(`items.${s}.title`) as string).replace(/<\/?em>/g, '');

  return (
    <main>
      {/* The band, in the family the prayer page opens on (client,
         2026-09-05). `split` rather than `over` because the subject photos
         are 1086-1600px wide: in a full-measure band subj-nikah would be
         upscaling, and a 240px letterbox would cut through the faces.

         The accent MUST be surface="dusk" here. accent.tsx maps paper to
         #9B7F4A and dusk to #C0A165; the paper gold on a dusk plate is far
         too dim to read.

         The kicker's second half is the service's own family, from
         servicesIndex.groups — copy that already exists in all three
         locales, so ten pages get four distinct kickers for no new
         strings. */}
      <PageBand
        kicker={tp('crumb')}
        kickerNote={t(`groups.${SERVICE_GROUP_OF[s]}`)}
        title={t.rich(`items.${s}.title`, {
          em: (chunks) => <Accent surface="dusk">{chunks}</Accent>,
        })}
        lede={t(`items.${s}.body`)}
        image={SERVICE_IMAGE[s]}
        alt={plainTitle}
        layout="split"
        // The section below opens on its own ground and brings its own top
        // padding. Left at the default, the band's bottom rhythm plus that
        // padding put ~190px of empty cream under the plate and the page
        // read as having ended there — the client's "this empty part".
        padBottom="none"
        {...SERVICE_BAND[s]}
      />

      {/* ── 2. What this is ────────────────────────────────────────────────
         A second real photograph, and the sentence that says what the
         service is.

         Two things have been tried here and rejected. First a large
         invented line-drawing on an "architect's sheet" plate, one per
         service — "looks fake", and it was: drawn artwork does not survive
         being set at full size a few hundred pixels under a photograph of
         real people. Then the drawing was simply removed and the sentence
         centred on its own — "very basic", which it was, because a heading
         and one paragraph is not a section.

         The answer to both is the same: real content. The photograph comes
         from the mosque's own library (lib/services.ts, SERVICE_STORY) and
         is never the one the band above is already showing.

         The picture goes on the START side, opposite the band's, so the two
         alternate down the page instead of stacking two pictures on the
         same edge. items-center, because the copy runs 149-379 characters
         across the eight services and the frame is a fixed 4:5 — top
         aligned, the short pages would hang three lines beside a tall
         photograph. */}
      <Section tone="paper-2" className="relative isolate overflow-hidden">
        {/* Light in the ground rather than a flat tint. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 end-[6%] -z-10 h-[34rem] w-[34rem] rounded-full bg-gold/[0.06] blur-3xl"
        />
        {/* And the mosque's own mark as ground — the logo, the same tile the
           facade carries. On its own childless layer: .star-texture sets
           `> * { position: relative }` and would drop any absolutely
           positioned sibling into the flow. */}
        <div
          aria-hidden
          className="star-texture star-texture--light pointer-events-none absolute inset-0 -z-10"
        />
        <SectionBody>
          <div className="grid gap-10 md:grid-cols-12 md:items-center md:gap-14 lg:gap-16">
            <div className="relative md:col-span-5">
              {/* The offset outline behind the frame: one hairline
                 rectangle, pushed down and out. It gives the picture a
                 second edge to sit against, which is what stops a lone
                 photograph on a flat ground reading as a placeholder.
                 Logical -end/-bottom, so it swaps sides in Arabic. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 hidden translate-x-4 translate-y-4 rounded-[1.5rem] rounded-se-[4.5rem] border border-gold-deep/30 sm:block rtl:-translate-x-4"
              />
              {/* rounded-se, the LOGICAL corner: start-end. It mirrors to the
                 other shoulder in Arabic on its own, where rounded-tr would
                 stay put and land on the wrong one. */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] rounded-se-[4.5rem] bg-paper-deep ring-1 ring-ink/5">
                <Image
                  src={SERVICE_STORY[s].src}
                  alt=""
                  fill
                  sizes="(min-width: 1152px) 430px, (min-width: 768px) 40vw, calc(100vw - 3rem)"
                  className={cn('object-cover', SERVICE_STORY[s].objectClass)}
                  // The site's own grade, so a second photograph on the page
                  // sits in the same light as the band above it.
                  style={{ filter: 'saturate(0.72) contrast(1.12) brightness(0.9)' }}
                />
              </div>
            </div>

            <div className="md:col-span-6 md:col-start-7">
              {/* The house section-opener: a short gold tick. It replaces
                 the ruled eyebrow that used to sit here, which printed the
                 heading's own words directly above the heading. */}
              <span aria-hidden className="block h-0.5 w-10 bg-gold-deep" />
              <SectionHeading className="mt-6">{t('detail.what')}</SectionHeading>
              {/* Serif, and a size up from text-body: this is the page's
                 statement, not a paragraph inside something longer. */}
              <p className="mt-6 max-w-[44ch] font-serif text-[clamp(1.1rem,1.05rem+0.4vw,1.35rem)] leading-[1.55] text-pretty text-ink">
                {t(`items.${s}.longBody`)}
              </p>
              {/* A foot for the column, and on a phone a genuine shortcut:
                 the form is a long way down from here. */}
              <a
                href="#enquiry"
                className="group mt-8 inline-flex min-h-11 items-center gap-3 border-t border-ink/15 pt-6 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-ink transition-colors hover:text-gold-deep"
              >
                {t('detail.request')}
                <span
                  aria-hidden
                  className="transition-transform duration-200 group-hover:translate-y-0.5"
                >
                  &darr;
                </span>
              </a>
            </div>
          </div>
        </SectionBody>
      </Section>

      {/* ── 3. Asking for it ───────────────────────────────────────────────
         The form, on the pale green (client, 2026-09-05).

         It stood on a dusk plate until now, which was bold but heavy — one
         more dark block on a page that opens on one, and it read as a
         widget dropped onto the page rather than as part of it. The green
         is the site's own: the same #e3eae4 the "Dette er Rabita" section,
         the follow section and the project facts stand on. It arrives
         through the tall gradient those sections use rather than as a hard
         seam, so the page runs paper -> warm -> green with no edge in it.

         The band's trailing "ask at reception" note lives here. Under the
         band it was an orphan hairline over 190px of nothing; beside the
         form it is what it always meant — the alternative to filling this
         in. */}
      <section id="enquiry" className="scroll-mt-24 bg-[#e3eae4]">
        <div aria-hidden className="h-24 bg-gradient-to-b from-paper-2 to-[#e3eae4] md:h-36" />
        <div className="pb-section-lg md:pb-24">
          <SectionBody>
            <div className="grid gap-10 md:grid-cols-12 md:gap-14">
              <div className="md:col-span-5">
                <span aria-hidden className="block h-0.5 w-10 bg-gold-deep" />
                <h2 className="mt-6 font-serif text-[clamp(1.5rem,2.4vw,2rem)] leading-tight text-balance text-ink">
                  {t('detail.request')}
                </h2>
                <p className="mt-4 max-w-[34ch] text-body text-ink-60">{tp('pages.services.note')}</p>
                <ul className="mt-7 space-y-2 border-t border-ink/10 pt-6">
                  <li>
                    <a
                      href={`mailto:${CAMPAIGN.contactEmail}`}
                      className="inline-flex min-h-11 items-center font-serif text-[1.15rem] text-ink transition-colors hover:text-gold-deep"
                    >
                      {CAMPAIGN.contactEmail}
                    </a>
                  </li>
                  <li>
                    <a
                      href={`tel:${CAMPAIGN.contactPhone.replace(/\s/g, '')}`}
                      className="inline-flex min-h-11 items-center font-serif text-[1.15rem] text-ink transition-colors hover:text-gold-deep"
                    >
                      {/* In an RTL paragraph the spaces inside a phone
                         number are neutral, so the groups get reordered:
                         +47 22 20 80 88 renders as 88 80 20 22 47+, which
                         is a different number. bdi isolates it and dir
                         pins it LTR. */}
                      <bdi dir="ltr">{CAMPAIGN.contactPhone}</bdi>
                    </a>
                  </li>
                  {/* "Ask at reception" names a place, so the place is here
                     too — and it gives the rail a third line rather than
                     trailing off under two. */}
                  <li className="pt-1 font-serif text-[1.15rem] text-ink-60">{CAMPAIGN.address}</li>
                </ul>
              </div>
              <div className="md:col-span-7">
                {/* Paper wells on green: #FAF8F4 fields on #e3eae4 read as
                   wells without a card under them, so the form can stand on
                   the ground itself rather than on a panel floating over it.
                   rule={false} because the black opening hairline exists for
                   /kontakt and /besok-oss, where the form follows body copy
                   in the same column; here it has a column of its own. */}
                <RequestForm subject={s as RequestSubject} rule={false} />
              </div>
            </div>
          </SectionBody>
        </div>
      </section>
      {/* The "Coming in person" band (ServiceVisit) was removed on 2026-08-31:
         it repeated verbatim on this page, the services index and all eleven
         subject pages, so the address stopped registering as information and
         started reading as furniture. It survives on /besok-oss, which is the
         page that exists to answer it. The component is left in
         components/service-page.tsx, unused, so it can go back with one line. */}
    </main>
  );
}
