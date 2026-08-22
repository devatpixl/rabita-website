import Image from 'next/image';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { GivingCard } from './giving-card';
import { HeroCampaign } from './hero-campaign';
import { HeroSentinel } from './campaign-strip';
import { Accent } from './accent';

// §4.01. Full-bleed dark plane. The photograph is a Rabita-owned image
// of four FRIVILLIG volunteers at a street iftar under the bridge in
// Oslo. No compositing, no building render, no vector rosette. The
// focal point is the man in the maroon scarf at centre-frame — the
// image is cropped IN on him, not out, so the hero reads as a single
// face and everything else falls to blur and shape.
//
// TODO before launch: confirm all four volunteers in the source image
// (public/hero/volunteers-gateiftar-*.jpg — original at
// /Desktop/rabita images all/01-gateiftar-2026__iftar_-13.jpg) have
// consented in writing to public use on the site. Åndsverkloven §104
// requires consent from identifiable people.

// Art direction knobs — kept as one exported const so this can be
// nudged without hunting through JSX. objectPosition first, scale
// second; the three filter values grade the photo toward the site
// palette (desaturated warm dusk).
export const HERO_ART = {
  objectPosition: '32% 42%',
  scale: 1.45,
  saturate: 0.72,
  contrast: 1.12,
  brightness: 0.9,
} as const;

const HERO_IMAGE = {
  desktop: '/hero/volunteers-gateiftar-16x9.jpg',
  mobile: '/hero/volunteers-gateiftar-4x5.jpg',
} as const;

// Measured (utility strip 61px + sticky main header 69px = 130px).
// Kept as a numeric constant so the section can subtract it and stay
// within one viewport; if the header ever changes height, re-measure
// once and update this.
const HEADER_H = 130;

// Two stacked gradients. The horizontal one does the work — heavy on
// the headline side and near-clear on the card side (the card is
// opaque anyway). The vertical one is only a header-legibility band
// at the very top. A flat scrim was rejected because it darkens the
// subject and the background by the same amount, which is why the
// previous version read as flat.
//
// Direction flips for RTL so heavy-side follows the headline column.
const scrimHorizontal = (rtl: boolean) =>
  `linear-gradient(${rtl ? 270 : 90}deg,` +
  ' rgba(22,36,46,0.92) 0%,' +
  ' rgba(22,36,46,0.82) 28%,' +
  ' rgba(22,36,46,0.34) 52%,' +
  ' rgba(22,36,46,0.10) 68%,' +
  ' rgba(22,36,46,0.04) 100%)';
const SCRIM_VERTICAL =
  'linear-gradient(180deg, rgba(22,36,46,0.55) 0, rgba(22,36,46,0) 220px)';

// A scrim at the foot so the photograph resolves into the section below instead of stopping dead.
const SCRIM_FOOT =
  'linear-gradient(0deg,' +
  ' rgb(22,36,46) 0%,' +
  ' rgba(22,36,46,0.86) 18%,' +
  ' rgba(22,36,46,0.45) 42%,' +
  ' rgba(22,36,46,0) 78%)';

const IMAGE_FILTER = `saturate(${HERO_ART.saturate}) contrast(${HERO_ART.contrast}) brightness(${HERO_ART.brightness})`;

// The hero keeps a narrower gutter than the sections below, since a full bleed photo carries more width.

