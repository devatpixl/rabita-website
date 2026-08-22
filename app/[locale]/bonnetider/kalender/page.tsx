import Image from 'next/image';
import Link from 'next/link';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN, PRAYER_TIMES_TODAY } from '@/lib/campaign';
import { PRAYER_DAYS, type PrayerDay } from '@/lib/prayer-times';
import { PrintButton } from '@/components/print-button';
import type { AppLocale } from '@/i18n/routing';

// A month of prayer times as a document, not a page section.
//
// The 153-row table used to sit inline on /bonnetider, which made the page
// a directory rather than an answer. It lives here instead, one month at a
// time, laid out for A4 and for a noticeboard.
//
// Rendered as HTML and printed rather than generated with a PDF library.
// Every common PDF library lacks Arabic shaping, so the /ar calendar would
// come out as disconnected, unjoined letters — unacceptable on a mosque
// calendar. The browser shapes Arabic correctly, embeds the site's own
// fonts, and costs no dependency.

const localeTag = (l: AppLocale) => (l === 'ar' ? 'ar-EG' : l === 'en' ? 'en-GB' : 'nb-NO');
const hijriTag = (l: AppLocale) =>
  l === 'ar'
    ? 'ar-SA-u-ca-islamic-umalqura'
    : l === 'en'
    ? 'en-GB-u-ca-islamic-umalqura'
    : 'nb-NO-u-ca-islamic-umalqura';

// Not `new Date(iso)` — that parses as UTC and can resolve to the day before.
const parseDay = (iso: string) => new Date(`${iso}T00:00:00`);

export function generateStaticParams() {
  return ['no', 'en', 'ar'].map((locale) => ({ locale }));
}

