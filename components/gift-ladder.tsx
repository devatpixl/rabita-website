'use client';

import { useLocale, useTranslations } from 'next-intl';
import { openGiveSheet } from './giving-sheet';
import { formatAmount } from '@/lib/format';
import { GIFTS, type Gift } from '@/lib/gifts';
import type { AppLocale } from '@/i18n/routing';
import { Eyebrow, Section, SectionBody, SectionHeading } from './primitives';
import { Accent } from './accent';
import { InventoryBar } from './inventory-bar';
import { MotionRise } from './motion-rise';
import { cn } from '@/lib/cn';

// §4.03 — Gift Ladder as four rows.
//
// The image column has been replaced by a LIVE INVENTORY column
// (funded/total + thin progress bar). No photography needed; honest
// scarcity is the design ("3 of 48 panels are taken"). Data comes from
// lib/gifts.ts. See that file's TODO — the unitFunded counts must be
// real, not invented.
//
// Layout scars kept as inline comments so the next hand doesn't re-hit
// them:
//   - Numeral column is FIXED (220px), sized so "100 000 kr" at the
//     largest type (55px) fits on one line. Sizing to content lets the
//     100 000 row overflow into the text column.
//   - Grid is `items-start` on desktop so per-row padY equals the true
//     top space above the numeral (items-center inflated the tall
//     rows).
//   - Numeral + kr live in a plain inline run per breakpoint so the
//     browser baseline aligns them. inline-flex + items-baseline was
//     dropping kr below the digits.
//   - Anchor bleed uses inline `left: -1.5rem right: -1.5rem` so the
//     paper-deep band extends symmetrically regardless of any Tailwind
//     class extraction quirk.

type Row = {
  key: Gift['key'];
  numDesktopPx: number;
  numMobilePx: number;
  tracking: number; // negative em
  padY: string; // rem
  anchor?: true;
};

// Middle scale — bigger than the original 30/38/46/55 (which read as
// too compact) but pulled back from 40/52/64/78 (which pushed too far).
// Column at 260px fits "100 000 kr" at 66px with the kr suffix.
const ROWS: readonly Row[] = [
  { key: 'prayer', numDesktopPx: 34, numMobilePx: 28, tracking: -0.02,  padY: '1.6rem' },
  { key: 'shelf',  numDesktopPx: 44, numMobilePx: 34, tracking: -0.025, padY: '1.9rem' },
  { key: 'desk',   numDesktopPx: 54, numMobilePx: 42, tracking: -0.03,  padY: '2.2rem', anchor: true },
  { key: 'panel',  numDesktopPx: 66, numMobilePx: 52, tracking: -0.035, padY: '2.6rem' },
];

export function GiftLadder() {
  const t = useTranslations('giftLadder');
  const locale = useLocale() as AppLocale;

  return (
    <Section id="hva-din-gave-bygger" tone="paper">
      <SectionBody>
        <div className="mb-12 max-w-3xl">
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <SectionHeading reveal className="mt-3 text-balance">
            {t.rich('heading', {
              em: (chunks) => <Accent surface="paper">{chunks}</Accent>,
            })}
          </SectionHeading>
        </div>

        {/* Ladder spans the full section content width. The text
           column's *content* is capped (see the max-w-[52ch] on the
           text block below) so the description doesn't stretch to a
           losing-line-length at 1440+; whatever the 1fr grid track
           leaves over sits as empty space between the text and the
           inventory column, which stays right-aligned at the container
           edge. Hairlines, anchor band and inventory all reach the
           edge as they should. */}
        <div className="border-t border-rule">
          {ROWS.map((row, i) => {
            const gift = GIFTS.find((g) => g.key === row.key);
            if (!gift) return null;
            return (
              <LadderRow
                key={row.key}
                row={row}
                gift={gift}
                locale={locale}
                title={t(`items.${row.key}.title`)}
                meta={t(`items.${row.key}.meta`)}
                unit={t(`units.${row.key}`)}
                totalSuffix={t('totalSuffix')}
                anchorLabel={t('anchorLabel')}
                index={i}
                isLast={i === ROWS.length - 1}
                isPreAnchor={ROWS[i + 1]?.anchor === true}
              />
            );
          })}
        </div>

        <div className="mt-12 flex flex-col items-start gap-3">
          <button
            type="button"
            onClick={() => openGiveSheet()}
            className="min-h-12 rounded-btn bg-gold-deep text-paper px-6 py-3 text-[15px] font-semibold transition-colors duration-200 ease-out hover:bg-ink active:scale-[0.99]"
          >
            {t('cta')}
          </button>
          <p className="text-[13.5px] text-ink-60">{t('footnote')}</p>
        </div>
      </SectionBody>
    </Section>
  );
}

