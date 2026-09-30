'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { StaggerWords } from './motion-rise';
import { ArchMark, ElevationMark, OrbitMark, RosetteMark } from './marks';
import { cn } from '@/lib/cn';

// The mark arrives as a NAME, not a component. A server component cannot
// hand a function to a client one -- React refuses to serialise it -- so
// PageBand passes the string and the lookup happens on this side.
const MARKS = {
  none: null,
  elevation: ElevationMark,
  arch: ArchMark,
  rosette: RosetteMark,
  orbit: OrbitMark,
} as const;

export type FeatureMark = keyof typeof MARKS;

// ─────────────────────────────────────────────────────────────────────────────
// The FEATURE band — /om-oss only, for now.
//
// PageBand's `over` layout is a 15rem plate inside the page gutter. It is
// right for eleven service pages, where the band announces a subject and the
// page beneath it does the work. It is wrong for the About page, whose whole
// argument is thirty-eight years of standing somewhere: that wants presence,
// and a 340px letterbox does not have any.
//
// So this is a THIRD layout rather than a change to the other two. Seventeen
// live pages keep the band they have; /om-oss opts in with one word, and if
// this is right it can be rolled out a page at a time instead of all at once.
//
// ── WHY THIS IS A SEPARATE FILE ──────────────────────────────────────────
// page-band.tsx is a server component and the other layouts need no client
// JavaScript at all. Scroll-linked drift and a staggered headline do. Putting
// them here keeps the hydration cost on the one page that asked for it.
//
// ── WHAT MOVES, AND WHAT SPEC §1 ALLOWS ──────────────────────────────────
// "Motion stays out of the way... Nothing autoplays." Three things move and
// none of them is a loop:
//
//   1. the photograph drifts as you scroll. Scroll-linked, so it is the
//      reader moving it, not the page playing at them;
//   2. the headline composes itself once, through StaggerWords — the same
//      component the homepage hero uses, so About reads as its sibling;
//   3. the gold rule draws to width, once.
//
// Below md there is NO drift. That is the rule zoom-parallax.tsx sets and the
// reason is the same: a phone should not be asked to composite a moving
// layer behind type. Under prefers-reduced-motion none of the three happens
// and the finished hero is simply there.
//
// No Lenis. page-band's sibling says report stiffness rather than add it.
// ─────────────────────────────────────────────────────────────────────────────

export type BandFeatureProps = {
  kicker: string;
  kickerNote?: string;
  title: string;
  /** Set in gold serif italic inside the headline. Matched ignoring punctuation. */
  accentWord?: string;
  lede?: string;
  image: string;
  /** Optional art-directed source below md. See the note at the <Image> pair. */
  imagePhone?: string;
  objectClassPhone?: string;
  alt?: string;
  objectClass?: string;
  /** Site GRADE string, passed down so tone stays PageBand's decision. */
  grade: string;
  veil: string;
  rule: string;
  /** Anchor the foot cue scrolls to. No cue is rendered without one. */
  cueHref?: string;
  cueLabel?: string;
  mark?: FeatureMark;
};

