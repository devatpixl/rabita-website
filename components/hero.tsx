import { Fragment } from 'react';
import type { CSSProperties } from 'react';
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
  // Phones get no extra magnification. The mobile source is already a 4:5
  // crop, and the hero column is roughly 1:1.95, so object-cover alone has
  // to enlarge it ~1.5x to fill. Stacking the desktop 1.45 on top of that
  // took it to 2.2x — the "why is the bg image so zoomed in" the client
  // flagged on 2026-08-30. 1 means: crop as much as cover needs, no more.
  scaleMobile: 1,
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
// The measured height of what sits above the hero at md and up: the prayer
// strip (45) plus the header (77). Only the giving card uses it — the hero's
// own min-height stays keyed to HEADER_H, which is tuned, not measured.
const CARD_CHROME_H = 122;

// The utility strip is hidden below md, so a phone only carries the bar —
// trimmed from 77 to 60 on 2026-08-30 when the mobile capsule was tightened.
const HEADER_MOBILE_H = 60;

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

// Portrait screens need their own scrim. The horizontal one is built for a
// two column hero: heavy on the headline side, clear on the card side. On a
// phone there is no second column, the text sits over the lower half of the
// picture, and a side weighted gradient leaves it illegible. This one keeps
// the faces readable near the top and darkens down into the text.
const SCRIM_MOBILE =
  'linear-gradient(180deg,' +
  ' rgba(22,36,46,0.44) 0%,' +
  ' rgba(22,36,46,0.20) 18%,' +
  ' rgba(22,36,46,0.52) 42%,' +
  ' rgba(22,36,46,0.88) 68%,' +
  ' rgba(22,36,46,0.96) 100%)';

// The headline is a list, and automatic wrapping was breaking it between
// every article and its noun: "En moské. En / skole. Et / bibliotek. Et /
// kjøkken. Én / adresse." Five lines, four of them ending on an article, each
// sentence severed from the word it introduces.
//
// Splitting on sentence and clause boundaries and making each phrase
// unbreakable means the browser can only break where a reader would. It picks
// how many phrases fit per line; every line still ends on a full stop or a
// comma.
//
// Phrases longer than this are left breakable on purpose. Arabic renders the
// whole list as a single clause, and a nowrap span wider than its column
// overflows the column rather than wrapping inside it.
const NOWRAP_MAX = 16;

