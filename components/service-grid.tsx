import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { SERVICE_FOCUS, SERVICE_IMAGE, type ServiceKey } from '@/lib/services';
import { SectionBody } from './primitives';
import { Accent } from './accent';
import { Reveal } from './reveal';

// The services as a grid of plates, replacing the alternating full-width
// bands (client, 2026-09-13: "too much to scroll... show like this in grids,
// but try to make it very modern, interactive and aesthetic, use bg
// overlays"), against a reference of photo cards with the words sitting on
// the picture.
//
// The bands cost 493px per service and ran 6 374px — 6.7 screens for ten
// services on a 1920px monitor, and worse on his laptop.
//
// ── The overlay is the whole problem ──────────────────────────────────────
// Thirteen photographs nobody art-directed, and white type has to survive
// all of them. Measured luminance in the text zone, inside the real crop:
// svc-fosterhjem-meeting reads 0.46 mean / 0.87 max — effectively white
// paper behind the title — while subj-janaza reads 0.019. A 24x spread. A
// flat bg-black/50 tuned for one of those ruins the other.
//
// So the guarantee does not come from a flat wash. It comes from a LUMINANCE
// CEILING: a solid colour painted with mix-blend-mode: darken, which is
// min(base, C) per channel. Bright pixels are clamped to C; pixels already
// darker than C are returned untouched. The cost falls entirely on the
// photographs that can afford it and is exactly zero for janaza. Every layer
// painted after the ceiling can only subtract luminance, so the clamp is
// airtight by construction rather than by tuning.
//
// There is no per-photograph scrim strength, deliberately. Thirteen tuned
// constants is thirteen things to get wrong when the client swaps an image,
// and he has said he is replacing `norsk` and `veivisere` one by one.
//
// ── Two cascade traps, both real, both verified in this repo ──────────────
// 1. globals.css is unlayered and sits ~400 lines after `@tailwind utilities`,
//    so at equal specificity `.rv-zoom { transition: transform 1.5s }` BEATS
//    any duration utility on the same element. The old index put
//    `group-hover/pic:scale-[1.03]` straight onto its .rv-zoom image, so its
//    hover zoom ran on a 1.5s reveal easing. Here the hover scale lives on a
//    WRAPPER and .rv-zoom stays on the image: one element per transform.
// 2. mix-blend-mode blends against whatever is behind it, so without
//    `isolate` on the card root the ceiling would blend against the page and
//    produce garbage. `isolate` here is load-bearing, not decoration.

// Unifies thirteen white balances into one register. Same family as
// project-gallery's GRADE, plus a warm swing: sepia pulls to flat amber and
// the negative hue-rotate swings it back off yellow toward the brand gold.
const GRADE =
  'saturate(0.82) contrast(1.07) brightness(0.94) sepia(0.14) hue-rotate(-6deg)';

// Light falling into the frame. soft-light, so it is photograph-ADAPTIVE:
// it lifts janaza's black coats slightly and deepens a whiteboard, rather
// than doing the same thing to both. The radial's peak sits off the top edge
// at -14% so its hottest point never lands on the picture, and it is centred
// rather than cornered, which makes it RTL-neutral.
const LIGHT: React.CSSProperties = {
  background:
    'radial-gradient(115% 78% at 50% -14%, rgba(192,161,101,0.50) 0%, rgba(192,161,101,0.18) 38%, rgba(192,161,101,0) 66%),' +
    'linear-gradient(180deg, rgba(22,36,46,0) 40%, rgba(22,36,46,0.45) 72%, rgba(22,36,46,0.75) 100%)',
  mixBlendMode: 'soft-light',
};

// The ceiling. #2B2A26 is a warm charcoal one step off `ink`, NOT dusk: a
// cool clamp takes R down hard and leaves B alone, which turns warm shadows
// cyan. Neutral-warm clamps all three channels together, so there is no cast.
// The ramp reaches 0.86 by 55%, which is where the words begin.
const CEILING: React.CSSProperties = {
  background:
    'linear-gradient(180deg,' +
    'rgba(43,42,38,0) 0%,' +
    'rgba(43,42,38,0.06) 20%,' +
    'rgba(43,42,38,0.40) 40%,' +
    'rgba(43,42,38,0.86) 55%,' +
    'rgba(43,42,38,0.96) 74%,' +
    'rgba(43,42,38,0.98) 100%)',
  mixBlendMode: 'darken',
};

// The seat under the words, as a two-state cross-fade rather than an alpha
// bump — background-image is not interpolable, so one gradient cannot
// transition its own stops. Normal blend on dusk: it can only ever lower
// luminance, which keeps the ceiling's guarantee intact.
const SEAT_REST: React.CSSProperties = {
  background:
    'linear-gradient(180deg, rgba(22,36,46,0) 44%, rgba(22,36,46,0.18) 70%, rgba(22,36,46,0.34) 100%)',
};
// On approach a gold glow rises from below the foot: the light warms when
// you reach for it. This is the only layer that can raise luminance, and
// 0.30 is the alpha at which the worst-case title still holds ~9:1.
const SEAT_HOVER: React.CSSProperties = {
  background:
    'radial-gradient(120% 72% at 50% 114%, rgba(155,127,74,0.30) 0%, rgba(155,127,74,0) 68%),' +
    'linear-gradient(180deg, rgba(22,36,46,0.05) 20%, rgba(22,36,46,0.30) 62%, rgba(22,36,46,0.52) 100%)',
};

