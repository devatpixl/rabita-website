import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { APARTMENTS_SOURCE, apartmentStats } from '@/lib/apartments';
import { Accent } from '@/components/accent';
import { FindUs } from '@/components/find-us';
import { ProjectGallery } from '@/components/project-gallery';
import { RequestForm } from '@/components/request-form';
import { VideoHero } from '@/components/video-hero';
import { Section, SectionBody, SectionHeading } from '@/components/primitives';

// The fifteen apartments in the new building, for sale. One page, by request.
//
// Built from the project's own sales site cm8.no (read 2026-09-02), which
// splits the same material over four pages. What is here is the part a buyer
// actually decides on: where it is, what is in the building, what it costs to
// get in, and a way to register interest.
//
// Deliberately NOT here, after 2026-09-02:
//   • the fifteen-row price table. It was accurate but it was a wall of
//     numbers on a page whose job is to make someone want to visit, and it
//     duplicated cm8's live listing — which is the one that governs. The data
//     stays in lib/apartments.ts and still drives the headline price.
//   • the old three-card "why here" block, whose garden/city/building points
//     are now said better, and with the project's own words, by the location
//     and quality sections below.
//
// The headline price is derived from units that are FOR SALE, not from the
// whole table: cm8's own front page still advertises "fra 2,8 millioner",
// which was the 17 m² studio, and that studio is sold. See lib/apartments.ts.

const QUALITY_ITEMS = ['outdoor', 'hall', 'teaching', 'library', 'terrace'] as const;

