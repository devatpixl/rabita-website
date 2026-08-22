import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CAMPAIGN } from '@/lib/campaign';
import { formatAmount } from '@/lib/format';
import type { AppLocale } from '@/i18n/routing';

// The site's own thank-you page. Receipt confirmation, next milestone, share
// prompt, tracked conversion event. Currently the thank-you belongs to the
// payment provider, which is the cheapest place on the site to ask for a
// share and it is being given away (§3).
export default async function ThankYouPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'thanks' });
  const raised = formatAmount(locale as AppLocale, CAMPAIGN.raisedNok);

  return (
    <main className="bg-paper">
      <div className="mx-auto max-w-3xl px-6 py-section-lg">
        <p className="mb-4 text-[13px] text-gold">
          {t('eyebrow')}
        </p>
        <h1 className="mb-8 font-serif text-display text-ink">{t('headline')}</h1>

        <div className="space-y-6 text-body text-ink">
          <p>{t('receipt')}</p>
          <p className="border-s-2 border-rule ps-4 text-ink-60">
            {t('nextMilestone')}
          </p>
          <p className="tabular-nums text-ink-60">
            {raised} kr / {formatAmount(locale as AppLocale, CAMPAIGN.goalNok)} kr
          </p>
        </div>

        <div className="mt-10 border-t border-rule pt-6">
          <p className="mb-4 text-body text-ink">{t('sharePrompt')}</p>
          <div className="flex flex-wrap gap-3">
            <a
              className="min-h-11 rounded-full border border-ink px-4 py-2 text-body font-semibold text-ink hover:bg-ink hover:text-paper transition-colors"
              href="https://api.whatsapp.com/send?text=https%3A%2F%2Frabita.no"
              target="_blank"
              rel="noreferrer"
            >
              {t('shareWhatsapp')}
            </a>
            <a
              className="min-h-11 rounded-full border border-ink px-4 py-2 text-body font-semibold text-ink hover:bg-ink hover:text-paper transition-colors"
              href="mailto:?subject=Rabita&body=https%3A%2F%2Frabita.no"
            >
              {t('shareEmail')}
            </a>
          </div>
        </div>

        <div className="mt-10">
          <Link
            href={`/${locale}`}
            className="inline-flex min-h-11 items-center text-body font-semibold text-ink underline underline-offset-4"
          >
            {t('back')}
          </Link>
        </div>
      </div>

      {/* Conversion event stub. Replaces with GA4/Meta Conversions API in phase 2. */}
      <ConversionPing />
    </main>
  );
}

function ConversionPing() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html:
          "try{window.dispatchEvent(new CustomEvent('rabita:donation_complete'));}catch(e){}",
      }}
    />
  );
}
