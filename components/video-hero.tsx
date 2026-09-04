'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

// A full-bleed film behind the page title.
//
// SELF-HOSTED as of 2026-09-04. This started as a YouTube embed, and the
// embed lost: with controls=0, autoplay and pointer-events-none it still
// painted its own UI whenever it felt like it — the big play button when an
// autoplay was refused, and centre pause/skip controls in mobile emulation,
// both on the client's screen ("never show this play/stop button"). An
// iframe's chrome cannot be styled away from outside, so the only way to
// guarantee NO player UI is for no player UI to exist: a native <video>
// with no controls attribute has none, ever, in any browser mode.
//
// public/video/cm8-film.mp4 is the project's own promotional film
// (cm8.no / youtu.be/ZZHfHvw7AGs), 1024px, silent (audio track stripped —
// wallpaper needs no sound and it saves a third of the bytes), ~12 MB.
//
// It runs as wallpaper: muted, looping, inline, autoplaying. Desktop only —
// a phone on mobile data should not pay 12 MB for a background, so below md
// the poster carries the hero (which also sidesteps every mobile-autoplay
// policy). Under prefers-reduced-motion it never starts anywhere.
//
// The reveal rule survives from the embed era, now on native events: the
// film fades in on `playing`, so the only frame a visitor can ever see is a
// moving one. Poster underneath in every other state — same fail-safe rule
// as the rest of the site.

export function VideoHero({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede: string;
  /** Buttons, rendered under the lede. */
  children?: React.ReactNode;
}) {
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Decided on the client, after mount: the server knows neither the
  // viewport nor the motion preference, and rendering the video on the
  // server then pulling it would be a hydration mismatch.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(min-width: 768px)').matches) return;
    setStarted(true);
  }, []);

  // Belt and braces: if the browser still refuses the muted autoplay, try
  // once explicitly; if that also fails, the poster simply stays.
  useEffect(() => {
    if (!started) return;
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {
      /* poster carries the hero */
    });
  }, [started]);

  return (
    <section className="relative isolate -mt-[60px] flex min-h-[86svh] items-end overflow-hidden bg-dusk pt-[60px] text-paper md:-mt-[77px] md:min-h-[92svh] md:pt-[77px]">
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        {/* The still is ALWAYS underneath, and it is one of our own renders.
           Slow network, refused autoplay, data-saver, reduced motion, a
           phone — in every one of those cases this is the hero, and the
           film is only ever an enhancement on top. */}
        <Image
          src="/photos/project-aerial.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {started && (
          <video
            ref={videoRef}
            src="/video/cm8-film.mp4"
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
            onPlaying={() => setPlaying(true)}
            className={cn(
              'pointer-events-none absolute inset-0 h-full w-full object-cover',
              'transition-opacity duration-700 ease-out motion-reduce:transition-none',
              playing ? 'opacity-100' : 'opacity-0',
            )}
          />
        )}

        {/* The grade, in three passes, each doing one job:
           1. a warm wash, so the film sits in the site's palette rather than
              beside it;
           2. an even veil, so no frame of a moving picture can wash out the
              type over it;
           3. a foot-up gradient, because the words sit at the bottom.
           Lightened on 2026-09-02 (client): the film was legible but dim. The
           saving is taken from the top — where there is nothing to protect —
           rather than evenly, so the flats read clearly while the headline
           keeps the same ground under it. */}
        <div className="absolute inset-0 bg-gold-deep/20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-dusk/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-dusk via-dusk/55 to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 pb-16 pt-28 md:pb-24 md:pt-36">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold">{eyebrow}</p>
        <h1 className="mt-5 max-w-[18ch] font-serif text-display text-balance text-paper">{title}</h1>
        <p className="mt-6 max-w-[52ch] text-body text-paper/80">{lede}</p>
        {children && <div className="mt-9 flex flex-wrap items-center gap-3">{children}</div>}
      </div>
    </section>
  );
}
