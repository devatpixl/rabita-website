'use client';

import { useRef, useState } from 'react';
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
  placeholder = false,
}: {
  video: SiteVideo;
  label?: string;
  className?: string;
  /**
   * Nothing to play yet. Shows the frame, the poster and the play button so
   * the slot is visibly reserved, but the button is inert and carries a
   * "video coming" badge instead of a runtime — a play button that does
   * nothing when tapped is worse than no button at all.
   */
  placeholder?: boolean;
}) {
  const t = useTranslations('video');
  const locale = useLocale() as AppLocale;
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLVideoElement | null>(null);

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
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-dusk">
        {playing ? (
          <video
            ref={ref}
            src={video.src}
            poster={video.poster}
            controls
            autoPlay
            playsInline
            className="h-full w-full object-cover"
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
