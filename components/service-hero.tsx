import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { Eyebrow, SectionBody } from './primitives';
import { Accent } from './accent';
import { cn } from '@/lib/cn';
import { SERVICE_STORY, galleryOrientation, type ServiceKey } from '@/lib/services';

/**
 * The merged service opener — client design, 2026-09-23.
 *
 * WHAT IT REPLACES. The old template opened with two sections, each a
 * heading over a paragraph, stacked:
 *
 *   section 1   h1  items.<s>.title        p  items.<s>.body
 *   section 2   h2  items.<s>.offerTitle   p  items.<s>.offerLede
 *
 * This is those two sections in one, with the photograph moved from inside
 * section 2 out to the right edge.
 *
 * ── NOT ONE WORD OF NEW COPY ──────────────────────────────────────────────
 * Client, 2026-09-23: "make sure the content we are using is the one which
 * was there before, we are just changing a design now." All four strings
 * above still print, in the same order, from the same keys. An earlier pass
 * wrote a new merged headline and a three-card "where are you right now?"
 * picker from the mock; both are gone, and items.<s>.hero.* went with them.
 * If that picker is ever wanted back, it was components/service-intent.tsx.
 *
 * THE CRUMB IS SHORTENED, not rewritten: "Shahada (bli muslim)" prints as
 * "Shahada". Everything before the first bracket, so it holds for the other
 * services whose titles carry a gloss — Nikah (islamsk vielse), and so on.
 * The full title still prints as the h1 directly under it.
 *
 * ⚠ THE CRUMB ITSELF IS A REVERSAL. On 2026-09-18 he asked for the kicker to
 * be "only 1 word like services", and it was cut to one word for exactly
 * that reason. The mock he approved on 09-23 shows "SERVICES · SHAHADA", so
 * the second half is back. Dropping it again is deleting the two spans below.
 *
 * ALL EIGHTEEN SERVICES since 2026-09-23, the five teaching subjects
 * included — they route through the same [subject] page. Shahada was the
 * pilot; the client approved it and asked for the rest.
 */
