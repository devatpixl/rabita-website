import type { ReactNode } from 'react';
import Image from 'next/image';
import { SectionBody } from './primitives';
import { ArchMark, ElevationMark, OrbitMark, RosetteMark } from './marks';
import { cn } from '@/lib/cn';

// The band the prayer page opens on, made reusable and given a phone design.
//
// The prayer page itself is NOT ported onto this. It is the reference the
// client approved and it stays exactly as it is; this is the same idea built
// so that eleven service pages, the services index and the visit page can be
// members of the same family without being the same picture.
//
// TWO LAYOUTS, and which one a page gets is decided by its photograph rather
// than by taste. SectionBody is max-w-6xl px-6, so a full-measure band is
// 1104 CSS px wide, and prayer-band.webp feeds it at 2000px — 1.81 source
// pixels per CSS pixel. Measured against that bar:
//
//   visit-entrance.webp   2000x1100   1.81x   fine
//   the gateiftar hero    2560x1440   2.3x    fine
//   subj-shahada etc.     1600x1000   1.45x   marginal
//   subj-nikah/-janaza    1086x724    0.98x   UPSCALING
//
//   'over'  — the picture fills the plate and the words sit on it. For the
//             pages whose sources can carry it.
//   'split' — a flat dusk field with the words, and the picture as a panel
//             beside it. The subject photos are 1086-1600px; in a ~460px
//             panel that is 2.4x-3.5x, sharp. It also stops a 240px
//             letterbox slicing through people's heads, and puts the gold
//             accent on flat dusk instead of on unpredictable photo
//             luminance.
//
// If the client ever supplies 2000px originals of nikah and janaza, moving a
// page to 'over' is a one-word change.

export type BandTone = 'calm' | 'solemn' | 'warm';
export type BandMark = 'none' | 'elevation' | 'arch' | 'rosette' | 'orbit';

// Tone changes the GRADE, the veil and the hairline — and nothing else.
// The gold kicker and the gold accent are the family signature: a page with
// a grey eyebrow stops reading as a sibling of the prayer band, so
// solemnity is carried by the photograph, which is where it belongs.
const TONE: Record<BandTone, { grade: string; veil: string; rule: string }> = {
  // The site's own GRADE, the same string eleven other files carry.
  calm: {
    grade: 'saturate(0.72) contrast(1.12) brightness(0.9)',
    veil: 'bg-dusk/40',
    rule: 'bg-gold/40',
  },
  // Colour pulled most of the way out and the veil taken up. Janaza should
  // not look like a photograph of an event.
  solemn: {
    grade: 'saturate(0.42) contrast(1.06) brightness(0.76)',
    veil: 'bg-dusk/60',
    rule: 'bg-paper/25',
  },
  // The other direction, barely: nikah and shahada keep their warmth rather
  // than being pushed to the site's default cool grade.
  warm: {
    grade: 'saturate(0.88) contrast(1.1) brightness(0.94)',
    veil: 'bg-dusk/35',
    rule: 'bg-gold/60',
  },
};

const MARKS = {
  none: null,
  elevation: ElevationMark,
  arch: ArchMark,
  rosette: RosetteMark,
  orbit: OrbitMark,
} as const;

export type PageBandProps = {
  /** Gold mono line — the section crumb. */
  kicker: string;
  /** The per-page half of the kicker, after a hairline. */
  kickerNote?: string;
  /** Pass through t.rich with <Accent surface="dusk">. */
  title: ReactNode;
  lede: string;
  image: string;
  /** '' when the band is decorative and the h1 carries the meaning. */
  alt?: string;
  /** Tailwind object-position, responsive allowed: 'object-[50%_30%] md:object-center'. */
  objectClass?: string;
  layout?: 'over' | 'split';
  tone?: BandTone;
  mark?: BandMark;
  sizes?: string;
  priority?: boolean;
  /** For a page that has earned a bigger headline than the rest. */
  titleClass?: string;
  /** Overrides the plate's min-height. The services index uses it to stand
   *  taller than the eleven pages it is the parent of. */
  heightClass?: string;
  /** A note or fact rail, in the same measure under the plate. */
  children?: ReactNode;
  /** 'none' when the section beneath the band supplies its own top padding
   *  and a rhythm gap here would read as the page ending. A prop, not a
   *  className: lib/cn.ts is clsx only, so a passed pb-0 would ship
   *  ALONGSIDE pb-10 md:pb-section-md and lose the cascade. */
  padBottom?: 'default' | 'none';
  className?: string;
};

// The type, shared so the services index can render the identical stack at a
// larger size rather than approximating it.
export function BandWords({
  kicker,
  kickerNote,
  title,
  lede,
  rule = 'bg-gold/40',
  titleClass,
  className,
}: {
  kicker: string;
  kickerNote?: string;
  title: ReactNode;
  lede: string;
  rule?: string;
  titleClass?: string;
  className?: string;
}) {
  return (
    <div className={cn('relative z-10', className)}>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold">
        <span>{kicker}</span>
        {kickerNote && (
          <>
            <span aria-hidden className={cn('h-px w-6 shrink-0', rule)} />
            <span className="text-paper/60">{kickerNote}</span>
          </>
        )}
      </p>
      {/* leading-[1.08], NOT the prayer band's leading-none: prayer's title
         is one line and never wraps, but "Barne- og ungdomsaktiviteter"
         does, and at opsz 144 a zero-leading second line collides with the
         first — the same trap Stat documents in primitives.tsx. */}
      <h1
        className={cn(
          'mt-3 max-w-[22ch] font-serif leading-[1.08] text-balance text-paper md:mt-2',
          titleClass ?? 'text-[clamp(1.65rem,3vw,2.3rem)]',
        )}
      >
        {title}
      </h1>
      <p className="mt-3 max-w-[46ch] text-[14px] leading-snug text-paper/75 md:mt-2 md:text-[13px]">
        {lede}
      </p>
    </div>
  );
}

