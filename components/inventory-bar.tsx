'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { formatAmount } from '@/lib/format';
import { fundedPercent, type Gift } from '@/lib/gifts';
import type { AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/cn';

// Inventory column for a Gift Ladder row.
//
// Two elements stacked:
//   1. A mono 11px count line — funded number in --ink, then
//      " / {total} {unit}" in --ink-40. Fallback when unitFunded is
//      null/undefined: "{total} {unit} {totalSuffix}" in --ink-40 only,
//      with NO bar. Never a zero, never a guess (see lib/gifts.ts).
//   2. A 4px-tall bar with 2px radius. Track --rule + fill --gold on
//      normal rows; track --gold-soft + fill --gold-deep on the anchor
//      row so the bar reads against the paper-deep band.
//
// Motion: the fill animates its width from 0% to the funded percentage
// on scroll entry, 600ms cubic-out. The stagger between rows (80ms) is
// applied by the parent via the `staggerDelay` prop. Runs once. Under
// prefers-reduced-motion it snaps to final width with no transition.
export function InventoryBar({
  gift,
  isAnchor,
  unit,
  totalSuffix,
  staggerDelay = 0,
}: {
  gift: Gift;
  isAnchor: boolean;
  unit: string;
  totalSuffix: string;
  staggerDelay?: number;
}) {
  const locale = useLocale() as AppLocale;
  const pct = fundedPercent(gift);
  const hasFunded = pct !== null;

  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduced(rm);
    if (rm) {
      setVisible(true);
      return;
    }
    const el = barRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.setTimeout(() => setVisible(true), staggerDelay);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [staggerDelay]);

  const totalStr = formatAmount(locale, gift.unitTotal);

  return (
    <div ref={barRef} className="w-full flex flex-col gap-[7px]">
      <p
        className="font-mono leading-none whitespace-nowrap"
        style={{ fontSize: '11.5px' }}
      >
        {hasFunded ? (
          <>
            <span className="text-ink">
              {formatAmount(locale, gift.unitFunded as number)}
            </span>
            <span className="text-ink-40">{` / ${totalStr} ${unit}`}</span>
          </>
        ) : (
          <span className="text-ink-40">
            {`${totalStr} ${unit} ${totalSuffix}`}
          </span>
        )}
      </p>

      {hasFunded && (
        <div
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${gift.unitFunded} / ${gift.unitTotal} ${unit}`}
          className={cn(
            'w-full overflow-hidden',
            isAnchor ? 'bg-gold-soft' : 'bg-rule',
          )}
          style={{ borderRadius: 2, height: '5px' }}
        >
          <div
            className={cn('h-full', isAnchor ? 'bg-gold-deep' : 'bg-gold')}
            style={{
              width: `${visible ? pct : 0}%`,
              borderRadius: 2,
              transition: reduced
                ? 'none'
                : 'width 700ms cubic-bezier(0.2, 0.7, 0.2, 1)',
            }}
          />
        </div>
      )}
    </div>
  );
}
