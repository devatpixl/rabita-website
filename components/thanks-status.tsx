'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Accent } from './accent';

// ── /takk TELLS THE TRUTH ─────────────────────────────────────────────
// Until 2026-10-10 the thank-you page was static: everyone who landed on it
// read «Takk. Gaven din er registrert. Kvittering er sendt» — including the
// user, who had just pressed Cancel in Vipps. The backend knew (Vipps sent
// ABORTED, the row was `cancelled`, /donations/status said so); the page never
// asked.
//
// Now it asks. Vipps returns the donor to /takk?ref=<payment> for one-time
// gifts and /takk?sub=<agreement> for monthly ones (both built by the
// backend's checkout view). This component reads whichever is present, calls
// the site's own /api/donations/status — a pass-through to the backend, so
// the browser never needs the backend's origin — and renders ONE of:
//
//   checking   first paint, before the first answer
//   ok         one_time authorized|captured  → the thank-you as before
//   monthlyOk  monthly active                → the agreement is live
//   pending    still pending after ~30s of polling → say so, offer a refresh
//   cancelled  cancelled|failed|expired|stopped → no money moved, try again
//   notFound   404 / backend unreachable      → we cannot see it, contact us
//   none       no ref at all (the pre-backend stub path) → a neutral thanks
//
// Polling: a row is `pending` for the seconds between the donor paying and
// the webhook landing (the backend also re-asks Vipps on every status call).
// Innocents' page asks once and shows "pending" forever if it loses that
// race; this one re-asks every 2s, 15 times, then gives up honestly.
//
// `after` is the rest of the page — the meter, the certificate, the share
// row and the conversion ping — rendered by the server and shown ONLY on a
// confirmed gift. A certificate for a cancelled payment is a lie on paper.

type View = 'checking' | 'ok' | 'monthlyOk' | 'pending' | 'cancelled' | 'notFound' | 'none';

const OK_ONE_TIME = new Set(['authorized', 'captured']);
const OK_MONTHLY = new Set(['active']);
const CANCELLED = new Set(['cancelled', 'failed', 'expired', 'stopped']);
const POLL_MS = 2000;
const POLL_MAX = 15;

export function ThanksStatus({
  locale,
  children,
  after,
}: {
  locale: string;
  /** The seal + mark above the words, server-rendered. */
  children: ReactNode;
  /** Everything below the acknowledgement; shown only when the gift is confirmed. */
  after: ReactNode;
}) {
  const t = useTranslations('thanks');
  const search = useSearchParams();
  const ref = (search.get('ref') || search.get('sub') || '').trim();
  const [view, setView] = useState<View>(ref ? 'checking' : 'none');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!ref) return;
    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const ask = async () => {
      attempts += 1;
      try {
        const res = await fetch(`/api/donations/status?ref=${encodeURIComponent(ref)}`, { cache: 'no-store' });
        if (cancelled) return;
        if (res.status === 404) { setView('notFound'); return; }
        const json = (await res.json().catch(() => null)) as
          | { ok?: boolean; kind?: string; status?: string }
          | null;
        if (!json?.ok) { setView('notFound'); return; }
        const status = String(json.status ?? '').toLowerCase();
        const monthly = json.kind === 'monthly';
        if (monthly ? OK_MONTHLY.has(status) : OK_ONE_TIME.has(status)) { setView(monthly ? 'monthlyOk' : 'ok'); return; }
        if (CANCELLED.has(status)) { setView('cancelled'); return; }
        // pending — keep asking for a while, then say so
        if (attempts < POLL_MAX) { timer = setTimeout(ask, POLL_MS); } else { setView('pending'); }
      } catch {
        if (!cancelled) setView('notFound');
      }
    };
    setView('checking');
    ask();
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [ref, tick]);

  const confirmed = view === 'ok' || view === 'monthlyOk' || view === 'none';
  const key = view === 'ok' ? null : `status.${view}`;
  const em = (chunks: ReactNode) => <Accent surface="paper">{chunks}</Accent>;

  return (
    <>
      {children}
      <p className="mt-7 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep" aria-live="polite">
        {key ? t(`${key}.eyebrow`) : t('eyebrow')}
      </p>
      <h1 className="mt-4 font-serif text-display leading-[1.02] text-balance text-ink">
        {key ? t.rich(`${key}.headlineRich`, { em }) : t.rich('headlineRich', { em })}
      </h1>
      <p className="mt-6 max-w-[52ch] text-body leading-relaxed text-ink-60">
        {key ? t(`${key}.body`) : t('receipt')}
      </p>

      {view === 'cancelled' && (
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/${locale}/gi-en-gave`}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gold-deep px-6 text-body font-semibold text-paper transition-colors hover:bg-ink"
          >
            {t('status.cancelled.retry')} <span aria-hidden className="rtl:rotate-180">&rarr;</span>
          </Link>
          <Link
            href={`/${locale}/kontakt`}
            className="inline-flex min-h-12 items-center rounded-full border border-ink px-6 text-body font-semibold text-ink transition-colors hover:border-gold-deep hover:bg-gold-deep hover:text-paper"
          >
            {t('status.cancelled.contact')}
          </Link>
        </div>
      )}
      {view === 'pending' && (
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setTick((n) => n + 1)}
            className="inline-flex min-h-12 items-center rounded-full border border-ink px-6 text-body font-semibold text-ink transition-colors hover:border-gold-deep hover:bg-gold-deep hover:text-paper"
          >
            {t('status.pending.refresh')}
          </button>
        </div>
      )}
      {view === 'notFound' && (
        <div className="mt-8">
          <Link
            href={`/${locale}/kontakt`}
            className="inline-flex min-h-12 items-center rounded-full border border-ink px-6 text-body font-semibold text-ink transition-colors hover:border-gold-deep hover:bg-gold-deep hover:text-paper"
          >
            {t('status.notFound.contact')}
          </Link>
        </div>
      )}

      {confirmed && after}
    </>
  );
}
