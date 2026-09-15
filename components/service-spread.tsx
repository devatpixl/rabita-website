// ── UNUSED SINCE 2026-09-16 ───────────────────────────────────────────────
// Nothing imports this. The client kept the three-section subject page ("we
// keep like this i like it") and dropped the "fit on one screen" point that
// this component was built to answer, so app/[locale]/tjenester/[subject]
// renders the three-section layout for all seventeen services.
//
// It is left in the tree rather than deleted, the same way ServiceVisit is
// left in components/service-page.tsx: it is finished and verified — one
// screen on a laptop, correct in Arabic, keyboard-driven gallery — and it
// comes back with one branch if the one-screen idea returns.

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

// The one-screen service page (client, 2026-09-15, points 3-6 of the Tjenester
// list: remove the bullet lists, add a gallery to the right of the text,
// reduce to a contact form plus a Bli medlem CTA, and "forenkle hele siden til
// å passe på én skjerm: kort tekst, galleri og henvendelsesboks").
//
// ── WHY A SPREAD AND NOT A SHORTER PAGE ───────────────────────────────────
// The obvious reading of "fit on one screen" is to delete until it fits, and
// that is how the last two attempts at this page failed — "looks fake", then
// "very basic". A page does not become modern by having less on it; it
// becomes modern by being ONE composition instead of three stacked bands.
//
// So this is a spread: a quiet column of type on paper, and a wall of
// photograph running off the right edge of the screen. The gallery is not
// placed beside the text, it is the other half of the page. That bleed is the
// whole difference between this and a two-column template.
//
// ── THE TEXT WAS ALREADY WRITTEN ──────────────────────────────────────────
// `text` is servicesIndex.items.<key>.longBody — 143 to 349 characters per
// service, translated into all three locales, and rendering NOWHERE before
// today. It is exactly the "kort tekst" he asked for, already paid for. The
// 01-04 offer list it replaces stays in the message files untouched.
//
// ── HEIGHT ────────────────────────────────────────────────────────────────
// 100svh minus the header, capped, which is the machinery components/hero.tsx
// already uses — svh rather than vh so mobile browser chrome does not push
// the foot off screen, and a cap so the spread does not stretch absurdly on a
// tall monitor. The left column scrolls inside itself if the viewport is very
// short, rather than the page growing a second screen.

export type SpreadImage = { src: string; alt: string };

// 130 and 60, the same tuned values components/hero.tsx uses — NOT the 77px a
// getBoundingClientRect on <header> returns. Above the header sits the prayer
// strip, so content actually starts at ~122px; measuring the header alone put
// the foot of this spread 45px below the fold and took the Bli medlem CTA with
// it, which is precisely the thing the brief says must be on screen.
const HEADER = 124;
const HEADER_SM = 60;

