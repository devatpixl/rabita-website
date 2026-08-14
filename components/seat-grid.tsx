'use client';

import { useEffect, useRef, useState } from 'react';

// The section's central argument: a field of 100 marks, of which the first
// N are gold and the rest muted, where N is the proportion of members who
// hold a vote. Seeing three-quarters unlit is the actual reason to pay
// 1 000 kr — no feature bullet does that work.
//
// 25 × 4 = 100 marks. r=2, 10px pitch → 250 × 40 viewBox with a 5px
// margin so the outermost dots aren't clipped.

const COLS = 25;
const ROWS = 4;
const TOTAL = COLS * ROWS;
const COL_PITCH = 10;
const ROW_PITCH = 14; // vertical breathing room between rows
const RADIUS = 2;
const MARGIN = 5;

const WIDTH = COLS * COL_PITCH;
const HEIGHT = ROWS * ROW_PITCH;

export function SeatGrid({
  voting,
  total,
  ariaLabel,
}: {
  voting: number;
  total: number;
  ariaLabel: string;
}) {
  const filled = Math.min(
    TOTAL,
    Math.max(0, Math.round((voting / total) * TOTAL)),
  );

  const ref = useRef<SVGSVGElement | null>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setPlay(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlay(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const marks: { cx: number; cy: number; i: number; on: boolean }[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c;
      marks.push({
        cx: MARGIN + c * COL_PITCH,
        cy: MARGIN + r * ROW_PITCH,
        i,
        on: i < filled,
      });
    }
  }

  return (
    <svg
      ref={ref}
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${WIDTH + MARGIN * 2} ${HEIGHT + MARGIN * 2}`}
      width="100%"
      className="block max-w-full"
    >
      {marks.map((m) => {
        // Off marks show immediately as the field; on marks stagger in
        // left-to-right column-first at 12ms per mark. Column index drives
        // the delay so an entire vertical stripe brightens together —
        // reads as a filling gauge rather than a random reveal.
        const col = m.i % COLS;
        const delayMs = m.on ? col * 12 : 0;
        return (
          <circle
            key={m.i}
            cx={m.cx}
            cy={m.cy}
            r={RADIUS}
            fill={m.on ? '#C0A165' : '#33454F'}
            style={
              m.on
                ? {
                    opacity: play ? 1 : 0,
                    transition: `opacity 220ms ease-out ${delayMs}ms`,
                  }
                : undefined
            }
          />
        );
      })}
    </svg>
  );
}
