import Image from 'next/image';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { PrintButton } from '@/components/print-button';
import type { AppLocale } from '@/i18n/routing';

// The gift certificate, as a one-page A4 document (client, 2026-09-14:
// "make a pdf, very modern, and matching aesthetics of the website").
//
// HTML PRINTED BY THE BROWSER, not a PDF library — the same decision, for the
// same reason, as /bonnetider/kalender: no common PDF library shapes Arabic,
// so the /ar certificate would come out as disconnected, unjoined letters on
// a document from a mosque. The browser shapes it correctly, embeds the
// site's own faces, and costs no dependency. globals.css already carries
// @page A4 and the print rules this leans on.
//
// ── THIS IS A SPECIMEN ────────────────────────────────────────────────────
// /api/donations is a stub that returns a fake session id; there is no
// payment, no persistence and no email in this project yet. So the page is
// marked EKSEMPEL on screen and on paper, and the signature is an obvious
// placeholder rather than anyone's actual hand. A document that looks like a
// receipt for money nobody gave should never be mistakable for the real
// thing, and the mark is what makes the difference.
//
// ── WHEN PAYMENTS ARE REAL ────────────────────────────────────────────────
// Take a signed reference (?ref=...) and look the gift up server-side. Do NOT
// keep passing the donor's name and amount in the query string as the preview
// does: a URL carrying somebody's name and what they gave leaks through
// referrers, browser history and server logs. The preview does it only
// because there is nothing to look up.

export function generateStaticParams() {
  return ['no', 'en', 'ar'].map((locale) => ({ locale }));
}

const localeTag = (l: AppLocale) => (l === 'ar' ? 'ar-EG' : l === 'en' ? 'en-GB' : 'nb-NO');