const phrases = (text: string) =>
  text.split(/(?<=[.,\u060C])\s+/).filter((p) => p.trim().length > 0);

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

  // The height cap and the vertical centring below are DESKTOP ONLY, and
  // that is not a refinement: applied at every width they broke the phone
  // layout outright. The content block is ~1194px tall on a 390px screen
  // inside a 714px cap, and `justify-center` splits an overflow across both
  // ends, so the headline sat at top:-240 and `overflow-hidden` threw it
  // away. The first thing a phone visitor saw was the middle of the second
  // sentence. On mobile the hero now flows at its natural height and starts
  // at the top, where a headline belongs.
  const heroVars = {
    '--hero-min-sm': `calc(100svh - ${HEADER_MOBILE_H}px)`,
    '--hero-min': `min(calc(100svh - ${HEADER_H}px), ${980 - HEADER_H}px)`,
    '--hero-cap': `calc(100svh - ${HEADER_H}px)`,
    // The gutter reserved above and below the card. 48px of breathing room is
    // right on a monitor; on a 13" laptop it is 48px the card does not have,
    // so it shrinks with the screen. Paired with the short:/shorter: spacing
    // inside GivingCard, which is what actually makes the card fit.
    // The card sits below real chrome of CARD_CHROME_H, not HEADER_H: the
    // 130 is a rounded figure the hero's own min-height is tuned against,
    // and measuring the strip (45) plus the header (77) gives 122. Those 8px
    // are the difference between the card fitting and not on a 13" laptop.
    '--hero-card-cap': `calc(100svh - ${CARD_CHROME_H}px - clamp(12px, 100svh - 700px, 48px))`,
  } as CSSProperties;

  return (
    <section
      aria-labelledby="hero-heading"
      // The max-height is gone; min-height stays. With a four line headline
      // the content block runs about 570px, and on a short laptop (1280x700,
      // say) the cap left barely 480px, so the section would have clipped the
      // very type this change enlarged. Without a cap the section grows by a
      // few pixels on short screens instead, which is a cosmetic cost against
      // a headline that vanishes. overflow-hidden stays: its real job is
      // holding the scaled background image, not trimming content.
      className="relative overflow-hidden bg-dusk text-paper min-h-[var(--hero-min-sm)] md:min-h-[var(--hero-min)]"
      style={heroVars}
    >
      {/* One background layer at every width, with the crop swapped at md.

         The photograph used to be a block ABOVE the text on phones: a 4:5
         crop that filled the entire first screen on its own and pushed the
         headline, the lede and both buttons below the fold. A visitor met a
         picture and nothing else. It is a background now, the way the desktop
         hero and innocents.no both do it, with the content over the top. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <Image
          src={HERO_IMAGE.mobile}
          alt=""
          fill
          priority
          sizes="100vw"
          className="md:hidden"
          style={{
            objectFit: 'cover',
            objectPosition,
            transform: `scale(${HERO_ART.scaleMobile})`,
            transformOrigin: objectPosition,
            filter: IMAGE_FILTER,
          }}
        />
        <div className="absolute inset-0 md:hidden" style={{ background: SCRIM_MOBILE }} />
        <Image
          src={HERO_IMAGE.desktop}
          alt=""
          fill
          priority
          sizes="100vw"
          className="hidden md:block"
          style={{
            objectFit: 'cover',
            objectPosition,
            transform: `scale(${HERO_ART.scale})`,
            transformOrigin: objectPosition,
            filter: IMAGE_FILTER,
          }}
        />
        <div className="absolute inset-0 hidden md:block" style={{ background: scrimHorizontal(isRtl) }} />
        <div className="absolute inset-0 hidden md:block" style={{ background: SCRIM_VERTICAL }} />
        <div
          className="absolute inset-x-0 bottom-0 h-[38%]"
          style={{ background: SCRIM_FOOT }}
        />
      </div>

      {/* 92rem here, against 84rem for the header and the sections. The hero
         is the one full bleed block on the site, so it can sit on a wider
         measure, and that is what moves the whole text column left: about
         64px at 1512 and above. It is the right edge that matters, since that
         is the end that was reaching the man's face. The cost is that the
         headline no longer starts exactly under the wordmark; a hero running
         wider than the grid beneath it is a normal editorial device, but it
         is a deliberate break rather than an accident. */}
      <div className="relative z-10 mx-auto flex min-h-[var(--hero-min-sm)] w-full max-w-[92rem] flex-col justify-end px-6 pt-8 pb-10 md:min-h-[var(--hero-min)] md:justify-center md:px-10 md:pt-10 md:pb-12 lg:px-12">
        <div className="grid w-full items-center gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-20">
          <div>
            <h1
              id="hero-heading"
              // display-opsz, not text-display: this headline sets its own
              // fontSize inline, and the opsz 144 rule was attached to the
              // .text-display CLASS. So the one piece of type that most needs
              // the display cut was the only heading on the site falling back
              // to font-optical-sizing: auto, which resolved it to about 75.
              // The gold accent inside the same sentence is .accent-em and was
              // already pinned to 144, so one line was set at two optical
              // sizes.
              // text-pretty, not text-balance. Balance evens every line out
              // rather than filling the measure, which turned four lines into
              // five short ones and overran the section's height cap. Pretty
              // only guards the last line, so the measure still fills but
              // "adresse." is not left orphaned on its own.
              className="display-opsz font-serif text-paper text-pretty"
              style={{
                // 128px at 1920, up from 96. innocents.no runs
                // clamp(52px, 9.4vw, 140px) and lands at 140, which is most
                // of what reads as "bigger and more modern" between the two.
                //
                // This cannot push the text right into the photograph: the
                // 22ch max width computes to about 1012px at this size, but
                // the grid column is roughly 700px, so the column is what
                // binds. Growing the type adds lines inside the same measure
                // rather than widening it, which is also what fills the
                // column vertically.
                //
                // The vh term stays so a short laptop does not get a headline
                // sized for a 27 inch monitor: at 1280x800 this resolves to
                // 88px, not 128.
                fontSize: 'clamp(2.125rem, min(6.2vw, 9.2vh), 6.5rem)',
                lineHeight: 0.99,
                letterSpacing: '-0.03em',
                // No max width: the grid column is the measure. A tighter
                // cap would stop two short phrases ever sharing a line, which
                // is what keeps this to four lines instead of five.
                maxWidth: '100%',
              }}
            >
              {phrases(t('headlineBefore')).map((phrase, i) => (
                <Fragment key={i}>
                  <span className={phrase.length <= NOWRAP_MAX ? 'whitespace-nowrap' : undefined}>
                    {phrase}
                  </span>{' '}
                </Fragment>
              ))}
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
                <span className="whitespace-nowrap">
                  <Accent surface="dusk">{t('headlineAccent')}</Accent>
                </span>
              )}
              {t('headlineAfter')}
            </h1>
            {/* Carries who Rabita is as well as what is being built. The
               founding line that used to sit above the headline was a gold
               small-caps caption, which read as decoration and got skipped;
               the same fact in a sentence at reading size gets read. */}
            <p className="mt-5 max-w-[52ch] text-body text-paper/80">{t('subhead')}</p>

            <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href={`/${locale}/moskeprosjektet`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold-deep px-6 py-3 text-[15px] font-semibold text-paper transition-colors duration-200 ease-out hover:bg-ink active:scale-[0.99] sm:justify-start"
              >
                {t('cta.primary')}
                <ArrowIcon className="h-3.5 w-3.5" />
              </Link>
              <a
                href="#menigheten-forteller"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-paper/60 px-6 py-3 text-[15px] font-semibold text-paper transition-colors hover:bg-paper/10 sm:justify-start"
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
          {/* Desktop only, deliberately. The card WAS shown here on phones for
             a few hours on 2026-08-30 to answer "where is the donation box" —
             but the hero grows to fit its content and the background is
             object-cover, so a taller hero crops the photo harder and it read
             as badly zoomed in. On a phone the card is its own section under
             the hero instead (HeroGive, in the homepage), which leaves this
             image at its intended crop. */}
          <aside
            aria-label="Give"
            className="hidden md:block md:sticky md:top-24 self-center w-full md:ml-auto md:max-h-[var(--hero-card-cap)]"
            style={{ maxWidth: '640px' }}
          >
            {/* One card. The offset paper-deep layer that used to sit behind
               it read as a second, stacked card; removed 2026-08-30. */}
            <div className="relative isolate h-full">
              <div className="no-scrollbar relative overflow-y-auto rounded-2xl border border-gold/30 bg-paper text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_-10px_rgba(0,0,0,0.35),0_28px_60px_-24px_rgba(0,0,0,0.4)] md:max-h-[var(--hero-card-cap)]">
                <GivingCard fit />
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
