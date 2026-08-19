'use client';

import { useId } from 'react';
import { cn } from '@/lib/cn';

// A circular seal that sits on the corner of a photograph, the label running
// round its edge and the star mark at its centre.
//
// Used once on the page, on the visit photograph, where it does a real job:
// the thing a reader most needs to know about dropping in is that the door is
// open every day, and that sits better on the picture than as another line of
// body text under it.
//
// The ring turns on a CSS animation rather than a library, since nothing else
// about it needs to be scripted, and stops entirely under reduced motion. Paper
// at 92 percent so the photograph still reads through it.

export function RotatingSeal({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  // Four passes so the ring reads as continuous at any size.
  const repeated = Array.from({ length: 4 }, () => `${label} · `).join('');

  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none relative block h-[124px] w-[124px] select-none',
        className,
      )}
    >
      <span className="absolute inset-0 block rounded-full bg-paper/95 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.5)]" />

      <svg viewBox="0 0 200 200" className="seal-ring absolute inset-0 h-full w-full">
        <defs>
          <path
            id={`seal-${id}`}
            d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0"
            fill="none"
          />
        </defs>
        <text
          fill="#9B7F4A"
          style={{ fontSize: 15, letterSpacing: '0.16em', fontWeight: 600 }}
        >
          <textPath href={`#seal-${id}`}>{repeated}</textPath>
        </text>
      </svg>

      {/* The mark at the centre, the same geometry as the logo */}
      <span className="absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 text-gold">
        <svg width="34" height="34" viewBox="-50 -50 100 100">
          <g fill="none" stroke="currentColor" strokeWidth="3">
            {[0, 22.5, 45, 67.5].map((a) => (
              <rect key={a} x={-26} y={-26} width={52} height={52} rx="2" transform={`rotate(${a})`} />
            ))}
          </g>
        </svg>
      </span>
    </span>
  );
}
