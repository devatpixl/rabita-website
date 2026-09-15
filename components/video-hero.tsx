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
// public/video/leiligheter-film.mp4 is the project's own promotional film.
//
// Replaced 2026-09-15 with the client's own 4K master ("Leilighet 1.mp4",
// 3840x2160, 112s, 1.02GB). It is the SAME FILM that was running here as
// cm8-film.mp4 at 1024x576 — frame-for-frame identical at the same
// timestamps — so this closes the "ask for a better original" note that file
// carried. Transcoded to 1280x720 at 1.72 Mbps, 22.9MB, audio stripped.
//
// 1080p was encoded first and rejected at 60.7MB: this runs as muted
// wallpaper behind a scrim and a headline, and tripling the page weight for
// detail nobody reads is a bad trade. 720p against the old 1024x576 is still
// 1.25x the width and 1.9x the bitrate.
//
// NOTE FOR WHOEVER REPLACES IT NEXT: the film carries a "CM8" watermark
// burned into its top-left corner, which sits oddly beside the client's
// 2026-09-15 instruction to take the CM8 link off this page. Flagged to him;
// only a new export from the studio can remove it.
//
// The old file said:
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
            src="/video/leiligheter-film.mp4"
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

        {/* The grade. Lightened again on 2026-09-15 ("maybe use lesser tint at
           video so it looks cleaner"), and the saving comes from the TOP
           because that is where it was being wasted.
           
           Measured before touching it: the type occupies 49% to 89% of the
           hero's height — eyebrow at 49, headline 53-70, lede 73-80, buttons
           84-89. Above 49% there is nothing to protect at all, and the even
           bg-dusk/25 veil was darkening that half as hard as the half under
           the words. It is /10 now, and the foot-up gradient does the real
           work with stops placed off those measurements rather than by eye:
           clear to about 22% down, and full dusk by the time it reaches the
           headline.
           
           The gold multiply stays — at /14 rather than /20 — because it is
           what keeps a stock-looking render in this site's palette rather
           than beside it. It is a wash, not a veil.
           
           Local contrast moved onto the type itself (see the shadow on the
           content block below), which is what lets the film be this clean:
           a scrim dark enough for a lede is dark enough to flatten a
           photograph, and the shadow buys the same legibility over a few
           hundred pixels instead of the whole frame. */}
        <div className="absolute inset-0 bg-gold-deep/14 mix-blend-multiply" />
        <div className="absolute inset-0 bg-dusk/10" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(22,36,46,0.97) 0%, rgba(22,36,46,0.93) 12%, rgba(22,36,46,0.82) 26%, rgba(22,36,46,0.58) 42%, rgba(22,36,46,0.28) 56%, rgba(22,36,46,0.06) 70%, rgba(22,36,46,0) 80%)',
          }}
        />
      </div>

      <div
        className="relative mx-auto w-full max-w-6xl px-6 pb-16 pt-28 md:pb-24 md:pt-36"
        // Two shadows: a tight one pinning the glyph edges, a wide soft one
        // darkening the pixels around them. This is what pays for the lighter
        // scrim above — contrast where the words are, not across the film.
        style={{ textShadow: '0 1px 2px rgba(22,36,46,0.75), 0 2px 16px rgba(22,36,46,0.55)' }}
      >
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gold">{eyebrow}</p>
        <h1 className="mt-5 max-w-[18ch] font-serif text-display text-balance text-paper">{title}</h1>
        <p className="mt-6 max-w-[52ch] text-body text-paper/80">{lede}</p>
        {children && <div className="mt-9 flex flex-wrap items-center gap-3">{children}</div>}
      </div>
    </section>
  );
}
