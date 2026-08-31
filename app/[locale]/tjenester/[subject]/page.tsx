import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Section, SectionBody, SectionHeading } from '@/components/primitives';
import { RequestForm, type RequestSubject } from '@/components/request-form';
import { ServiceHero } from '@/components/service-page';
import { Accent } from '@/components/accent';
import { SERVICE_KEYS, SERVICE_IMAGE, type ServiceKey } from '@/lib/services';

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
      <ServiceHero
        crumb={tp('crumb')}
        eyebrow={t('eyebrow')}
        title={t.rich(`items.${s}.title`, {
          em: (chunks) => <Accent surface="paper">{chunks}</Accent>,
        })}
        lede={t(`items.${s}.body`)}
        note={tp('pages.services.note')}
        image={SERVICE_IMAGE[s]}
        alt={plainTitle}
      />
      {/* The two halves of the page's business — what this service is, and
         how to ask for it — set to the treatment the client supplied on
         2026-08-31. The words are unchanged; what is new is the furniture:
         a ruled eyebrow over each heading, a gold margin rule down the prose,
         marks beside the field labels, and a building drawn very faintly into
         the foot of the column. */}
      <Section tone="paper" className="relative isolate overflow-hidden">
        {/* The watermark. aria-hidden and pointer-events-none: it is texture,
           and at 5% ink it is barely a picture at all. Desktop only — on a
           phone the column is the full width and a drawing behind the prose
           would only make it harder to read. */}
        <ElevationMark
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -start-16 -z-10 hidden h-[30rem] w-[40rem] text-ink/[0.045] md:block"
        />
        <SectionBody>
          <div className="grid gap-10 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-6">
              <EyebrowRule>{t('detail.what')}</EyebrowRule>
              <SectionHeading className="mt-4">{t('detail.what')}</SectionHeading>
              {/* A hairline down the start edge with a diamond on it, so the
                 prose is held in a margin rather than starting at the page
                 edge like every other paragraph. */}
              <div className="relative mt-6 ps-6 md:ps-7">
                <span aria-hidden className="absolute inset-y-1 start-0 w-px bg-gold-deep/35" />
                <span
                  aria-hidden
                  className="absolute start-0 top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-paper ring-1 ring-gold-deep/60 rtl:translate-x-1/2"
                />
                <p className="text-body text-ink">{t(`items.${s}.longBody`)}</p>
              </div>
            </div>
            <div className="md:col-span-6">
              <EyebrowRule>{t('detail.request')}</EyebrowRule>
              <SectionHeading className="mt-4">{t('detail.request')}</SectionHeading>
              <div className="mt-7">
                <RequestForm subject={s as RequestSubject} ornate />
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
function EyebrowRule({ children }: { children: React.ReactNode }) {
  return (
    <p aria-hidden className="flex items-center gap-4">
      <span className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-ink-60">
        {children}
      </span>
      <span className="h-px flex-1 bg-gold-deep/45" />
    </p>
  );
}

/* An elevation of the building, drawn as a single-weight outline for use as a
   watermark. Not a render and not to scale — a facade, an arcade and a dome,
   enough to read as architecture at 5% ink behind a column of text. */
function ElevationMark({ className }: { className?: string; 'aria-hidden'?: boolean }) {
  return (
    <svg viewBox="0 0 480 340" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      {/* dome and its finial */}
      <path d="M150 150c-26-30-20-58 14-82 16-11 28-20 32-33 4 13 16 22 32 33 34 24 40 52 14 82Z" />
      <path d="M194 33V16" />
      <circle cx="196" cy="10" r="6" />
      {/* drum */}
      <path d="M150 150h92v26h-92Z" />
      {/* facade and its storeys */}
      <path d="M96 176h200v164H96Z" />
      <path d="M96 220h200M96 264h200M96 308h200" />
      {/* the arcade along the ground floor */}
      <path d="M116 340v-24a12 12 0 0 1 24 0v24M160 340v-24a12 12 0 0 1 24 0v24M204 340v-24a12 12 0 0 1 24 0v24M248 340v-24a12 12 0 0 1 24 0v24" />
      {/* minaret */}
      <path d="M330 340V120h30v220Z" />
      <path d="M326 120c0-20 8-31 19-42 11 11 19 22 19 42Z" />
      <path d="M344 76V58" />
      <circle cx="345" cy="52" r="5" />
      <path d="M330 164h30M330 208h30M330 252h30" />
      {/* ground */}
      <path d="M60 340h360" />
    </svg>
  );
}