export default async function ApartmentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'apartmentsPage' });

  const stats = apartmentStats();

  // "6 millioner" rather than "6 000 000 kr" — the project's own way of
  // quoting it, and the shape a buyer reads at a glance. Whole millions only
  // because every available unit is one; a stray 6,2 would need a decimal and
  // the locale's own separator, so it is formatted rather than concatenated.
  const fromMillions = new Intl.NumberFormat(
    locale === 'ar' ? 'ar-EG' : locale === 'en' ? 'en-GB' : 'nb-NO',
    { maximumFractionDigits: 1 },
  ).format(stats.fromNok / 1_000_000);

  return (
    <main>
      <VideoHero
        eyebrow={t('eyebrow')}
        title={t.rich('title', { em: (chunks) => <Accent surface="dusk">{chunks}</Accent> })}
        lede={t('ledeShort')}
      >
        <a
          href="#interesse"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold-deep px-6 text-[15px] font-semibold text-paper transition-colors hover:bg-paper hover:text-ink"
        >
          {t('primary')}
        </a>
        <a
          href="#om"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-paper/50 px-6 text-[15px] font-semibold text-paper transition-colors hover:bg-paper/10"
        >
          {t('about.eyebrow')}
        </a>
      </VideoHero>

      {/* ── om prosjektet ───────────────────────────────────────────────────
         items-center, not items-start: the words run longer than the map, and
         a map pinned to the top of a much taller column reads as though it
         slipped. Centred, the two halves balance on a laptop, which is where
         this page is mostly read. */}
      <Section tone="paper" id="om">
        <SectionBody>
          <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
                {t('about.eyebrow')}
              </p>
              <SectionHeading className="mt-4">
                {t.rich('about.heading', { em: (chunks) => <Accent surface="paper">{chunks}</Accent> })}
              </SectionHeading>
              {/* One paragraph, not two. The second said the same thing about
                 facilities that the quality section below now says properly. */}
              <p className="mt-6 max-w-[52ch] text-body text-ink-60">{t('about.body1')}</p>

              <ul className="mt-8 space-y-5">
                {(['modern', 'central'] as const).map((k) => (
                  <li key={k} className="flex gap-4">
                    <span
                      aria-hidden
                      className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-gold-deep/45 text-gold-deep"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                        <path d="m5 12.5 4.5 4.5L19 7" />
                      </svg>
                    </span>
                    <div>
                      <h3 className="font-serif text-[1.15rem] leading-tight text-ink">
                        {t(`about.points.${k}.title`)}
                      </h3>
                      <p className="mt-1.5 max-w-[46ch] text-body text-ink-60">
                        {t(`about.points.${k}.body`)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* The price, in the project's own units. */}
              <div className="mt-9 border-t border-rule pt-6">
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-60">
                  {t('priceLabel')}
                </p>
                <p className="mt-2 flex items-baseline gap-2.5">
                  <span className="font-serif text-[clamp(2.5rem,5vw,3.75rem)] leading-none tabular-nums text-gold-deep">
                    {fromMillions}
                  </span>
                  <span className="font-serif text-[1.15rem] italic text-ink-60">{t('priceUnit')}</span>
                </p>
              </div>
            </div>

            <div>
              <div className="overflow-hidden rounded-3xl bg-dusk p-4 sm:p-5">
                <FindUs extended />
              </div>
              <p className="mt-4 text-[13px] leading-relaxed text-ink-60">{t('about.mapCaption')}</p>
            </div>
          </div>

          {/* Across to the developer.
             Placed at the foot of this section rather than at the foot of the
             page, because it answers the question the price directly above it
             raises — "from 6 million" is the start of a list, and the list
             lives on cm8.no. It spans both columns so it reads as this
             section's closing line rather than as a stray button under the
             left-hand text.

             The URL is APARTMENTS_SOURCE, the same constant the snapshot in
             lib/apartments.ts cites as its origin, so the link and the data
             can never point at two different places. */}
          <div className="mt-14 flex flex-col gap-6 rounded-[1.5rem] border border-rule bg-paper-2/70 p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:p-7 md:mt-16">
            <div>
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-gold-deep">
                {t('sales.eyebrow')}
              </p>
              <p className="mt-2.5 max-w-[54ch] text-body text-ink-60">{t('sales.line')}</p>
            </div>
            <a
              href={APARTMENTS_SOURCE}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-12 shrink-0 items-center gap-3 self-start rounded-full bg-gold-deep px-7 text-[15px] font-semibold text-paper transition-colors hover:bg-ink sm:self-auto"
            >
              {t('sales.cta')}
              {/* A diagonal, not a right arrow: everything else on this page
                 that carries an arrow keeps you here. */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              >
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
              <span className="sr-only">{t('sales.newTab')}</span>
            </a>
          </div>
        </SectionBody>
      </Section>

      {/* ── sentral beliggenhet ─────────────────────────────────────────────
         The four claims cm8 makes about the location, built to the client's
         mock (2026-09-04): an arch-topped photograph with a dot grid beside
         it, and each claim as icon medallion / oversized numeral / line —
         a register, because bullets read as small print and these are the
         argument. */}
      <section className="relative overflow-hidden bg-dusk py-10 text-paper md:py-14">
        {/* A single warm bloom behind the arch, so the dark ground has a
           light in it rather than reading as a flat block. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -start-24 top-1/3 h-[32rem] w-[32rem] rounded-full bg-gold/[0.07] blur-3xl"
        />
        <SectionBody className="relative">
          <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
            <div className="md:sticky md:top-24 md:self-start">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold">
                {t('location.eyebrow')}
              </p>
              <SectionHeading className="mt-3 text-paper">
                {t.rich('location.heading', { em: (chunks) => <Accent surface="dusk">{chunks}</Accent> })}
              </SectionHeading>
              <span aria-hidden className="mt-4 block h-0.5 w-10 bg-gold" />
              <p className="mt-4 max-w-[42ch] text-body text-paper/70">{t('location.lede')}</p>

              {/* The street itself, under an arch — the building's own
                 doorway shape, the same one the facilities medallions use.
                 The dot grid sits behind its shoulder, a printer's ornament
                 rather than another picture. */}
              <div className="relative mt-6 max-w-[22rem]">
                <svg
                  aria-hidden
                  className="absolute -end-8 top-3 hidden h-20 w-20 text-gold/40 sm:block"
                  viewBox="0 0 100 100"
                >
                  <defs>
                    <pattern id="loc-dots" width="12.5" height="12.5" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1.6" fill="currentColor" />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#loc-dots)" />
                </svg>
                <div className="relative h-[clamp(13rem,30vh,19rem)] overflow-hidden rounded-b-[14px] rounded-t-[11rem] ring-1 ring-paper/15">
                  <Image
                    src="/photos/calmeyers-street.webp"
                    alt=""
                    fill
                    sizes="(min-width: 768px) 24rem, 92vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            <ol className="space-y-0 md:self-center">
              {(t.raw('location.items') as string[]).map((item, i) => (
                <li key={item} className="flex items-center gap-4 border-b-[0.5px] border-paper/15 py-6 first:pt-0 md:gap-6">
                  {/* The mark, in a soft seal: what the claim is ABOUT — on
                     foot, cafés, transport, quiet streets. */}
                  <span
                    aria-hidden
                    className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-paper/[0.06] text-gold ring-1 ring-paper/10"
                  >
                    <LocationIcon index={i} className="h-[1.6rem] w-[1.6rem]" />
                  </span>
                  <span aria-hidden className="h-10 w-px shrink-0 bg-paper/15" />
                  <span
                    aria-hidden
                    className="shrink-0 font-serif text-[1.7rem] leading-none tabular-nums text-gold md:text-[2.05rem]"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="max-w-[42ch] text-body text-paper/85">{item}</p>
                </li>
              ))}
              <li className="pt-7">
                {/* The closing line, with an arch drawn faintly at its end —
                   the building itself, as a watermark. */}
                <div className="relative overflow-hidden rounded-[14px] bg-paper/[0.06] p-5 ring-1 ring-paper/10 md:p-6">
                  <svg
                    aria-hidden
                    viewBox="0 0 100 120"
                    className="pointer-events-none absolute -bottom-2 end-4 h-[7.5rem] w-24 text-gold/25"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path d="M12 118V52a38 38 0 0 1 76 0v66" />
                    <path d="M30 118V56a20 20 0 0 1 40 0v62" />
                    <path d="M50 118V36" />
                  </svg>
                  <span aria-hidden className="relative block font-serif text-[1.7rem] leading-none text-gold">
                    &ldquo;
                  </span>
                  <p className="relative mt-0.5 max-w-[42ch] font-serif text-[1.15rem] italic leading-snug text-paper">
                    {t('location.close')}
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </SectionBody>
      </section>

      {/* ── kvalitet og møteplasser ─────────────────────────────────────
         Rebuilt to the client's mock (2026-09-04): heading beside the
         courtyard render with a community chip floating on it; the five
         facilities as arch-shaped medallions on one thread; the closing
         line as a quote bar. */}
      <section className="bg-paper py-10 [@media(max-height:820px)]:py-6 md:py-14">
        <SectionBody>
          <div className="grid items-center gap-8 md:grid-cols-[0.9fr_1.1fr] md:gap-12">
            <div>
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
                {t('quality.eyebrow')}
              </p>
              <SectionHeading className="mt-3 max-w-[16ch]">
                {t.rich('quality.heading', { em: (chunks) => <Accent surface="paper">{chunks}</Accent> })}
              </SectionHeading>
              <span aria-hidden className="mt-4 block h-0.5 w-10 bg-gold-deep" />
              <p className="mt-4 max-w-[46ch] text-body text-ink-60">{t('quality.lede')}</p>
            </div>

            {/* The courtyard at dusk — the minaret over the shared garden,
               every window lit. One oversized corner, per the mock. */}
            <div className="relative overflow-hidden rounded-[1.5rem] rounded-bl-[4.5rem]">
              <div className="relative h-[clamp(13rem,31vh,22rem)]">
                <Image
                  src="/photos/courtyard-dusk.webp"
                  alt=""
                  fill
                  sizes="(min-width: 768px) 40rem, 92vw"
                  className="object-cover"
                />
              </div>
              {/* The chip, floating on the picture: what the picture is FOR. */}
              <div className="absolute bottom-4 start-4 flex items-center gap-3 rounded-2xl bg-dusk/85 p-3.5 pe-5 text-paper backdrop-blur-sm">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-paper text-gold-deep">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-5 w-5">
                    <circle cx="9" cy="8" r="3" />
                    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
                    <circle cx="17" cy="9.5" r="2.3" />
                    <path d="M14.5 19a4.6 4.6 0 0 1 6-4.3" />
                  </svg>
                </span>
                <span>
                  <span className="block font-serif text-[1.05rem] leading-tight">{t('quality.chip.title')}</span>
                  <span className="mt-0.5 block text-[12.5px] leading-snug text-paper/70">{t('quality.chip.body')}</span>
                </span>
              </div>
            </div>
          </div>

          {/* The list label, running out along a hairline to a gold point. */}
          <div className="mt-8 flex items-center gap-5 md:mt-10">
            <p className="shrink-0 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-60">
              {t('quality.listLabel')}
            </p>
            <span aria-hidden className="h-px flex-1 bg-rule" />
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-deep" />
          </div>

          {/* Five medallions on one thread. The thread is a gentle wave
             drawn behind the arches (md+), so the row reads as beads on a
             string rather than five columns. */}
          <div className="relative mt-7">
            <svg
              aria-hidden
              viewBox="0 0 1000 60"
              preserveAspectRatio="none"
              className="absolute inset-x-0 top-7 hidden h-[60px] w-full text-gold-deep/30 md:block"
            >
              <path d="M0 38 C 100 10, 180 52, 300 30 S 520 8, 640 34 S 880 54, 1000 22" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            <ol className="relative grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-5 md:gap-x-6">
              {QUALITY_ITEMS.map((k, i) => (
                <li key={k} className="flex flex-col items-center text-center md:border-s md:border-rule/70 md:first:border-s-0">
                  {/* The arch: the building's own doorway shape as the icon
                     plate. */}
                  <span className="grid h-16 w-[3.5rem] place-items-center rounded-t-full rounded-b-xl bg-paper-deep/60 md:h-[4.5rem] md:w-16">
                    <QualityIcon name={k} className="h-6 w-6 text-gold-deep" />
                  </span>
                  <span className="mt-3 font-mono text-[0.6875rem] tracking-[0.14em] text-gold-deep">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-1 max-w-[16ch] font-serif text-[1.02rem] leading-tight text-ink">
                    {t(`quality.items.${k}.title`)}
                  </h3>
                  <p className="mt-1.5 max-w-[22ch] text-[12.5px] leading-snug text-ink-60">
                    {t(`quality.items.${k}.body`)}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          {/* The closing line as a quote bar: the oversized mark, a rule,
             the sentence. */}
          <div className="mt-8 flex items-center gap-5 rounded-2xl bg-paper-deep/60 px-6 py-4 md:mt-10 md:px-8">
            <span aria-hidden className="font-serif text-[2.2rem] leading-none text-gold-deep">&ldquo;</span>
            <span aria-hidden className="h-8 w-px shrink-0 bg-gold-deep/30" />
            <p className="font-serif text-[clamp(1.05rem,2vw,1.3rem)] italic leading-snug text-ink">
              {t('quality.close')}
            </p>
          </div>
        </SectionBody>
      </section>

      <section className="bg-paper-2 py-section-md">
        <SectionBody>
          <ProjectGallery only={['aerial', 'garden', 'facadeDay', 'facadeNight']} />
        </SectionBody>
      </section>

      {/* Interest. */}
      <Section tone="paper-2" id="interesse">
        <SectionBody>
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">{t('interest.eyebrow')}</p>
              <SectionHeading className="mt-4">
                {t.rich('interest.heading', { em: (chunks) => <Accent surface="paper">{chunks}</Accent> })}
              </SectionHeading>
              <p className="mt-4 max-w-prose text-body text-ink-60">{t('interest.body')}</p>
              <p className="mt-6 border-s-2 border-gold-deep ps-4 text-[14px] leading-relaxed text-ink">{t('interest.note')}</p>
            </div>
            <div className="md:col-span-7">
              <RequestForm subject="apartments" heading={t('interest.formHeading')} card />
            </div>
          </div>
        </SectionBody>
      </Section>
    </main>
  );
}

/* The five marks for what the project includes. Line drawings at 20px, in the
   same weight as the site's other icon sets. */
// The location marks: on foot, cafés, transport, quiet streets — one per
// claim, in the order the copy makes them.
function LocationIcon({ index, className }: { index: number; className?: string }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  };
  if (index === 0) {
    // Walking.
    return (
      <svg {...common}>
        <circle cx="13" cy="4.5" r="1.8" />
        <path d="M12.5 21l-1.2-5.4 2.4-2.2-.8-4.4-3.4 1.6L8 13" />
        <path d="M13.7 13.4l2.6 1.6 1.2 3.2" />
      </svg>
    );
  }
  if (index === 1) {
    // A cup.
    return (
      <svg {...common}>
        <path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9z" />
        <path d="M17 10.5h1.6a2.4 2.4 0 0 1 0 4.8H17" />
        <path d="M7.5 3v2.5M11 3v2.5M14.5 3v2.5" />
      </svg>
    );
  }
  if (index === 2) {
    // A train carriage.
    return (
      <svg {...common}>
        <rect x="5" y="3" width="14" height="13" rx="3.5" />
        <path d="M5 10h14" />
        <circle cx="9" cy="13" r="1" fill="currentColor" stroke="none" />
        <circle cx="15" cy="13" r="1" fill="currentColor" stroke="none" />
        <path d="M8 16l-2.5 5M16 16l2.5 5" />
      </svg>
    );
  }
  // A tree, for the quiet side streets.
  return (
    <svg {...common}>
      <path d="M12 21v-6" />
      <path d="M12 15a5.5 5.5 0 0 0 0-11 5.5 5.5 0 0 0 0 11z" />
      <path d="M12 12.5l3-3M12 10l-2.6-2.6" />
    </svg>
  );
}

function QualityIcon({ name, className }: { name: (typeof QUALITY_ITEMS)[number]; className?: string }) {
  const c = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  };
  if (name === 'outdoor') {
    return (
      <svg {...c}>
        <path d="M12 21v-7" />
        <path d="M12 14c0-4 2.5-7 6-8-.5 4-2.5 7-6 8ZM12 15c0-3.5-2.2-6.2-5.3-7 .4 3.5 2.2 6.2 5.3 7Z" />
        <path d="M4 21h16" />
      </svg>
    );
  }
  if (name === 'hall') {
    return (
      <svg {...c}>
        <path d="M3 20V9l9-5 9 5v11" />
        <path d="M2 20h20" />
        <path d="M8 20v-5a4 4 0 0 1 8 0v5" />
      </svg>
    );
  }
  if (name === 'teaching') {
    return (
      <svg {...c}>
        <path d="M12 4 2.5 8.5 12 13l9.5-4.5Z" />
        <path d="M6 10.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.5" />
        <path d="M21.5 8.5v5" />
      </svg>
    );
  }
  if (name === 'library') {
    return (
      <svg {...c}>
        <path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4Z" />
        <path d="M20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6Z" />
      </svg>
    );
  }
  return (
    <svg {...c}>
      <path d="M3 13h18" />
      <path d="M5 13V8l7-4 7 4v5" />
      <path d="M6 13v7M18 13v7M3 20h18" />
      <path d="M10 13v-2h4v2" />
    </svg>
  );
}