export function BandFeature({
  kicker,
  kickerNote,
  title,
  accentWord,
  lede,
  image,
  imagePhone,
  objectClassPhone,
  alt = '',
  objectClass = 'object-center',
  grade,
  veil,
  rule,
  cueHref,
  cueLabel,
  mark = 'none',
}: BandFeatureProps) {
  const Mark = MARKS[mark];
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const set = () => setWide(mq.matches);
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);

  const drift = !reduced && wide;

  // start: band's top meets the viewport's top. end: band's foot leaves it.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  // Spring so a trackpad's jitter does not reach the photograph. Stiff
  // enough not to trail the scroll — the sibling file's warning.
  const eased = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.35 });
  // 12% of the overscan. The wrapper below is 112% tall, so the picture can
  // travel this far without ever showing an edge.
  const y = useTransform(eased, [0, 1], ['0%', '12%']);

  return (
    <section
      // Full-bleed, and NOT via w-screen: vw units include the scrollbar, so
      // a 100vw child overflows the page by its width and hands every page a
      // horizontal scrollbar. A plain block element is already the width of
      // its container, and this one's container is <main>.
      className="relative isolate overflow-hidden bg-dusk text-paper"
    >
      {/* min-h in svh, not vh: on iOS the URL bar collapsing changes vh
         mid-scroll and the band would resize under the reader's thumb. svh
         is the small viewport — stable. The height is declared here rather
         than grown by content, so the picture has a box to land in and CLS
         stays at nil. */}
      {/* The ref goes HERE rather than on the <section>, so the nearest
          positioned ancestor is the section itself.

          motion still logs "ensure that the container has a non-static
          position" in dev. That is about the SCROLL CONTAINER, not this
          element: the chain is div(relative) -> section(relative) ->
          body(static), and body is static on essentially every site. The
          only way to silence it is `body { position: relative }`, which
          would change the containing block for every absolutely-positioned
          element on all eighteen pages to buy a dev-only message -- motion
          strips its warnings from production builds. Not worth it.

          The measurement is correct regardless; the drift was verified at
          0 -> 24px -> 71px across a 650px scroll. */}
      <div ref={ref} className="relative min-h-[70svh] md:min-h-[78svh]">
        <motion.div
          aria-hidden
          // 112% tall, pinned to the top, so the 12% travel never exposes
          // the bottom edge of the photograph.
          className="absolute inset-x-0 top-0 h-[112%] will-change-transform"
          style={drift ? { y } : undefined}
        >
          {/* ── ART DIRECTION, NOT A CROP (2026-09-30) ──────────────────
             A band this tall is about 2:1 on a laptop and about 0.6 on a
             phone, and no single file is good at both: object-cover holds
             one axis and throws the other away, so a wide photograph loses
             two thirds of its width on a phone and a tall one loses its top
             and bottom on a laptop.
             
             Where a page has a second frame of the same occasion, it can
             pass `imagePhone` and each screen gets a picture composed for
             its own shape. This is a paired branch rather than a CSS crop
             because the difference is which photograph, not which part of
             one. Pages that pass nothing behave exactly as before. */}
          {imagePhone && (
            <Image
              src={imagePhone}
              alt={alt}
              fill
              priority
              sizes="100vw"
              className={cn('object-cover md:hidden', objectClassPhone ?? objectClass)}
              style={{ filter: grade }}
            />
          )}
          <Image
            src={image}
            alt={imagePhone ? '' : alt}
            aria-hidden={imagePhone ? true : undefined}
            fill
            priority
            sizes="100vw"
            className={cn('object-cover', objectClass, imagePhone && 'hidden md:block')}
            style={{ filter: grade }}
          />
        </motion.div>

        {/* An even veil first, so no crop of any photograph can wash out the
           type, then a foot-weighted pass for the words. Both are the
           `over` layout's treatment; only the direction changes, because
           here the words are always at the foot rather than moving to the
           reading side from md. */}
        <div aria-hidden className={cn('absolute inset-0', veil)} />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-dusk via-dusk/55 to-dusk/5"
        />

        {Mark && (
          <Mark
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -end-16 hidden h-[26rem] w-[34rem] text-paper/[0.05] md:block"
          />
        )}

        {/* The words sit on SectionBody's measure — mx-auto max-w-6xl px-6 —
           so the headline's left edge lands on the same rail as every
           paragraph below it. A full-bleed band whose type is not on the
           page grid reads as a banner pasted on top. */}
        <div className="relative flex min-h-[70svh] flex-col justify-end md:min-h-[78svh]">
          <div className="mx-auto w-full max-w-6xl px-6 pb-12 md:pb-16">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold">
              <span>{kicker}</span>
              {kickerNote && (
                <>
                  <span
                    aria-hidden
                    className={cn('h-px shrink-0', rule, reduced ? 'w-6' : 'band-rule')}
                  />
                  <span className="text-paper/60">{kickerNote}</span>
                </>
              )}
            </p>

            {/* 13ch, and no text-balance: the measure is doing the breaking on
                purpose. "Rabita siden" fills a line and the year drops alone
                onto the next, in gold — which is the whole claim of the page
                given a line to itself. Balance would re-flow that to whatever
                it thought was evenest. */}
            {/* The font-size lives HERE, on the h1, not on the span inside
                it -- because `ch` resolves against the element's OWN
                font-size. With the clamp on the child, max-w-[13ch] was
                measured against the inherited 16px, came out about 104px,
                and broke the headline one word per line. */}
            <h1 className="mt-4 max-w-[13ch] font-serif text-[clamp(2.1rem,6vw,4.25rem)] leading-[1.04] text-paper md:mt-5">
              <StaggerWords text={title} accentWord={accentWord} accentSurface="dusk" />
            </h1>

            {lede && (
              <p
                className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-paper/80 md:mt-5 md:text-[17px]"
                style={
                  reduced
                    ? undefined
                    : {
                        opacity: 0,
                        // Lands after the last word of the headline. The
                        // stagger is 90ms a word, so this waits for a
                        // six-word title and then a beat.
                        animation:
                          'rabita-word-in 700ms 620ms cubic-bezier(0.2, 0.7, 0.2, 1) forwards',
                      }
                }
              >
                {lede}
              </p>
            )}

            {cueHref && (
              <a
                href={cueHref}
                className="group mt-9 inline-flex items-center gap-2.5 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-paper/55 transition-colors hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold md:mt-11"
              >
                <span
                  aria-hidden
                  className="grid h-8 w-8 place-items-center rounded-full border border-paper/25 transition-colors group-hover:border-gold"
                >
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
                    <path
                      d="M8 3v10M4 9.5 8 13.5l4-4"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {cueLabel}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
