import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { PRAYER_DAYS } from '@/lib/prayer-times';
import type { AppLocale } from '@/i18n/routing';

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
  const months = [...new Set(PRAYER_DAYS.map((d) => d.date.slice(0, 7)))].sort();
  const fmt = new Intl.DateTimeFormat(localeTag(l), { month: 'long', year: 'numeric' });

  return (
    <section className="mt-16 border-t border-rule pt-10">
      <div className="grid gap-8 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <h2 className="font-serif text-section text-balance text-ink">{tc('panelHeading')}</h2>
          <p className="mt-4 max-w-prose text-body text-ink-60">{tc('panelBody')}</p>
        </div>
        <div className="md:col-span-7">
          <ul className="border-t border-rule">
            {months.map((key) => (
              <li key={key}>
                <Link
                  href={`/${l}/bonnetider/kalender?m=${key}`}
                  className="group flex min-h-14 items-center justify-between gap-4 border-b border-rule text-ink transition-colors hover:text-gold-deep"
                >
                  <span className="font-serif text-[1.1rem]">
                    {fmt.format(new Date(`${key}-01T00:00:00`))}
                  </span>
                  <span
                    aria-hidden
                    className="shrink-0 text-ink-60 transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                  >
                    &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