export async function ServiceGrid({
  items,
  locale,
  header = true,
  picker,
}: {
  items: readonly ServiceKey[];
  locale: string;
  /** The rullegardin, rendered INSIDE this section rather than above it.
   *  Standing on its own between the band and the grid it sat in a strip of
   *  bare paper — three paddings deep on a laptop and worse on a phone
   *  (client, 2026-09-13: "this space looks so bad"). On the arcade it reads
   *  as part of the section it controls. */
  picker?: React.ReactNode;
  /** The "Alle tjenester / Alt vi gjør, samlet" opener. Off on a page whose
   *  band already names it: two "Undervisning" eyebrows stacked stutter, and
   *  "everything we do, collected" is false over three of thirteen. */
  header?: boolean;
}) {
  const t = await getTranslations({ locale, namespace: 'servicesIndex' });
  const total = String(items.length).padStart(2, '0');

  return (
    // The pinned backdrop (client, 2026-09-13: "i want the bg fixed but cards
    // can move on scroll").
    //
    // position: sticky, NOT background-attachment: fixed. iOS Safari ignores
    // `fixed` and paints the background as `scroll`, which would have made
    // this work on every machine in the studio and on no phone.
    //
    // overflow-CLIP, not overflow-hidden. `hidden` makes the section a scroll
    // container, and a sticky element's containing scroller is its nearest
    // scrollable ancestor — so `hidden` here would silently pin the image to a
    // box that never scrolls, i.e. it would not stick at all. `clip` clips
    // without creating a scroller.
    <section className="relative isolate overflow-clip pb-section-md pt-10 md:pt-14">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="sticky top-0 h-screen">
          <Image
            src="/photos/svc-hall-bg.webp"
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover object-[70%_50%]"
          />
          {/* A paper wash, light enough that the arcade still reads. The
             heading is ink on this, and the plates are dark, so the ground
             only has to stay quiet — not disappear. */}
          <div className="absolute inset-0 bg-paper/45" />
        </div>

        {/* The seam. The arcade started on a hard horizontal line against the
           page's paper (client, 2026-09-13: "it is so sharp of transition
           from white to this").

           These live OUTSIDE the sticky child on purpose. On it they would
           pin to the viewport and fade whatever happened to be at the top of
           the screen; here they belong to the section box and scroll with it,
           so they sit on its actual edges. They are painted after the sticky
           layer, so they land over the photograph.

           Explicit rgba rather than `to-transparent`: Tailwind's transparent
           is rgba(0,0,0,0), which interpolates through grey and dirties a
           warm ground. */}
        <div
          className="absolute inset-x-0 top-0 h-40 md:h-56"
          style={{
            background:
              'linear-gradient(180deg, rgb(250,248,244) 0%, rgba(250,248,244,0.86) 28%, rgba(250,248,244,0) 100%)',
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-32 md:h-44"
          style={{
            background:
              'linear-gradient(0deg, rgb(250,248,244) 0%, rgba(250,248,244,0.8) 32%, rgba(250,248,244,0) 100%)',
          }}
        />
      </div>
      <SectionBody>
        {picker && <div className="mb-10 md:mb-14">{picker}</div>}
        {header && (
          <>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
              {t('allEyebrow')}
            </p>
            <h2 className="mt-4 max-w-2xl font-serif text-section text-balance text-ink">
              {t.rich('allHeading', { em: (chunks) => <Accent surface="paper">{chunks}</Accent> })}
            </h2>
          </>
        )}

        {/* Tight gutters on purpose. A wide gutter on photo cards makes ten
           postcards; a tight one makes a contact sheet, which is the register
           this site is in. */}
        <ol className={header
          ? 'mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:mt-14 lg:grid-cols-3 lg:gap-6'
          : 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6'}>
          {items.map((key, i) => {
            const n = String(i + 1).padStart(2, '0');
            return (
              <Reveal
                as="li"
                key={key}
                id={key}
                // Repeating 0 / .08 / .16 reads as a diagonal at three
                // columns, an alternation at two, and is harmless at one.
                delay={(i % 3) * 0.08}
                // group + relative + isolate + the aspect box, all on the
                // card root. justify-end seats the only in-flow child — the
                // words — at the foot, so the text is not absolutely placed
                // and the card's height is the aspect ratio's business.
                //
                // 4:3 on a phone, 4:5 from lg. Ten of the thirteen sources
                // are ~3:2 landscape and three are 3:4 portrait, so there is
                // no ratio that crops nothing; SERVICE_FOCUS steers each one.
                className="group/card relative isolate flex aspect-[4/3] scroll-mt-28 flex-col justify-end overflow-hidden rounded-2xl bg-ink md:scroll-mt-32 lg:aspect-[4/5]"
              >
                {/* The photograph. The hover scale is on THIS wrapper, never
                   on the .rv-zoom image below it — see trap 1 in the header. */}
                <span
                  aria-hidden
                  className="absolute inset-0 z-0 transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover/card:scale-[1.04] motion-safe:group-focus-within/card:scale-[1.04]"
                >
                  <Image
                    src={SERVICE_IMAGE[key]}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 92vw"
                    style={{ filter: GRADE, objectPosition: SERVICE_FOCUS[key] ?? '50% 50%' }}
                    className="rv-zoom object-cover"
                  />
                </span>

                {/* 1 — light fall, BEFORE the ceiling on purpose: the
                   guarantee must not depend on this layer's behaviour. */}
                <span aria-hidden className="pointer-events-none absolute inset-0 z-10" style={LIGHT} />
                {/* 2 — the ceiling. Everything after this can only subtract. */}
                <span aria-hidden className="pointer-events-none absolute inset-0 z-20" style={CEILING} />
                {/* 3 — the seat, cross-faded on approach. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-30 opacity-100 transition-opacity duration-[420ms] ease-out group-hover/card:opacity-0 group-focus-within/card:opacity-0"
                  style={SEAT_REST}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-30 opacity-0 transition-opacity duration-[420ms] ease-out group-hover/card:opacity-100 group-focus-within/card:opacity-100 group-active/card:opacity-100"
                  style={SEAT_HOVER}
                />

                {/* The words. z-40 with NO `relative`, and that is
                   load-bearing: a flex item with a z-index makes a stacking
                   context while staying a non-containing-block, which is what
                   lets the title link's ::after span the WHOLE card. Add
                   `relative` here and the hit area silently collapses to this
                   box with no visual symptom. */}
                <div className="z-40 p-5 text-start sm:p-6">
                  <div className="flex items-center gap-3">
                    {/* gold-soft, not gold: bright gold is a 7.5:1 token on
                       flat dusk but collapses to ~3.6:1 over a clamped
                       photograph. */}
                    <span
                      aria-hidden
                      className="font-mono text-[0.625rem] uppercase tracking-[0.18em] tabular-nums text-gold-soft"
                    >
                      {n} <span className="text-paper/45">/</span> {total}
                    </span>
                    {/* The affordance is the site's own hairline, extending on
                       approach — not an arrow. Ten arrows on a ten-card grid
                       is ten pieces of noise, and the whole plate is already
                       the target. Width rather than scale-x: a width
                       transition flows from the inline start in both
                       directions for free, with no logical origin needed. */}
                    <span
                      aria-hidden
                      className="h-px w-8 bg-gold-soft/55 transition-[width] duration-[320ms] ease-out group-hover/card:w-14 group-focus-within/card:w-14"
                    />
                  </div>

                  <h3 className="mt-3 font-serif text-[clamp(1.2rem,1.5vw+0.8rem,1.6rem)] leading-[1.16] text-balance text-paper">
                    {/* The link wraps ONLY the title, and ::after expands the
                       hit area to the whole plate. Wrapping the card instead
                       would give every link an accessible name that is the
                       concatenation of everything inside it — "Nikah:
                       ekteskapsseremoni, den religiøse seremonien..., Les
                       mer, link", ten times down the page. */}
                    <Link
                      href={`/${locale}/tjenester/${key}`}
                      className="touch-manipulation after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-gold [-webkit-tap-highlight-color:transparent]"
                    >
                      {t.rich(`items.${key}.title`, {
                        em: (chunks) => <Accent surface="photo">{chunks}</Accent>,
                      })}
                    </Link>
                  </h3>

                  <p className="mt-2 line-clamp-2 max-w-[34ch] text-[0.875rem] leading-[1.5] text-paper/85 sm:line-clamp-3">
                    {t(`items.${key}.body`)}
                  </p>
                </div>

                {/* The rim, on its own element so it never collides with the
                   link's focus ring.
                   /15, not /12: Tailwind's opacity scale runs in steps of
                   five, so `ring-paper/12` generates NO rule at all and the
                   ring silently falls back to the default blue-500. It fails
                   quietly — the card still had a ring, just the wrong colour. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-40 rounded-2xl ring-1 ring-inset ring-paper/15 transition-[box-shadow] duration-300 ease-out group-hover/card:ring-gold/45 group-focus-within/card:ring-gold/45"
                />

                {/* The repo's curtain, over everything, so the plate is
                   uncovered rather than popped. Hidden under reduced motion —
                   every .rv-mask rule lives in a no-preference media query,
                   so without that it is an opaque panel. */}
                <span
                  aria-hidden
                  className="rv-mask pointer-events-none absolute inset-0 z-50 bg-paper"
                />
              </Reveal>
            );
          })}
        </ol>
      </SectionBody>
    </section>
  );
}
