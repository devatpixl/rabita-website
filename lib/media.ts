import type { AppLocale } from '@/i18n/routing';

// Video the site can show, declared in one place so every surface that uses
// a film lights up the moment the file lands — no component changes.
export type SiteVideo = {
  /** MP4 (H.264) under /public. */
  src: string;
  /** Still frame shown before play; same folder, .webp. */
  poster: string;
  /** WebVTT subtitle file per locale. Most people watch muted. */
  captions?: Partial<Record<AppLocale, string>>;
  /** Runtime, for the hint on the play button. */
  seconds?: number;
};

// NOT FILMED YET (2026-08-30). The imam's welcome — a short thank-you to
// people who have just given. To turn it on:
//
//   1. put the file at        public/video/imam-welcome.mp4
//   2. a still frame at       public/video/imam-welcome-poster.webp
//   3. subtitles at           public/video/imam-welcome.<locale>.vtt
//   4. replace `null` below with the object commented out under it.
//
// Nothing else changes: the thank-you card renders the film instead of
// closing on a button, and the prayer popup can opt in with
// `showVideoInAsk` if the client wants it there too.
export const IMAM_WELCOME: SiteVideo | null = null;
// export const IMAM_WELCOME: SiteVideo | null = {
//   src: '/video/imam-welcome.mp4',
//   poster: '/video/imam-welcome-poster.webp',
//   captions: {
//     no: '/video/imam-welcome.no.vtt',
//     en: '/video/imam-welcome.en.vtt',
//     ar: '/video/imam-welcome.ar.vtt',
//   },
//   seconds: 32,
// };


// Stand-in while nothing has been filmed. Only the poster is real — VideoCard
// is passed `placeholder` alongside it, so the src is never requested and the
// play button is inert. Swap IMAM_WELCOME off null and this drops out of use
// on its own; it is not a fallback that could ever try to play.
export const WELCOME_PLACEHOLDER: SiteVideo = {
  src: '',
  poster: '/photos/event-talk.webp',
};
