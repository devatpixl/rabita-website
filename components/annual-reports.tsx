import { getTranslations } from 'next-intl/server';
import { OrgChart } from './org-chart';
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

export async function AnnualReports({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'aboutPage.reports' });

  // paper, not paper-2, since 2026-09-15. Besøk oss merged into this page
  // directly above and has to stand on paper-2 — its form card is bg-paper
  // and stops reading as a card on any lighter ground — so two paper-2
  // sections would have met here and read as one flat strip instead of two.
  return (
    <>
    <section id="arsrapporter" className="scroll-mt-24 bg-paper py-section-md">
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
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-60 transition-colors hover:bg-paper-2 hover:text-gold-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-deep/50"
                >
                  <span aria-hidden className="text-[0.95rem] leading-none">&darr;</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

      </SectionBody>
    </section>

    {/* ── ORGANISASJONSKART, ON THE SAGE GROUND ──────────────────────────
       Client, 2026-09-16: "for this organisation part, use light green in
       background as colour which comes in our theme and used other places
       also". That is `sage` (#E3EAE4) — the site's own green, already the
       ground under the campaign meter, the membership recognition block and
       every form well.

       It is a section of its own now rather than the tail of Årsrapportene.
       The two were one block on paper, so the chart read as an appendix to
       the reports; on its own ground it is a thing in its own right, and the
       paper/sage step does the separating that a 6rem margin was doing
       before. */}
    <section id="organisasjonskart" className="scroll-mt-24 bg-sage py-section-md">
      <SectionBody>
        <div>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
            {t('chartEyebrow')}
          </p>
          <h2 className="mt-4 max-w-2xl font-serif text-section text-balance text-ink">
            {t.rich('chartHeading', { em: (chunks) => <Accent surface="paper">{chunks}</Accent> })}
          </h2>

          {/* THE CHART ITSELF, as markup (client, 2026-09-16: "Gjøre
             organisasjonskart til en integrert del av nettsiden").

             It was a single 1024x724 webp until today. The names in it are
             about 10px of baked-in pixels, so on a phone they could not be
             read, and to a screen reader, a translator or a search engine
             they did not exist at all. OrgChart renders the same 28 people as
             text that reflows, translates and can be selected.

             The image is still linked below, because it carries a portrait of
             each person and this does not — they live inside that one file at
             ~51px across, too small to crop out and reuse honestly. */}
          <OrgChart locale={locale} />

          {/* Still here, but doing a different job now. It used to be the
             only way to read the chart on a phone; the markup above has taken
             that over. What the file still has that the markup does not is a
             photograph of each person. */}
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
    </>
  );
}
