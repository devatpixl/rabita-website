import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Eyebrow, Section, SectionBody, SectionHeading } from '@/components/primitives';
import { RequestForm, type RequestSubject } from '@/components/request-form';
import { PageBand } from '@/components/page-band';
import { ServiceOffer, type OfferItem } from '@/components/service-offer';
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
  // Address / Phone / E-mail, already translated for the footer's own
  // find-us block. Three labels for no new strings.
  const tf = await getTranslations({ locale, namespace: 'footer.findUs' });

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

      {/* ── 2. What we offer ───────────────────────────────────────────────
         The client's mockup (2026-09-06): eyebrow, headline and a short
         lede on one side, and on the other a numbered list of what the
         service actually involves.

         Third design for this section. The first was a large invented
         line-drawing per service — "looks fake", and it was. The second was
         the drawing removed and the sentence centred on its own — "very
         basic", and it was. Both failed on the same thing and it was never
         the treatment: the section had one paragraph in it. The four points
         per service now come from rabita.no, which turned out to carry a
         great deal that our own copy never had — the whole nikah sequence
         through Skatteetaten, the counselling page's own four headings, the
         hajj office and its number.

         SERVICE_STORY, the second photograph, moves down to section 3. The
         mockup has no picture here, and the enquiry rail had ~150px of
         empty green under the address for it to fill. */}
      <Section tone="paper-2" className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 end-[6%] -z-10 h-[34rem] w-[34rem] rounded-full bg-gold/[0.06] blur-3xl"
        />
        {/* The mosque's own mark as ground. On its own childless layer:
           .star-texture sets `> * { position: relative }` and would drop any
           absolutely positioned sibling into the flow. */}
        <div
          aria-hidden
          className="star-texture star-texture--light pointer-events-none absolute inset-0 -z-10"
        />
        <SectionBody>
          <div className="grid gap-10 md:grid-cols-12 md:gap-12 lg:gap-16">
            <div className="md:col-span-5">
              {/* Eyebrow draws its own 28px rule before the text
                 (.eyebrow-bar::before, globals.css) — the mockup's eyebrow,
                 already in the design system. `detail.what` is reused rather
                 than a new per-service string, and it no longer echoes the
                 heading below it, because the heading is now the service's
                 own offerTitle. */}
              <Eyebrow tone="gold-deep">{t('detail.what')}</Eyebrow>
              <SectionHeading className="mt-5">{t(`items.${s}.offerTitle`)}</SectionHeading>
              <p className="mt-6 max-w-[38ch] text-body text-ink-60">{t(`items.${s}.offerLede`)}</p>

              {/* The foot of the column. Rabita's own mark, not a drawn
                 per-service glyph (client, 2026-09-06). */}
              <div className="mt-10 flex items-center gap-5">
                <Image
                  src="/logo/rabita-mark-256.png"
                  alt=""
                  width={40}
                  height={40}
                  aria-hidden
                  className="h-10 w-10 shrink-0 opacity-70"
                />
                <span aria-hidden className="h-px flex-1 bg-gold-deep/30" />
              </div>
            </div>

            <div className="md:col-span-7">
              <ServiceOffer items={t.raw(`items.${s}.offer`) as OfferItem[]} />
            </div>
          </div>
        </SectionBody>
      </Section>

      {/* ── 3. Asking for it ───────────────────────────────────────────────
         The form, on the pale green — the site's own #e3eae4, arriving
         through the tall gradient the "Dette er Rabita", follow and project
         sections use rather than as a hard seam.

         Same opener as section 2 (eyebrow, heading, lede) and the same row
         language: the three ways to reach us are rows with a mono label, a
         serif value and the section-2 seal, so the two halves of the page
         read as one design. */}
      <section id="enquiry" className="scroll-mt-24 bg-[#e3eae4]">
        <div aria-hidden className="h-24 bg-gradient-to-b from-paper-2 to-[#e3eae4] md:h-36" />
        <div className="pb-section-lg md:pb-24">
          <SectionBody>
            <div className="grid gap-10 md:grid-cols-12 md:gap-12 lg:gap-16">
              <div className="md:col-span-5">
                {/* The eyebrow is the SERVICE here, not the section name.
                   Section 2 can print "What we offer" over the service's own
                   headline because the two say different things; printing
                   "Send an enquiry" over "Send an enquiry" is the echo that
                   got the old ruled eyebrow removed in the first place. The
                   service name in that slot earns its place — it says what
                   the enquiry is about. */}
                <Eyebrow tone="gold-deep">{plainTitle}</Eyebrow>
                <SectionHeading className="mt-5">{t('detail.request')}</SectionHeading>
                <p className="mt-6 max-w-[34ch] text-body text-ink-60">{tp('pages.services.note')}</p>

                <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
                  <ContactRow label={tf('email')} href={`mailto:${CAMPAIGN.contactEmail}`}>
                    {CAMPAIGN.contactEmail}
                  </ContactRow>
                  <ContactRow
                    label={tf('phone')}
                    href={`tel:${CAMPAIGN.contactPhone.replace(/\s/g, '')}`}
                  >
                    {/* In an RTL paragraph the spaces inside a phone number
                       are neutral, so the groups get reordered: +47 22 20 80
                       88 renders as 88 80 20 22 47+, which is a different
                       number. bdi isolates it and dir pins it LTR. */}
                    <bdi dir="ltr">{CAMPAIGN.contactPhone}</bdi>
                  </ContactRow>
                  <ContactRow label={tf('address')}>{CAMPAIGN.address}</ContactRow>
                </ul>

                {/* The second photograph, moved down from section 2. It fills
                   the tail of the rail, which was ~150px of empty green. */}
                <div className="relative mt-8 hidden aspect-[3/2] overflow-hidden rounded-[1.25rem] rounded-se-[3rem] bg-paper-deep ring-1 ring-ink/5 md:block">
                  <Image
                    src={SERVICE_STORY[s].src}
                    alt=""
                    fill
                    sizes="(min-width: 1152px) 430px, 40vw"
                    className={cn('object-cover', SERVICE_STORY[s].objectClass)}
                    // The site's own grade, so a second photograph on the
                    // page sits in the same light as the band above it.
                    style={{ filter: 'saturate(0.72) contrast(1.12) brightness(0.9)' }}
                  />
                </div>
              </div>
              <div className="md:col-span-7">
                {/* A paper card on the green, so the form matches the card
                   language section 2 sets. `card` also switches the wells to
                   bg-paper-2, which is the correct fill inside a paper panel
                   — a paper well on a paper card would vanish. */}
                <RequestForm subject={s as RequestSubject} card rule={false} />
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

