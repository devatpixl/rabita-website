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
// ── THE SOURCE IS NOW A 4:5 CROP, AND THAT IS THE WHOLE FIX ─────────────
// This used to point at prayer-band-iftar.webp, which is 2000x800. In a phone
// box taller than about 156px a 2.5:1 source is always the WIDER of the two,
// so object-cover scaled it to fill the height and cropped the width — and the
// vertical objectPosition did nothing at all. The frame's full height was
// always in view, graffiti wall included, and no amount of positioning could
// move it. The scrim was doing the work a crop should have done.
//
// prayer-band-iftar-4x5.webp is the same photograph — the client's own
// gateiftar shoot on Grønland — cut to 4:5 from the 5472x3648 original rather
// than from the 2000px web file. Now the source is TALLER than the box, so
// cover crops the height and objectPosition steers it, which is what lets the
// bowed rows sit where they should instead of wherever the file happened to
// put them.
//
// The desktop band on the page keeps the 5:2 file, also recut from the same
// original: it was a 2000px crop and is now 2400px.
const GRADE = 'saturate(0.72) contrast(1.12) brightness(0.9)';

export function PrayerHero({ title }: { title: string }) {
  const t = useTranslations('prayerBoard');
  const tv = useTranslations('prayerVisit');
  const { today, win, until, gregorianShort, hijri, progress } = usePrayerWindow();

  return (
    <section className="relative isolate overflow-hidden bg-dusk text-paper md:hidden">
      <Image
        src="/photos/prayer-band-iftar-4x5.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
        // 38%: with a real vertical crop available at last, this lifts the
        // window off the wet ground and holds the bowed backs and the wall
        // behind them.
        style={{ objectPosition: '50% 38%', filter: GRADE }}
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
