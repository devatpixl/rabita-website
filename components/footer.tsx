'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { CAMPAIGN } from '@/lib/campaign';
import { Copyable } from './copyable';
import { LanguageSwitcher } from './language-switcher';
import { openGiveSheet } from './giving-sheet';
import { QiblaCompass } from './qibla-compass';
import { Accent } from './accent';

// §4.11. Second giving block (ink not action — the 4-slot rule is spent),
// Vipps as selectable text set large, bank and IBAN with copy, address,
// hours, newsletter, language, legal links.
export function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();

  return (
    <footer className="border-t border-rule bg-paper text-ink">
      {/* Second giving block */}
      <div className="border-b border-rule">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-section-md md:grid-cols-12 md:items-center">
          <div className="md:col-span-6">
            <p className="mb-3 text-label uppercase tracking-widest text-gold">
              {t('give.eyebrow')}
            </p>
            <h2 className="mb-4 font-serif text-section text-balance">
              {t.rich('give.heading', {
                em: (chunks) => <Accent surface="paper">{chunks}</Accent>,
              })}
            </h2>
            <p className="mb-6 max-w-prose text-body text-ink-60">{t('give.body')}</p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => openGiveSheet()}
                className="min-h-12 rounded-btn bg-gold-deep px-5 py-3 text-body font-semibold text-paper hover:bg-ink transition-colors"
              >
                {t('give.primary')}
              </button>
              <Link
                href={`/${locale}/gi-en-gave`}
                className="min-h-12 rounded-btn border border-ink px-5 py-3 text-body font-semibold text-ink hover:bg-ink hover:text-paper transition-colors"
              >
                {t('give.moreWays')}
              </Link>
            </div>
          </div>

          <div className="md:col-span-6 md:border-s md:border-rule md:ps-10 space-y-8">
            <Copyable value={CAMPAIGN.vippsNumber} label={t('vipps')} size="display" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Copyable value={CAMPAIGN.bankAccount} label={t('bankAccount')} />
              <Copyable value={CAMPAIGN.iban} label={t('iban')} />
              <Copyable value={CAMPAIGN.swift} label="SWIFT" />
              <Copyable value={CAMPAIGN.orgNr} label={t('orgNr')} />
            </div>
          </div>
        </div>
      </div>

      {/* Contact + newsletter + legal */}
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-section-md md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="mb-3 text-[13px] font-semibold text-ink">
            {t('contact.heading')}
          </p>
          <address className="not-italic text-body">
            <p className="mb-1">Rabita</p>
            <p className="mb-1">{CAMPAIGN.address}</p>
            <p className="mb-4 text-ink-60">{CAMPAIGN.postalCity}</p>
            <p className="mb-1">
              <a href={`tel:${CAMPAIGN.contactPhone.replace(/\s/g, '')}`} className="inline-flex min-h-11 items-center hover:underline">
                {CAMPAIGN.contactPhone}
              </a>
            </p>
            <p>
              <a href={`mailto:${CAMPAIGN.contactEmail}`} className="inline-flex min-h-11 items-center hover:underline">
                {CAMPAIGN.contactEmail}
              </a>
            </p>
          </address>
        </div>

        <div className="md:col-span-4">
          <p className="mb-3 text-[13px] font-semibold text-ink">
            {t('newsletter.heading')}
          </p>
          <p className="mb-4 text-body text-ink-60">{t('newsletter.body')}</p>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              // TODO wire to newsletter provider in phase 3
            }}
          >
            <input
              type="email"
              required
              placeholder={t('newsletter.placeholder')}
              className="min-h-11 w-full border border-rule bg-paper-2 px-3 py-2 text-body outline-none focus:border-ink"
            />
            <button
              type="submit"
              className="min-h-11 rounded-btn bg-gold-deep px-4 py-2 text-body font-semibold text-paper hover:bg-ink transition-colors"
            >
              {t('newsletter.submit')}
            </button>
          </form>
        </div>

        <nav aria-label="Legal" className="md:col-span-4">
          <p className="mb-3 text-[13px] font-semibold text-ink">
            {t('legal.heading')}
          </p>
          {/* inline-flex, because min-height does nothing to an inline box */}
          <ul className="space-y-2 text-body">
            <li><Link href={`/${locale}/personvern-og-tilgjengelighet`} className="inline-flex min-h-11 items-center hover:underline">{t('legal.privacy')}</Link></li>
            <li><Link href={`/${locale}/givere`} className="inline-flex min-h-11 items-center hover:underline">{t('legal.donors')}</Link></li>
            <li><Link href={`/${locale}/om-oss`} className="inline-flex min-h-11 items-center hover:underline">{t('legal.about')}</Link></li>
          </ul>
          <div className="mt-6">
            <LanguageSwitcher />
          </div>
        </nav>
      </div>

      <div className="border-t border-rule">
        <div className="mx-auto max-w-6xl px-6 py-6 flex flex-wrap items-center justify-between gap-6">
          <p className="font-mono text-label uppercase tracking-widest text-ink-60">
            © {new Date().getFullYear()} Rabita · Org.nr. {CAMPAIGN.orgNr}
          </p>
          <QiblaCompass />
        </div>
      </div>
    </footer>
  );
}
