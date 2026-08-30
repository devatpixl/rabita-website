import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { getPrayerData } from '@/lib/irn';
import type { AppLocale } from '@/i18n/routing';
import { Accent } from './accent';
import { SectionBody } from './primitives';

// Replaces the 153-row table that used to run down this page. A full year
// of times inline turned the page into a directory you scroll rather than
// an answer you read; the months live at /bonnetider/kalender now, one
// sheet at a time.
//
// Server-rendered, so the month links are crawlable and the page still
// carries real content for the searches that bring people here.

const localeTag = (l: AppLocale) => (l === 'ar' ? 'ar-EG' : l === 'en' ? 'en-GB' : 'nb-NO');

export async function CalendarDownload() {
  const l = (await getLocale()) as AppLocale;
  const tc = await getTranslations('calendar');
  const { days } = await getPrayerData();
  const months = [...new Set(days.map((d) => d.date.slice(0, 7)))].sort();
  const fmt = new Intl.DateTimeFormat(localeTag(l), { month: 'long', year: 'numeric' });

  return (
    <section id="kalender" className="scroll-mt-24 bg-paper py-section-sm">
      <SectionBody>
        <div className="grid gap-8 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
              {tc('panelEyebrow')}
            </p>
            <h2 className="mt-4 font-serif text-section text-balance text-ink">
              {tc.rich('panelHeadingRich', { em: (chunks) => <Accent surface="paper">{chunks}</Accent> })}
            </h2>
            <p className="mt-4 max-w-prose text-body text-ink-60">{tc('panelBody')}</p>
          </div>

          {/* The months as one ruled register, not a grid of tinted boxes:
             five items never divide evenly into a grid, and the last row
             always left a hole. Same row pattern the key-figures registers
             use, so it reads as part of the same system. */}
          <ul className="self-center border-t border-ink md:col-span-7">
            {months.map((key) => (
              <li key={key}>
                <Link
                  href={`/${l}/bonnetider/kalender?m=${key}`}
                  className="group flex min-h-[3.75rem] items-center justify-between gap-4 border-b border-rule px-1 text-ink transition-colors duration-200 hover:px-3 hover:text-gold-deep"
                >
                  <span className="font-serif text-[1.15rem] leading-none">
                    {fmt.format(new Date(`${key}-01T00:00:00`))}
                  </span>
                  <span
                    aria-hidden
                    className="shrink-0 text-ink-60 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-gold-deep rtl:rotate-180 rtl:group-hover:-translate-x-1"
                  >
                    &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </SectionBody>
    </section>
  );
}
