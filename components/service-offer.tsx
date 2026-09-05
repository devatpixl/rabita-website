'use client';

import { useId, useRef, useState } from 'react';
import { MotionRise } from './motion-rise';
import { cn } from '@/lib/cn';

// The numbered list of what a service actually involves, from the client's
// mockup (2026-09-06): a row per point, a serif numeral, and the open row
// lifted onto a paper card with a gold start-edge border and a circular
// seal.
//
// This is the third design for this section, and the first two were rejected
// for opposite reasons — invented line-drawings ("looks fake"), then a bare
// centred paragraph ("very basic"). Both failed for the same reason: the
// section had nothing in it. What makes this one work is not the treatment,
// it is that there are now four real points per service behind it, taken
// from rabita.no (messages/*.json, servicesIndex.items.<key>.offer).
//
// WHICH ROWS OPEN. An item carries `detail` only where there is a concrete
// fact to reveal — a phone number, an opening time, a requirement. Rows
// without one are not buttons: a control that does nothing when you press it
// is worse than no control, so those rows carry a diamond instead of a seal
// and simply sit there. That is also why `open` starts on the first
// EXPANDABLE row rather than on index 0 — every page then loads with a card
// showing, the way the mockup does.

export type OfferItem = { title: string; body: string; detail?: string };

// The panel is a SIBLING of the trigger, not a child: a <button> may only
// contain phrasing content, and a disclosure panel is flow content. That
// means its start padding has to be composed by hand to line up under the
// title, so the three measurements live here rather than being retyped —
// row padding + numeral column + column gap.
//   base: 1rem + 2.5rem + 1.25rem = 4.75rem
//   sm:   1.25rem + 3rem + 1.5rem = 5.75rem
const ROW_PAD = 'px-4 sm:px-5';
const NUM_COL = 'w-10 sm:w-12';
const COL_GAP = 'gap-x-5 sm:gap-x-6';
const PANEL_PAD = 'ps-[4.75rem] pe-4 sm:ps-[5.75rem] sm:pe-5';

export function ServiceOffer({ items }: { items: OfferItem[] }) {
  const uid = useId();
  const expandable = items.map((it) => Boolean(it.detail));
  const first = expandable.indexOf(true);
  const [open, setOpen] = useState(first);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  // Up and down move between the rows that are actually buttons. Deliberately
  // NOT left/right: those are the axis that mirrors in Arabic, and this list
  // runs down the page in both directions.
  const step = (from: number, dir: 1 | -1) => {
    const order = items.map((_, i) => i).filter((i) => expandable[i]);
    const at = order.indexOf(from);
    if (at === -1) return;
    const next = order[(at + dir + order.length) % order.length];
    refs.current[next]?.focus();
  };

  return (
    <MotionRise>
      <ul className="divide-y divide-rule border-y border-rule">
        {items.map((item, i) => {
          const n = String(i + 1).padStart(2, '0');
          const isOpen = open === i;
          const canOpen = expandable[i];
          const panelId = `${uid}-panel-${i}`;

          const inner = (
            <>
              {/* The numeral. It brightens when the row is live, which is
                 half the reason the list reads as interactive at all. */}
              <span
                aria-hidden
                className={cn(
                  'shrink-0 font-serif text-[1.7rem] leading-none tabular-nums transition-colors duration-300 md:text-[2.05rem]',
                  NUM_COL,
                  isOpen ? 'text-gold-deep' : 'text-gold-deep/40 group-hover:text-gold-deep/70',
                )}
              >
                {n}
              </span>
              <span className="block min-w-0">
                <span className="block font-serif text-[1.15rem] leading-snug text-ink md:text-[1.25rem]">
                  {item.title}
                </span>
                <span className="mt-1.5 block text-[14px] leading-snug text-ink-60 md:text-[15px]">
                  {item.body}
                </span>
              </span>
              {canOpen ? (
                // The seal, from follow-us.tsx — it already animates exactly
                // this transition, outlined at rest and gold-filled when live.
                <span
                  aria-hidden
                  className={cn(
                    'mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full ring-1 transition-colors duration-300',
                    isOpen
                      ? 'bg-gold-deep text-paper ring-gold-deep'
                      : 'bg-gold-soft/40 text-gold-deep ring-gold-deep/25 group-hover:bg-gold-soft/70',
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={cn(
                      'h-4 w-4 transition-transform duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
                      isOpen ? 'rotate-180' : 'rotate-0',
                    )}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              ) : (
                // Same box as the seal, so the marker sits on the same line
                // whether a row expands or not.
                <span aria-hidden className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center">
                  <span className="h-1.5 w-1.5 rotate-45 bg-gold-deep/35" />
                </span>
              )}
            </>
          );

          return (
            <li
              key={item.title}
              className={cn(
                'group relative isolate border-s-2 transition-colors duration-300 motion-reduce:transition-none',
                isOpen
                  ? 'rounded-e-lg border-gold-deep bg-paper'
                  : 'border-transparent hover:border-gold-deep/30 hover:bg-paper/60 focus-within:border-gold-deep/30 focus-within:bg-paper/60',
              )}
            >
              {/* Rabita's own mark, ghosted into the open card. The one piece
                 of pattern on these pages that is not invented — it is the
                 logo, the same geometry the facade carries. Painted behind
                 the row, which is why the li is `isolate`: without it the
                 -z-10 would drop through to the section ground. */}
              <span
                aria-hidden
                className={cn(
                  'pointer-events-none absolute -bottom-5 -end-3 -z-10 hidden h-28 w-28 bg-contain bg-no-repeat transition-opacity duration-500 sm:block motion-reduce:transition-none',
                  isOpen ? 'opacity-[0.07]' : 'opacity-0',
                )}
                style={{ backgroundImage: "url('/logo/rabita-mark-256.png')" }}
              />

              {canOpen ? (
                <button
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      step(i, 1);
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      step(i, -1);
                    }
                  }}
                  className={cn(
                    'grid w-full grid-cols-[auto_1fr_auto] items-start py-5 text-start',
                    ROW_PAD,
                    COL_GAP,
                  )}
                >
                  {inner}
                </button>
              ) : (
                <div className={cn('grid grid-cols-[auto_1fr_auto] items-start py-5', ROW_PAD, COL_GAP)}>
                  {inner}
                </div>
              )}

              {/* 0fr -> 1fr, the height-auto transition without a library and
                 without measuring anything. The inner element carries the
                 overflow so the text is clipped rather than reflowed. */}
              {canOpen && (
                <div
                  id={panelId}
                  className={cn(
                    'grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <div className="overflow-hidden">
                    <p
                      className={cn(
                        'border-t border-gold-deep/20 pb-5 pt-4 text-[14px] leading-relaxed text-ink-60',
                        PANEL_PAD,
                      )}
                    >
                      {item.detail}
                    </p>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </MotionRise>
  );
}
