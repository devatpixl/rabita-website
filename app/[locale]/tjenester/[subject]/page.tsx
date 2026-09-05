import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Section, SectionBody, SectionHeading } from '@/components/primitives';
import { RequestForm, type RequestSubject } from '@/components/request-form';
import { PageBand } from '@/components/page-band';
import { Accent } from '@/components/accent';
import { MARK_COMPONENTS } from '@/components/marks';
import { CAMPAIGN } from '@/lib/campaign';
import { cn } from '@/lib/cn';
import {
  SERVICE_BAND,
  SERVICE_FEATURE_MARK,
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
         The description, on its own ground, beside a drawing.

         It used to be one half of a two-column grid whose other half was the
         form. That was the fault: the longBody copy runs 149-379 characters,
         so a 2-5 line paragraph was being stretched down the side of a
         500px form — measured at 493px of dead space on /counselling, with
         a watermark sitting in it at 4.5% ink. Two subjects, two sections.

         items-center, and it matters: with the columns top-aligned a short
         paragraph would hang at the top of a tall plate and reproduce
         exactly the hole this is fixing. */}
      <Section tone="paper-2" className="relative isolate overflow-hidden">
        {/* Light in the ground rather than a flat tint. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 end-[8%] -z-10 h-[26rem] w-[26rem] rounded-full bg-gold/[0.07] blur-3xl"
        />
        <SectionBody>
          <div className="grid gap-10 md:grid-cols-12 md:items-center md:gap-16">
            <div className="md:col-span-7">
              <EyebrowRule>{t('detail.what')}</EyebrowRule>
              <SectionHeading className="mt-4">{t('detail.what')}</SectionHeading>
              {/* A hairline down the start edge with a diamond on it, so the
                 prose is held in a margin rather than starting at the page
                 edge like every other paragraph. */}
              <div className="relative mt-6 ps-6 md:ps-7">
                <span aria-hidden className="absolute inset-y-1 start-0 w-px bg-gold-deep/35" />
                <span
                  aria-hidden
                  className="absolute start-0 top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-paper-2 ring-1 ring-gold-deep/60 rtl:translate-x-1/2"
                />
                <p className="text-body text-ink">{t(`items.${s}.longBody`)}</p>
              </div>
            </div>

            {/* The drawing, promoted from watermark to subject.
               Same four-mark family the bands use, one per service, stroked
               at a FEATURE opacity — 30% against the 4.5% it was hiding at.
               The plate is an architect's sheet: ruled margin, drawn frame,
               a title block at the foot. */}
            <FeaturePlate label={t(`groups.${SERVICE_GROUP_OF[s]}`)} mark={s} />
          </div>
        </SectionBody>
      </Section>

      {/* ── 3. Asking for it ───────────────────────────────────────────────
         The form, on a dark plate of its own, so that the page reads
         dusk -> light -> dusk instead of one unbroken field of cream.

         The band's trailing "ask at reception" note moved in here. Under the
         band it was an orphan hairline over 190px of nothing; beside the
         form it is what it always meant — the alternative to filling this
         in. */}
      <Section tone="paper" className="pb-20 md:pb-28">
        <SectionBody>
          <div className="relative isolate overflow-hidden rounded-3xl bg-dusk text-paper">
            {/* The star ground goes on its own layer, NOT on the plate.
               .star-texture carries `> * { position: relative }`, which
               overrides `absolute` on every direct child — the bloom below
               fell into the flow as a 480px block and opened a 425px hole
               above the form. On a childless layer the rule has nothing to
               act on. */}
            <div aria-hidden className="star-texture star-texture--plate pointer-events-none absolute inset-0" />
            <div
              aria-hidden
              className="pointer-events-none absolute -start-24 -top-24 h-[30rem] w-[30rem] rounded-full bg-gold/[0.07] blur-3xl"
            />
            <div className="relative grid gap-10 p-7 sm:p-9 md:grid-cols-12 md:gap-14 md:p-12">
              <div className="md:col-span-5">
                <EyebrowRule tone="dusk">{t('detail.request')}</EyebrowRule>
                <h2 className="mt-4 font-serif text-[clamp(1.5rem,2.4vw,2rem)] leading-tight text-balance text-paper">
                  {t('detail.request')}
                </h2>
                <p className="mt-5 max-w-[34ch] text-body text-paper/70">{tp('pages.services.note')}</p>
                <ul className="mt-6 space-y-3 border-t border-paper/15 pt-6">
                  <li>
                    <a
                      href={`mailto:${CAMPAIGN.contactEmail}`}
                      className="inline-flex min-h-11 items-center font-serif text-[1.15rem] text-paper transition-colors hover:text-gold"
                    >
                      {CAMPAIGN.contactEmail}
                    </a>
                  </li>
                  <li>
                    <a
                      href={`tel:${CAMPAIGN.contactPhone.replace(/\s/g, '')}`}
                      className="inline-flex min-h-11 items-center font-serif text-[1.15rem] text-paper transition-colors hover:text-gold"
                    >
                      {CAMPAIGN.contactPhone}
                    </a>
                  </li>
                  {/* "Ask at reception" names a place, so the place is here
                     too — and it gives the rail a third line rather than
                     trailing off under two. */}
                  <li className="pt-1 font-serif text-[1.15rem] text-paper/70">{CAMPAIGN.address}</li>
                </ul>
              </div>
              <div className="md:col-span-7">
                <RequestForm subject={s as RequestSubject} tone="dusk" />
              </div>
            </div>
          </div>
        </SectionBody>
      </Section>
      {/* The "Coming in person" band (ServiceVisit) was removed on 2026-08-31:
         it repeated verbatim on this page, the services index and all eleven
         subject pages, so the address stopped registering as information and
         started reading as furniture. It survives on /besok-oss, which is the
         page that exists to answer it. The component is left in
         components/service-page.tsx, unused, so it can go back with one line. */}
    </main>
  );
}

