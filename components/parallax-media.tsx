'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useReducedMotion } from 'motion/react';

// Holds a figure level with the section's opening text while the section is
// arriving, and brings it down to sit level with the top of the column beside
// it exactly as the section reaches the top of the screen.
//
// Three things make it land right:
//
//   The distance is measured, not guessed. The figure's grid row starts below
//   the heading block, so the rise it needs is the gap between its own top and
//   the top of that heading. Re-measured on resize, so it holds at any
//   viewport and for any length of copy.
//
//   The progress is measured against the section, not against the figure. Off
//   the figure, the travel finished a few hundred pixels late, which is what
//   left the photograph sitting short of the column.
//
//   The travel is read straight off scroll position, with no spring in the
//   way. A spring always trails the wheel by its own settling time, which is
//   what made this lag. Driven directly, the figure moves exactly as fast as
//   you scroll. Fast flick, fast move. Slow drag, slow move.
export function ParallaxMedia({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const y = useMotionValue(0);

  useEffect(() => {
    if (reduced) {
      y.set(0);
      return;
    }

    const el = ref.current;
    const row = el?.parentElement;
    const header = row?.previousElementSibling;
    const section = el?.closest('section');
    if (!el || !row || !header || !section) return;

    // Only the inner child is transformed, so these boxes are the untransformed
    // layout positions and the measurement stays stable while scrolling.
    let rise = 0;
    const measure = () => {
      rise = Math.max(0, el.getBoundingClientRect().top - header.getBoundingClientRect().top);
    };

    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight || 1;
      const top = section.getBoundingClientRect().top;
      // 0 when the section's top meets the bottom of the screen, 1 when it
      // reaches the top. Past either end it holds.
      const p = Math.min(1, Math.max(0, (vh - top) / vh));
      y.set(-rise * (1 - p));
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      update();
    };

    measure();
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(onResize);
    ro.observe(row);
    ro.observe(header);
    return () => {
      window.removeEventListener('scroll', onScroll);
      ro.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reduced, y]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
