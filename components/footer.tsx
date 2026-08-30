'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { CAMPAIGN } from '@/lib/campaign';
import { DIRECTIONS_URL } from '@/lib/location';
import { FindUs } from './find-us';
import { LanguageSwitcher } from './language-switcher';
import { QiblaCompass } from './qibla-compass';

// Footer, rebuilt 2026-08-30.
//   FIND US   the drawn map with walking times, beside address / hours /
//             contact and a directions button. The one thing a visitor
//             needs from a mosque footer is "where, when, how do I get
//             there" — so it comes first and gets the room.
//   COLUMNS   Rabita · Tjenester · Følg oss · Nyhetsbrev, on one rule.
//   BAR       lockup, © + org.nr, privacy, language, qibla.

const SOCIAL = [
  { key: 'facebook', href: 'https://facebook.com/detislamskeforbundet/' },
  { key: 'instagram', href: 'https://instagram.com/detislamskeforbundet/' },
  { key: 'tiktok', href: 'https://tiktok.com/@oslomosque' },
] as const;

export function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const p = (path: string) => `/${locale}${path}`;

  return (
    <footer data-print-hide className="relative isolate z-[1] bg-dusk text-paper">
      {/* One band, three columns: the lockup with the contact ledger,
         newsletter and follow, and the map plate on the right. Two columns
         from sm, three from lg; below lg the map comes FIRST (see the
         order-first note on it). */}
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10 md:py-16">
        <div className="grid gap-7 sm:grid-cols-2 sm:gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            {/* The lockup signs the page — mark plus both lines of the name.
               lg and up only: below that it moves to the foot of the footer,
               next to the social links, as its own grid item further down
               (client, 2026-08-30). A signature belongs at the end. */}
            <Link
              href={p('')}
              className="hidden items-center gap-4 transition-opacity hover:opacity-80 lg:inline-flex"
              aria-label={`${tNav('orgName')}, ${tNav('wordmark')}`}
            >
              <Image src="/logo/rabita-mark-256.png" alt="" width={56} height={56} className="h-14 w-14" />
              <span className="flex flex-col font-serif leading-tight text-paper">
                <span className="text-[1.15rem] font-medium">{tNav('orgName')}</span>
                <span className="text-[1rem] italic text-paper/60">Rabita</span>
              </span>
            </Link>

            {/* A ruled register on phones — label left, value right, one
               hairline per row — instead of four label-above-value blocks
               floating in their own space. Same pattern as the key-figures
               register on /moskeprosjektet, so the footer reads as part of
               the same site. From sm it returns to the stacked form, which
               is what the narrow desktop column wants. */}
            <dl className="divide-y divide-paper/10 border-y border-paper/10 lg:mt-8 sm:space-y-4 sm:divide-y-0 sm:border-0">
              <div className="flex items-baseline gap-3 py-2.5 sm:block sm:py-0">
                <dt className="w-[4.25rem] shrink-0 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-paper/45 sm:w-auto">{t('findUs.address')}</dt>
                <dd className="min-w-0 flex-1 text-[14px] leading-snug text-paper sm:mt-1 sm:text-body">
                  {CAMPAIGN.address} <span className="text-paper/60">· {CAMPAIGN.postalCity}</span>
                </dd>
              </div>
              <div className="flex items-baseline gap-3 py-2.5 sm:block sm:py-0">
                <dt className="w-[4.25rem] shrink-0 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-paper/45 sm:w-auto">{t('findUs.hours')}</dt>
                <dd className="min-w-0 flex-1 text-[14px] leading-snug text-paper sm:mt-1 sm:text-body">
                  {tNav('openDaily')} <span className="tabular-nums text-paper/60">· {tNav('openHours')}</span>
                </dd>
              </div>
              <div className="flex items-baseline gap-3 py-2.5 sm:hidden">
                <dt className="w-[4.25rem] shrink-0 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-paper/45">{t('findUs.phone')}</dt>
                <dd className="min-w-0 flex-1 text-[14px] text-paper">
                  <a href={`tel:${CAMPAIGN.contactPhone.replace(/\s/g, '')}`} className="transition-colors hover:text-gold">
                    {CAMPAIGN.contactPhone}
                  </a>
                </dd>
              </div>
              <div className="flex items-baseline gap-3 py-2.5 sm:hidden">
                <dt className="w-[4.25rem] shrink-0 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-paper/45">{t('findUs.email')}</dt>
                <dd className="min-w-0 flex-1 break-all text-[14px] text-paper">
                  <a href={`mailto:${CAMPAIGN.contactEmail}`} className="transition-colors hover:text-gold">
                    {CAMPAIGN.contactEmail}
                  </a>
                </dd>
              </div>
              {/* sm and up keep the original two-up pair. */}
              <div className="hidden grid-cols-2 gap-4 sm:grid">
                <div>
                  <dt className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-paper/45">{t('findUs.phone')}</dt>
                  <dd className="mt-1">
                    <a href={`tel:${CAMPAIGN.contactPhone.replace(/\s/g, '')}`} className="text-body text-paper transition-colors hover:text-gold">
                      {CAMPAIGN.contactPhone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-paper/45">{t('findUs.email')}</dt>
                  <dd className="mt-1">
                    <a href={`mailto:${CAMPAIGN.contactEmail}`} className="break-all text-body text-paper transition-colors hover:text-gold">
                      {CAMPAIGN.contactEmail}
                    </a>
                  </dd>
                </div>
              </div>
            </dl>
            {/* Hidden on phones (client, 2026-08-30). Both are already
               reachable right there: the map plate above carries "Open in
               Google Maps", and the address sits in the register directly
               over these. Two big buttons repeating them cost ~64px of a
               footer that was the complaint. They return from sm, where the
               map sits in a different column and the repetition is not one. */}
            <div className="hidden flex-wrap gap-3 sm:mt-6 sm:flex">
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gold px-5 py-2 text-[14px] font-semibold text-dusk transition-colors hover:bg-paper"
              >
                {t('findUs.directions')}
                <span aria-hidden className="rtl:rotate-180">&rarr;</span>
              </a>
              <Link
                href={p('/besok-oss')}
                className="inline-flex min-h-11 items-center rounded-full border border-paper/30 px-5 py-2 text-[14px] font-semibold text-paper transition-colors hover:border-paper hover:bg-paper hover:text-dusk"
              >
                {t('findUs.visit')}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h3 className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-paper/50">{t('newsletter.heading')}</h3>
            <p className="mt-2 max-w-prose text-[13.5px] leading-snug text-paper/70 sm:mt-4 sm:text-[15px] sm:leading-relaxed">{t('newsletter.body')}</p>
            <form
              className="mt-3 flex overflow-hidden rounded-full border border-paper/25 focus-within:border-gold sm:mt-4"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <input
                type="email"
                required
                placeholder={t('newsletter.placeholder')}
                aria-label={t('newsletter.heading')}
                className="min-h-11 w-full min-w-0 bg-transparent px-4 text-[15px] text-paper outline-none placeholder:text-paper/40"
              />
              <button type="submit" className="m-1 shrink-0 rounded-full bg-gold px-4 text-[14px] font-semibold text-dusk transition-colors hover:bg-paper">
                {t('newsletter.submit')}
              </button>
            </form>

            <h3 className="mt-5 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-paper/50 sm:mt-8">{t('cols.follow')}</h3>
            <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1 sm:mt-3">
              {SOCIAL.map((s) => (
                <li key={s.key}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1.5 text-[15px] text-paper/80 transition-colors hover:text-gold">
                    {t(`social.${s.key}`)}
                    <span aria-hidden className="text-[11px] text-paper/40">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* order-first below lg (client, 2026-08-30): the map used to be the
             last thing in a footer that already runs long on a phone, so the
             one panel that answers "where is this place" sat behind three
             screens of scroll. At lg the three columns sit side by side and
             the natural order is right again. */}
          <div className="order-first sm:col-span-2 lg:order-none lg:col-span-5">
            <FindUs className="mx-auto max-w-[30rem] lg:max-w-none" />
          </div>

          {/* The lockup, at the foot — below the social links on a phone,
             which is where the client asked for it. order-last keeps it there
             whatever the grid does above; lg:hidden because the copy at the
             top of the first column takes over from lg. */}
          <div className="order-last sm:col-span-2 lg:hidden">
            <Link
              href={p('')}
              className="inline-flex items-center gap-3 transition-opacity hover:opacity-80"
              aria-label={`${tNav('orgName')}, ${tNav('wordmark')}`}
            >
              <Image src="/logo/rabita-mark-256.png" alt="" width={56} height={56} className="h-11 w-11" />
              <span className="flex flex-col font-serif leading-tight text-paper">
                <span className="text-[1.05rem] font-medium">{tNav('orgName')}</span>
                <span className="text-[0.95rem] italic text-paper/60">Rabita</span>
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bar: © / org.nr on the left, language and qibla on the right, one
         line, everything centred on the same axis. Page links live in the
         header nav. NOTE: the privacy page (/personvern-og-tilgjengelighet)
         is no longer linked from anywhere on the site since the client asked
         for it to leave this bar (2026-08-30) — it needs a home, e.g. the
         consent banner. */}
      <div className="border-t border-paper/12">
        <div className="mx-auto grid max-w-6xl items-center gap-y-2 px-5 py-3 sm:grid-cols-3 sm:gap-y-3 sm:px-6 sm:py-5">
          <p className="text-center font-mono text-[0.625rem] uppercase leading-none tracking-[0.16em] text-gold sm:text-start">
            &copy; {new Date().getFullYear()} Rabita · {t('orgNr')} {CAMPAIGN.orgNr}
          </p>
          {/* Credit and the two controls share one row on a phone. They are
             wrapped so they can sit on a line together; `sm:contents` drops
             the wrapper from the layout again so the three-column grid above
             sees them as its own children, exactly as before.
             (An earlier attempt used -mt-6 to pull the controls up onto the
             credit line — it overlapped the two, which is what the client
             saw on 2026-08-30. This does it with layout, not a nudge.) */}
          <div className="flex items-center justify-center gap-4 sm:contents">
            <p className="text-[13px] leading-none text-paper/70 sm:text-center">
              {t('credit')}{' '}
              <a
                href="https://pixlmedia.no"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-paper underline decoration-gold/70 underline-offset-4 transition-colors hover:text-gold"
              >
                Pixl Media
              </a>
            </p>
            {/* Language and qibla are hidden on phones (client, 2026-08-30).
               The language switcher also sits at the foot of the nav drawer,
               which is where a phone visitor changes it; the qibla compass is
               a desktop nicety that was crowding the credit line. */}
            <div className="hidden shrink-0 items-center gap-4 sm:flex sm:gap-8 sm:justify-self-end">
              <LanguageSwitcher tone="paper" drop="up" />
              <QiblaCompass tone="paper" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