export default async function CalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ m?: string }>;
}) {
  const { locale } = await params;
  const { m } = await searchParams;
  setRequestLocale(locale);
  const l = (await getLocale()) as AppLocale;
  const t = await getTranslations('bonnetiderPage');
  const tc = await getTranslations('calendar');

  const months = [...new Set(PRAYER_DAYS.map((d) => d.date.slice(0, 7)))].sort();
  const month = m && months.includes(m) ? m : months[0];
  const rows: PrayerDay[] = PRAYER_DAYS.filter((d) => d.date.startsWith(month));

  const tag = localeTag(l);
  const monthFmt = new Intl.DateTimeFormat(tag, { month: 'long', year: 'numeric' });
  const weekdayFmt = new Intl.DateTimeFormat(tag, { weekday: 'short' });
  const hijriDayFmt = new Intl.DateTimeFormat(hijriTag(l), { day: 'numeric', month: 'short' });
  const hijriSpanFmt = new Intl.DateTimeFormat(hijriTag(l), { month: 'long', year: 'numeric' });

  const first = parseDay(rows[0].date);
  const last = parseDay(rows[rows.length - 1].date);
  const hijriStart = hijriSpanFmt.format(first);
  const hijriEnd = hijriSpanFmt.format(last);
  const hijriSpan = hijriStart === hijriEnd ? hijriStart : `${hijriStart} – ${hijriEnd}`;

  const COLUMNS = [
    { key: 'fajr', label: 'Fajr' },
    { key: 'sunrise', label: t('sunrise') },
    { key: 'dhuhr', label: 'Dhuhr' },
    { key: 'asr', label: 'Asr' },
    { key: 'maghrib', label: 'Maghrib' },
    { key: 'isha', label: 'Isha' },
  ] as const;

  return (
    <main className="print-doc bg-paper py-10 print:py-0">
      <div className="mx-auto w-full max-w-[62rem] px-6 print:max-w-none print:px-0">
        {/* Screen-only controls. Never on paper. */}
        <div data-print-hide className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/${l}/bonnetider`}
            className="inline-flex min-h-11 items-center text-body font-semibold text-ink underline decoration-gold underline-offset-4"
          >
            {tc('back')}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            {months.map((key) => (
              <Link
                key={key}
                href={`/${l}/bonnetider/kalender?m=${key}`}
                aria-current={key === month ? 'page' : undefined}
                className={
                  key === month
                    ? 'min-h-11 rounded-chip border-[1.5px] border-ink px-4 py-2 text-[14px] font-semibold text-ink'
                    : 'min-h-11 rounded-chip border border-rule px-4 py-2 text-[14px] text-ink-60 transition-colors hover:border-ink hover:text-ink'
                }
              >
                {monthFmt.format(parseDay(`${key}-01`))}
              </Link>
            ))}
            <PrintButton label={tc('download')} />
          </div>
        </div>

        {/* ── The document ─────────────────────────────────────────── */}
        <article className="border border-rule bg-paper p-10 print:border-0 print:p-0">
          <header className="flex items-start justify-between gap-8 border-b-2 border-ink pb-5">
            <div className="flex items-center gap-4">
              <Image
                src="/logo/rabita-mark-256.png"
                alt=""
                width={56}
                height={56}
                className="h-14 w-14"
              />
              <div className="leading-tight">
                <p className="font-serif text-[1.15rem] font-medium text-ink">{tc('orgName')}</p>
                <p className="font-serif text-[0.95rem] italic text-ink-60">Rabita</p>
              </div>
            </div>
            <div className="text-end">
              <p className="font-serif text-[1.15rem] text-ink">{tc('title')}</p>
              <p className="mt-1 text-[0.8rem] text-ink-60">{CAMPAIGN.address}</p>
            </div>
          </header>

          <div className="mt-7 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1">
            <h1 className="font-serif text-[2rem] leading-none text-ink">
              {monthFmt.format(first)}
            </h1>
            <p className="text-[0.85rem] tabular-nums text-ink-60">{hijriSpan}</p>
          </div>

          <table className="mt-6 w-full border-collapse text-[0.8rem]">
            <thead>
              <tr>
                <th className="border-b border-ink py-2 pe-3 text-start font-mono text-[0.62rem] uppercase tracking-[0.12em] font-normal text-ink-60">
                  {t('day')}
                </th>
                <th className="border-b border-ink px-3 py-2 text-start font-mono text-[0.62rem] uppercase tracking-[0.12em] font-normal text-ink-60">
                  {tc('hijri')}
                </th>
                {COLUMNS.map((c) => (
                  <th
                    key={c.key}
                    className="border-b border-ink px-2 py-2 text-end font-mono text-[0.62rem] uppercase tracking-[0.12em] font-normal text-ink-60"
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const d = parseDay(row.date);
                const isFriday = d.getDay() === 5;
                return (
                  <tr key={row.date} className={isFriday ? 'bg-paper-2 print:bg-paper-2' : undefined}>
                    <td className="whitespace-nowrap border-b border-rule py-1.5 pe-3 text-ink">
                      <span className="tabular-nums">{d.getDate()}</span>
                      <span className="ms-2 text-ink-60">{weekdayFmt.format(d)}</span>
                    </td>
                    <td className="whitespace-nowrap border-b border-rule px-3 py-1.5 tabular-nums text-ink-60">
                      {hijriDayFmt.format(d)}
                    </td>
                    {COLUMNS.map((c) => (
                      <td
                        key={c.key}
                        className="border-b border-rule px-2 py-1.5 text-end tabular-nums text-ink"
                      >
                        {row[c.key]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2 border border-rule bg-paper-2 px-5 py-3">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-gold-deep">
              {t('jumua')}
            </p>
            <p className="font-serif text-[1.35rem] leading-none tabular-nums text-ink">
              {PRAYER_TIMES_TODAY.jumua}
            </p>
            <p className="text-[0.8rem] text-ink-60">{t('jumuaNote')}</p>
          </div>

          <footer className="mt-7 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-t border-rule pt-4 text-[0.72rem] text-ink-60">
            <p>{tc('source')}</p>
            <p className="tabular-nums">
              {CAMPAIGN.address} · Org.nr. {CAMPAIGN.orgNr} · Vipps {CAMPAIGN.vippsNumber}
            </p>
          </footer>
        </article>
      </div>
    </main>
  );
}
