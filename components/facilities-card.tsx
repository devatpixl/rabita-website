'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { FACILITIES, FLOOR_COUNT, FLOOR_ROOM_COUNT } from '@/lib/floor-markers';

// The FASILITETER card on /moskeprosjektet.
//
// ── BUILT TO A SUPPLIED DESIGN ────────────────────────────────────────────
// Client, 2026-09-18, with a mock: "copy it as it is, make sure no
// difference, even bg layout in the card and icons and coolours and
// aesthetics". So this is a reproduction, not an interpretation, and where
// the mock and this site's own palette disagree the MOCK WINS:
//
//   • the chips and the round button are a warm dark olive (#3c3f38). That
//     is not a token — `ink` is near-black and `dusk` is blue-green, and
//     both read wrong beside the mock's warm grey.
//   • the FACILITIES label is dark, not the gold this section's other two
//     cards use for their labels. The mock sets it dark and only the little
//     mark beside it gold.
//   • the chevrons and the link are gold-deep, which the mock's bronze
//     matches closely enough to stay on-palette.
//
// ── WHAT IS NOT IN THE MOCK, AND WHY IT IS HERE ANYWAY ────────────────────
// Pointing at a row swaps the photograph on the right for that room. At rest
// the card is pixel-for-pixel the mock — the arch is what shows until a
// pointer arrives — so this adds behaviour without changing the design it was
// asked to reproduce. Every one of the six has a real photograph; a reveal
// that works on four of six would be worse than none.

const CHIP = '#3c3f38';

/** 24x24, stroke 1.5, round caps — the site's icon language, drawn to the
 *  glyphs the mock shows: a dome, a book, a book, a runner, a cup, a sprout.
 *  None of these existed: figure-icons has no runner, cup or plant, and
 *  department-icons is keyed by department rather than by room. */
const GLYPH: Record<string, React.ReactNode> = {
  // Main prayer hall — the dome, its finial and the doorway under it.
  prayerMain: (
    <>
      <path d="M5.5 20.5V12.2a6.5 6.5 0 0 1 13 0v8.3" />
      <path d="M3 20.5h18" />
      <path d="M12 5.7V3.5" />
      <path d="M10 20.5v-3.3a2 2 0 0 1 4 0v3.3" />
    </>
  ),
  // School and Library both take the open book the mock shows for each.
  school: (
    <>
      <path d="M12 7.4v12" />
      <path d="M12 7.4C10.4 6 7.9 5.4 4.2 5.9v11.7c3.7-.5 6.2.1 7.8 1.5" />
      <path d="M12 7.4c1.6-1.4 4.1-2 7.8-1.5v11.7c-3.7-.5-6.2.1-7.8 1.5" />
    </>
  ),
  library: (
    <>
      <path d="M12 7.4v12" />
      <path d="M12 7.4C10.4 6 7.9 5.4 4.2 5.9v11.7c3.7-.5 6.2.1 7.8 1.5" />
      <path d="M12 7.4c1.6-1.4 4.1-2 7.8-1.5v11.7c-3.7-.5-6.2.1-7.8 1.5" />
    </>
  ),
  // Sports hall — a runner.
  sportsHall: (
    <>
      <circle cx="15.3" cy="4.9" r="1.9" />
      <path d="M14.1 8.6 11.4 12.6l3.1 2.3.8 5.6" />
      <path d="m14.5 14.9-3.9 1.6-2.2 4.1" />
      <path d="m11.8 12.2-3.6-1-1.4-3" />
      <path d="m17.2 10.6 3 1.4 1.2 3.1" />
    </>
  ),
  // Café — a cup, its handle and two threads of steam.
  cafe: (
    <>
      <path d="M4.6 9.2h11.6v5.4a4.4 4.4 0 0 1-4.4 4.4H9a4.4 4.4 0 0 1-4.4-4.4V9.2Z" />
      <path d="M16.2 10.8h1.5a2.3 2.3 0 0 1 0 4.6h-1.5" />
      <path d="M3.6 21.3h14" />
      <path d="M8.2 6.3c0-1 1-1.2 1-2.2M12 6.3c0-1 1-1.2 1-2.2" />
    </>
  ),
  // Roof terrace — a sprout in its bed.
  roofTerrace: (
    <>
      <path d="M12 20.8v-7.4" />
      <path d="M12 14.6C12 11.2 9.6 9 6.4 9c0 3.3 2.4 5.6 5.6 5.6Z" />
      <path d="M12 13.1c0-3 2-5 5-5 0 2.8-2 5-5 5Z" />
      <path d="M7 20.8h10" />
    </>
  ),
};

function Glyph({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {GLYPH[name]}
    </svg>
  );
}


