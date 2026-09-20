'use client';

import type { CSSProperties, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { CAMPAIGN } from '@/lib/campaign';
import { VISIT_DIRECTIONS_URL } from '@/lib/location';

import { CHANNELS, CHANNEL_RGB, ChannelMark } from './social-marks';
import { LanguageSwitcher } from './language-switcher';
import { QiblaCompass } from './qibla-compass';

// Footer, rebuilt 2026-08-30.
//   FIND US   the drawn map with walking times, beside address / hours /
//             contact and a directions button. The one thing a visitor
//             needs from a mosque footer is "where, when, how do I get
//             there" — so it comes first and gets the room.
//   COLUMNS   Rabita · Tjenester · Følg oss · Nyhetsbrev, on one rule.
//   BAR       lockup, © + org.nr, privacy, language, qibla.

// The register's label: mono, uppercase, and now allowed to wrap — "ÅPENT
// FOR BØNN" does not fit the 68px the phone column gives it, and a clipped
// label is worse than a two-line one.
const DT = 'font-mono text-[0.625rem] uppercase leading-[1.45] tracking-[0.16em] text-paper/45';

export function Footer({ map }: { map?: ReactNode }) {
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
            {/* ── Sept 2026, Tekst (endelig) — the register changed ──────────
               TELEPHONE IS OUT, everywhere in this block: "Telefonnummer er
               fjernet fra footeren inntil videre — det står et avvikende
               nummer flere steder på siden." Two numbers are in circulation
               (+47 22 20 80 88 here and on WhatsApp, 22 99 36 62 in all
               three annual reports) and nobody has said which is answered.
               A wrong number on every page of a mosque site is worse than
               no number, so it comes down until they tell us. CAMPAIGN
               .contactPhone is untouched — restoring this is re-adding a
               row, not re-finding a fact.

               OPENING HOURS SPLIT IN TWO. One row claimed "ÅPENT DAGLIG ·
               06:00 til 22:00", which is not true of either thing it could
               mean: the doors follow the prayer times, which move through
               the year, and the office keeps its own hours. So the prayer
               window says what it is and links to the table that has the
               actual minutes, and the office gets its own row. */}
            <dl className="divide-y divide-paper/10 border-y border-paper/10 lg:mt-8 sm:space-y-4 sm:divide-y-0 sm:border-0">
              <div className="flex items-baseline gap-3 py-2.5 sm:block sm:py-0">
                <dt className={cn(DT, 'w-20 shrink-0 sm:w-auto')}>{t('findUs.address')}</dt>
                <dd className="min-w-0 flex-1 text-[14px] leading-snug text-paper sm:mt-1 sm:text-body">
                  {CAMPAIGN.visitAddress} <span className="text-paper/60">· {CAMPAIGN.visitPostal}</span>
                </dd>
              </div>
              <div className="flex items-baseline gap-3 py-2.5 sm:block sm:py-0">
                <dt className={cn(DT, 'w-20 shrink-0 sm:w-auto')}>{t('findUs.hours')}</dt>
                <dd className="min-w-0 flex-1 text-[14px] leading-snug text-paper sm:mt-1 sm:text-body">
                  {t('findUs.prayerWindow')}{' '}
                  <Link href={p('/bonnetider')} className="whitespace-nowrap text-paper/60 underline decoration-paper/25 underline-offset-2 transition-colors hover:text-gold hover:decoration-gold">
                    {t('findUs.prayerLink')} &rarr;
                  </Link>
                </dd>
              </div>
              <div className="flex items-baseline gap-3 py-2.5 sm:hidden">
                <dt className={cn(DT, 'w-20 shrink-0')}>{t('findUs.office')}</dt>
                <dd className="min-w-0 flex-1 text-[14px] leading-snug text-paper">
                  {t('findUs.officeHours')}
                </dd>
              </div>
              <div className="flex items-baseline gap-3 py-2.5 sm:hidden">
                <dt className={cn(DT, 'w-20 shrink-0')}>{t('findUs.email')}</dt>
                <dd className="min-w-0 flex-1 break-all text-[14px] text-paper">
                  <a href={`mailto:${CAMPAIGN.contactEmail}`} className="transition-colors hover:text-gold">
                    {CAMPAIGN.contactEmail}
                  </a>
                </dd>
              </div>
              {/* sm and up keep the two-up pair — office where the telephone
                 used to sit, so the column count is unchanged. */}
              <div className="hidden grid-cols-2 gap-4 sm:grid">
                <div>
                  <dt className={DT}>{t('findUs.office')}</dt>
                  <dd className="mt-1 text-body text-paper">{t('findUs.officeHours')}</dd>
                </div>
                <div>
                  <dt className={DT}>{t('findUs.email')}</dt>
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
                href={VISIT_DIRECTIONS_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gold px-5 py-2 text-[14px] font-semibold text-dusk transition-colors hover:bg-paper"
              >
                {t('findUs.directions')}
                <span aria-hidden className="rtl:rotate-180">&rarr;</span>
              </a>
              <Link
                href={p('/om-oss#besok-oss')}
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
            {/* Real logos, real colours (client, 2026-09-16: "Legg inn logo
               til alle sosiale medier nederst"), from the same glyphs the
               home-page cards use — see social-marks.tsx.

               EACH SITS ON A PAPER DISC, and that is not decoration. Two of
               the four cannot be painted straight onto dusk #16242E and stay
               themselves: TikTok is black with a cyan and a magenta offset,
               and the black layer — the one carrying the note's shape —
               disappears on a dark ground, leaving a cyan-and-magenta ghost.
               Facebook's #1877F2 on #16242E is blue on blue. The disc is what
               every brand guideline prescribes for a dark background: put the
               full-colour mark on a light field rather than recolour it.

               44px discs, so the tap target is the whole mark and the row
               still clears Apple's minimum with a 20px glyph inside it.

               The hover beat is the ring, in that platform's own colour, and
               a half-step rise. The logo itself never moves or recolours —
               a recoloured brand mark is not that brand's mark. Same rule the
               cards follow. */}
            {/* Centred on a phone (client, 2026-09-16), left from sm.
               Below sm this column is the full page width, so four 44px
               discs left-aligned left ~60% of the row empty; from sm the
               column narrows and left is right again. */}
            <ul className="mt-3 flex flex-wrap justify-center gap-2.5 sm:mt-4 sm:justify-start">
              {CHANNELS.map(({ key, href }) => (
                <li key={key}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t(`social.${key}`)}
                    style={{ '--ch-ring': `rgb(${CHANNEL_RGB[key]} / 0.65)` } as CSSProperties}
                    className="grid h-11 w-11 place-items-center rounded-full bg-paper transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:ring-2 hover:ring-[color:var(--ch-ring)]"
                  >
                    <ChannelMark channel={key} instance={`footer-${key}`} className="h-5 w-5" />
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
            {/* The same Google map as Leiligheter, since 2026-09-15 ("also
               show here in the footer without increating size of footer, it
               can fit and make it fit"). It replaces the site's own drawn SVG
               plate, which had carried "legg det samme kartet til nederst på
               alle sidene" from 2026-09-13 — the instruction still holds, the
               map behind it simply changed.

               variant="map": no distance list. The column directly above this
               already prints the address, the opening hours and a
               Veibeskrivelse link, so the metres would have answered a
               question this footer answers twice already. His words: "dont
               show the distance, rather only show the map in footer".

               SIZED TO THE SLOT THE PLATE HAD — measured 437x398 — so the
               footer does not grow, which is the part he was explicit about.

               Known and accepted: at 437px the embed is under the ~600px
               where Google's two attribution groups stop overlapping, so they
               collide down here. That is Google's own chrome and the only
               cure is a wider column, which is exactly what he ruled out.

               PASSED IN AS A SLOT, not imported. This file is 'use client'
               (it calls useLocale), and FindUsGoogle is an async server
               component — a client component cannot render one. The layout is
               a server component, so it renders the map there and hands it
               down as a prop. The alternative was making FindUsGoogle a
               client component, which would have shipped
               lib/walking-routes.json — 13.5KB of polyline geometry — to
               every visitor to print five numbers the footer does not even
               show. */}
            {map}
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
