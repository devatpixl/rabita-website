'use client';

import { useCallback, useState } from 'react';
import { cn } from '@/lib/cn';

// Tiny "click to copy" affordance. Renders the value as selectable text
// (never an image, so screen readers and Cmd/Ctrl-C both work) with a
// button that copies programmatically for pointer users.
export function Copyable({
  value,
  label,
  size = 'body',
  className,
}: {
  value: string;
  label: string;
  size?: 'body' | 'display';
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard blocked — user can still select the text manually
    }
  }, [value]);

  return (
    <div className={cn('flex items-baseline gap-3', className)}>
      <div className="flex flex-col">
        <span className="font-mono text-label uppercase tracking-widest text-ink-60">
          {label}
        </span>
        <span
          className={cn(
            'font-serif tabular-nums select-all',
            size === 'display'
              ? 'text-display leading-none text-gold-deep'
              : 'text-card text-ink',
          )}
        >
          {value}
        </span>
      </div>
      <button
        type="button"
        onClick={copy}
        className="min-h-9 rounded-btn border border-ink/40 px-3 py-1 text-[13px] text-ink hover:border-ink hover:bg-ink hover:text-paper transition-colors"
        aria-label={`Kopier ${label}`}
      >
        {copied ? '✓' : '⧉'}
      </button>
    </div>
  );
}
