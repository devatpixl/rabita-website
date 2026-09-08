'use client';

import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

// A phase card's detail, folded away on a phone.
//
// Four of the five phases are not the one being paid for now, and stacked
// full they ran the rail past 1400px. So on a phone every phase except the
// current one keeps its number, name, sum and state — nothing about the money
// is hidden — and folds the rule and the list of what that sum buys.
//
// The toggle shares a line with the status pill rather than taking one of its
// own: a collapsed card is four lines and a fifth for a lone button is the
// difference between a summary and a stub.
//
// From sm the button is not rendered and the panel is open, so the desktop
// rail is untouched.
export function PhaseTasks({
  collapsible,
  labelShow,
  labelHide,
  panel,
  footer,
}: {
  /** Everything but the current phase folds. */
  collapsible: boolean;
  /** Already interpolated by the server: "Vis oppgaver (4)". */
  labelShow: string;
  labelHide: string;
  /** The rule and the task list. */
  panel: ReactNode;
  /** The status pill. */
  footer: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <>
      {/* grid-template-rows 1fr -> 0fr is service-offer's height animation.
         Open is the BASE state and the closed one is max-sm only, so from sm
         the panel is open with no override to lose: cn() is clsx-only here
         and a later class cannot win on its own. overflow-hidden goes on the
         CHILD — min-h-0 here instead kills the row's auto minimum, so 1fr
         resolves against zero free space and the panel never opens.

         flex-1 is sm-only too: it exists so the status pills line up across a
         row of cards, and a box that grows cannot also collapse to zero. */}
      <div
        id={id}
        className={cn(
          'grid grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none sm:flex-1',
          collapsible && !open && 'max-sm:grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">{panel}</div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 sm:mt-6 sm:block">
        {footer}
        {collapsible && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={id}
            className="inline-flex min-h-9 shrink-0 items-center gap-2 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-60 transition-colors hover:text-gold-deep sm:hidden"
          >
            {open ? labelHide : labelShow}
            <svg
              aria-hidden
              viewBox="0 0 10 6"
              className={cn(
                'h-1.5 w-2.5 transition-transform duration-200 motion-reduce:transition-none',
                open && 'rotate-180',
              )}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 1l4 4 4-4" />
            </svg>
          </button>
        )}
      </div>
    </>
  );
}