function LadderRow({
  row,
  gift,
  locale,
  title,
  meta,
  unit,
  totalSuffix,
  anchorLabel,
  index,
  isLast,
  isPreAnchor,
}: {
  row: Row;
  gift: Gift;
  locale: AppLocale;
  title: string;
  meta: string;
  unit: string;
  totalSuffix: string;
  anchorLabel: string;
  index: number;
  isLast: boolean;
  isPreAnchor: boolean;
}) {
  const isAnchor = !!row.anchor;
  const numeral = formatAmount(locale, gift.amountNok);
  const showBottomRule = !isAnchor && !isLast && !isPreAnchor;

  return (
    <MotionRise
      as="div"
      delay={index * 80}
      className={cn(
        'relative',
        isAnchor && 'group isolate',
        showBottomRule && 'border-b border-rule',
        isLast && !isAnchor && 'border-b border-rule',
      )}
    >
      {/* Anchor band. Inline styles for every load-bearing property —
         `left/right` for symmetric bleed AND the two gold hairlines —
         so nothing about the band can be silently truncated by class
         extraction, cascade, or a shorter border painting than fill. */}
      {isAnchor && (
        <div
          aria-hidden
          className="pointer-events-none bg-paper-deep transition-colors duration-200 ease-out group-hover:bg-[color-mix(in_srgb,#EDE6D7,#E4DED3_35%)]"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '-1.5rem',
            right: '-1.5rem',
            zIndex: -10,
            borderTop: '1px solid #C0A165',
            borderBottom: '1px solid #C0A165',
          }}
        />
      )}

      <button
        type="button"
        onClick={() => openGiveSheet(gift.amountNok)}
        className={cn(
          'grid w-full items-start text-start',
          // Fixed 260px numeral column so "100 000 kr" at 66px always
          // fits on one line. 164px inventory column matches the
          // slightly-larger scale of the bar and count.
          'grid-cols-[260px_1fr_164px] gap-7',
          'max-md:grid-cols-[1fr_128px] max-md:gap-4',
          'transition-colors duration-200 ease-out',
          !isAnchor && 'hover:bg-paper-2',
        )}
        style={{ paddingTop: row.padY, paddingBottom: row.padY }}
        aria-label={`${title}, ${numeral} kr`}
      >
        {/* Column 1 — optional anchor label + numeral + kr suffix */}
        <div className="max-md:col-span-1 flex flex-col items-start">
          {isAnchor && (
            <span
              className="font-mono uppercase text-gold-deep whitespace-nowrap leading-none"
              style={{
                fontSize: '12px',
                letterSpacing: '0.1em',
                marginBottom: '6px',
              }}
            >
              {anchorLabel}
            </span>
          )}
          <span
            className="hidden md:inline font-serif tabular-nums text-ink whitespace-nowrap"
            style={{ lineHeight: 1 }}
          >
            <span
              style={{
                fontSize: `${row.numDesktopPx}px`,
                letterSpacing: `${row.tracking}em`,
              }}
            >
              {numeral}
            </span>
            <span
              className="text-ink-60"
              style={{ fontSize: '14.5px', marginInlineStart: '7px' }}
            >
              kr
            </span>
          </span>
          <span
            className="md:hidden font-serif tabular-nums text-ink whitespace-nowrap"
            style={{ lineHeight: 1 }}
          >
            <span
              style={{
                fontSize: `${row.numMobilePx}px`,
                letterSpacing: `${row.tracking}em`,
              }}
            >
              {numeral}
            </span>
            <span
              className="text-ink-60"
              style={{ fontSize: '14.5px', marginInlineStart: '7px' }}
            >
              kr
            </span>
          </span>
        </div>

        {/* Column 2 — title + meta. Capped at 52ch so lines stay
           readable at wide viewports; the surplus 1fr width sits as
           empty gap between the text and the inventory column, which
           stays pinned to the right edge of the container. */}
        <div className="max-md:col-span-1 max-md:row-start-2 flex flex-col gap-1 min-w-0 max-w-[52ch]">
          <p
            className={cn(
              'font-serif text-[1.375rem] leading-snug text-ink text-balance',
              isAnchor && 'font-semibold',
            )}
          >
            {title}
          </p>
          <p className="text-[14.5px] text-ink-60 leading-relaxed">{meta}</p>
        </div>

        {/* Column 3 — inventory count + progress bar, vertically centred */}
        <div className="max-md:row-start-1 max-md:col-start-2 max-md:row-span-2 self-center">
          <InventoryBar
            gift={gift}
            isAnchor={isAnchor}
            unit={unit}
            totalSuffix={totalSuffix}
            staggerDelay={index * 80}
          />
        </div>
      </button>
    </MotionRise>
  );
}
