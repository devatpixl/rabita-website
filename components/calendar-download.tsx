import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { getPrayerData } from '@/lib/irn';
import { calendarMonths } from '@/lib/prayer-times';
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
  const months = calendarMonths(days);
  const fmt = new Intl.DateTimeFormat(localeTag(l), { month: 'long', year: 'numeric' });

  return (
    <section id="kalender" className="scroll-mt-24 bg-paper py-section-sm">
      <SectionBody>
        <div className="grid gap-8 max-md:gap-5 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
              {tc('panelEyebrow')}
            </p>
            <h2 className="mt-4 font-serif text-section text-balance text-ink">
              {tc.rich('panelHeadingRich', { em: (chunks) => <Accent surface="paper">{chunks}</Accent> })}
            </h2>
            <p className="mt-4 max-w-prose text-body text-ink-60 max-md:hidden">{tc('panelBody')}</p>
          </div>

          {/* The months as one ruled register, not a grid of tinted boxes:
             five items never divide evenly into a grid, and the last row
             always left a hole. Same row pattern the key-figures registers
             use, so it reads as part of the same system. (Desktop only — the
             phone grid below is a different problem, see the next note.) */}
          {/* ── THREE ACROSS ON PHONES (client, Mobilversjon 2026-10-06) ─────
             "Kanskje ha fire neste månedene slik at det blir fire bokser og
             ikke tre?"

             He cannot have four. IRN has not published 2027 —
             /prayertimes/181/2027/1/ answers 200 with an empty array — so
             there are three months of data and no fourth to show. lib/irn.ts
             now asks for four so the box appears the day they generate it.

             What he is actually looking at is the WIDOW. Two columns with a
             lone third item spanning both read as a layout that came up
             short, and the old `[&>li:last-child:nth-child(odd)]:col-span-2`
             is what produced it.

             THE TWO-COLUMN GRID WAS NOT WRONG — it was built for four, and at
             four it is a clean 2x2. The widow is a symptom of the missing
             month, not of the CSS. Three across is therefore a deliberate
             trade: it is right for the three months that exist today and
             will itself leave a 3+1 widow the moment IRN publishes. Chosen
             with that understood (user, 2026-10-06: "looks good for now").

             Measured at 390: each box is 108px and the label wraps to two
             lines, "oktober" over "2026", with no overflow and no
             truncation in any of the three month names.

             WHEN THE FOURTH MONTH ARRIVES, the count-proof answer is one
             column — three or four or twelve all read as a list, which is
             the same conclusion the desktop register above reached. */}
          <ul className="self-center border-t border-ink max-md:mt-2 max-md:grid max-md:grid-cols-3 max-md:gap-2 max-md:border-t-0 md:col-span-7">
            {months.map((key) => (
              <li key={key}>
                <Link
                  href={`/${l}/bonnetider/kalender?m=${key}`}
                  className="group flex min-h-[3.75rem] items-center justify-between gap-4 border-b border-rule px-1 text-ink transition-colors duration-200 max-md:min-h-11 max-md:justify-center max-md:rounded-full max-md:border max-md:border-rule max-md:px-4 hover:px-3 hover:text-gold-deep"
                >
                  <span className="font-serif text-[1.15rem] leading-none max-md:text-[1rem]">
                    {fmt.format(new Date(`${key}-01T00:00:00`))}
                  </span>
                  <span
                    aria-hidden
                    className="shrink-0 text-ink-60 transition-transform duration-200 max-md:hidden group-hover:translate-x-1 group-hover:text-gold-deep rtl:rotate-180 rtl:group-hover:-translate-x-1"
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
