'use client';

import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

// A completed phase's task list, folded away on a phone.
//
// The five phase cards run to about 1470px stacked, and four of them are
// history: what a visitor on a phone wants is the phase that is running now
// and the ones still to be paid for. So the finished ones keep their number,
// their name, their sum and their Completed mark — nothing about the money
// is hidden — and only the list of what that sum bought folds away.
//
// From sm the panel is simply open and the button is not rendered at all, so
// the desktop rail is untouched.
export function PhaseTasks({
  collapsible,
  labelShow,
  labelHide,
  children,
}: {
  /** Only completed phases fold. The current and coming ones stay open. */
  collapsible: boolean;
  /** Already interpolated by the server: "Show tasks (4)". */
  labelShow: string;
  labelHide: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  if (!collapsible) return <div className="flex-1">{children}</div>;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="mt-3.5 inline-flex min-h-9 items-center gap-2 self-start font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-60 transition-colors hover:text-gold-deep sm:hidden"
      >
        {open ? labelHide : labelShow}
        <svg
          aria-hidden
          viewBox="0 0 10 6"
          className={cn('h-1.5 w-2.5 transition-transform duration-200 motion-reduce:transition-none', open && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 1l4 4 4-4" />
        </svg>
      </button>

      {/* grid-template-rows 1fr -> 0fr is the height animation this codebase
         already uses for a disclosure. Open is the BASE state and the closed
         one is max-sm only, so from sm the panel is open with no override to
         lose: cn() is clsx-only here and a later class cannot win on its own.
         flex-1 is sm-only too — it exists so the status pills line up across
         a row of cards, and a growing box cannot also collapse to zero. */}
      <div
        id={id}
        className={cn(
          'grid grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none sm:flex-1',
          !open && 'max-sm:grid-rows-[0fr]',
        )}
      >
        {/* overflow-hidden belongs on the CHILD, which is service-offer's
           idiom and the only version that works: min-h-0 here instead kills
           the row's auto minimum, so 1fr resolves against zero free space and
           the panel stays shut even when open. */}
        <div className="overflow-hidden">{children}</div>
      </div>
    </>
  );
}
