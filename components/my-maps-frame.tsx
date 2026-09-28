'use client';

import { useEffect, useRef, type CSSProperties } from 'react';

// The My Maps iframe, with a different opening view on phones.
//
// The embed's centre and zoom are URL parameters, and the URL is built on the
// server, which does not know the viewport. On a ~330px phone frame the
// laptop view (centred on the midpoint of all six pins, Slottet included)
// pushed the five central pins to the right edge and left the west half of
// the frame empty (client, 2026-09-28, with a screenshot of the map panned
// the way he wanted it). So the frame is given two URLs and picks one once it
// is on the client, from a media query.
//
// ONE LOAD, NOT TWO. The server renders the iframe WITHOUT a src; the effect
// sets it. Rendering the laptop URL on the server and swapping on phones
// would have loaded Google twice on exactly the devices that can least
// afford it. The cost is that the map waits for hydration — it sits below
// the fold on every page, so nobody sees the wait — and that it needs
// JavaScript, which the rest of this site already does.
//
// loading="lazy" is set before src is assigned, so the browser still defers
// the fetch until the frame is near the viewport.
export function MyMapsFrame({
  src,
  phoneSrc,
  title,
  className,
  style,
}: {
  /** The view from sm (640px) up. */
  src: string;
  /** The view below sm. */
  phoneSrc: string;
  title: string;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const phone = window.matchMedia('(max-width: 639px)').matches;
    const next = phone ? phoneSrc : src;
    if (el.src !== next) el.src = next;
  }, [src, phoneSrc]);

  return (
    <iframe
      ref={ref}
      title={title}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      style={style}
      className={className}
    />
  );
}
