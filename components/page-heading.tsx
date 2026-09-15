import type { ReactNode } from 'react';
import { SectionBody } from './primitives';

// A page header with NO photograph.
//
// Client, 2026-09-16, on both the Tjenester and the Undervisning lists:
// "Fjerne bildet øverst på hovedsiden" — remove the image at the top of the
// main page. It is the SECTION's main page he means, not the site's: the
// point appears once under each list, his separate Hjemmeside list never
// asked for it, and the same lists say "hver spesifikk tjeneste" when they
// mean the subject pages. Those keep their bands.
//
// So /tjenester and /undervisning open on type instead of a photograph. This
// is the PageBand's own opener with the picture taken away — the same kicker
// pair split by a hairline, the same serif title, the same lede — because
// the index should still look like the parent of the pages beneath it. What
// changes is the ground: ink on paper rather than paper on a dusk plate, so
// the gold hairline and the gold accent switch to their paper values.
//
// Not StoryHero, which is the other photo-free header on this site: that one
// requires an `index` ("01", "02") because it belongs to a numbered series,
// and neither of these pages is in one. Inventing a number to borrow the
// component would put a false ordinal on the page.

export function PageHeading({
  kicker,
  kickerNote,
  title,
  lede,
}: {
  kicker: string;
  /** The per-page half of the kicker, after a hairline. */
  kickerNote?: string;
  title: ReactNode;
  lede?: string;
}) {
  // pt-12/16 rather than pt-section-sm, and NO BOTTOM PADDING at all
  // (client, 2026-09-16: "less space empty as main goal is to see services").
  // Between this section's padding and the grid's own, the cards on both index
  // pages were starting below the fold on a laptop.
  //
  // NO BOTTOM PADDING. The section under this one opens on its own ground and
  // brings its own top padding, so a pb here adds to that one and the page
  // gets a hole in it — which is exactly what the PageBand this replaces
  // carried padBottom="none" to avoid (client, 2026-09-13: "remove this empty
  // space and blend the first section with this top"). Putting it back
  // reopened the same gap.
  return (
    <section className="bg-paper pt-12 md:pt-16">
      <SectionBody>
        <p className="flex items-center gap-3 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-gold-deep">
          <span>{kicker}</span>
          {kickerNote && (
            <>
              <span aria-hidden className="h-px w-6 shrink-0 bg-gold-deep/40" />
              <span className="text-ink-60">{kickerNote}</span>
            </>
          )}
        </p>

        {/* text-balance and a max measure, as on the band: these titles wrap
            to two lines at most widths and a ragged break reads as an
            accident at this size. */}
        <h1 className="mt-6 max-w-4xl font-serif text-display leading-[1.08] text-balance text-ink">
          {title}
        </h1>

        {lede && <p className="mt-6 max-w-prose text-body text-ink-60">{lede}</p>}
      </SectionBody>
    </section>
  );
}
