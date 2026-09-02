'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

// A full-bleed film behind the page title.
//
// The project's own sales site runs this as a boxed YouTube player halfway
// down the page. Here it is the first thing you see, edge to edge, graded to
// the site's palette — the render is a walk through the finished flats, which
// is exactly the argument this page is making, so it should not be a small
// rectangle you have to find.
//
// It runs as WALLPAPER: always playing, always silent, no controls of any kind
// (client, 2026-09-02). That is also why it can autoplay at all — every
// browser refuses an unmuted autoplay — and it is why the frame keeps
// pointer-events-none: there is nothing on it to click, and a stray click
// landing on YouTube's own player would pause a film with no way to restart
// it. Under prefers-reduced-motion it never starts; the still carries the
// hero instead.
//
// Grading a cross-origin <iframe> from the outside is not possible, so the
// warmth comes from three passes stacked over the top of it rather than from
// a CSS filter on the frame.

const VIDEO_ID = 'ZZHfHvw7AGs';

// youtube-nocookie, so no tracking cookie is set for people who never watch.
//
// loop=1 needs playlist=<the same id> to work: YouTube only loops a playlist,
// so a single video has to be handed to it as a playlist of one.
const EMBED_SRC = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?${new URLSearchParams(
  {
    autoplay: '1',
    mute: '1',
    controls: '0',
    loop: '1',
    playlist: VIDEO_ID,
    playsinline: '1',
    modestbranding: '1',
    rel: '0',
    iv_load_policy: '3',
    disablekb: '1',
  },
).toString()}`;

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
  // The frame stays transparent until YouTube's own document has loaded. Its
  // player shell paints an opaque near-black rectangle from the moment it is
  // in the DOM, which would sit on top of the still and hide it — so an embed
  // that is blocked, proxied away or simply slow would leave a black hero
  // rather than the render underneath.
  const [frameShown, setFrameShown] = useState(false);

  // Decided on the client, after mount: the server cannot know whether this
  // visitor asks for reduced motion, and rendering the iframe on the server
  // then pulling it would be a hydration mismatch.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setStarted(true);
  }, []);

  return (
    <section className="relative isolate -mt-[60px] flex min-h-[86svh] items-end overflow-hidden bg-dusk pt-[60px] text-paper md:-mt-[77px] md:min-h-[92svh] md:pt-[77px]">
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        {/* The still is ALWAYS underneath, and it is one of our own renders
           rather than a YouTube thumbnail. The film is a third-party embed on
           a third-party network: it can be slow, blocked by an extension,
           refused by a corporate proxy, or simply down, and in every one of
           those cases this hero would otherwise be an empty dusk rectangle
           with a headline floating in it. Same rule as the rest of the site —
           the fallback is what renders, and the enhancement layers on top. */}
        <Image
          src="/photos/project-aerial.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Sized to COVER: a 16:9 film in a tall viewport has to be scaled up
           and centred, or it letterboxes. 177.78vh is 16/9 of the height, and
           the same trick the other way round for wide screens. */}
        {started && (
          <iframe
            src={EMBED_SRC}
            title=""
            allow="autoplay; encrypted-media"
            onLoad={() => setFrameShown(true)}
            className={cn(
              'pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0',
              'transition-opacity duration-700 ease-out motion-reduce:transition-none',
              frameShown ? 'opacity-100' : 'opacity-0',
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