export function FacilitiesCard() {
  const t = useTranslations('projectPage');
  const troom = useTranslations('floorByFloor.rooms');

  return (
    <Link
      href="#etasjene"
      className="group/fac relative hidden flex-col overflow-hidden rounded-[1.25rem] border border-rule bg-gradient-to-b from-paper to-paper-2 shadow-[0_1px_2px_rgba(26,26,24,0.04),0_16px_36px_-26px_rgba(26,26,24,0.28)] p-6 lg:flex"
    >
      {/* ── THE PHOTOGRAPH, DOWN THE END EDGE ──────────────────────────────
         The mock runs it about 29% of the card, bleeding top, end and bottom,
         with the card's own ground fading over its start edge so it has no
         hard vertical seam. arch-light is the frame that matches the mock's
         mood: pale stone, an arched opening, lattice shadows across a floor.

         The per-room photographs sit on top of it and only appear on hover,
         so the resting card is the mock exactly. */}
      <span aria-hidden className="pointer-events-none absolute inset-y-0 end-0 w-[29%]">
        {/* loading="eager" on all seven. The browser issued ZERO requests
           for them while every other image on the page loaded normally —
           confirmed from resource timings, and flipping one to eager made it
           arrive instantly. Native lazy-loading does not fire for them here:
           the card is display:none until lg and sits below a 640vh sticky
           scroll track, which is enough to confuse the proximity heuristic.
           Seven small images that ARE the card are not worth deferring. */}
        {/* ONE photograph, always. The six per-room frames that cross-faded
           in on hover are gone (client, 2026-09-18: "it shows different
           images on hover, remove those and keep this which is always
           shown").
           
           sizes is 40rem and not 10rem, and that was the "why does it look
           pixelated". Measured on the live page: the panel renders 98 x 413,
           but `sizes="10rem"` told next/image the image displays at 160px, so
           it served a 160 x 106 file. object-cover then had to stretch 106px
           of height over 413 — a 3.9x upscale. The panel is NARROW and TALL,
           and `sizes` only describes width, so the width it asks for has to be
           the one that covers the HEIGHT: 413 x (525/350) = 619px. 40rem asks
           for 640 and gets the whole source. */}
        <Image
          src="/photos/arch-light.jpg"
          alt=""
          fill
          sizes="40rem"
          loading="eager"
          className="object-cover"
        />
        {/* The ground, poured over the start edge. to-70% so the outer third
           of the panel is the photograph at full strength. */}
        <span className="absolute inset-0 bg-gradient-to-r from-paper-2 via-paper-2/85 to-transparent to-70% rtl:bg-gradient-to-l" />
      </span>

      {/* ── LABEL ──────────────────────────────────────────────────────────
         Dark, not gold: the mock reserves the gold for the little mark and
         the chevrons. pe-[30%] keeps every line clear of the photograph. */}
      <div className="relative flex items-center gap-2.5 pe-[30%]">
        <Glyph name="prayerMain" className="h-[17px] w-[17px] shrink-0 text-gold-deep" />
        <h2 className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-ink">
          {t('facts.facilitiesLabel')}
        </h2>
        <span aria-hidden className="h-px flex-1 bg-rule" />
      </div>

      {/* ── THE SIX ROOMS ──────────────────────────────────────────────── */}
      <ul className="relative mt-3 pe-[30%]">
        {FACILITIES.map((room) => (
          <li key={room}>
            {/* group/row + CSS, where a useState used to be. The state only
               existed to drive the photo swap; the chevron nudge was riding
               along on it, and a hover nudge is something CSS does without a
               re-render. */}
            <span className="group/row flex items-center gap-3 py-[0.375rem]">
              <span
                aria-hidden
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-paper transition-transform duration-300"
                style={{ backgroundColor: CHIP }}
              >
                <Glyph name={room} className="h-4 w-4" />
              </span>

              <span className="whitespace-nowrap text-[0.9375rem] leading-none text-ink">
                {troom(room)}
              </span>

              <span aria-hidden className="h-px flex-1 bg-rule" />

              <span
                aria-hidden
                className="shrink-0 font-mono text-[0.9375rem] leading-none text-gold-deep transition-transform duration-300 group-hover/row:translate-x-1 rtl:group-hover/row:-translate-x-1"
              >
                &rsaquo;
              </span>
            </span>
          </li>
        ))}
      </ul>

      {/* ── THE FOOT ───────────────────────────────────────────────────── */}
      <div className="relative mt-4 pe-[30%]">
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-40">
          {t('facts.facilitiesCount', { rooms: FLOOR_ROOM_COUNT, floors: FLOOR_COUNT })}
        </p>
        <span className="mt-2 inline-flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-gold-deep">
          {t('facts.facilitiesLink')}
          <span aria-hidden className="transition-transform duration-300 group-hover/fac:translate-x-1 rtl:rotate-180 rtl:group-hover/fac:-translate-x-1">
            &rarr;
          </span>
        </span>
      </div>

      {/* ── THE ROUND BUTTON, ON THE PHOTOGRAPH ────────────────────────────
         The mock's one piece of weight: a filled disc at the end corner,
         sitting over the picture rather than beside it. */}
      <span
        aria-hidden
        className="absolute bottom-5 end-5 grid h-12 w-12 place-items-center rounded-full text-paper transition-transform duration-300 group-hover/fac:scale-105"
        style={{ backgroundColor: CHIP }}
      >
        <span className="text-[1.05rem] leading-none rtl:rotate-180">&rarr;</span>
      </span>
    </Link>
  );
}
