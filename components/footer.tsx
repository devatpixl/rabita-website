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
      {/* One band, three columns: the lockup with the contact ledger, the
         social row, and the map plate on the right. Two columns from sm,
         three from lg; below lg the map comes FIRST (see the order-first
         note on it).

         The middle column carried the newsletter above the social row until
         2026-09-23; see the note where it stood. */}
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
              {/* ÅPENT FOR BØNN SITS ABOVE THE ADDRESS.
                 Client, Versjon 6 (2026-09-22), under Footer: "Fajr, Duhur
                 til Isha flytte opp." It was the second row, under the
                 street.

                 Which is the right order anyway, on the evidence we have:
                 the strip at the top of every page now carries all six
                 prayer times because his own congregation told him that is
                 what people come for. The footer answering "when is it open"
                 before "where is it" follows the same reader. */}
              <div className="flex items-baseline gap-3 py-2.5 sm:block sm:py-0">
                <dt className={cn(DT, 'w-20 shrink-0 sm:w-auto')}>{t('findUs.hours')}</dt>
                <dd className="min-w-0 flex-1 text-[14px] leading-snug text-paper sm:mt-1 sm:text-body">
                  {t('findUs.prayerWindow')}{' '}
                  <Link href={p('/bonnetider')} className="whitespace-nowrap text-paper/60 underline decoration-paper/25 underline-offset-2 transition-colors hover:text-gold hover:decoration-gold">
                    {t('findUs.prayerLink')} &rarr;
                  </Link>
                </dd>
              </div>
              <div className="flex items-baseline gap-3 py-2.5 sm:block sm:py-0">
                <dt className={cn(DT, 'w-20 shrink-0 sm:w-auto')}>{t('findUs.address')}</dt>
                <dd className="min-w-0 flex-1 text-[14px] leading-snug text-paper sm:mt-1 sm:text-body">
                  {CAMPAIGN.visitAddress} <span className="text-paper/60">· {CAMPAIGN.visitPostal}</span>
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
              {/* Office and e-mail, stacked rather than two-up from lg.
                 They shared a row until 2026-09-23: in a column that is a
                 third of the band, that is about 170px each, and "Weekdays
                 10:00-14:00" needs more — it wrapped onto two lines. Side by
                 side at sm, where the column is half the band and wide
                 enough; stacked at lg, where it is not.

                 The e-mail briefly moved to the middle column the same day
                 and came straight back (client: "move mail back"). It reads
                 as part of the contact register, not as a thing beside the
                 social row. */}
              <div className="hidden grid-cols-2 gap-4 sm:grid lg:grid-cols-1 lg:gap-5">
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
          </div>

          {/* ── THE SECOND COLUMN: SOCIAL, THEN THE TWO BUTTONS ──────
             The e-mail is NOT here. It sat here for about ten minutes on
             2026-09-23 and went back to the register, where it belongs —
             it is contact detail, not something that pairs with a social
             row.

             VERTICALLY CENTRED, and that is the whole point of the flex
             (client: "bring this vertically in centre"). This column holds
             roughly 150px of content in a band whose height is set by the
             map plate beside it, near 380px. Left at the top it reads as a
             column that ran out rather than one that was placed; centred,
             its foot lands close to where the left register ends and the
             three columns read as one object.

             It replaces an lg:mt-[5.5rem] that tried to line FOLLOW US up
             with OPEN FOR PRAYER by matching the wordmark's height. That
             aligned the tops and left the same hole underneath. Centring
             solves the thing the offset was aiming at.

             items-center centres the three blocks on each other across
             (client: "horizontally make both in centre, so it looks neat").
             The discs run about 200px and the two buttons about 230, so
             left-aligned they sat on a ragged edge. As flex children they
             now each shrink to their own width and share one centre line,
             and the label rides with them rather than being left behind on
             the start edge.

             The ul keeps its own sm:justify-start. That is not a conflict:
             once the ul is shrink-to-fit there is no free space inside it
             for justify-* to distribute, so the rule is inert here and
             still correct at sm, where this column is left-aligned.

             BOTH ONLY BITE AT lg. Below that the columns stack full width
             and this column is left-aligned like everything beside it —
             centring there would put it out of step with the register it
             sits under, not in step with it. */}
          <div className="lg:col-span-3 lg:flex lg:flex-col lg:items-center lg:justify-center">
            {/* DT, the same mono the left register uses for OPEN FOR PRAYER
               and ADDRESS. This was 11px at 50% against their 10px at 45%. */}
            <h3 className={DT}>{t('cols.follow')}</h3>
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
            <div className="mt-8 hidden flex-wrap gap-3 sm:flex">
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
        {/* ── ROOM FOR THE FLOATING BUTTON, PHONES ONLY ───────────────────
           Client, 2026-09-23: scrolled to the very bottom on a phone, the
           org.nr line sat under the "Questions?" button. That button is
           fixed at bottom-5 (20px) and about 48px tall, so the bottom ~68px
           of every viewport is spoken for — and on a phone this bar is the
           last thing on the page, with 12px under it. He asked for the fix
           without moving the button, so the bar gets the room instead:
           5rem of bottom padding plus the safe-area inset, which means at
           full scroll the last line sits clear ABOVE the button rather than
           behind it. Measured on a 390x844: the credit line ends 15px above
           the button's top edge; at 4.5rem it was 7, which is clear but
           reads as touching. sm:pb-5 hands the old padding back from sm, where the
           bar is three columns wide and the button only ever overlaps empty
           ground on its right. */}
        <div className="mx-auto grid max-w-6xl items-center gap-y-2 px-5 py-3 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:grid-cols-3 sm:gap-y-3 sm:px-6 sm:py-5 sm:pb-5">
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
