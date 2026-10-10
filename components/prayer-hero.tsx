'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ClockIcon } from './prayer-board';
import { usePrayerWindow } from './use-prayer-window';
import { PRAYER_ORDER, type PrayerKey } from '@/lib/prayer-window';
import { cn } from '@/lib/cn';
import { PlateFoot } from './plate-foot';

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

// ── THE HIERARCHY IS THE COUNTDOWN'S (2026-09-29, second pass) ──────────
// The first pass put the name and the clock time on one baseline at opposite
// edges of a 342px column, with the countdown small underneath. Two things of
// near-equal weight with a hole between them, and the one line that answers
// "do I need to leave now" set smallest of the three. The client asked for the
// next prayer to be more prominent, and the fix was not more size on the same
// arrangement: it was putting the right figure at the top of the scale.
//
// So the countdown is the hero figure. The name and the time follow as one
// supporting line, and the day band along the foot puts both in context.
export function PrayerHero({ title }: { title: string }) {
  const t = useTranslations('prayerBoard');
  const tv = useTranslations('prayerVisit');
  const { today, win, untilBare, nowMinutes, gregorianShort, hijri } = usePrayerWindow();

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

      <div className="relative flex min-h-[23rem] flex-col justify-end px-6 pb-16 pt-10">
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
           Countdown first and largest, because it is the only line here that
           is about the reader rather than about the day. Name and time under
           it as one line, in one measure, so the eye reads down a column
           instead of crossing a gap.

           EVERY ROW KEYED ON `now` RESERVES ITS HEIGHT. usePrayerWindow
           returns a null clock until mount (a server cannot know the
           reader's minute), so these lines are blank in the HTML and fill in
           a tick later. Without the min-h the masthead would grow by ~90px
           under the reader's thumb on first paint. */}
        <div className="mt-7">
          <p className="flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-gold">
            <ClockIcon className="h-3.5 w-3.5" />
            {t('nextLabel')}
          </p>
          <p className="mt-2.5 min-h-[3.25rem] font-serif text-[3.5rem] leading-[0.92] tabular-nums text-gold">
            {untilBare}
          </p>
          <p className="mt-1.5 min-h-[1.6rem] font-serif text-[1.5rem] leading-none text-paper">
            {win ? tv(`names.${win.next}`) : ''}
            {win && today ? (
              <>
                <span className="text-paper/40"> · </span>
                <span className="tabular-nums text-paper/85">{today[win.next]}</span>
              </>
            ) : null}
          </p>
        </div>

        {today ? <DayBand today={today} nextKey={win?.next ?? null} nowMinutes={nowMinutes} /> : null}
      </div>
      {/* Ends on the site's curve into the paper below (user, 2026-10-10:
         every hero ends on the wave). pb-16 above keeps the day band clear
         of it. This hero is phone-only already. */}
      <PlateFoot fill="#FAF8F4" className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] block h-12 w-full" />
    </section>
  );
}

/** "05:12" -> minutes since midnight. */
function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/**
 * The whole day on one rail, Fajr at one end and Isha at the other.
 *
 * WHY A BAND AND NOT THE OLD PROGRESS HAIRLINE. What the hairline showed was
 * how far through the CURRENT window we are — a fraction with no units, drawn
 * 1px high at the very bottom of the masthead, which is to say invisible and
 * uninterpretable. This shows the same idea against a scale the reader already
 * knows: six ticks at their real positions in the day, the part that has gone
 * filled in, and a marker where the reader is standing.
 *
 * THE SCALE IS FAJR TO ISHA, NOT MIDNIGHT TO MIDNIGHT. A 24-hour rail spends
 * a third of its width on the hours between Isha and Fajr, when there is
 * nothing to show and nobody is looking. Clamping to the six means the ticks
 * spread across the full measure — which is also why the marker clamps rather
 * than disappearing when someone opens this at 02:00 or 23:30.
 *
 * NOTHING HERE MOVES BEFORE MOUNT. The ticks come from the server's times and
 * are in the HTML; only the marker and the fill are keyed on the clock, and
 * both are absolutely positioned, so the hydration tick cannot shift anything.
 */
function DayBand({
  today,
  nextKey,
  nowMinutes,
}: {
  today: Record<string, string>;
  nextKey: PrayerKey | null;
  nowMinutes: number | null;
}) {
  const tv = useTranslations('prayerVisit');
  const start = toMinutes(today.fajr);
  const end = toMinutes(today.isha);
  const span = Math.max(1, end - start);
  const at = (m: number) => Math.min(100, Math.max(0, ((m - start) / span) * 100));
  const nowPct = nowMinutes == null ? null : at(nowMinutes);

  return (
    <div className="mt-7">
      <div className="relative h-4">
        <div aria-hidden className="absolute inset-x-0 top-[7px] h-px bg-paper/25" />
        {nowPct != null && (
          <div
            aria-hidden
            className="absolute start-0 top-[7px] h-px bg-gold transition-[width] duration-700 ease-out"
            style={{ width: `${nowPct}%` }}
          />
        )}

        {/* One tick per prayer, placed at its real hour. `insetInlineStart`
           with a negative inline margin rather than a translate, because a
           -50% translate is written in physical x and would push every tick
           the wrong way in Arabic. */}
        {PRAYER_ORDER.map((key) => {
          const pct = at(toMinutes(today[key]));
          const isNext = key === nextKey;
          const passed = nowMinutes != null && toMinutes(today[key]) <= nowMinutes;
          return (
            <span
              key={key}
              aria-hidden
              className={cn(
                'absolute rounded-full',
                isNext
                  ? 'top-[2px] h-2.5 w-2.5 bg-gold ring-4 ring-gold/20'
                  : passed
                    ? 'top-[4px] h-1.5 w-1.5 bg-gold/70'
                    : 'top-[4px] h-1.5 w-1.5 bg-paper/40',
              )}
              style={{
                insetInlineStart: `${pct}%`,
                marginInlineStart: isNext ? '-5px' : '-3px',
              }}
            />
          );
        })}

        {/* The reader's own position: a full-height stroke, so it reads as a
           cursor across the day rather than as a seventh prayer. */}
        {nowPct != null && (
          <span
            aria-hidden
            className="absolute top-0 h-4 w-px bg-paper"
            style={{ insetInlineStart: `${nowPct}%` }}
          />
        )}
      </div>

      <div className="mt-2 flex items-baseline justify-between font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-paper/45">
        <span>
          {tv('names.fajr')} <span className="tabular-nums">{today.fajr}</span>
        </span>
        <span>
          {tv('names.isha')} <span className="tabular-nums">{today.isha}</span>
        </span>
      </div>
    </div>
  );
}