export async function Hero() {
  const t = await getTranslations('hero');
  const locale = await getLocale();
  const isRtl = locale === 'ar';

  // Focal point stays fixed regardless of writing direction — the image
  // container isn't mirrored, only the grid columns are. The scrim
  // direction flips (below) so the "clear" side always sits under the
  // card, not the headline.
  const objectPosition = HERO_ART.objectPosition;

  // The hero carries the headline, the subhead, two links and the giving
  // card — nothing else. The founding-date line and the phase line were
  // removed deliberately; `hero.credLine` and `hero.phaseLine` are still in
  // messages/*.json for whatever surfaces them next.

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-dusk text-paper"
      style={{
        minHeight: `min(calc(100svh - ${HEADER_H}px), ${980 - HEADER_H}px)`,
        maxHeight: `calc(100svh - ${HEADER_H}px)`,
      }}
    >
      {/* Mobile image — sits above the content block. 4:5 crop, same
         grading + scale so the face is dominant, no scrim (image is
         above the content, not underneath it). */}
      <div className="relative block md:hidden overflow-hidden">
        <div className="relative aspect-[4/5] w-full">
          <Image
            src={HERO_IMAGE.mobile}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{
              objectFit: 'cover',
              objectPosition,
              transform: `scale(${HERO_ART.scale})`,
              transformOrigin: objectPosition,
              filter: IMAGE_FILTER,
            }}
          />
        </div>
      </div>

      {/* Desktop background image + stacked scrims. Absolute so the
         content grid below sits over it. Hidden on mobile. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden md:block overflow-hidden"
      >
        <Image
          src={HERO_IMAGE.desktop}
          alt=""
          fill
          priority
          sizes="100vw"
          style={{
            objectFit: 'cover',
            objectPosition,
            transform: `scale(${HERO_ART.scale})`,
            transformOrigin: objectPosition,
            filter: IMAGE_FILTER,
          }}
        />
        <div className="absolute inset-0" style={{ background: scrimHorizontal(isRtl) }} />
        <div className="absolute inset-0" style={{ background: SCRIM_VERTICAL }} />
        <div
          className="absolute inset-x-0 bottom-0 h-[38%]"
          style={{ background: SCRIM_FOOT }}
        />
      </div>

      <div
        className="relative z-10 mx-auto flex w-full max-w-[84rem] flex-col justify-center px-6 pt-8 pb-10 md:px-10 md:pt-10 md:pb-12 lg:px-12"
        style={{
          minHeight: `min(calc(100svh - ${HEADER_H}px), ${980 - HEADER_H}px)`,
        }}
      >
        <div className="grid w-full items-center gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-20">
          <div>
            <h1
              id="hero-heading"
              className="font-serif text-paper text-balance"
              style={{
                fontSize: 'clamp(2.75rem, min(6vw, 8.8vh), 6rem)',
                lineHeight: 1.06,
                letterSpacing: '-0.015em',
                maxWidth: '22ch',
              }}
            >
              {t('headlineBefore')}
              {isRtl ? (
                // Arabic accent — IBM Plex Sans Arabic 700, no italic
                // (italic Latin-form isn't a native Arabic emphasis; the
                // <Accent> component's serif-italic treatment would
                // read as a font glitch here). Same gold on dusk.
                <em
                  className="font-sans not-italic"
                  style={{ color: '#C0A165', fontWeight: 700 }}
                >
                  {t('headlineAccent')}
                </em>
              ) : (
                <Accent surface="dusk">{t('headlineAccent')}</Accent>
              )}
              {t('headlineAfter')}
            </h1>
            {/* Carries who Rabita is as well as what is being built. The
               founding line that used to sit above the headline was a gold
               small-caps caption, which read as decoration and got skipped;
               the same fact in a sentence at reading size gets read. */}
            <p className="mt-5 max-w-[52ch] text-body text-paper/80">{t('subhead')}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={`/${locale}/moskeprosjektet`}
                className="inline-flex items-center gap-2 rounded-full bg-gold-deep text-paper px-6 py-3 text-[15px] font-semibold transition-colors duration-200 ease-out hover:bg-ink active:scale-[0.99]"
              >
                {t('cta.primary')}
                <ArrowIcon className="h-3.5 w-3.5" />
              </Link>
              <a
                href="#menigheten-forteller"
                className="inline-flex items-center gap-2 rounded-full border border-paper/60 px-6 py-3 text-[15px] font-semibold text-paper hover:bg-paper/10 transition-colors"
              >
                {t('cta.secondary')}
                <ArrowIcon className="h-3.5 w-3.5" />
              </a>
            </div>

            <HeroCampaign />
          </div>

          {/* Right column — giving card. Capped at 640px wide and
             anchored to the right edge of the col (ml-auto) so the
             surplus width goes into the gap with the headline, not
             into the form controls. Vertically centred against the
             headline block via the grid's items-center; height capped
             so a short viewport never overflows, inner scroll if the
             card is taller than the cap. */}
          <aside
            aria-label="Give"
            className="md:sticky md:top-24 self-center w-full md:ml-auto"
            style={{
              maxWidth: '640px',
              maxHeight: `calc(100svh - ${HEADER_H}px - 48px)`,
            }}
          >
            <div className="relative isolate h-full">
              <div
                aria-hidden
                className="absolute inset-0 translate-y-2 translate-x-2 rounded-2xl bg-paper-deep border-t border-gold/40"
              />
              <div
                className="no-scrollbar relative rounded-2xl overflow-y-auto bg-paper text-ink border border-gold/30 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_-10px_rgba(0,0,0,0.35),0_28px_60px_-24px_rgba(0,0,0,0.4)]"
                style={{
                  maxHeight: `calc(100svh - ${HEADER_H}px - 48px)`,
                }}
              >
                <GivingCard />
              </div>
            </div>
          </aside>
        </div>
        <HeroSentinel />
      </div>
    </section>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
