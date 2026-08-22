'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { CAMPAIGN } from '@/lib/campaign';
import { LanguageSwitcher } from './language-switcher';
import { QiblaCompass } from './qibla-compass';

// §4.11. Second giving block, Vipps as selectable text set large, bank and
// IBAN with copy, address, hours, newsletter, language, legal links.
//
// The whole footer is on dusk now. That is what makes the page END rather
// than trail off — before, it was the same paper as the sections above and
// read as more page.
//
// The lockup is the other half of the fix. There was no mark and no name
// anywhere down here: the last thing a reader saw was a column of links
// under 13px bold headings. Now the organisation signs the page.
export function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const locale = useLocale();

  return (
    <footer data-print-hide className="bg-dusk text-paper">
      {/* The second giving block used to sit here: a "Build something that
         outlives you" panel with the Vipps number, account, IBAN, SWIFT and
         org number as copy-to-clipboard figures. Removed because the giving
         sheet now handles every method, and none of those numbers were
         orphaned by it — the trust band at the foot of the homepage still
         prints Vipps, account and IBAN, and the org number is in the bottom
         bar below. */}
      {/* Contact + newsletter + legal, on dusk */}
      <div className="bg-dusk text-paper">
        <div className="mx-auto max-w-6xl px-6 py-section-lg">
          <div className="grid gap-12 md:grid-cols-12 md:gap-10">
            {/* The lockup signs the page. Mark plus both lines of the name,
               larger than the nav's so it reads as a signature rather than a
               repeat of the header. */}
            <div className="md:col-span-4">
              <Link
                href={`/${locale}`}
                className="inline-flex items-center gap-4 transition-opacity hover:opacity-80"
                aria-label={`${tNav('orgName')}, ${tNav('wordmark')}`}
              >
                <Image
                  src="/logo/rabita-mark-256.png"
                  alt=""
                  width={56}
                  height={56}
                  className="h-14 w-14"
                />
                <span className="flex flex-col font-serif leading-tight text-paper">
                  <span className="text-[1.15rem] font-medium">{tNav('orgName')}</span>
                  <span className="text-[1rem] italic text-paper/60">Rabita</span>
                </span>
              </Link>

              <address className="mt-8 not-italic text-body text-paper/70">
                <p>{CAMPAIGN.address}</p>
                <p className="text-paper/50">{CAMPAIGN.postalCity}</p>
                <p className="mt-4">
                  <a
                    href={`tel:${CAMPAIGN.contactPhone.replace(/\s/g, '')}`}
                    className="inline-flex min-h-11 items-center transition-colors hover:text-gold"
                  >
                    {CAMPAIGN.contactPhone}
                  </a>
                </p>
                <p>
                  <a
                    href={`mailto:${CAMPAIGN.contactEmail}`}
                    className="inline-flex min-h-11 items-center transition-colors hover:text-gold"
                  >
                    {CAMPAIGN.contactEmail}
                  </a>
                </p>
                {/* Org number lives here now rather than only in the bottom
                   bar. It is the one figure from the removed trust band that
                   a reader may actually need: it is how you verify the
                   organisation in Brønnøysundregistrene. */}
                <p className="mt-4 text-[13px] tabular-nums text-paper/50">
                  {t('orgNr')} {CAMPAIGN.orgNr}
                </p>
              </address>
            </div>

            <div className="md:col-span-4">
              {/* Serif at card size, not 13px bold. The old headings were the
                 weakest type on the site. */}
              <h2 className="font-serif text-card text-paper">{t('newsletter.heading')}</h2>
              <p className="mt-3 max-w-prose text-body text-paper/70">{t('newsletter.body')}</p>
              <form
                className="mt-6 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  // TODO wire to newsletter provider in phase 3
                }}
              >
                <input
                  type="email"
                  required
                  placeholder={t('newsletter.placeholder')}
                  aria-label={t('newsletter.heading')}
                  className="min-h-11 w-full rounded-btn border border-paper/25 bg-transparent px-3 py-2 text-body text-paper outline-none transition-colors placeholder:text-paper/40 focus:border-gold"
                />
                <button
                  type="submit"
                  className="min-h-11 shrink-0 rounded-full bg-gold px-4 py-2 text-body font-semibold text-dusk transition-colors hover:bg-paper"
                >
                  {t('newsletter.submit')}
                </button>
              </form>
            </div>

            <nav aria-label="Legal" className="md:col-span-4">
              <h2 className="font-serif text-card text-paper">{t('legal.heading')}</h2>
              <ul className="mt-3 text-body">
                {([
                  ['personvern-og-tilgjengelighet', t('legal.privacy')],
                  ['givere', t('legal.donors')],
                  ['om-oss', t('legal.about')],
                ] as const).map(([href, label]) => (
                  <li key={href}>
                    <Link
                      href={`/${locale}/${href}`}
                      className="inline-flex min-h-11 items-center text-paper/70 transition-colors hover:text-gold"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <LanguageSwitcher tone="paper" />
              </div>
            </nav>
          </div>
        </div>

        <div className="border-t border-paper/12">
          {/* Extra foot room on mobile so the floating give bar never covers
             the org number or the qibla reading. */}
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 pb-24 pt-6 md:pb-6">
            <p className="font-mono text-label uppercase tracking-widest text-paper/45">
              &copy; {new Date().getFullYear()} Rabita
            </p>
            <QiblaCompass tone="paper" />
          </div>
        </div>
      </div>
    </footer>
  );
}
