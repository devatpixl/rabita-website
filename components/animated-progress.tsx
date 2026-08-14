'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { cn } from '@/lib/cn';

// Fills 0 → percent over ~800ms on first view. Once. Respects
// prefers-reduced-motion (renders final width instantly).
export function AnimatedProgress({
  percent,
  className,
  fillClassName,
  style,
}: {
  percent: number;
  className?: string;
  fillClassName?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const target = Math.min(100, Math.max(0, percent));
    if (typeof window === 'undefined') return;
    const prefers = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefers) {
      setWidth(target);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setWidth(target);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [percent]);

  return (
    <div
      ref={ref}
      className={cn('relative overflow-hidden', className)}
      style={style}
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn('h-full transition-[width] duration-[800ms] ease-out', fillClassName)}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
