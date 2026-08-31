'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

// A scroll reveal that cannot hide content permanently.
//
// The obvious way to write this — framer's `initial={{opacity:0}}` +
// `whileInView` — server-renders `style="opacity:0"` into the HTML. The
// element is then invisible until a viewport observer fires, and if that
// observer never fires the content is simply gone. That is exactly what
// happened to the services page on 2026-08-31: every card shipped with
// opacity:0 baked into the markup and none of them ever revealed, so the page
// rendered blank. A page whose content depends on an animation succeeding is
// a page with a single point of failure, for a decoration.
//
// So the order is inverted here:
//
//   1. Server renders the child VISIBLE. No opacity in the HTML at all.
//   2. On the client, before the first paint (useLayoutEffect, so there is no
//      flash), we hide it — but only if JS is actually running, only if
//      IntersectionObserver exists, and only if it is still below the fold.
//   3. The observer brings it back.
//
// If any of that fails — JS off, hydration broken, an extension mangling the
// tree, an old browser — the content stays visible, because visible is what
// the HTML said in the first place. The animation can only ever be additive.
//
// Anything already on screen at mount is left alone rather than being hidden
// and re-shown, which would flash.

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  /** Seconds, for staggering along a row. */
  delay?: number;
  className?: string;
  as?: 'div' | 'li';
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [hidden, setHidden] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Already on screen: leave it be.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    setHidden(true);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHidden(false);
            io.disconnect();
          }
        }
      },
      // Innocents' own trigger for the same effect: a real threshold, so a
      // fraction of the band must actually be on screen — not merely its top
      // edge touching the fold — plus a small bottom margin.
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);

    // No timeout failsafe here, deliberately. An earlier version revealed
    // everything after 4s "just in case", which meant anything the reader had
    // not scrolled to within four seconds simply popped in with no animation —
    // it defeated the thing it was guarding. It was also redundant: the safety
    // does not come from a timer, it comes from the fact that ONLY this effect
    // ever hides anything. If hydration fails the effect never runs, nothing is
    // armed, and the content stays visible. And if we got as far as observing,
    // a constructed IntersectionObserver will fire.
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      // The ONLY thing this sets is the attribute. Every hidden style in
      // globals.css is keyed on [data-reveal='out'], which appears only when
      // JS has armed it — so with no JS there is no attribute and nothing is
      // hidden. Children opt into an entrance with .rv-img / .rv-up / .rv-num.
      data-reveal={hidden ? 'out' : 'in'}
      style={delay ? ({ ['--rv-delay' as string]: `${delay}s` }) : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}