/* One way to reach us, in the same row language section 2 uses: a mono
   label, a serif value and the seal. A row with an href is a link and takes
   the whole row; the address is not a link, so it is a plain row and carries
   the same diamond a non-expandable offer row does. */
function ContactRow({
  label,
  href,
  children,
}: {
  label: string;
  href?: string;
  children: React.ReactNode;
}) {
  const body = (
    <>
      <span className="block min-w-0">
        <span className="block font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-60">
          {label}
        </span>
        <span className="mt-1.5 block font-serif text-[1.15rem] leading-snug text-ink">
          {children}
        </span>
      </span>
      {href ? (
        <span
          aria-hidden
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-soft/40 text-gold-deep ring-1 ring-gold-deep/25 transition-colors duration-300 group-hover:bg-gold-deep group-hover:text-paper group-hover:ring-gold-deep"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 rtl:rotate-180"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </span>
      ) : (
        <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center">
          <span className="h-1.5 w-1.5 rotate-45 bg-gold-deep/35" />
        </span>
      )}
    </>
  );

  const shape = 'grid grid-cols-[1fr_auto] items-center gap-5 py-4';

  return (
    <li className="group">
      {href ? (
        <a href={href} className={`${shape} transition-colors hover:text-gold-deep`}>
          {body}
        </a>
      ) : (
        <div className={shape}>{body}</div>
      )}
    </li>
  );
}
