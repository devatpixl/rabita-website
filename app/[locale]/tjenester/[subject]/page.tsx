import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Section, SectionBody, SectionHeading } from '@/components/primitives';
import { RequestForm, type RequestSubject } from '@/components/request-form';
import { PageBand } from '@/components/page-band';
import { Accent } from '@/components/accent';
import { CAMPAIGN } from '@/lib/campaign';
import {
  SERVICE_BAND,
  SERVICE_GROUP_OF,
  SERVICE_IMAGE,
  SERVICE_KEYS,
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
         One centred statement, and nothing else in the section.

         This replaced a two-column layout whose right half was a large
         line-drawing on an "architect's sheet" plate — a mihrab, a lattice,
         a lectern, one per service. The client's read, and it is the right
         one: "looks fake, all these things you generated". They were
         invented artwork sitting a few hundred pixels under a real
         photograph of real people, and that is exactly how they read. Every
         one of them is gone, along with the map that assigned them.

         What is left is the only thing on this page that has to be here:
         the sentence that says what the service is. It gets the full
         measure, set large, with air around it. That also settles the
         layout problem for good — the copy runs 149-379 characters across
         the eight services, and a single centred column cannot develop the
         493px of dead space the old side-by-side grid did, whatever length
         the copy turns out to be. */}
      <Section tone="paper-2" className="relative isolate overflow-hidden">
        {/* Light in the ground rather than a flat tint. Two blooms, wide
           and low-contrast, so the section has depth without an image. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 start-1/2 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-gold/[0.06] blur-3xl"
        />
        {/* And the mosque's own mark as ground, which is the one piece of
           pattern on this page that is not invented — it is the logo, the
           same tile the facade carries. On its own childless layer:
           .star-texture sets `> * { position: relative }` and would drop
           any absolutely positioned sibling into the flow. */}
        <div
          aria-hidden
          className="star-texture star-texture--light pointer-events-none absolute inset-0 -z-10"
        />
        <SectionBody>
          <div className="mx-auto max-w-[46rem] text-center">
            {/* The house section-opener: a short gold tick. Centred, it
               replaces the ruled eyebrow that used to sit here — that
               eyebrow printed the heading's own words directly above the
               heading, which reads as a design detail beside a column and
               as a mistake in the middle of one. */}
            <span aria-hidden className="mx-auto block h-0.5 w-10 bg-gold-deep" />
            <SectionHeading className="mt-6">{t('detail.what')}</SectionHeading>
            {/* Serif, and a size up from text-body: this is the page's
               statement, not a paragraph inside something longer. */}
            <p className="mx-auto mt-7 max-w-[42ch] font-serif text-[clamp(1.15rem,1.15rem+0.5vw,1.5rem)] leading-[1.55] text-pretty text-ink">
              {t(`items.${s}.longBody`)}
            </p>
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
      <section className="bg-[#e3eae4]">
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
