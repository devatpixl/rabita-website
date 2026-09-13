'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

// The photographs behind a room on the floor figure (client, 2026-09-13:
// clicking a marker should open the pictures of that place, with arrows where
// there is more than one, and a line of description).
//
// A dialog, not a panel pinned to the drawing. The figure lives in a pinned
// section that is still being scroll-driven underneath, so anything anchored
// to the plate would move while you read it. A centred sheet over a dimmed
// page is also the only version that works on a phone, where the drawing is
// already the full width.
//
// Rules it has to keep, because this is a modal over a scroll-driven section:
//
//   - the page must not scroll behind it. Locked on open, and the scrollbar's
//     width is handed back as padding so the layout does not jump;
//   - Escape closes, arrows page, and Tab cannot walk out into the page
//     behind — a focus trap, not just an overlay;
//   - focus returns to the marker you opened it from, or the reader is left
//     somewhere arbitrary in a very long page.
export function RoomPhotos({
  roomId,
  photos,
  onClose,
}: {
  roomId: string;
  photos: readonly string[];
  onClose: () => void;
}) {
  const t = useTranslations('floorByFloor');
  const tg = useTranslations('projectPage.gallery');
  // giving.closeSheet is the site's existing "Lukk", already in all three
  // locales. A fourth translation of one word would only drift from it.
  const tClose = useTranslations('giving');
  const [i, setI] = useState(0);
  const n = photos.length;
  const go = useCallback((to: number) => setI(((to % n) + n) % n), [n]);

  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Lock the page, trap the keyboard, restore focus. One effect, because the
  // teardown of each half has to happen in the same order it was set up.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;

    // Lock the element that actually SCROLLS, which on this site is <html>,
    // not <body>. globals.css puts overflow-x: clip on html, and that makes
    // html the scroll container — so overflow:hidden on body is applied to
    // something that was never scrolling and the page carried on moving
    // behind the dialog (client, 2026-09-13). Worse than an ordinary leak
    // here: this section is scroll-driven, so a scroll behind the dialog
    // changes the floor you came from.
    //
    // Both are locked rather than only html: body is free either way, and it
    // costs nothing to be right on a browser that disagrees about which one
    // is the scroller.
    const root = document.documentElement;
    const prev = {
      rootOverflow: root.style.overflow,
      rootPad: root.style.paddingRight,
      bodyOverflow: document.body.style.overflow,
    };
    const gap = window.innerWidth - root.clientWidth;
    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    // The scrollbar's width, handed back so the page does not jump sideways
    // as it disappears.
    if (gap > 0) root.style.paddingRight = `${gap}px`;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      // Space, PageUp/Down, Home/End and the vertical arrows all scroll a
      // page. None of them should reach one the reader cannot see.
      if ([' ', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        return;
      }
      if (e.key === 'ArrowRight') { e.preventDefault(); setI((p) => ((p + 1) % n + n) % n); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); setI((p) => ((p - 1) % n + n) % n); return; }
      if (e.key !== 'Tab') return;
      // The trap. Without it, Tab walks out of the sheet and into a page the
      // reader cannot see.
      const focusables = sheetRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    // And stop the events, not just the overflow.
    //
    // overflow:hidden on the scroller is the usual lock and it is not enough
    // on its own here — measured: a real wheel over the backdrop still moved
    // the page 600px with html AND body both hidden. So the wheel and the
    // touch are cancelled outright anywhere outside the sheet. passive:false
    // because a passive listener is not allowed to preventDefault, and the
    // default is exactly what has to go.
    //
    // Inside the sheet they pass through, so the description can still scroll
    // on a short phone; overscroll-contain on that block stops the scroll
    // chaining back out to the page when it reaches its end.
    const stopScroll = (e: Event) => {
      if (sheetRef.current?.contains(e.target as Node)) return;
      e.preventDefault();
    };
    document.addEventListener('wheel', stopScroll, { passive: false });
    document.addEventListener('touchmove', stopScroll, { passive: false });
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('wheel', stopScroll);
      document.removeEventListener('touchmove', stopScroll);
      document.removeEventListener('keydown', onKey);
      root.style.overflow = prev.rootOverflow;
      root.style.paddingRight = prev.rootPad;
      document.body.style.overflow = prev.bodyOverflow;
      opener?.focus?.();
    };
  }, [n, onClose]);

  // Swipe, same threshold as the render gallery.
  const x0 = useRef<number | null>(null);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(`rooms.${roomId}`)}
      className="fixed inset-0 z-[60] flex items-center justify-center p-5 sm:p-8 lg:p-12"
    >
      {/* The ground. Clicking off the sheet closes, but this is NOT exposed:
         it is a mouse shortcut for something the close button and Escape
         already do, and an unnamed control in the tree would just be one more
         thing to tab past. */}
      {/* 60%, not 85 (client, 2026-09-13: "make the sides more visible").
         At 85 the page behind was a flat dark field and the dialog read as a
         new screen; at 60 with the blur still on you can see WHERE you are
         and that this is laid over it. The sheet carries its own opaque dusk,
         so nothing in it depends on the ground for contrast. */}
      <div aria-hidden onClick={onClose} className="absolute inset-0 bg-dusk/60 backdrop-blur-[3px]" />

      <div
        ref={sheetRef}
        // max-w-3xl, not 4xl, and the picture capped against the viewport's
        // own height. At 4xl the sheet came to 710px of the 742 a 13" Air
        // has once the padding is off — it filled the screen and the dimmed
        // page behind it never showed (client, 2026-09-13: "no room to
        // breathe ... space outside the image"). At 3xl the same screen
        // leaves about 85px of dark above and below, which is what makes it
        // read as something laid OVER the page rather than as a new one.
        className="relative flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-dusk text-paper shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] ring-1 ring-paper/15"
        onPointerDown={(e) => { x0.current = e.clientX; }}
        onPointerUp={(e) => {
          if (x0.current == null) return;
          const dx = e.clientX - x0.current;
          x0.current = null;
          if (Math.abs(dx) < 40) return;
          if (dx < 0) go(i + 1); else go(i - 1);
        }}
        style={{ touchAction: 'pan-y' }}
      >
        {/* The picture. A fixed 16:10 window rather than the file's own shape,
           so paging between a wide overview and a tall corridor does not
           resize the sheet under the reader's hands. */}
        {/* max-h against the viewport as well as the aspect ratio: on a short
           laptop the 16:10 box alone would still push the sheet past the
           screen, and object-cover simply crops a little more instead. */}
        <div className="relative aspect-[16/10] max-h-[54svh] w-full shrink-0 bg-dusk">
          {photos.map((src, idx) => (
            <Image
              key={src}
              src={src}
              alt=""
              fill
              sizes="(min-width: 896px) 56rem, 92vw"
              priority={idx === 0}
              className={cn(
                'object-cover transition-opacity duration-300 ease-out motion-reduce:transition-none',
                idx === i ? 'opacity-100' : 'opacity-0',
              )}
            />
          ))}

          {n > 1 && (
            <>
              <SheetArrow dir="prev" label={tg('prev')} onClick={() => go(i - 1)} className="start-3" />
              <SheetArrow dir="next" label={tg('next')} onClick={() => go(i + 1)} className="end-3" />
              <p className="absolute bottom-3 end-4 rounded-full bg-dusk/70 px-2.5 py-1 font-mono text-[0.625rem] tabular-nums tracking-[0.14em] text-paper/80 backdrop-blur-sm">
                <span className="text-paper">{String(i + 1).padStart(2, '0')}</span> / {String(n).padStart(2, '0')}
              </p>
            </>
          )}
        </div>

        {/* The words. min-h-0 + overflow so a long description on a short
           phone scrolls inside the sheet instead of pushing the picture off
           the top of the screen. */}
        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
          <p className="flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-gold">
            <span aria-hidden className="h-px w-6 shrink-0 bg-gold/70" />
            {t(`floors.${FLOOR_OF[roomId] ?? 'whole'}`)}
          </p>
          <h3 className="mt-3 font-serif text-[clamp(1.3rem,2.4vw,1.75rem)] leading-tight text-paper">
            {t(`rooms.${roomId}`)}
          </h3>
          <p className="mt-2.5 max-w-[62ch] text-body text-paper/70">{t(`roomDesc.${roomId}`)}</p>
        </div>

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={tClose('closeSheet')}
          className="absolute end-3 top-3 grid h-10 w-10 place-items-center rounded-full border border-paper/30 bg-dusk/70 text-paper backdrop-blur-sm transition-colors hover:border-gold hover:bg-gold hover:text-dusk"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Which floor caption to show above the room name. Derived here rather than
// threaded through the marker, so the dialog can be opened from anywhere.
const FLOOR_OF: Record<string, string> = {
  sportsHall: 'lower',
  foyer: 'first', cafe: 'first', library: 'first',
  commercial: 'second', childrensRoom: 'second', imamOffice: 'second',
  school: 'third', conference: 'third', garden: 'third',
  meetingRooms: 'fourth', youthClub: 'fourth',
  apartments: 'fifth',
  roofTerrace: 'whole', minaret: 'whole',
};

function SheetArrow({
  dir,
  label,
  onClick,
  className,
}: {
  dir: 'prev' | 'next';
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'absolute top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-paper/30 bg-dusk/60 text-paper backdrop-blur-sm transition-colors hover:border-gold hover:bg-gold hover:text-dusk',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn('h-4 w-4', dir === 'prev' ? 'rtl:rotate-180' : 'rotate-180 rtl:rotate-0')} aria-hidden>
        <path d="M15 5l-7 7 7 7" />
      </svg>
    </button>
  );
}
