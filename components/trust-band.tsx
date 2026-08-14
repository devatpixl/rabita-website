import { getTranslations } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';

// Editorial hairline row (§8) — TRANSACTIONAL ONLY.
//
// The persuasive trust claims (tax deduction, audited accounts,
// building permit) used to live here AND in the WhereMoneyGoes cards,
// which read as a duplicate. Those claims now live only in that
// section; this band carries account details a donor might copy on the
// way down (Vipps, IBAN, SWIFT, konto, org.nr). Padlock stays only as
// the single glyph next to the organisation number.
export async function TrustBand() {
  const t = await getTranslations('trust');
  const ft = await getTranslations('footer');

  const items: { key: string; label: string; icon?: 'padlock' }[] = [
    { key: 'vipps', label: `${ft('vipps')} ${CAMPAIGN.vippsNumber}` },
    { key: 'account', label: `${ft('bankAccount')} ${CAMPAIGN.bankAccount}` },
    { key: 'iban', label: `${ft('iban')} ${CAMPAIGN.iban}` },
    { key: 'swift', label: `SWIFT ${CAMPAIGN.swift}` },
    { key: 'org', label: t('orgNr', { orgNr: CAMPAIGN.orgNr }), icon: 'padlock' },
  ];

  return (
    <section
      aria-labelledby="trust-heading"
      className="border-y-2 border-gold bg-gold-soft/30"
    >
      <h2 id="trust-heading" className="sr-only">
        {t('secure')}
      </h2>
      <div className="mx-auto max-w-6xl px-6 py-6">
        <ul className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          {items.map((item, i) => (
            <li key={item.key} className="flex items-center gap-3">
              {i > 0 && (
                <span aria-hidden className="hidden md:inline-block h-4 w-px bg-gold me-3" />
              )}
              {item.icon === 'padlock' && (
                <PadlockIcon className="h-3.5 w-3.5 text-gold-deep" />
              )}
              <span className="font-mono text-label uppercase tracking-widest text-ink">
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function PadlockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="4" y="10" width="16" height="10" rx="1" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
