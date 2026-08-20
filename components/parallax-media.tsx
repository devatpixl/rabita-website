'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

// Travels a figure down its own grid row as the section passes, so it starts
// level with the top of the column beside it and finishes level with the
// bottom of it. At every point in between it is level with some part of that
// column rather than parked in a fixed row.
//
// Two things make it feel right:
//
//   The travel is read straight off scroll position, with no spring in the way.
//   A spring is what made this lag: it always trails the wheel by its own
//   settling time. Driven directly, the figure moves exactly as fast as you
//   scroll, which is the adaptive behaviour we actually wanted. Fast flick,
//   fast move. Slow drag, slow move.
//
//   The distance is measured, not guessed. The figure sits at the bottom of
//   its grid row, so the lift it needs is however much taller the column
//   beside it is. That is measured on mount and on resize, so it stays
//   correct at any viewport and for any length of copy.
export function ParallaxMedia({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [lift, setLift] = useState(0);

  useEffect(() => {
    const el = ref.current;
    const row = el?.parentElement;
    if (!el || !row) return;

    const measure = () => {
      // How much taller the row is than this figure, which is exactly the gap
      // between sitting at the top of the column and sitting at the bottom.
      setLift(Math.max(0, row.offsetHeight - el.offsetHeight));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, lift]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduced ? undefined : { y }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
