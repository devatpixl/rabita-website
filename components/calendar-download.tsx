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

  // ── FOUR BOXES, EVEN WHEN THERE IS NOT A FOURTH MONTH ────────────────────
  // Client, Mobilversjon 2026-10-06: "Kanskje ha fire neste månedene slik at
  // det blir fire bokser og ikke tre?" — asked again 2026-10-08, knowing the
  // fourth is empty.
  //
  // IRN has not generated 2027. /prayertimes/181/2027/1/ answers 200 with an
  // empty array, so calendarMonths — which derives the list from the days that
  // exist — returns three. lib/irn.ts already requests four, so the day they
  // publish, January fills itself and nothing here has to change.
  //
  // Until then the fourth is padded in and marked unavailable, because the
  // alternative is worse than a placeholder: /bonnetider/kalender?m=2027-01
  // does NOT 404 — an unknown month silently falls back to the first one it
  // has, so a working-looking link would quietly show October under a January
  // label. A box that plainly says "kommer" is honest; a link that lies is not.
  const SHOW = 4;
  const available = new Set(months);
  const shown = [...months];
  while (shown.length < SHOW && shown.length > 0) {
    const [y, m] = shown[shown.length - 1].split('-').map(Number);
    const next = new Date(y, m, 1);
    shown.push(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  }

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
          <ul className="self-center border-t border-ink max-md:mt-2 max-md:grid max-md:grid-cols-2 max-md:gap-2 max-md:border-t-0 md:col-span-7">
            {shown.map((key) => {
              const label = fmt.format(new Date(`${key}-01T00:00:00`));
              const ready = available.has(key);
              const row =
                'group flex min-h-[3.75rem] items-center justify-between gap-4 border-b border-rule px-1 transition-colors duration-200 max-md:min-h-11 max-md:justify-center max-md:rounded-full max-md:border max-md:border-rule max-md:px-4';
              return (
                <li key={key}>
                  {ready ? (
                    <Link href={`/${l}/bonnetider/kalender?m=${key}`} className={`${row} text-ink hover:px-3 hover:text-gold-deep`}>
                      <span className="font-serif text-[1.15rem] leading-none max-md:text-[1rem]">{label}</span>
                      <span
                        aria-hidden
                        className="shrink-0 text-ink-60 transition-transform duration-200 max-md:hidden group-hover:translate-x-1 group-hover:text-gold-deep rtl:rotate-180 rtl:group-hover:-translate-x-1"
                      >
                        &rarr;
                      </span>
                    </Link>
                  ) : (
                    // Not a link and not focusable: there is nothing behind it
                    // yet. aria-disabled rather than hiding it, so a screen
                    // reader is told the same thing the dimming says.
                    <span aria-disabled className={`${row} cursor-default text-ink-60 max-md:border-dashed`}>
                      <span className="whitespace-nowrap font-serif text-[1.15rem] leading-none text-ink-60 max-md:text-[1rem]">
                        {label}
                      </span>
                      {/* The word is md-and-up. At 390 a pill is 167px and
                         "januar 2027" alone is about 95 of them — adding
                         "KOMMER" beside it wrapped the month onto two lines
                         and made the fourth box taller than the three it sits
                         with. The dashed border and the muted type carry the
                         same signal in the space available; the screen reader
                         still gets aria-disabled either way. */}
                      <span className="hidden shrink-0 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-60 md:inline">
                        {tc('monthPending')}
                      </span>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </SectionBody>
    </section>
  );
}