export function ServiceSpread({
  eyebrow,
  title,
  caption,
  orientation = 'portrait',
  text,
  images,
  form,
  membership,
}: {
  eyebrow: string;
  title: React.ReactNode;
  /**
   * Mono line under the plate — servicesIndex.detail.photos, "Fotografier fra
   * Rabita".
   *
   * It said the service name first, which was the H1 repeated four inches to
   * the left: a caption that tells you nothing is just a rule with text on
   * it. Naming the source does the actual work, because it moves these frames
   * from the advertising register to the reportage one — a snapshot credited
   * as a record is allowed to be grainy, an uncredited one just looks like
   * bad art direction.
   *
   * It does NOT name a place or a date. longBody lists Hersleb skole,
   * Ekeberghallen and Rådhusplassen, but which frame was shot where is not
   * something we know, and a caption is the wrong place to guess. Real
   * per-image captions are the single biggest upgrade left here and they have
   * to come from Rabita.
   */
  caption: string;
  /** Which way this service's photographs actually face. Measured from the
   *  files, not assumed: the set is 13 portrait to 23 landscape, so no single
   *  frame fits them all. */
  orientation?: 'portrait' | 'landscape';
  /**
   * servicesIndex.items.<key>.longBody — the ONLY paragraph on the page.
   *
   * This used to be `lede` (.body) followed by `text` (.longBody), and on
   * id-for-alle that printed the same sentence twice, stacked: ".body" is a
   * 63-character compression of longBody's opening line. .body earns its keep
   * on the /tjenester grid, where it is all there is room for; here, next to
   * the full paragraph, it is an echo. One paragraph is also what "kort tekst"
   * asks for.
   */
  text: string;
  images: SpreadImage[];
  /** The enquiry form, rendered on the server and passed in. */
  form: React.ReactNode;
  membership: { line: string; cta: string; href: string };
}) {
  const t = useTranslations('servicesIndex');
  const [i, setI] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const n = images.length;
  // A single photograph is a PLATE, not a gallery of one: no counter, no
  // filmstrip, no controls that imply somewhere to go. Most services are in
  // this case and will be until real photographs arrive — see SERVICE_GALLERY.
  const isGallery = n > 1;

  const go = useCallback((d: number) => setI((p) => (p + d + n) % n), [n]);

  useEffect(() => {
    if (!isGallery) return;
    const el = railRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      // Up/Down, not Left/Right: the horizontal axis mirrors in Arabic, and
      // service-offer.tsx made the same call for the same reason.
      if (e.key === 'ArrowDown') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); go(-1); }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [go, isGallery]);

  return (
    <section
      className="relative isolate bg-paper lg:grid lg:grid-cols-12"
      style={{
        // Capped at 940 so a 27" monitor gets a spread, not a canyon.
        ['--spread' as string]: `min(calc(100svh - ${HEADER}px), 940px)`,
        ['--spread-sm' as string]: `calc(100svh - ${HEADER_SM}px)`,
      }}
    >
      {/* ── the photograph, AS A PLATE ON A MAT ──────────────────────────
         FIRST in the DOM and visually second at lg. On a phone the picture
         is the thing that should arrive first — it says what the service is
         before a word is read — and at lg `order` puts it back on the right.

         ── WHY THIS IS NOT FULL-BLEED ANY MORE ─────────────────────────────
         It was, and it looked cheap (client, 2026-09-15: "full fit doesnt
         looks good", "very cheap its looking"). Three findings, all measured:

         1. NOTHING ELSE ON THIS SITE FULL-BLEEDS A PHOTOGRAPH. Every other
            photo is a framed plate — rounded-3xl + overflow-hidden on a
            paper-2 ground, no shadow, no border: story-page, visit-page,
            service-page, sadaqa-band, service-index, impact-story. The
            full-bleed treatment existed on this page and nowhere else, which
            is why it read as foreign.
         2. THE SOURCES ARE PORTRAIT AND THE FRAME WAS LANDSCAPE. All four
            id-for-alle frames are 1125x1500 (3:4). Cover-fitting 3:4 into a
            1114x778 landscape box threw away 48% of every photograph and
            magnified the middle slice — which is why a bake sale rendered as
            a wall of brownies.
         3. SCALE AMPLIFIES DEFECTS. These are phone snapshots, not
            commissioned work. At 1114px they run near 1:1, so sensor noise
            and soft focus are at full legibility. Framing at ~420px discards
            roughly a third of the linear defect for free.

         Full-bleed is a claim the photography cannot cash: edge-to-edge says
         "this image is worth your whole screen". A mat makes a smaller claim
         that these photographs CAN honour, and the caption moves them from
         the advertising register into the reportage one, where a grainy
         frame reads as a record rather than as failed art direction.

         The tonal step is the whole mechanism: paper #FAF8F4 on the left,
         paper-2 #F2EEE7 here. Without a real step the plate does not read as
         mounted, and this is just padding. */}
      {/* The plate is START-aligned at lg, not centred. Centred, it stranded
         itself in the middle of its half — the type block ended at x=490 and
         the plate began at x=1224, with 600px of dead paper between them, so
         the two halves read as two unrelated panels instead of one spread.
         Pulled to the gutter, the leftover air collects on the OUTER edge
         where it reads as a page margin, which is what it is. */}
      <div className="relative flex flex-col items-center justify-center bg-paper-2 px-6 py-10 lg:order-2 lg:col-span-6 lg:h-[var(--spread)] lg:items-start lg:px-12 xl:px-16">
        <figure
          ref={railRef}
          tabIndex={isGallery ? 0 : undefined}
          aria-roledescription={isGallery ? t('detail.what') : undefined}
          className="w-full max-w-[20rem] focus-visible:outline-none sm:max-w-[23rem] lg:max-w-[27rem]"
        >
          <div className="relative">
            {/* The ghost card — an outlined duplicate offset behind the
               plate. This site's own way of giving a flat photograph depth
               WITHOUT a drop shadow (service-index.tsx, whose comment says
               exactly that). Only 2 of the 32 shadows in this codebase touch
               a photograph, so a shadow here would be the foreign thing. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 translate-x-2 translate-y-2 rounded-3xl border border-gold-deep/25 md:translate-x-3 md:translate-y-3"
            />
            <div
              className={cn(
                'relative w-full overflow-hidden rounded-3xl bg-paper-deep',
                // The 1px keyline. One pixel that says "framed" without
                // weight — the alternative was a shadow, which this site
                // does not put on photographs.
                'ring-1 ring-inset ring-ink/10',
                // 4:5 is this site's portrait plate ratio (project-gallery,
                // impact-story, apartment-units, prayer-visit). The sources
                // are 3:4, so this trims 6% off the sides rather than the
                // 48% the landscape box was taking.
                orientation === 'landscape' ? 'aspect-[4/3]' : 'aspect-[4/5]',
              )}
            >
              {images.map((im, k) => (
                <Image
                  key={im.src}
                  src={im.src}
                  alt={k === i ? im.alt : ''}
                  aria-hidden={k !== i}
                  fill
                  priority={k === 0}
                  sizes="(min-width: 1024px) 27rem, (min-width: 640px) 23rem, 20rem"
                  className={cn(
                    'object-cover transition-opacity duration-500 ease-out motion-reduce:transition-none',
                    k === i ? 'opacity-100' : 'opacity-0',
                  )}
                  // The site's grade plus a touch of grayscale. The grayscale
                  // is the unifier: four phone photographs shot on different
                  // days under different light have clashing auto white
                  // balance, and a little desaturation pulls them into one
                  // set. Kept low on purpose — full monochrome would strip
                  // the warmth out of a children's fair, which is the only
                  // real asset this material has. No brightness cut: the
                  // client asked for that to come off the gift photos on
                  // 2026-09-15 for reading too dark.
                  style={{ filter: 'grayscale(0.15) saturate(0.9) contrast(1.06)' }}
                />
              ))}
            </div>
          </div>

          {/* The caption, in the StoryPlate register — hairline, then mono
             uppercase at ink-60. story-page.tsx calls this "captioned like a
             plate in a printed record", which is exactly the job here.

             It names the service and counts the set. It does NOT name a
             place or a date, because we do not know which frame was shot
             where: longBody lists Hersleb skole, Ekeberghallen and
             Rådhusplassen, but mapping a photograph to one of them would be
             a guess. Real per-image captions are the single biggest
             remaining upgrade and they have to come from Rabita. */}
          <figcaption className="mt-4 border-t border-rule pt-3 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-60">
            {caption}
          </figcaption>

          {/* THE NUMBERED INDEX, NOT A FILMSTRIP.
             Thumbnails preview MANY items; with four they are pure chrome,
             and a filmstrip lying on top of the photograph is the tell of an
             e-commerce product page — which is the register we are trying to
             get out of. A numbered index is what the reference shelf
             (Norm Architects, Kinfolk) actually ships, and it matches this
             site's own habit of counting in mono. The rule above each
             numeral goes full strength on the active one. */}
          {isGallery && (
            <ul className="mt-5 flex gap-4" aria-label={`1 / ${n}`}>
              {images.map((im, k) => (
                <li key={im.src}>
                  <button
                    type="button"
                    onClick={() => setI(k)}
                    aria-label={`${k + 1} / ${n}`}
                    aria-current={k === i}
                    className="group block min-h-11 w-10 pt-1 text-start focus-visible:outline-none"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'block h-px w-full transition-colors duration-300 motion-reduce:transition-none',
                        k === i ? 'bg-gold-deep' : 'bg-rule group-hover:bg-gold-deep/50',
                      )}
                    />
                    <span
                      className={cn(
                        'mt-2 block font-mono text-[0.6875rem] tabular-nums tracking-[0.12em] transition-colors duration-300 motion-reduce:transition-none',
                        k === i ? 'text-ink' : 'text-ink-40 group-hover:text-ink-60',
                      )}
                    >
                      {String(k + 1).padStart(2, '0')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </figure>
      </div>

      {/* ── the type ───────────────────────────────────────────────────────
         min-h-0 plus overflow-y-auto: on a short laptop the column scrolls
         INSIDE the screen rather than making the page two screens tall. The
         same trick hero.tsx uses for its card, and no-scrollbar keeps it from
         showing a bar. */}
      <div className="lg:order-1 lg:col-span-6 lg:flex lg:h-[var(--spread)] lg:min-h-0 lg:flex-col">
        {/* Only THIS part scrolls. The membership line below is pinned to the
           foot of the column, because "kun kontaktskjema + CTA «Bli medlem»"
           is an instruction about what is ON the screen — a CTA that needs
           scrolling to reach has not been kept. */}
        {/* max-w on the INNER content, not the column: the column has to keep
           filling its half so the paper/paper-2 split runs the full height,
           but the type and the form want a measure. Without this the form
           card stretched to 688px against a 416px plate and the two halves
           stopped balancing. */}
        <div className="no-scrollbar px-6 pt-10 sm:px-8 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:px-10 lg:pt-9 xl:px-14">
          <div className="lg:max-w-[36rem]">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold-deep">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-[18ch] font-serif text-[clamp(1.9rem,2.7vw,2.5rem)] leading-[1.06] text-balance text-ink">
            {title}
          </h1>
          <p className="mt-4 max-w-[52ch] text-[1.0625rem] leading-relaxed text-ink-80">{text}</p>

          <span aria-hidden className="mt-5 block h-px w-12 bg-gold-deep/40" />

          {/* The enquiry box. Server-rendered and passed in, because
             RequestForm is where the posting lives and this file is a client
             component. */}
          <div className="mt-4 pb-8 lg:pb-3">{form}</div>
          </div>
        </div>

        {/* ── the membership line ────────────────────────────────────────
           Client: "kun kontaktskjema + CTA «Bli medlem», med begrunnelse for
           fordelene ved medlemskap". The begrunnelse was already written —
           membership.body — and it argues the right thing: not perks, but who
           decides what the seven floors are used for.

           OUTSIDE the scroller, so it is always on screen. */}
        <div className="shrink-0 border-t border-rule bg-paper px-6 py-3 sm:px-8 lg:px-10 xl:px-14">
          {/* Stacked on a phone, side by side once there is width. Measured at
             390: the row kept the CTA inline and left the sentence 130px
             wide, wrapping "Årsmøtet velger styret" over six lines. */}
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 lg:max-w-[36rem]">
            <p className="text-[13.5px] leading-relaxed text-ink-60 sm:max-w-[34ch] sm:flex-1">
              {membership.line}
            </p>
            <Link
              href={membership.href}
              className="group inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-ink px-5 text-[14px] font-semibold text-ink transition-colors hover:border-gold-deep hover:bg-gold-deep hover:text-paper"
            >
              {membership.cta}
              <span
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
              >
                &rarr;
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