export default async function CertificatePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ name?: string; amount?: string; ref?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = (await getLocale()) as AppLocale;
  const t = await getTranslations('certificate');
  const tn = await getTranslations('nav');
  const sp = await searchParams;

  const name = sp.name?.slice(0, 80) || t('sampleName');
  const amount = Number(sp.amount) > 0 ? Math.round(Number(sp.amount)) : 2500;
  const reference = sp.ref?.slice(0, 24) || 'EKS-2026-0001';

  const nf = new Intl.NumberFormat(localeTag(l));
  const today = new Intl.DateTimeFormat(localeTag(l), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const rows: [string, string][] = [
    [t('rows.reference'), reference],
    [t('rows.date'), today],
    [t('rows.purpose'), t('purposeBuilding')],
    [t('rows.orgNr'), CAMPAIGN.orgNr],
  ];

  return (
    <main className="min-h-screen bg-paper-2 py-10 print:bg-white print:py-0">
      {/* Screen-only chrome. Never on paper. */}
      <div data-print-hide className="mx-auto mb-8 flex max-w-[210mm] items-center justify-between gap-4 px-6">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
          {t('previewNote')}
        </p>
        <PrintButton label={t('save')} />
      </div>

      {/* The sheet. A4 proportions on screen so what you see is what prints;
         on paper the @page rule in globals.css owns the margins. */}
      <article className="print-doc relative mx-auto flex min-h-[297mm] w-full max-w-[210mm] flex-col overflow-hidden bg-paper px-[18mm] py-[20mm] shadow-[0_1px_2px_rgba(26,26,24,0.04),0_30px_80px_-40px_rgba(26,26,24,0.35)] print:min-h-0 print:max-w-none print:p-0 print:shadow-none">
        {/* The specimen mark. Set in the paper itself rather than stamped over
           the type, so the document still reads as designed while never being
           mistakable for a real receipt. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 grid place-items-center"
        >
          <span className="-rotate-[24deg] font-serif text-[7rem] leading-none tracking-[0.08em] text-ink/[0.045] print:text-ink/[0.07]">
            {t('specimen')}
          </span>
        </span>

        {/* ── head ───────────────────────────────────────────────────── */}
        <header className="relative flex items-start justify-between gap-6 border-b border-rule pb-7">
          <div className="flex items-center gap-4">
            <Image
              src="/logo/rabita-mark-256.png"
              alt=""
              width={52}
              height={52}
              className="h-[52px] w-[52px]"
            />
            <span>
              <span className="block font-serif text-[1.35rem] leading-tight text-ink">
                {tn('orgName')}
              </span>
              <span className="block font-serif text-[1rem] italic leading-tight text-ink-60">
                {tn('wordmark')}
              </span>
            </span>
          </div>
          <span className="text-end font-mono text-[0.625rem] uppercase leading-relaxed tracking-[0.16em] text-ink-60">
            {CAMPAIGN.address}
            <br />
            {CAMPAIGN.postalCity}
          </span>
        </header>

        {/* ── the statement ──────────────────────────────────────────── */}
        <div className="relative mt-12">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
            {t('eyebrow')}
          </p>
          <h1 className="mt-4 max-w-[18ch] font-serif text-[2.6rem] leading-[1.06] text-balance text-ink">
            {t('heading')}
          </h1>
          <p className="mt-5 max-w-[56ch] text-body leading-relaxed text-ink-60">{t('lede')}</p>
        </div>

        {/* ── who and how much ───────────────────────────────────────── */}
        <div className="relative mt-11 grid gap-8 sm:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-40">
              {t('rows.donor')}
            </p>
            <p className="mt-2 font-serif text-[1.5rem] leading-tight text-ink">{name}</p>
          </div>
          <div className="sm:text-end">
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-40">
              {t('rows.amount')}
            </p>
            <p className="mt-2 font-serif text-[2.1rem] leading-none text-gold-deep">
              {nf.format(amount)}{' '}
              <span className="font-sans text-[0.42em] uppercase tracking-[0.12em] text-ink-60">
                {t('kr')}
              </span>
            </p>
          </div>
        </div>

        {/* ── the particulars ────────────────────────────────────────── */}
        <dl className="relative mt-10 border-t border-ink">
          {rows.map(([k, v]) => (
            <div
              key={k}
              className="flex items-baseline justify-between gap-6 border-b border-rule py-3"
            >
              <dt className="text-[0.8125rem] text-ink-60">{k}</dt>
              <dd className="text-end font-mono text-[0.8125rem] tabular-nums text-ink">{v}</dd>
            </div>
          ))}
        </dl>

        {/* ── signature ──────────────────────────────────────────────── */}
        {/* mt-auto pins this to the foot of the sheet however long the body
           runs, which is what makes it read as a signed document rather than
           as a paragraph that happens to end with a name. */}
        <div className="relative mt-auto flex items-end justify-between gap-10 pt-16">
          <div>
            {/* A PLACEHOLDER hand, drawn as a path — not a scan of anyone's
               real signature, which we do not have and should not invent.
               Replace with the signatory's own image when Rabita supplies it. */}
            <svg viewBox="0 0 260 70" className="h-[46px] w-[172px] text-ink" aria-hidden>
              <path
                d="M6 48c18-4 26-30 36-30s6 30 18 30 20-36 32-36 8 34 20 34 16-22 26-22 6 16 16 16c8 0 14-6 20-12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M180 52c22 2 44 0 66-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.5"
              />
            </svg>
            <span aria-hidden className="mt-2 block h-px w-[200px] bg-ink/25" />
            <p className="mt-2 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-60">
              {t('signatory')}
            </p>
          </div>
          <Image
            src="/logo/rabita-mark-256.png"
            alt=""
            width={40}
            height={40}
            aria-hidden
            className="h-10 w-10 opacity-40"
          />
        </div>

        <p className="relative mt-8 border-t border-rule pt-5 text-[0.75rem] leading-relaxed text-ink-40">
          {t('foot', { orgNr: CAMPAIGN.orgNr })}
        </p>
      </article>
    </main>
  );
}
