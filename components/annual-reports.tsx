import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ANNUAL_REPORTS } from '@/lib/reports';
import { Accent } from './accent';
import { SectionBody } from './primitives';

// Annual reports and the organisation chart, on /om-oss (client, 2026-09-13:
// "Legg inn årsrapporter, litt som bønnetabellene på bønnetider" and "Legg
// in organisasjonskart").
//
// The reports use the SAME register as the prayer calendar's month list:
// ruled rows on a 5/7 split, serif label, arrow that steps on hover. He named
// that panel as the model, and reusing it means the two read as one system
// rather than as two people's idea of a download list.
//
// Rows carried "PDF · 6.4 MB" until 2026-09-14, when the client asked for it
// off. It wrapped to two lines in the narrow column, which is what he was
// looking at. Worth knowing what went with it: the 2022 report is 31.5MB, and
// nothing on the page now warns anyone before they tap it on mobile data.
// aboutPage.reports.mb stays in the message files, unreferenced.
//
// The chart is the client's own image. It is NOT rebuilt as markup: it names
// twenty-eight real people with their roles, and transcribing those by eye
// into HTML is a way to misspell somebody's name on their own mosque's
// website. The cost of that decision is honest and stated below.

export async function AnnualReports() {
  const t = await getTranslations('aboutPage.reports');

  return (
    <section id="arsrapporter" className="scroll-mt-24 bg-paper-2 py-section-md">
      <SectionBody>
        <div className="grid gap-8 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
              {t('eyebrow')}
            </p>
            <h2 className="mt-4 font-serif text-section text-balance text-ink">
              {t.rich('heading', { em: (chunks) => <Accent surface="paper">{chunks}</Accent> })}
            </h2>
            <p className="mt-4 max-w-prose text-body text-ink-60">{t('lede')}</p>
          </div>

          {/* TWO controls per row, not one (client, 2026-09-14: "download them
             as doing now, but also open in new page so can view it").
             A single click cannot do both: `download` tells the browser to
             save the file and specifically NOT to navigate to it, so the row
             could either open a viewer or save, never both. Forcing both from
             one click means scripting a save alongside window.open, which
             trips popup blockers and gives the reader two surprises at once.

             So the row opens the PDF in a new tab — "open like normally
             things open" — and a separate button beside it saves. Two
             anchors side by side rather than one wrapping the other, because
             an <a> inside an <a> is invalid markup. */}
          <ul className="self-center border-t border-ink md:col-span-7">
            {ANNUAL_REPORTS.map((r) => (
              <li
                key={r.year}
                className="flex min-h-[3.75rem] items-center gap-2 border-b border-rule"
              >
                <a
                  href={r.file}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-1 items-center gap-3 self-stretch px-1 text-ink transition-[padding,color] duration-200 hover:px-3 hover:text-gold-deep"
                >
                  {/* The label pair is baseline-aligned to itself; the row is
                     centre-aligned. Mixing the two on one flex line is what
                     put the two arrows on different lines. */}
                  <span className="font-serif text-[1.15rem] leading-none tabular-nums">
                    {t('year', { year: r.year })}
                  </span>
                  <span
                    aria-hidden
                    className="ms-auto shrink-0 text-ink-60 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-gold-deep rtl:rotate-180 rtl:group-hover:-translate-x-1"
                  >
                    &rarr;
                  </span>
                </a>
                <a
                  href={r.file}
                  download
                  aria-label={t('download', { year: r.year })}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-60 transition-colors hover:bg-paper hover:text-gold-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-deep/50"
                >
                  <span aria-hidden className="text-[0.95rem] leading-none">&darr;</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* ── organisasjonskart ──────────────────────────────────────────── */}
        <div className="mt-16 md:mt-24">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
            {t('chartEyebrow')}
          </p>
          <h2 className="mt-4 max-w-2xl font-serif text-section text-balance text-ink">
            {t.rich('chartHeading', { em: (chunks) => <Accent surface="paper">{chunks}</Accent> })}
          </h2>

          {/* UNOPTIMIZED, and the width capped at the file's own 1024px.
             Two separate reasons, both visible on this particular image:

             next.config sets formats: ['image/avif', 'image/webp'], so the
             optimizer re-encodes. The client's file is ALREADY a lossy webp,
             so the page was serving a lossy AVIF made from a lossy webp —
             generation loss, and this image is almost entirely 10px text,
             which is precisely what lossy codecs smear. Opening the file
             directly looked sharper because that is the untouched original.
             It is 49KB; there is nothing for the optimizer to win here.

             And the plate is 1104px wide while the source is 1024, so it was
             also being stretched 8% past native. max-w caps that: better a
             slightly narrower chart than a soft one. */}
          <div className="mx-auto mt-8 max-w-[1024px] overflow-hidden rounded-2xl border border-rule bg-paper md:mt-10">
            <Image
              src="/photos/organisasjonskart.webp"
              alt={t('chartAlt')}
              width={1024}
              height={724}
              unoptimized
              className="h-auto w-full"
            />
          </div>

          {/* The chart is an image, so its names are ~10px on a phone. This
             opens the file itself, where the reader can pinch to zoom — which
             is a better answer on a touch screen than any zoom control we
             could build over it. */}
          <a
            href="/photos/organisasjonskart.webp"
            target="_blank"
            rel="noreferrer"
            className="group mt-4 inline-flex items-center gap-2 border-b border-gold-deep/40 pb-1 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-gold-deep hover:border-gold-deep"
          >
            {t('chartOpen')}
            <span
              aria-hidden
              className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
            >
              &rarr;
            </span>
          </a>
        </div>
      </SectionBody>
    </section>
  );
}
