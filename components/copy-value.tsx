'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

// A value you can take with you.
//
// The colophon exists for "a member, a journalist or an auditor" — people
// who came for the organisation number or the bank account and are going to
// put it somewhere else. Selecting a tabular figure by hand and hoping the
// spaces come with it is the worst part of that, so those two rows get a
// button.
//
// The button is quiet: invisible until the row is hovered or the button is
// focused, and it never moves the value. On success the label swaps for a
// moment and the change is announced once, politely.

export function CopyValue({
  value,
  copyLabel,
  copiedLabel,
  className,
}: {
  value: string;
  /** Accessible name for the control, e.g. "Copy". */
  copyLabel: string;
  /** Shown and announced after a successful copy. */
  copiedLabel: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Insecure origin, denied permission, or no clipboard API. Say nothing
      // and change nothing: the value is right there to select by hand, and
      // a "copied" that did not copy is worse than no button.
      return;
    }
    setCopied(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <span className={cn('inline-flex items-baseline gap-2.5', className)}>
      {/* Always Latin/numeric data, so it is isolated from the page's
         direction rather than reordered by it. */}
      <bdi dir="ltr">{value}</bdi>
      <button
        type="button"
        onClick={copy}
        aria-label={`${copyLabel} ${value}`}
        className={cn(
          'inline-grid h-7 w-7 shrink-0 translate-y-[2px] place-items-center rounded-btn text-ink-40 transition-all duration-200',
          'hover:bg-ink/5 hover:text-gold-deep focus-visible:opacity-100',
          // Hidden until the row is hovered, so six rows do not carry six
          // buttons at rest. Always present for keyboard and touch.
          'opacity-0 group-hover:opacity-100 focus:opacity-100 max-md:opacity-100',
          copied && 'text-gold-deep opacity-100',
        )}
      >
        {copied ? (
          <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </svg>
        )}
      </button>
      {/* One region, mounted for the life of the row rather than appearing
         with its message — a live region inserted at the moment it gains
         content is announced unreliably. */}
      <span aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ''}
      </span>
    </span>
  );
}