export function PageBand({
  kicker,
  kickerNote,
  title,
  lede,
  image,
  alt = '',
  objectClass = 'object-center',
  layout = 'over',
  tone = 'calm',
  mark = 'none',
  sizes,
  priority = true,
  titleClass,
  heightClass,
  children,
  padBottom = 'default',
  className,
}: PageBandProps) {
  const t = TONE[tone];
  const Mark = MARKS[mark];

  return (
    // pt-5 is the prayer band's mt-5: the plate starts just under the header
    // rather than a full section rhythm down.
    <section
      className={cn(
        'bg-paper pt-5',
        padBottom === 'none' ? 'pb-0' : 'pb-10 md:pb-section-md',
        className,
      )}
    >
      <SectionBody>
        <div className="relative isolate overflow-hidden rounded-3xl bg-dusk text-paper">
          {layout === 'over' ? (
            <>
              <Image
                src={image}
                alt={alt}
                fill
                priority={priority}
                sizes={sizes ?? '(min-width: 1152px) 1104px, calc(100vw - 3rem)'}
                className={cn('object-cover', objectClass)}
                style={{ filter: t.grade }}
              />
              {/* An even veil first, so that no crop of any photograph can
                 wash out the type, then a directional pass over it. */}
              <div aria-hidden className={cn('absolute inset-0', t.veil)} />
              {/* Phones read the words at the foot, so the dark end is the
                 foot. */}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-dusk via-dusk/70 to-dusk/10 md:hidden"
              />
              {/* From md the words move to the reading side and the dark end
                 goes with them. The md gate is a plain wrapper rather than a
                 stacked md:rtl: — two background-image utilities on one
                 element is a specificity coin-toss. */}
              <div aria-hidden className="absolute inset-0 hidden md:block">
                <div className="absolute inset-0 bg-gradient-to-r from-dusk via-dusk/70 to-dusk/5 rtl:bg-gradient-to-l" />
              </div>

              <div
                className={cn(
                  'relative flex flex-col justify-end p-7 sm:p-8 md:max-w-[38rem] md:justify-center md:py-9 md:ps-10 md:pe-8 lg:ps-12',
                  heightClass ?? 'min-h-[19rem] md:min-h-[15rem]',
                )}
              >
                {Mark && (
                  <Mark
                    aria-hidden
                    className="pointer-events-none absolute -bottom-14 -end-10 -z-10 hidden h-[17rem] w-[23rem] text-paper/[0.06] md:block"
                  />
                )}
                <BandWords
                  kicker={kicker}
                  kickerNote={kickerNote}
                  title={title}
                  lede={lede}
                  rule={t.rule}
                  titleClass={titleClass}
                />
              </div>
            </>
          ) : (
            // ── split ────────────────────────────────────────────────────
            // Phones put the picture on top and the words beneath it on the
            // dusk field, both inside the one plate. Deliberately not text
            // over photo at 390px: at that width the scrim has to be so
            // heavy to hold 14px type that the photograph stops being a
            // photograph. From md a grid flips it to words | picture, and
            // because order-* runs on the inline axis, RTL reverses it for
            // free.
            <div className="grid md:grid-cols-12">
              <div className="relative order-1 aspect-[16/9] md:order-2 md:col-span-5 md:aspect-auto">
                <Image
                  src={image}
                  alt={alt}
                  fill
                  priority={priority}
                  sizes={sizes ?? '(min-width: 1152px) 460px, (min-width: 768px) 40vw, calc(100vw - 3rem)'}
                  className={cn('object-cover', objectClass)}
                  style={{ filter: t.grade }}
                />
                <div aria-hidden className={cn('absolute inset-0 md:hidden', t.veil)} />
                {/* The seam: the picture dissolves into the dusk on the side
                   it meets the words, so the plate reads as one object and
                   not as a photograph pasted beside a box. */}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-dusk via-dusk/20 to-transparent md:hidden"
                />
                <div aria-hidden className="absolute inset-0 hidden md:block">
                  <div className="absolute inset-0 bg-gradient-to-r from-dusk via-dusk/15 to-transparent rtl:bg-gradient-to-l" />
                </div>
              </div>

              <div className="relative order-2 px-7 pb-8 pt-7 sm:px-8 md:order-1 md:col-span-7 md:flex md:min-h-[17rem] md:flex-col md:justify-center md:py-10 md:ps-10 md:pe-8 lg:ps-12">
                {Mark && (
                  <Mark
                    aria-hidden
                    className="pointer-events-none absolute -bottom-16 -end-4 -z-10 hidden h-[18rem] w-[24rem] text-paper/[0.06] md:block"
                  />
                )}
                <BandWords
                  kicker={kicker}
                  kickerNote={kickerNote}
                  title={title}
                  lede={lede}
                  rule={t.rule}
                  titleClass={titleClass}
                />
              </div>
            </div>
          )}
        </div>

        {children && <div className="mt-6 md:mt-8">{children}</div>}
      </SectionBody>
    </section>
  );
}