/* The mono line over a heading, with a gold rule running off it to the end of
   the column.

   aria-hidden, and deliberately so: it repeats the heading directly beneath it
   word for word, which is what the client's design does. Left readable it
   would be announced twice in a row. */
function EyebrowRule({ children, tone = 'paper' }: { children: React.ReactNode; tone?: 'paper' | 'dusk' }) {
  return (
    <p aria-hidden className="flex items-center gap-4">
      <span
        className={cn(
          'font-mono text-[0.6875rem] uppercase tracking-[0.2em]',
          tone === 'dusk' ? 'text-paper/55' : 'text-ink-60',
        )}
      >
        {children}
      </span>
      <span className={cn('h-px flex-1', tone === 'dusk' ? 'bg-gold/45' : 'bg-gold-deep/45')} />
    </p>
  );
}

/* The drawing plate in section 2.

   Sized with clamp() rather than left to grow: the copy beside it is two to
   five lines depending on the service, and a plate that matched the tallest
   of them would leave the shortest page with a hole. It shows at EVERY
   width — unlike the band's marks, which are decoration and hide below md.
   Here the drawing is the content of its column. */
function FeaturePlate({
  mark,
  label,
}: {
  mark: ServiceKey;
  /** The service family, set as a drawing sheet's title block. */
  label: string;
}) {
  const Mark = MARK_COMPONENTS[SERVICE_FEATURE_MARK[mark]];
  return (
    <div className="relative md:col-span-5">
      {/* The dot field at the shoulder, the same device the apartments
         location panel uses. Logical -end, so it changes sides in Arabic. */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="absolute -top-6 -end-5 hidden h-24 w-24 text-gold-deep/45 lg:block"
      >
        <defs>
          <pattern id="svc-plate-dots" width="12.5" height="12.5" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.6" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#svc-plate-dots)" />
      </svg>

      {/* rounded-se, the LOGICAL corner: start-end. It mirrors to the other
         side in Arabic on its own, where rounded-tr would stay put and land
         on the wrong shoulder. */}
      <div className="relative h-[clamp(14rem,32vh,20rem)] overflow-hidden rounded-[1.5rem] rounded-se-[4.5rem] bg-paper-deep ring-1 ring-ink/10">
        {/* the sheet: a drawn frame and a ruled margin down the start edge */}
        <span aria-hidden className="absolute inset-4 rounded-[1rem] border border-ink/[0.07]" />
        <span aria-hidden className="absolute inset-y-4 start-10 w-px bg-gold-deep/20" />

        <Mark
          aria-hidden
          className="absolute inset-0 h-full w-full p-7 pb-12 text-gold-deep/55 [stroke-width:1.25]"
        />

        {/* the title block */}
        <p className="absolute bottom-4 start-4 end-4 flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-40">
          <span aria-hidden className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-deep/60" />
          <span className="truncate">{label}</span>
          <span aria-hidden className="h-px flex-1 bg-ink/10" />
        </p>
      </div>
    </div>
  );
}
