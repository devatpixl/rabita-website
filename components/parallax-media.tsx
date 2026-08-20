'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';

// Lifts a figure above its grid slot when the section first comes into view,
// then lets it settle level with the column beside it as you scroll down. The
// photograph starts at the height of the heading and ends at the height of the
// content, so the two sides arrive together rather than sitting in a fixed row.
//
// `lift` is how far above the slot it starts, in pixels. Reduced motion skips
// the whole thing and renders the figure in its slot.
export function ParallaxMedia({
  children,
  lift = 150,
  className,
}: {
  children: ReactNode;
  lift?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start start'],
  });

  const eased = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 40,
    mass: 0.3,
    restDelta: 0.001,
  });

  const y = useTransform(eased, [0, 1], [-lift, 0]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduced ? undefined : { y }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
