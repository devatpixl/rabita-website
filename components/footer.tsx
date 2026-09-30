'use client';

import type { CSSProperties, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { CAMPAIGN } from '@/lib/campaign';
import { VISIT_DIRECTIONS_URL } from '@/lib/location';

import { CHANNELS, CHANNEL_RGB, ChannelMark } from './social-marks';
import { RosetteMark } from './marks';
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

// ── THE REGISTER'S ICON DISCS (client mock, 2026-09-28) ──────────────────
// Each row of the contact register gets a dark disc with a gold line glyph
// beside it: a mihrab for the prayer window, a pin, a clock, an envelope.
// The disc is the same dusk as the footer, lifted 6% and ringed, so it reads
// as a coin set into the ground rather than a button. From sm only — on a
// phone the register is the compact label|value list and a disc per row
// would cost 40px × 4 of a footer that was once the complaint.
const DISC =
  'hidden h-10 w-10 shrink-0 place-items-center rounded-full bg-paper/[0.06] text-gold ring-1 ring-paper/12 sm:grid';

type FooterGlyphName = 'prayer' | 'pin' | 'clock' | 'mail';
function FooterGlyph({ name, className }: { name: FooterGlyphName; className?: string }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true as const,
  };
  if (name === 'prayer') {
    // A mihrab: the pointed arch on two jambs, and the floor line.
    return (
      <svg {...common}>
        <path d="M6 20V11.5C6 7.9 8.7 5 12 4c3.3 1 6 3.9 6 7.5V20" />
        <path d="M4.5 20h15" />
        <path d="M9 20v-5.5a3 3 0 0 1 6 0V20" />
      </svg>
    );
  }
  if (name === 'pin') {
    return (
      <svg {...common}>
        <path d="M12 21s6.5-5.7 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5.3 6.5 11 6.5 11Z" />
        <circle cx="12" cy="10" r="2.3" />
      </svg>
    );
  }
  if (name === 'clock') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function Footer({ map }: { map?: ReactNode }) {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const p = (path: string) => `/${locale}${path}`;

  return (
    <footer data-print-hide className="relative isolate z-[1] overflow-hidden bg-dusk text-paper">
      {/* ── THE ORNAMENT IN THE CORNERS (client mock, 2026-09-28) ──────────
         The rosette construction drawing, gold at 7%, bleeding off the
         top-start and bottom-end corners. It is the site's own mark (the
         same one the newsletter band tiles at 1.5%), not an imported
         arabesque, so the footer's flourish is the mosque's geometry.
         Logical corners (start/end), so Arabic mirrors it. xl only: below
         that the columns stack and the drawing would sit behind type. */}
      <RosetteMark className="pointer-events-none absolute -start-44 -top-40 hidden w-[30rem] text-gold opacity-[0.07] xl:block" />
      <RosetteMark className="pointer-events-none absolute -bottom-44 -end-44 hidden w-[30rem] text-gold opacity-[0.07] xl:block" />
      {/* One band, three columns: the lockup with the contact ledger, the
         social row, and the map plate on the right. Two columns from sm,
         three from xl; below xl the map comes FIRST (see the order-first
         note on it).

         THREE COLUMNS FROM xl, NOT lg, AND THE BAND IS max-w-7xl, NOT 6xl
         (2026-09-28). Both follow from one number: the landmark map came back
         into this footer (client: the Sørligata pin "didn't turn out very
         well", he wants the map "where it clearly shows how centrally located
         the mosque is"), and a My Maps embed needs ≥520px of width before
         Google's own bottom chrome stops colliding with itself (measured
         2026-09-28: 490 touches, 500 is clean). On the 6xl band a 12-column
         4/3/5 split gave the iframe 417px.

         THE TRACKS, and every number is load-bearing. Map: minmax(0,33rem)
         = 528px track = 508px iframe inside the plate's 10px padding. The
         standalone embed is clean at 500, but inside the page at 500 the
         scale bar still nicked the K of "Keyboard shortcuts"; 508 clears it.
         Not a pixel more, because every pixel over it comes out of the
         edges (below). Social row: auto, which measures 285px (the two
         buttons side by side). Register: the remainder, which must hold the
         English prayer line "Fajr, Dhuhr to Isha see prayer times →" at
         ~323px unwrapped. At xl the band is 1280 − 2×40 padding = 1200,
         minus 2×28 gaps = 1144, minus 285 and 528 = 331 for the register.
         Eight pixels of slack. Widen the padding or the gaps and the prayer
         line wraps; narrow the map and Google's chrome collides.

         Below 1280 the register starves, so the two-column layout holds up
         to xl instead of lg — on a 1024–1279 screen the map runs full width
         above the columns, which is what phones and tablets already did.

         xl:px-10, not the sm:px-6 the rest of the band uses: the client saw
         the footer on a 13-inch MacBook with 24px to each edge and asked for
         "a little more" room at the sides (2026-09-28). 40px is what the
         numbers above allow. The 7xl band still sits wider than the 6xl page
         sections above it; deliberate, the alternative was a narrower map,
         and the site already mixes 6xl with 84rem bands.

         The middle column carried the newsletter above the social row until
         2026-09-23; see the note where it stood. */}
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10 md:py-16 xl:px-10">
        <div className="grid gap-7 sm:grid-cols-2 sm:gap-10 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,33rem)] xl:gap-0">
          <div>
            {/* The lockup signs the page — mark plus both lines of the name.
               lg and up only: below that it moves to the foot of the footer,
               next to the social links, as its own grid item further down
               (client, 2026-08-30). A signature belongs at the end. */}
            <Link
              href={p('')}
              className="hidden items-center gap-4 transition-opacity hover:opacity-80 xl:inline-flex"
              aria-label={`${tNav('orgName')}, ${tNav('wordmark')}`}
            >
              <Image src="/logo/rabita-mark-256.png" alt="" width={64} height={64} className="h-16 w-16" />
              <span className="flex flex-col font-serif leading-tight text-paper">
                <span className="text-[1.35rem] font-medium">{tNav('orgName')}</span>
                {/* Gold, not paper/60 (client mock, 2026-09-28). */}
                <span className="text-[1.05rem] italic text-gold">Rabita</span>
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
            <dl className="divide-y divide-paper/10 border-y border-paper/10 xl:mt-9 sm:space-y-5 sm:divide-y-0 sm:border-0">
              {/* ÅPENT FOR BØNN SITS ABOVE THE ADDRESS.
                 Client, Versjon 6 (2026-09-22), under Footer: "Fajr, Duhur
                 til Isha flytte opp." It was the second row, under the
                 street.

                 Which is the right order anyway, on the evidence we have:
                 the strip at the top of every page now carries all six
                 prayer times because his own congregation told him that is
                 what people come for. The footer answering "when is it open"
                 before "where is it" follows the same reader. */}
              <div className="flex items-baseline gap-3 py-2.5 sm:items-start sm:gap-4 sm:py-0">
                <span aria-hidden className={DISC}><FooterGlyph name="prayer" className="h-[18px] w-[18px]" /></span>
                <div className="flex min-w-0 flex-1 items-baseline gap-3 sm:block">
                  <dt className={cn(DT, 'w-20 shrink-0 sm:w-auto')}>{t('findUs.hours')}</dt>
                  <dd className="min-w-0 flex-1 text-[14px] leading-snug text-paper sm:mt-1 sm:text-body">
                    {t('findUs.prayerWindow')}
                    {/* Gold, and set off by a wider gap (client mock). At xl
                       it takes its own line under the window: the disc beside
                       the row costs the register 56px, and inline the sentence
                       broke as "Fajr, Dhuhr til / Isha se bønnetider", which
                       is worse than a link on the line below. */}
                    <Link href={p('/bonnetider')} className="ms-2 whitespace-nowrap text-gold underline decoration-gold/40 underline-offset-[5px] transition-colors hover:text-paper hover:decoration-paper sm:ms-4 xl:ms-0 xl:mt-1.5 xl:block xl:w-fit">
                      {t('findUs.prayerLink')} &rarr;
                    </Link>
                  </dd>
                </div>
              </div>
              <div className="flex items-baseline gap-3 py-2.5 sm:items-start sm:gap-4 sm:py-0">
                <span aria-hidden className={DISC}><FooterGlyph name="pin" className="h-[18px] w-[18px]" /></span>
                <div className="flex min-w-0 flex-1 items-baseline gap-3 sm:block">
                  <dt className={cn(DT, 'w-20 shrink-0 sm:w-auto')}>{t('findUs.address')}</dt>
                  <dd className="min-w-0 flex-1 text-[14px] leading-snug text-paper sm:mt-1 sm:text-body">
                    {CAMPAIGN.visitAddress} <span className="text-paper/60">· {CAMPAIGN.visitPostal}</span>
                  </dd>
                </div>
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
              <div className="hidden grid-cols-2 gap-4 sm:grid xl:grid-cols-1 xl:gap-5">
                <div className="flex items-start gap-4">
                  <span aria-hidden className={DISC}><FooterGlyph name="clock" className="h-[18px] w-[18px]" /></span>
                  <div className="min-w-0">
                    <dt className={DT}>{t('findUs.office')}</dt>
                    <dd className="mt-1 text-body text-paper">{t('findUs.officeHours')}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span aria-hidden className={DISC}><FooterGlyph name="mail" className="h-[18px] w-[18px]" /></span>
                  <div className="min-w-0">
                    <dt className={DT}>{t('findUs.email')}</dt>
                    <dd className="mt-1">
                      <a href={`mailto:${CAMPAIGN.contactEmail}`} className="break-all text-body text-paper transition-colors hover:text-gold">
                        {CAMPAIGN.contactEmail}
                      </a>
                    </dd>
                  </div>
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
          {/* xl:px-7 — the column's padding IS the grid gap on its two sides
             (xl:gap-0 on the grid): 28px each, the same 28 the gap was, so
             the register's 331px budget — see the note on the grid — is
             untouched. The two hairlines the mock drew on these edges were
             here for an hour on 2026-09-28 and came off on the user's call
             ("remove the 2 vertical lines"). */}
          <div className="xl:flex xl:flex-col xl:items-center xl:justify-center xl:px-7">
            {/* DT, the same mono the left register uses for OPEN FOR PRAYER
               and ADDRESS. This was 11px at 50% against their 10px at 45%. */}
            {/* The label between two rules, at xl (client mock). Below xl
               the column is left-aligned under the register and the label
               is the register's own DT, as before. */}
            <h3 className={cn(DT, 'xl:flex xl:items-center xl:gap-4 xl:text-[0.75rem] xl:tracking-[0.22em] xl:text-paper/70')}>
              <span aria-hidden className="hidden h-px w-14 bg-paper/20 xl:block" />
              {t('cols.follow')}
              <span aria-hidden className="hidden h-px w-14 bg-paper/20 xl:block" />
            </h3>
            <ul className="mt-3 flex flex-wrap justify-center gap-2.5 sm:mt-4 sm:justify-start xl:mt-7 xl:gap-4">
              {CHANNELS.map(({ key, href }) => (
                <li key={key}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t(`social.${key}`)}
                    style={{ '--ch-ring': `rgb(${CHANNEL_RGB[key]} / 0.65)` } as CSSProperties}
                    // DARK DISCS WITH A RING (client mock, 2026-09-28),
                    // where paper discs stood since 2026-09-16. The paper
                    // was load-bearing for TikTok's black layer, which
                    // vanishes on dusk — so the mark is drawn with a paper
                    // ink here (ChannelMark `ink`), and the cyan and magenta
                    // offsets still read. Facebook's blue is a little quiet
                    // on dusk; that is the mock's choice, and the hover ring
                    // in the channel colour is what lifts it.
                    className="grid h-12 w-12 place-items-center rounded-full bg-paper/[0.06] ring-1 ring-paper/15 transition-[transform,box-shadow,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:bg-paper/10 hover:ring-2 hover:ring-[color:var(--ch-ring)] xl:h-[3.25rem] xl:w-[3.25rem]"
                  >
                    <ChannelMark channel={key} instance={`footer-${key}`} ink="#F4F1EA" className="h-[22px] w-[22px]" />
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-8 hidden flex-wrap gap-3 sm:flex xl:mt-10">
              {/* The glow (client mock): a soft gold halo under the filled
                 button, so it reads as the lit one of the pair. Sizes are
                 unchanged — the pair measures 285px and the register's
                 budget cannot spare more. */}
              <a
                href={VISIT_DIRECTIONS_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gold px-5 py-2 text-[14px] font-semibold text-dusk shadow-[0_0_28px_rgba(192,161,101,0.35)] transition-[background-color,box-shadow] hover:bg-paper hover:shadow-[0_0_32px_rgba(244,241,234,0.3)]"
              >
                {t('findUs.directions')}
                <span aria-hidden className="rtl:rotate-180">&rarr;</span>
              </a>
              <Link
                href={p('/om-oss#besok-oss')}
                className="inline-flex min-h-11 items-center rounded-full border border-paper/40 px-5 py-2 text-[14px] font-semibold text-paper transition-colors hover:border-paper hover:bg-paper hover:text-dusk"
              >
                {t('findUs.visit')}
              </Link>
            </div>
          </div>

          {/* max-sm:order-none (2026-09-29): order-first put a 368px map at
             the very top of the footer on a phone, so the address, the
             opening hour and the e-mail — the reasons anyone scrolls this
             far — sat below it. Below sm the map takes its DOM position,
             after the contact register, and its height drops to 15rem
             (see find-us-google.tsx). From sm the order is unchanged. */}
          <div className="order-first max-sm:order-none sm:col-span-2 xl:order-none xl:col-auto">
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

               Was 437px wide until 2026-09-28, under the ~520px where
               Google's bottom chrome stops colliding with itself. The column
               is now the widest track of the band (see the note on the grid),
               which is the only cure for that; the footer's height did not
               change.

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
          <div className="order-last sm:col-span-2 xl:hidden">
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
        {/* ── THE ROOM FOR THE FLOATING BUTTON IS GIVEN BACK ──────────────
           It was taken on 2026-09-23, when the client found the org.nr line
           sitting under the "Questions?" button at full scroll. The button
           was then a worded pill about 150px wide and 48px tall, pinned to
           the bottom-right — wide enough to reach across a centred line —
           so the bar was given 5rem of bottom padding to sit clear above it.
           He asked for the fix without moving the button, so the bar moved.
           
           The button became a 44px disc on 2026-09-30, at his request, and
           it now occupies only the corner: 44px wide against a 390px
           viewport. Neither centred line reaches it any more — measured, the
           org.nr line ends 3px short of the disc's left edge and the credit
           line 10px short — so the padding is paying for a collision that
           can no longer happen, and the footer was left floating.
           
           Back to the ordinary 12px, keeping the safe-area inset so the last
           line still clears a home indicator. sm: is unchanged, as it has
           been throughout. */}
        <div className="mx-auto grid max-w-7xl items-center gap-y-2 px-5 py-3 pb-[calc(3.25rem+env(safe-area-inset-bottom))] sm:grid-cols-3 sm:gap-y-3 sm:px-6 sm:py-5 sm:pb-5 xl:px-10">
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
