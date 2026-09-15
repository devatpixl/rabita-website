import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { apartmentStats } from '@/lib/apartments';
import { Accent } from '@/components/accent';
import { ApartmentUnits } from '@/components/apartment-units';
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
// whole table. See lib/apartments.ts — the rule is what keeps this figure
// honest in both directions.

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

  // "2,8 millioner" rather than "2 800 000 kr" — the project's own way of
  // quoting it, and the shape a buyer reads at a glance. Formatted rather
  // than concatenated precisely because of the decimal: nb-NO wants 2,8 and
  // en-GB wants 2.8, and the cheapest unit has not always been a whole
  // million.
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
              {/* The "walking distances are measured along real routes"
                 caption is gone with the rest of the map's text (client,
                 2026-09-13). The distances are still real; the sentence
                 explaining that they are was one more thing to read. */}
            </div>
          </div>

          {/* The link across to cm8.no stood here until 2026-09-15
             ("Fjerne lenken til CM8"). It was a gold CTA carrying
             APARTMENTS_SOURCE, placed to answer the question the price above
             it raises — "from 6 million" is the start of a list, and the list
             lived there.

             WORTH KNOWING WHAT WENT WITH IT. lib/apartments.ts is a SNAPSHOT,
             read on 2026-09-02, and its own header names cm8.no as the source
             that governs. That link was the only route from this page to live
             prices and availability; without it our figures are the only ones
             a visitor sees and there is nowhere to check them. Flagged to the
             client. Restoring it is this block plus the import.

             apartments.sales.eyebrow / .line / .cta / .newTab stay in the
             message files, unreferenced and translated in all three. */}
        </SectionBody>
      </Section>

      {/* ── the apartments, one card each ───────────────────────────────
         Replaces "sentral beliggenhet" (client, 2026-09-13). That section
         made four claims about the neighbourhood, on a page that has already
         said where the building is twice — once in the opening copy and once
         on the map. These are the homes themselves, which is what a buyer
         came for. */}
      <ApartmentUnits />

      {/* Contained, in the same band as the project page's (client,
         2026-09-13: "make the images in appartments also same, fix the
         appartment format"). It had been left bare while that one sat in a
         SectionBody, so this gallery ran edge to edge and the plate cropped
         differently — two designs for one component. The wrapper IS the fix:
         the component has no opinion about its own width.

         THIRD, ahead of "kvalitet og møteplasser" (client, 2026-09-13:
         "erstatte en av seksjonene med leilighetene, og plasser som nummer
         3"). The renders used to sit fourth, after the facilities thread,
         which meant the page argued for the homes twice in words before it
         showed you one. */}
      <section className="bg-paper-2 pt-14 pb-section-md md:pt-20">
        <SectionBody>
          <ProjectGallery
            // Apartment-led since 2026-09-15. Five of the seven are now the
            // inside of the flats, which is what a buyer on this page is
            // deciding on; minaret and garden stay so the building the flats
            // sit in is still in the reel. The project page is untouched — it
            // passes no `only` and renders SLIDES in its own order.
            only={[
              // Twelve slides, every one of them the client's own render of
              // these flats. minaret and garden dropped from THIS page on
              // 2026-09-15: his folder carries the same subjects shot from
              // the apartments themselves — apartmentRoof, apartmentCourtyard
              // and apartmentDusk, which has the lit minaret in frame. The
              // project page still renders both; it passes no `only`.
              //
              // Ordered inside-out: the flats, then the balcony at dusk, then
              // the building they sit in.
              'apartmentLiving',
              'apartmentAttic',
              'apartmentFamily',
              'apartmentGreen',
              'apartmentBalcony',
              'apartmentCalligraphy',
              'apartmentArt',
              'apartmentKitchen',
              'apartmentDusk',
              'apartmentFacade',
              'apartmentRoof',
              'apartmentCourtyard',
            ]}
          />
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
