'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ClockIcon } from './prayer-board';
import { usePrayerWindow } from './use-prayer-window';

// The phone masthead for /bonnetider (2026-09-29).
//
// WHAT IT ANSWERS. Client, on seeing the page at 390px: the information is
// right, "but design is too basic ... on the mobile it's just there like it was
// forcefully placed". He was describing something real. The desktop opens on a
// photographic band carrying the h1 — and that band is `hidden md:block`, so a
// phone opened on a screen-reader-only h1 and went straight into a white card
// of boxes. The page had no first impression at all, and the six times it led
// with were the same six already printed in the utility strip above the header.
//
// So the phone gets a masthead of its own, on the SAME photograph the desktop
// band uses, and it leads on the one thing a person opening this page at 15:40
// actually wants: which prayer is next, at what time, and how long they have.
// The six times keep their place below, as a list rather than a second grid.
//
// ONE CLOCK. Both this and PrayerBoard read usePrayerWindow, so the name lit
// here and the row lit down there cannot disagree. See that file.
//
// ── WHY THE SCRIM IS HEAVY, AND WHY THE CROP NUMBER BARELY MATTERS ──────
// The file is 2000x800. In a phone-width box taller than ~156px the source is
// the WIDER of the two, so object-cover scales it to fill the height and crops
// the WIDTH — which means the vertical objectPosition does nothing at all here,
// and the frame's full height is always in view. That includes the graffiti
// wall behind the congregation, which is the top 45% of the photograph and
// which the desktop band never shows because its box is 4.6:1 and cuts it off.
//
// The first cut inherited the band's light scrim and the wall arrived in full
// colour: a blue, busy top half under a page whose subject is a time. Swapping
// in a calmer stock interior was the easy fix and the wrong one — this is the
// gateiftar on Grønland, the congregation's own photograph, and the site
// celebrates it elsewhere. So the scrim does the work instead: a heavier flat
// veil plus a ramp that never thins past 35%, which drops the wall to texture
// and leaves the bowed rows as the only thing with shape in it.
//
// objectPosition's 50% is therefore the HORIZONTAL centre and is the part that
// counts: at 390px we see the middle ~44% of the width, which is the group in
// rukuʿ. The 40% is inert, kept only so the value still reads as deliberate if
// the box is ever made short enough to crop vertically.
const GRADE = 'saturate(0.72) contrast(1.12) brightness(0.9)';

export function PrayerHero({ title }: { title: string }) {
  const t = useTranslations('prayerBoard');
  const tv = useTranslations('prayerVisit');
  const { today, win, until, gregorianShort, hijri, progress } = usePrayerWindow();

  return (
    <section className="relative isolate overflow-hidden bg-dusk text-paper md:hidden">
      <Image
        src="/photos/prayer-band-iftar.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: '50% 40%', filter: GRADE }}
      />
      {/* Two layers, and both earn their place: a flat veil so the whole frame
         drops far enough for paper type to hold anywhere on it, then a
         bottom-up ramp so the block of words at the foot sits on near-solid
         dusk. The ramp is VERTICAL, which is why there is no rtl: twin — in
         Arabic the words move to the other edge but the dark stays at the
         bottom either way. */}
      <div aria-hidden className="absolute inset-0 bg-dusk/55" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-dusk via-dusk/80 to-dusk/35" />

      <div className="relative flex min-h-[20rem] flex-col justify-end px-6 pb-7 pt-10">
        {/* The masthead line: the page's name, and the day it is answering
           for. THE HIJRI DATE BECOMES VISIBLE ON PHONES HERE — in the board
           below it is `hidden md:block`, so until now the one place on the
           site where the Islamic date belongs was the one place it never
           showed. Both dates on one mono line, hijri lit and gregorian
           quiet, because the hijri is the one this page is keeping. */}
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="font-serif text-[1.65rem] leading-none text-paper">{title}</h1>
          <p className="shrink-0 text-end font-mono text-[0.625rem] uppercase leading-tight tracking-[0.14em] text-gold">
            {hijri}
            <span className="block text-paper/55">{gregorianShort}</span>
          </p>
        </div>

        {/* ── THE NEXT PRAYER, AS THE OBJECT OF THE PAGE ──────────────────
           Name and time on one baseline, the big figure at the end edge
           where the eye lands last and stays.

           EVERY ROW KEYED ON `now` RESERVES ITS HEIGHT. usePrayerWindow
           returns a null clock until mount (a server cannot know the
           reader's minute), so these three lines are blank in the HTML and
           fill in a tick later. Without the min-h the whole masthead would
           grow by ~80px under the reader's thumb on first paint. */}
        <div className="mt-6">
          <p className="flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-gold">
            <ClockIcon className="h-3.5 w-3.5" />
            {t('nextLabel')}
          </p>
          <div className="mt-2 flex min-h-[3.25rem] items-end justify-between gap-4">
            <p className="font-serif text-[2.25rem] leading-none text-paper">
              {win ? tv(`names.${win.next}`) : ''}
            </p>
            <p className="font-serif text-[3.25rem] leading-none tabular-nums text-gold">
              {win && today ? today[win.next] : ''}
            </p>
          </div>
          <p className="mt-2 min-h-[1.5rem] font-serif text-[1rem] italic leading-normal text-gold/85">
            {until}
          </p>
        </div>

        {/* The same rail the board carries on desktop, restated in the
           masthead's palette: a hairline, because at this size a 4px bar
           would read as a control rather than as elapsed time. */}
        <div className="mt-4 h-px w-full overflow-hidden bg-paper/20">
          <div
            className="h-full bg-gold transition-[width] duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </section>
  );
}
