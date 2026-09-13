import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { ANNUAL_REPORTS, reportSizeMb } from '@/lib/reports';
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
// Two departures from that panel, both because these are PDFs and the months
// are pages:
//   - every row carries its size. Handing someone a 31MB download on mobile
//     data without saying so is not a detail, it is the whole decision.
//   - `download` on the anchor, so a click saves the file instead of
//     replacing the page with a PDF viewer the reader then has to back out of.
//
// The chart is the client's own image. It is NOT rebuilt as markup: it names
// twenty-eight real people with their roles, and transcribing those by eye
// into HTML is a way to misspell somebody's name on their own mosque's
// website. The cost of that decision is honest and stated below.

export async function AnnualReports() {
  const locale = await getLocale();
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

          <ul className="self-center border-t border-ink md:col-span-7">
            {ANNUAL_REPORTS.map((r) => (
              <li key={r.year}>
                <a
                  href={r.file}
                  download
                  className="group flex min-h-[3.75rem] items-center justify-between gap-4 border-b border-rule px-1 text-ink transition-[padding,color] duration-200 hover:px-3 hover:text-gold-deep"
                >
                  <span className="flex items-baseline gap-3">
                    <span className="font-serif text-[1.15rem] leading-none tabular-nums">
                      {t('year', { year: r.year })}
                    </span>
                    <span className="font-mono text-[0.6875rem] tabular-nums text-ink-40">
                      PDF · {t('mb', { n: reportSizeMb(r.bytes, locale) })}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="shrink-0 text-ink-60 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-gold-deep rtl:rotate-180 rtl:group-hover:-translate-x-1"
                  >
                    &darr;
                  </span>
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

          <div className="mt-8 overflow-hidden rounded-2xl border border-rule bg-paper md:mt-10">
            <Image
              src="/photos/organisasjonskart.webp"
              alt={t('chartAlt')}
              width={1024}
              height={724}
              sizes="(min-width: 1152px) 1104px, 100vw"
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
