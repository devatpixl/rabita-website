import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { AssuranceRegister } from './assurance-register';
import { CAMPAIGN } from '@/lib/campaign';
import { formatAmount } from '@/lib/format';
import type { AppLocale } from '@/i18n/routing';
import { Section, SectionBody, SectionHeading } from './primitives';
import { Accent } from './accent';

// §4.06 — matched to reference mockup. Surface is --paper-2 #F2EEE7.
//
// Ornament is an inline SVG pattern based on the Rabita rosette mark
// (the shared logo asset is a PNG at /logo/rabita-mark-256.png so it
// can't be stripped to strokes directly — this is a section-local
// stroke-only geometric variant of the same 9-fold rosette motif:
// outer 9-gon + {9/4} interlaced star + small central circle, stroked
// in --rule / #E4DED3 at stroke-width 1). The shared logo component
// is not modified. The fold count was confirmed by FFT of the PNG
// alpha along a mid-ring — dominant harmonics at k=9, 18, 27.
//
// Tile is 168 × 336 to carry a half-drop brick offset: row 1 has the
// mark centred at (84, 84); row 2 draws two half-marks at (0, 252)
// and (168, 252) whose right/left halves stitch across the tile seam
// to form the offset row. Wrapper opacity 0.55 (paper-2 ground is
// darker than paper, so the stroke needs the extra lift to hold).
//
// A vertical mask fades the pattern out before the four trust items,
// so the numeral row and above sit on pattern, and the two-column
// grid below sits on clean --paper-2.
//
// Section owns `overflow: hidden`; content sits in a `relative`
// wrapper stacked above the aria-hidden pattern layer.
//
// Trust items sit in a 2-column grid at md+ (no xl 4-col step): wider
// columns let each body run at up to 46ch without stretching to the
// full column width.
export async function WhereMoneyGoes() {
  const t = await getTranslations('whereMoneyGoes');
  const locale = (await getLocale()) as AppLocale;

  const cards: { key: 'tax' | 'accounts' | 'permit' | 'org'; href: string }[] = [
    { key: 'tax', href: `/${locale}/hvor-pengene-gar#skattefradrag` },
    { key: 'accounts', href: `/${locale}/hvor-pengene-gar#regnskap` },
    { key: 'permit', href: `/${locale}/hvor-pengene-gar#tillatelse` },
    { key: 'org', href: `/${locale}/om-oss` },
  ];

  return (
    <Section
      id="hvor-pengene-gar"
      tone="paper-2"
      className="relative isolate overflow-hidden scroll-mt-20 !pt-[88px] !pb-[88px]"
    >
      {/* Ornament — inline SVG pattern, section-local. Absolute, behind
         content via -z-10. Aria-hidden. Wrapper opacity 0.55. Mask
         fades the pattern out before the four trust items. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          opacity: 0.55,
          maskImage:
            'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 34%, rgba(0,0,0,0) 62%)',
          WebkitMaskImage:
            'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 34%, rgba(0,0,0,0) 62%)',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          role="presentation"
        >
          <defs>
            {/* Rosette mark, centred on (0,0), r=40. Stroke-only.
               Outer 9-gon + {9/4} interlaced star + small central
               circle. Kept as a <symbol> so the pattern places it via
               <use> at three anchor points without repeating geometry. */}
            <symbol id="wmg-mark" overflow="visible">
              <g fill="none" stroke="#E4DED3" strokeWidth="1">
                {/* Outer regular 9-gon (nonagon) */}
                <path d="M 0 -40 L 25.71 -30.64 L 39.39 -6.95 L 34.64 20.00 L 13.68 37.59 L -13.68 37.59 L -34.64 20.00 L -39.39 -6.95 L -25.71 -30.64 Z" />
                {/* Interlaced {9/4} star polygon (each vertex to +4;
                    gcd(9,4)=1 so it forms a single continuous path) */}
                <path d="M 0 -40 L 13.68 37.59 L -25.71 -30.64 L 34.64 20.00 L -39.39 -6.95 L 39.39 -6.95 L -34.64 20.00 L 25.71 -30.64 L -13.68 37.59 Z" />
                {/* Central marker */}
                <circle cx="0" cy="0" r="5" />
              </g>
            </symbol>
            <pattern
              id="wmg-tile"
              width="168"
              height="336"
              patternUnits="userSpaceOnUse"
            >
              {/* Row 1 — centred */}
              <use href="#wmg-mark" x="84" y="84" />
              {/* Row 2 — half-drop: two half-marks stitch across the
                  vertical seam so the mark appears centred between the
                  row-1 columns. */}
              <use href="#wmg-mark" x="0" y="252" />
              <use href="#wmg-mark" x="168" y="252" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wmg-tile)" />
        </svg>
      </div>

      <SectionBody className="relative">
        {/* Heading block — eyebrow → headline gap = 20px (mt-5). */}
        <div className="max-w-3xl">
          <SectionHeading reveal className="text-balance">
            {t.rich('heading', {
              em: (chunks) => <Accent surface="paper">{chunks}</Accent>,
            })}
          </SectionHeading>
        </div>

        {/* Numeral + sentence as one unit. Headline → numeral row = 48px. */}
        <div
          className="mt-12 flex items-start"
          style={{ gap: '48px' }}
        >
          {/* Numeral column — shrink-to-fit around the numeral. Label
             below is capped so "Rental apartments" wraps to two lines
             beneath the numeral rather than running wider. */}
          <div
            className="flex flex-col items-start shrink-0"
            style={{ flex: '0 0 auto' }}
          >
            <span
              className="font-serif text-ink whitespace-nowrap"
              style={{
                fontSize: 'clamp(72px, 6vw, 92px)',
                lineHeight: 0.82,
                letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatAmount(locale, CAMPAIGN.rentalApartments)}
            </span>
            <span
              className="text-ink-60 font-sans"
              style={{
                fontSize: '13px',
                marginTop: '12px',
                lineHeight: 1.4,
                letterSpacing: 'normal',
                maxWidth: '100px',
                overflowWrap: 'break-word',
              }}
            >
              {t('rentalApartmentsLabel')}
            </span>
          </div>
          <p
            className="text-body text-ink leading-relaxed"
            style={{ maxWidth: '62ch', paddingTop: '6px' }}
          >
            {t('runningCost')}
          </p>
        </div>

        <AssuranceRegister
          cards={cards}
          values={{
            orgNr: CAMPAIGN.orgNr,
            founded: CAMPAIGN.foundedYear,
            cap: CAMPAIGN.taxDeductionCapNok.toLocaleString('nb-NO'),
          }}
        />

      </SectionBody>
    </Section>
  );
}
