import { getTranslations, setRequestLocale } from 'next-intl/server';
import { APARTMENTS_SOURCE, apartmentStats } from '@/lib/apartments';
import { LANDMARKS, routedMinutes } from '@/lib/location';
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

  const walk = LANDMARKS.map((l) => ({ key: l.key, min: routedMinutes(l.key) })).sort((a, b) => a.min - b.min);
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
                <FindUs />
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
         The four claims cm8 makes about the location, each on its own ruled
         line with an oversized numeral — a register rather than a bullet
         list, because bullets read as small print and these are the argument. */}
      <Section tone="paper-2">
        <SectionBody>
          <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
            <div className="md:sticky md:top-28 md:self-start">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
                {t('location.eyebrow')}
              </p>
              <SectionHeading className="mt-4">
                {t.rich('location.heading', { em: (chunks) => <Accent surface="paper">{chunks}</Accent> })}
              </SectionHeading>
              <p className="mt-6 max-w-[44ch] text-body text-ink-60">{t('location.lede')}</p>

              {/* The routed walking times, which cm8 does not publish at all. */}
              <dl className="mt-9 border-t border-ink">
                {walk.map((w) => (
                  <div key={w.key} className="flex items-baseline justify-between gap-4 border-b-[0.5px] border-rule py-3.5">
                    <dt className="text-[13px] text-ink-60">{t(`facts.stations.${w.key}`)}</dt>
                    <dd className="flex items-baseline gap-1.5">
                      <span className="font-serif text-[1.35rem] leading-none tabular-nums text-ink">{w.min}</span>
                      <span className="font-mono text-[11px] tracking-[0.08em] text-ink-60">min</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <ol className="space-y-0">
              {(t.raw('location.items') as string[]).map((item, i) => (
                <li key={item} className="flex gap-6 border-b-[0.5px] border-rule py-6 first:border-t first:border-t-ink first:pt-6">
                  <span
                    aria-hidden
                    className="shrink-0 font-serif text-[1.6rem] leading-none tabular-nums text-ink/30"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="max-w-[46ch] text-body text-ink">{item}</p>
                </li>
              ))}
              <li className="pt-7">
                <p className="max-w-[46ch] border-s-2 border-gold-deep ps-5 font-serif text-[1.2rem] italic leading-snug text-ink">
                  {t('location.close')}
                </p>
              </li>
            </ol>
          </div>
        </SectionBody>
      </Section>

      {/* ── kvalitet og møteplasser ─────────────────────────────────────── */}
      <Section tone="paper">
        <SectionBody>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
            {t('quality.eyebrow')}
          </p>
          <SectionHeading className="mt-4 max-w-2xl">
            {t.rich('quality.heading', { em: (chunks) => <Accent surface="paper">{chunks}</Accent> })}
          </SectionHeading>
          <p className="mt-6 max-w-[58ch] text-body text-ink-60">{t('quality.lede')}</p>

          <p className="mt-12 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-60 md:mt-16">
            {t('quality.listLabel')}
          </p>
          {/* Five plates. The first is wide on a large screen so the grid
             reads as a composition rather than as five equal boxes. */}
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {QUALITY_ITEMS.map((k, i) => (
              <li
                key={k}
                className={[
                  'group relative overflow-hidden rounded-2xl border border-rule bg-paper-2/50 p-6 transition-colors hover:border-gold-deep/40 hover:bg-paper-2',
                  // Six columns: the first two take three each, the last
                  // three take two each. Both rows fill exactly, and the
                  // grid reads as a composition rather than five equal
                  // boxes with a gap at the end.
                  i < 2 ? 'lg:col-span-3' : 'lg:col-span-2',
                ].join(' ')}
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gold-deep transition-transform duration-500 ease-out group-hover:scale-x-100 motion-reduce:transition-none rtl:origin-right"
                />
                <QualityIcon name={k} className="h-5 w-5 text-gold-deep" />
                <h3 className="mt-5 font-serif text-[1.2rem] leading-tight text-ink">
                  {t(`quality.items.${k}.title`)}
                </h3>
                <p className="mt-2 text-body text-ink-60">{t(`quality.items.${k}.body`)}</p>
              </li>
            ))}
          </ul>

          <p className="mt-10 font-serif text-[clamp(1.25rem,2.4vw,1.6rem)] italic leading-snug text-ink">
            {t('quality.close')}
          </p>
        </SectionBody>
      </Section>

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
