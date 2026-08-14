'use client';

import { useEffect, useRef, useState } from 'react';

// Character-level reveal — used only on flagged section-openers. Each glyph
// enters with translateY(20px) + opacity 0 → 1, staggered.
//
// Space handling: word wrappers are inline (NOT inline-block) so text-node
// spaces between them render normally. Only the character spans inside
// each word are inline-block, which is what actually needs to animate.
// Putting inline-block on the word wrappers eats the trailing whitespace
// between adjacent word wrappers.

export function SplitReveal({
  text,
  className,
  stagger = 22,
  as = 'span',
}: {
  text: string;
  className?: string;
  stagger?: number;
  as?: 'span';
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const words = text.split(' ');
  let charIndex = 0;

  const Wrapper = as as 'span';
  return (
    <Wrapper ref={ref} className={className} aria-label={text}>
      {words.map((word, wi) => (
        <span key={`${wi}-${word}`} aria-hidden className="whitespace-nowrap">
          {[...word].map((ch, ci) => {
            const idx = charIndex++;
            return (
              <span
                key={ci}
                className="inline-block"
                style={{
                  opacity: reduced || visible ? 1 : 0,
                  transform: reduced || visible ? 'none' : 'translateY(20px)',
                  transition: reduced
                    ? undefined
                    : `opacity 620ms cubic-bezier(0.2,0.7,0.2,1) ${idx * stagger}ms, transform 620ms cubic-bezier(0.2,0.7,0.2,1) ${idx * stagger}ms`,
                }}
              >
                {ch}
              </span>
            );
          })}
          {wi < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </Wrapper>
  );
}
