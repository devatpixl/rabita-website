'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import type { SiteVideo } from '@/lib/media';
import type { AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/cn';

// A film in the site's own frame: poster still, one gold play button, the
// runtime in mono. Nothing autoplays and nothing carries sound until the
// visitor asks for it — this appears inside a dialog, and a video that
// starts talking at someone is the thing everybody hates about popups.
//
// Subtitles are a real <track>, not burned into the picture, so they follow
// the site's language and can be turned off.
export function VideoCard({
  video,
  label,
  className,
  frameClassName,
  placeholder = false,
  autoPlay = false,
}: {
  video: SiteVideo;
  label?: string;
  className?: string;
  /**
   * Sizing for the picture itself, when the caller needs to drive it from
   * height rather than width — a portrait film in a dialog has to fit the
   * screen vertically, and letting the width lead puts the play button off
   * the bottom of a laptop. Replaces the default 16:9 full-width box.
   */
  frameClassName?: string;
  /**
   * Nothing to play yet. Shows the frame, the poster and the play button so
   * the slot is visibly reserved, but the button is inert and carries a
   * "video coming" badge instead of a runtime — a play button that does
   * nothing when tapped is worse than no button at all.
   */
  placeholder?: boolean;
  /**
   * Start playing on its own, without the poster step.
   *
   * MUTED, necessarily: every browser refuses to autoplay a film with sound,
   * so an unmuted attempt does not start quietly — it does not start at all.
   * The card carries an obvious "turn on sound" control instead, and the
   * native controls stay on so it can be paused.
   *
   * Ignored under prefers-reduced-motion, where the poster and the play
   * button are shown as normal.
   */
  autoPlay?: boolean;
}) {
  const t = useTranslations('video');
  const locale = useLocale() as AppLocale;
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const ref = useRef<HTMLVideoElement | null>(null);

  // Belt and braces: stop on the way out. Unmounting a <video> is normally
  // enough, but this one lives in a dialog and "the sound kept going after I
  // closed it" is the exact failure worth two lines of insurance against.
  useEffect(() => () => {
    const el = ref.current;
    if (el) {
      el.pause();
      el.muted = true;
    }
  }, []);

  // Autoplay decides itself on the client, after mount: the server cannot
  // know whether this visitor asks for reduced motion, and rendering the
  // <video> on the server and then pulling it would be a hydration mismatch.
  useEffect(() => {
    if (!autoPlay || placeholder || !video.src) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setPlaying(true);
  }, [autoPlay, placeholder, video.src]);

  const mmss = video.seconds
    ? `${Math.floor(video.seconds / 60)}:${String(video.seconds % 60).padStart(2, '0')}`
    : null;

  return (
    <figure className={cn('m-0', className)}>
      {label && (
        <figcaption className="mb-3 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-gold-deep">
          {label}
        </figcaption>
      )}
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl bg-dusk',
          frameClassName ?? 'aspect-video w-full',
        )}
        style={video.aspect && !frameClassName ? { aspectRatio: video.aspect } : undefined}
      >
        {playing ? (
          <>
          <video
            ref={ref}
            src={video.src}
            poster={video.poster}
            controls
            autoPlay
            muted={muted}
            onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
            playsInline
            className="h-full w-full object-contain"
          >
            {Object.entries(video.captions ?? {}).map(([lang, src]) => (
              <track
                key={lang}
                kind="captions"
                src={src as string}
                srcLang={lang}
                label={lang.toUpperCase()}
                default={lang === locale}
              />
            ))}
          </video>
          {/* Autoplay is muted because browsers allow nothing else, so the
             card has to say so and offer the way out. It disappears the
             moment sound is on, however it was turned on — the native
             volume control fires the same event. */}
          {muted && (
            <button
              type="button"
              onClick={() => {
                const el = ref.current;
                if (!el) return;
                el.muted = false;
                setMuted(false);
                void el.play();
              }}
              className="absolute inset-x-0 top-0 z-[1] flex items-center justify-center gap-2 bg-gradient-to-b from-dusk/75 to-transparent px-3 pb-6 pt-3 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-paper transition-opacity hover:opacity-90"
            >
              <SoundOffIcon className="h-4 w-4 shrink-0" />
              {t('unmute')}
            </button>
          )}
          </>
        ) : (
          <PosterFrame
            as={placeholder ? 'div' : 'button'}
            onPlay={placeholder ? undefined : () => setPlaying(true)}
            label={t('play')}
          >
            <Image
              src={video.poster}
              alt=""
              fill
              sizes="(min-width: 768px) 34rem, 90vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <span aria-hidden className="absolute inset-0 bg-dusk/25 transition-colors group-hover:bg-dusk/15" />
            <span
              aria-hidden
              className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold-deep text-paper shadow-[0_8px_28px_-8px_rgba(26,26,24,0.6)] transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="ms-1 h-6 w-6">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            {(placeholder || mmss) && (
              <span
                aria-hidden
                className="absolute bottom-3 end-3 rounded-full bg-dusk/70 px-2.5 py-1 font-mono text-[0.625rem] uppercase tabular-nums tracking-[0.1em] text-paper backdrop-blur-sm"
              >
                {placeholder ? t('comingSoon') : mmss}
              </span>
            )}
          </PosterFrame>
        )}
      </div>
    </figure>
  );
}


// The poster + play button, as either a real button or an inert div. Kept as
// one element so the placeholder and the live card cannot drift apart
// visually — they are the same frame, only the behaviour differs.
function PosterFrame({
  as,
  onPlay,
  label,
  children,
}: {
  as: 'button' | 'div';
  onPlay?: () => void;
  label: string;
  children: React.ReactNode;
}) {
  if (as === 'button') {
    return (
      <button type="button" onClick={onPlay} aria-label={label} className="group absolute inset-0 h-full w-full">
        {children}
      </button>
    );
  }
  return (
    <div className="group absolute inset-0 h-full w-full" aria-hidden>
      {children}
    </div>
  );
}

function SoundOffIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M11 5 6.5 9H3v6h3.5L11 19Z" />
      <path d="m16 9 5 6M21 9l-5 6" />
    </svg>
  );
}
