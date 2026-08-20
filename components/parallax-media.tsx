'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useReducedMotion } from 'motion/react';

// Walks a figure down the whole length of the column beside it as the section
// scrolls through. It starts level with the section's opening text and finishes
// with its bottom level with the bottom of that column, and it is moving the
// entire way rather than parking part way down.
//
// Three things make it land right:
//
//   Both ends are measured, not guessed. The top of the travel is the gap up to
//   the heading block; the bottom is whatever is left of the row underneath the
//   figure. Re-measured on resize, so it holds at any viewport and for any
//   length of copy.
//
//   The progress is measured against the section, not against the figure, and
//   it runs from the section arriving at the bottom of the screen to the whole
//   of it being on screen. That is the window in which the reader can actually
//   see the column, so it is the window the photograph travels in.
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
    let from = 0;
    let to = 0;
    const measure = () => {
      const fig = el.getBoundingClientRect();
      from = Math.min(0, header.getBoundingClientRect().top - fig.top);
      to = Math.max(0, row.getBoundingClientRect().bottom - fig.bottom);
    };

    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight || 1;
      const rect = section.getBoundingClientRect();
      const span = rect.height || 1;
      // 0 when the section's top meets the bottom of the screen, 1 once its
      // bottom has come up to meet the bottom of the screen too.
      const p = Math.min(1, Math.max(0, (vh - rect.top) / span));
      y.set(from + (to - from) * p);
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
