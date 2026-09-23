'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Accent } from './accent';

// The newsletter band on /aktuelt.
//
// The client wrote this section in Tekst (endelig) (Sept 2026) — heading,
// body, field and button — and left one thing to us: "Hor denne seksjonen
// skal plasseres bestemmes av utvikler."
//
// ── WHERE ─────────────────────────────────────────────────────────────────
// Last on the page, under the calendar. Client, 2026-09-20: "in aktuelt,
// move this down below the calendar."
//
// It sat between Arrangementer and the calendar until then, for three
// reasons. One survives the move, two do not, and the two are worth knowing:
//
//   1. RHYTHM — LOST. /aktuelt is a dusk hero, then paper-2, then paper-2.
//      In the middle this dark band broke one long pale run. Last, it lands
//      dusk against the dusk footer, so the page now ends on a single tall
//      dark block instead of a beat.
//   2. DISTANCE FROM THE FOOTER — LOST. The footer already carries a
//      newsletter field on every page, so the same ask now appears twice
//      within one screen at the foot of this one. If that reads as
//      duplication, the fix is to suppress the footer's field on /aktuelt
//      rather than move this back.
//   3. IT DOES NOT GATE THE NEWS — KEPT, and more so. A signup under the
//      hero, before the reader has been given anything, is the pattern
//      people resent. Below the calendar it is the last thing on the page.
//
// The "Kalender →" button in the section above still jumps straight to
// #kalender.
//
// ── THE FORM IS NOT WIRED ─────────────────────────────────────────────────
// Same as the footer's: it validates and it says thank you, and nothing is
// sent anywhere. There is no list to post to yet. Deliberate and visible
// here rather than a silent no-op — the success state says the address is
// registered, so the moment a provider exists this needs one fetch and the
// copy is already true.
export function NewsletterBand() {
  const t = useTranslations('newsletterBand');
  const tf = useTranslations('footer.newsletter');
  const [done, setDone] = useState(false);

  // ── SMALLER SINCE 2026-09-22 ──────────────────────────────────────
  // Client, Versjon 6, under Footer: "Fiks nyhetsbrev en del av footer,
  // men gjør selve nyhetsbrev seksjonen mindre."
  //
  // So the newsletter STAYS in the footer — it was never leaving — and
  // this standalone band, which he did not ask for and then asked to
  // keep, stops behaving like a major section. 56/80px of padding down
  // to 40/56, and the display heading down from a 3.25rem cap to
  // 2.25rem, which is the size the page's own section headings run at
  // rather than a hero's.
  //
  // "→ endre teksten" is the other half of that line, and it IS done as of
  // 2026-09-23. He never said what the copy should become — he wrote the old
  // wording himself in Tekst (endelig) and then asked for it changed — so
  // this is our proposal, and he judges it.
  //
  // WHAT CHANGED AND WHY. "Hold deg oppdatert" would sit unaltered on any
  // website in Norway; "Følg byggingen" could only sit on this one, and it
  // names the single thing worth subscribing for — one of Europe's largest
  // new mosques going up in central Oslo, currently in the foundation phase.
  // "rett i innboksen" went because it is dead words, which also shortens
  // the line to suit a band that just dropped from hero size to section size.
  // The <em> accent moved off "oppdatert", a filler word, onto "byggingen".
  //
  // NO FREQUENCY PROMISE, deliberately. "Noen få e-poster i året" is the line
  // that answers the real objection and it converts, but nobody has told us
  // how often Rabita actually sends. A cadence we promise and they break is
  // worse than none. Add it the day he gives a real number.
  return (
    <section className="star-texture relative isolate overflow-hidden bg-dusk py-10 text-paper md:py-14">
      {/* NO SEPARATE WATERMARK. The first draft floated an oversized
         rabita-mark in the corner at 4%; .star-texture already tiles that
         same mark across the whole band as its ground, so it was the same
         ornament twice.

         It was also broken: globals.css has `.star-texture > * { position:
         relative }` to lift real content above the texture layer, and that
         beats Tailwind's `absolute` on specificity — so the image dropped
         into flow as a 384px block and pushed the content to the bottom of
         a 708px section. Worth knowing before putting anything else
         absolutely positioned directly inside a .star-texture element. */}
      <div className="mx-auto grid max-w-6xl items-center gap-7 px-6 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <p className="flex items-center gap-3 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold">
            <span aria-hidden className="h-px w-6 shrink-0 bg-gold/50" />
            {t('eyebrow')}
          </p>
          <h2 className="mt-3 max-w-[20ch] font-serif text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.08] tracking-[-0.015em] text-balance text-paper">
            {t.rich('heading', { em: (chunks) => <Accent surface="dusk">{chunks}</Accent> })}
          </h2>
          <p className="mt-3 max-w-[52ch] text-[15px] leading-snug text-paper/70">{t('body')}</p>
        </div>

        {/* The form sits in its own column from lg and under the words below
           it. Not centred under the heading at any width: a form is a thing
           you do, and it holds its own edge rather than floating. */}
        <div className="lg:col-span-5">
          {done ? (
            // The success state takes the field's place rather than sitting
            // under it, so the band does not jump taller on submit.
            <p
              role="status"
              className="flex min-h-14 items-center gap-3 rounded-full border border-gold/40 bg-gold/10 px-6 text-[15px] text-paper"
            >
              <CheckIcon className="h-4 w-4 shrink-0 text-gold" />
              {t('done')}
            </p>
          ) : (
            <form
              className="flex min-h-14 overflow-hidden rounded-full border border-paper/25 bg-paper/[0.04] transition-colors focus-within:border-gold"
              onSubmit={(e) => {
                e.preventDefault();
                setDone(true);
              }}
            >
              <input
                type="email"
                required
                placeholder={tf('placeholder')}
                aria-label={t('eyebrow')}
                // NO OUTLINE HERE — and the wrapper is why it is safe.
                //
                // Client, Versjon 6 (2026-09-22): "Fjern den røde streken når
                // du holder musen over innskrivningsboksen." The red line is
                // OUR focus ring, not a browser default. globals.css draws
                // `outline: 2px solid #b4381f` on every focused control; this
                // form is `overflow-hidden rounded-full`, so three sides of
                // that rectangle are clipped away and the only segment left
                // is its RIGHT edge — a 2px red bar standing between the
                // field and the button, which is exactly what he described
                // and reads as a rendering fault rather than a focus state.
                //
                // Focus is still plainly visible: the form carries
                // `focus-within:border-gold`, so the whole pill turns gold
                // the moment the field is entered. Removing the outline
                // leaves the indicator intact — it does not remove one.
                className="w-full min-w-0 bg-transparent px-6 text-[15px] text-paper outline-none focus-visible:outline-none placeholder:text-paper/40"
              />
              <button
                type="submit"
                className="m-1.5 shrink-0 rounded-full bg-gold px-6 text-[15px] font-semibold text-dusk transition-colors hover:bg-paper active:scale-[0.99]"
              >
                {tf('submit')}
              </button>
            </form>
          )}
          <p className="mt-3 ps-6 text-[13px] text-paper/50">{t('note')}</p>
        </div>
      </div>
    </section>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  );
}