export async function ServiceHero({ s, crumb }: { s: ServiceKey; crumb: string }) {
  const t = await getTranslations('servicesIndex');
  const locale = await getLocale();
  const rtl = locale === 'ar';

  // SERVICE_STORY is Partial — six of the eighteen have no page photograph.
  // Every branch below is guarded rather than asserted, so a service added to
  // REDESIGNED before its picture arrives degrades to a full-width type
  // column instead of crashing the route.
  const story = SERVICE_STORY[s];
  const rawTitle = t.raw(`items.${s}.title`) as string;
  const plainTitle = rawTitle.replace(/<\/?em>/g, '');
  const shortTitle = plainTitle.split('(')[0]!.trim();

  // ── DOES THE NAME GET ITS OWN LINE? ───────────────────────────────────
  // Only when the title OPENS with the <em>. Seven of the eighteen do —
  // "<em>Shahada</em> (bli muslim)", "<em>Nikah</em> (islamsk vielse)" —
  // and for those the em is the name and the rest is a gloss, so the name
  // standing alone on line 1 in gold is the right shape.
  //
  // Eleven do not: "Hajj og <em>umrah</em>", "Samtaler og <em>megling</em>",
  // "Kurs i <em>norsk</em>". A block em there would print "Hajj og" alone on
  // line 1 and "umrah" in gold on line 2 — a headline broken in the wrong
  // place. Those run INLINE, one continuous line at the same size, and the
  // gold word sits wherever it falls in the sentence, which is what the
  // reference does with its own second line.
  //
  // Decided per LOCALE from the raw string, not per service: veivisere is
  // "Muslimske <em>veivisere</em>" in Norwegian but "<em>المرشدون
  // المسلمون</em>" in Arabic, so the same page splits in one language and
  // not the other. That is correct — the split follows the sentence.
  const emLeads = /^\s*<em>/.test(rawTitle);

  // ── WHERE THE PHOTOGRAPH IS CROPPED TO ────────────────────────────────
  // The box is ~46vw wide and the full section tall — near square on a
  // laptop — and object-cover crops whichever axis overflows. Every entry
  // in SERVICE_STORY carries an objectClass tuned for the old plate; those
  // are kept, with one exception: a PORTRAIT source left on plain
  // object-center. A portrait in a square box loses ~200px of height, and
  // centring takes half of that off the top, which on a photograph of a
  // person is the head. object-top keeps it. Tuned values such as
  // hajj-umrah's 55% (the Kaaba sits low in that frame) are not touched.
  const portrait = story ? galleryOrientation([story.src]) === 'portrait' : false;
  const objectClass =
    story && portrait && story.objectClass === 'object-center' ? 'object-top' : story?.objectClass ?? 'object-center';

  // ── THE FADE ──────────────────────────────────────────────────────────
  // TWO MASK LAYERS. It has been wrong twice, in opposite directions, and
  // both mistakes are worth keeping written down.
  //
  //   1st  the inner edge faded and the top went to `transparent 0%`. A mask
  //        that reaches zero is a crop, not a fade — it deleted the top
  //        quarter of the frame, which is where the head is.
  //   2nd  fixing that, an outer-edge layer was added and the inner ramp ran
  //        to 70%. The outer layer began recovering 30% in from the right —
  //        the same line. The picture had ONE column at full strength and
  //        was veiled everywhere else, so it read as washed out.
  //        (Client: "too much fade done".)
  //
  // So: the outer layer is GONE. It was polish for an edge nobody sees — the
  // picture bleeds off the viewport, and a fade there only costs contrast.
  // And the inner ramp now finishes at 52%, which leaves the outer half of
  // the frame — the half carrying the subject — completely untouched.
  //
  // Overlays and masks are the same arithmetic: covering with the ground
  // colour at opacity c leaves 1-c of the image, and multiplying mask alphas
  // does a1*a2, so (1-c1)(1-c2) = a1*a2. Masking is used rather than cream
  // overlays because HallBackdrop washes an arcade photograph behind all
  // three sections, so the ground is NOT flat cream — masking the image is
  // exact whatever sits behind it.
  //
  // Directions are logical: in Arabic the picture sits on the left, so its
  // inner edge is its right and layer 1 flips.
  //
  // -webkit-mask-composite takes 'source-in' where the standard property
  // takes 'intersect'. Both are set; Safari reads the first, everything else
  // the second.
  const innerDir = rtl ? 'to left' : 'to right';
  const fade = [
    // inner edge only — opaque from 52%, so the subject is never veiled
    `linear-gradient(${innerDir}, transparent 0%, rgba(0,0,0,0.22) 14%, rgba(0,0,0,0.78) 34%, #000 52%)`,
    // top softened to 0.68, NOT to zero, and recovered by 16%. The foot may
    // go to zero: that end is melting into the section below.
    'linear-gradient(to bottom, rgba(0,0,0,0.68) 0%, #000 16%, #000 74%, transparent 100%)',
  ].join(', ');

  // ── THE TOP PADDING IS ON THE TYPE, NOT ON THE SECTION ────────────────
  // Client, 2026-09-23: "why is this space empty in header and till the
  // image".
  //
  // It was the section's own pt-10/md:pt-14. With the padding out on the
  // section, the picture's box began BELOW it — a band of bare ground between
  // the nav and the top of the photograph, about 56px of nothing running the
  // full width of the picture. His reference has the image starting
  // immediately under the nav.
  //
  // Moving the padding inward is the fix rather than a negative offset on the
  // image: the type keeps exactly the spacing it had, and inset-y-0 now
  // measures the whole section, so the photograph reaches the nav on its own.
  //
  // ── AND THE SECTION OWNS THE FIRST SCREEN ─────────────────────────────
  // Client, 2026-09-23: on a 13" MacBook a white hairline from the enquiry
  // section showed at the foot of the opening view. "We should only be
  // seeing this and the below section should be moved down ... on desktop
  // since there would be more height I want the same rule there as well."
  //
  // So from md the section is at least the viewport minus the header, and
  // the type is centred in whatever that turns out to be. 120px is the
  // header stack MEASURED, not guessed: the utility strip is md:min-h-11
  // plus a 1px gold border (45), the nav md:min-h-[77px] plus its own border
  // (78), 123 together. Subtracting 120 rather than 123 is deliberate — the
  // section ends up three pixels TALL rather than three short, and the error
  // that matters here is the short one, which is what puts a sliver of the
  // next section back on screen.
  //
  // min-h, never h: on a short laptop the content still grows past it rather
  // than being clipped, and the enquiry simply moves down with it.
  //
  // md only. Below that the columns stack and a full-height opening would be
  // a screen of type with the photograph pushed off the bottom.
  // THE TWO-COLUMN OPENER STARTS AT md, NOT lg. Client, 2026-09-23, with
  // the window narrowed to just under 1024: "try to fit in very small
  // also". Below md the section renders the pre-redesign phone layout
  // (see the phone-only branches below); from 768 the photograph goes out
  // to the edge and the type takes the start half. Checked at 768, 900 and
  // 1000 across all 54 pages: the longest title word, "geometriskolen",
  // runs ~290px at the 768 size against a ~375px column, and the display
  // line never wraps mid-word. The header stack is the same 123px from md
  // up, so the first-screen rule holds unchanged.
  return (
    <section className="relative md:flex md:min-h-[calc(100vh-120px)] md:items-center">
      {/* end-0 reaches the viewport edge rather than the container's,
         because this element is outside SectionBody, which applies the
         max-width. The parent HALL_HOST is `overflow-clip`, so nothing
         spills sideways and no horizontal scrollbar appears. */}
        {story && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 end-0 hidden w-[46vw] max-w-[46rem] md:block"
          >
            <div
              className="relative h-full w-full"
              style={{
                WebkitMaskImage: fade,
                maskImage: fade,
                WebkitMaskComposite: 'source-in',
                maskComposite: 'intersect',
              }}
            >
              <Image
                src={story.src}
                alt=""
                fill
                // NOT priority: that emits a <link rel=preload> from the head,
                // which a phone would fetch for an image inside a hidden
                // block. Lazy inside display:none is never requested; at md
                // the box is in the first viewport, so it loads at once.
                sizes="46vw"
                // Position per service — see objectClass above.
                //
                // Barely desaturated — 0.94, down from 0.88, which was
                // adding to the washed-out look rather than calming it.
                style={{ filter: 'saturate(0.94)' }}
                className={cn('object-cover', objectClass)}
              />
            </div>
          </div>
        )}

        {/* w-full because the section is a flex row from md: without it
           this item shrinks to its content and SectionBody loses its
           centring. md:py-12 replaces the top-only padding once the column
           is vertically centred — padding on one side of a centred box just
           shifts it off centre. */}
        {/* THIS IS THE FLEX ITEM. It used to sit inside a bare <div>, and the
           day the section became md:flex that wrapper became the item — a
           flex item with no width shrinks to its content, so the column
           collapsed to its longest paragraph and the h1 broke into three
           lines. w-full has to be on the item itself. */}
        <div className="w-full pt-10 md:pt-16 md:py-12 [@media(min-width:768px)_and_(max-height:860px)]:py-7">
        <SectionBody>
          {/* 52% rather than a grid column: the picture is positioned against
             the viewport, not placed in a cell, so the type only needs to
             stop before it. */}
          <div className={story ? 'md:w-[52%]' : ''}>
            <p className="flex items-center gap-2.5 font-mono text-[0.6875rem] uppercase leading-none tracking-[0.18em] text-gold-deep">
              {crumb}
              {/* The second half is md-only. Below md the kicker is the one
                 word it was before the redesign (client, 2026-09-18). */}
              <span aria-hidden className="hidden h-px w-3 bg-gold-deep/45 md:inline-block" />
              <span className="hidden text-ink-40 md:inline">{shortTitle}</span>
            </p>

            {/* ── THE TITLE, ONE SIZE, THE NAME ON ITS OWN LINE ─────────────
               items.<s>.title, unchanged — "<em>Shahada</em> (bli muslim)".

               Client, 2026-09-23, from a reference that sets the whole
               headline at display size: "make the heading like this, use the
               text we already had." So both halves run at ONE size — 64px at
               1280, 72px at 1440, 76px from 1536 — and the reference's shape
               comes from the <em> being a block: the name stands alone on
               line 1 in the gold italic, and the gloss follows beneath it in
               ink, wrapping as it needs to. On shahada that is three lines,
               which is exactly what the reference is.

               An earlier cut set the gloss SMALLER than the name (1.8em vs
               1em). It read as a title with a subtitle; the reference reads
               as one headline, and that is what he pointed at.

               display-opsz on the h1 for Fraunces' opsz-144 cut, which the
               page's other headings use. The Accent brings SOFT 80 and WONK 1
               — the slightly wonky italic is where the "life" is at this
               size. -ms on the accent is optical: the italic S overhangs, so
               without it the name sits a hair right of the kicker. LTR ONLY —
               the Arabic face has no such overhang, and in RTL the start
               edge is the right one, so the same margin pushed the Arabic
               display line ~2px past the column instead of aligning it.
               Caught by the 2026-09-23 rollout sweep on all nine Arabic
               pages whose title opens with the em.

               The short-height override shaves a little, not a lot: the
               section owns the first screen and is centred in it, so a 13"
               has room for ~65px and needs no more than that taken off.

               ⚠ IF THIS SPREADS: `block` on the em splits wherever the em
               falls. Titles that open with it (Shahada, Nikah, Janaza...)
               behave as here; one like "Hajj og <em>umrah</em>" would put
               "Hajj og" on line 1 and "umrah" on line 2 in gold. Check each
               title before adding its key to REDESIGNED. */}
            {/* break-words is a guard, not a style. The longest single word
               in any title is "geometriskolen" (14 characters, and inside
               the italic), which at the 76px cap runs ~530px against a
               ~574px column. It fits; but it is the only thing between a
               long Norwegian compound and the photograph, and a word that
               cannot fit would otherwise run under the picture. This only
               ever fires for a word wider than the column. */}
            <h1 className="mt-7 max-w-[18ch] break-words font-serif text-[clamp(2.25rem,5.5vw,4.25rem)] leading-[1.02] tracking-[-0.02em] text-balance text-ink md:[font-variation-settings:'opsz'_144] md:mt-5 md:max-w-[14ch] md:text-[clamp(2.6rem,5vw,4.75rem)] md:leading-[1.0] md:text-wrap [@media(min-width:768px)_and_(max-height:900px)]:text-[clamp(2.4rem,4.5vw,4.25rem)]">
              {t.rich(`items.${s}.title`, {
                em: (chunks) => (
                  <Accent surface="paper" className={emLeads ? 'md:block md:ltr:-ms-[0.03em]' : undefined}>
                    {chunks}
                  </Accent>
                ),
              })}
            </h1>

            {/* items.<s>.body — the one-line summary that used to sit under
               the h1 in section 1. */}
            {/* A step up with the title, so the lede is not dwarfed by it. */}
            <p className="mt-8 max-w-[56ch] text-[clamp(1rem,1.15vw,1.125rem)] leading-relaxed text-ink-60 md:mt-6 md:max-w-[42ch] md:text-[clamp(1.0625rem,1.2vw,1.2rem)] md:leading-[1.6]">
              {t(`items.${s}.body`)}
            </p>

            {/* ── WHAT WAS SECTION 2 ──────────────────────────────────────
               Client: "keeping the heading and the below section like
               Interested in Islam and the text to it in one section."

               So offerTitle and offerLede print here rather than in a section
               of their own. A hairline and the eyebrow keep them legible as a
               second movement instead of a fourth paragraph — without that,
               a question set at heading size directly under a lede reads as
               the page stuttering. */}
            <div className="mt-9 md:mt-14 md:mt-10 md:border-t md:border-rule md:pt-8">
              <Eyebrow tone="gold-deep">{t('detail.what')}</Eyebrow>
              <h2 className="font-serif text-section text-ink mt-5 md:mt-4 md:max-w-[20ch] md:text-[clamp(1.45rem,2.2vw,1.95rem)] md:leading-[1.15] md:tracking-[-0.01em] md:text-balance">
                {t(`items.${s}.offerTitle`)}
              </h2>
              <p className="mt-6 max-w-[38ch] text-body text-ink-60 md:mt-4 md:max-w-[46ch] md:leading-relaxed">
                {t(`items.${s}.offerLede`)}
              </p>
              {/* Client, 2026-09-23 (English list): "at end of each paragraph
                 we can have a href link here." One link, after the paragraph
                 that makes the offer, to the enquiry form further down the
                 same page — the one action every service page has. The label
                 is detail.request, the heading that form already carries, so
                 no new string in any locale. */}
              <a
                href="#enquiry"
                className="group mt-5 inline-flex min-h-11 items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-gold-deep transition-colors hover:text-ink"
              >
                {t('detail.request')}
                <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">&rarr;</span>
              </a>
              {/* The foot of the column, as it was: Rabita's own mark and a
                 hairline. Below md only — at md the photograph beside the
                 text closes the column. */}
              <div className="mt-10 flex items-center gap-5 md:hidden">
                <Image src="/logo/rabita-mark-256.png" alt="" width={40} height={40} aria-hidden className="h-10 w-10 shrink-0 opacity-70" />
                <span aria-hidden className="h-px flex-1 bg-gold-deep/30" />
              </div>
            </div>
          </div>

          {/* ── BELOW md: THE PLATE, AS IT WAS ─────────────────────────────
             Client, 2026-09-23: "keep service pages on phone only, like
             before." The offset frame, the rounded plate, the 4:5 / 4:3 by
             orientation, the 24rem cap on portraits and the grade are the
             section-2 plate from before the redesign, moved here unchanged. */}
          {story && (
            <div className={cn('relative mt-10 md:hidden', portrait ? 'max-w-[24rem]' : 'max-w-none')}>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 translate-x-2 translate-y-2 rounded-3xl border border-gold-deep/25 md:translate-x-3 md:translate-y-3"
              />
              <div className={cn('relative w-full overflow-hidden rounded-3xl bg-paper-deep ring-1 ring-inset ring-ink/10', portrait ? 'aspect-[4/5]' : 'aspect-[4/3]')}>
                <Image
                  src={story.src}
                  alt={plainTitle}
                  fill
                  sizes="(min-width: 768px) 58vw, 100vw"
                  className="object-cover"
                  style={{ filter: 'grayscale(0.15) saturate(0.9) contrast(1.06)' }}
                />
              </div>
            </div>
          )}
        </SectionBody>
        </div>
    </section>
  );
}
